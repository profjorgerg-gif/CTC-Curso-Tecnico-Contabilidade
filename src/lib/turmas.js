// Turmas, listas de alunos e matrículas
import {
  arrayRemove, arrayUnion, collection, doc, getDoc, getDocs,
  orderBy, query, serverTimestamp, where, writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { auditar } from "./auditoria";

// Lê a lista colada pelo professor: uma linha por aluno, "Nome completo, matrícula"
// Aceita vírgula, ponto e vírgula ou tabulação (colado do Excel)
export function lerListaDeAlunos(texto) {
  const alunos = [];
  const erros = [];
  const vistos = new Set();
  texto.split(/\r?\n/).forEach((linha, i) => {
    const l = linha.trim();
    if (!l) return;
    const partes = l.split(/[;,\t]/).map((p) => p.trim()).filter(Boolean);
    const matricula = (partes.find((p) => /^\d{3,}$/.test(p.replace(/[.\-\s]/g, ""))) || "").replace(/[.\-\s]/g, "");
    const nome = partes.filter((p) => p.replace(/[.\-\s]/g, "") !== matricula).join(" ").replace(/\s+/g, " ");
    if (!matricula || !nome) return erros.push(`Linha ${i + 1}: "${l}" — informe nome e matrícula`);
    if (vistos.has(matricula)) return erros.push(`Linha ${i + 1}: matrícula ${matricula} repetida`);
    vistos.add(matricula);
    alunos.push({ nome, matricula });
  });
  return { alunos, erros };
}

// Turmas visíveis ao professor (as próprias) ou ao administrador (todas)
export async function turmasDoProfessor(uid, souAdmin) {
  const ref = collection(db, "turmas");
  const q = souAdmin ? query(ref, orderBy("criadaEm", "desc")) : query(ref, where("professorUid", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Turmas do aluno, a partir da matrícula vinculada
export async function turmasDoAluno(matricula) {
  if (!matricula) return [];
  const m = await getDoc(doc(db, "matriculas", matricula));
  const ids = m.exists() ? m.data().turmas || [] : [];
  const turmas = await Promise.all(ids.map(async (id) => {
    try {
      const t = await getDoc(doc(db, "turmas", id));
      return t.exists() ? { id, ...t.data() } : null;
    } catch {
      return null; // turma da qual o aluno foi retirado
    }
  }));
  return turmas.filter(Boolean);
}

export async function alunosDaTurma(turmaId) {
  const snap = await getDocs(collection(db, "turmas", turmaId, "alunos"));
  const alunos = snap.docs.map((d) => ({ matricula: d.id, ...d.data() }));
  // situação do vínculo com a conta Google
  await Promise.all(alunos.map(async (a) => {
    const m = await getDoc(doc(db, "matriculas", a.matricula));
    a.vinculado = !!(m.exists() && m.data().uid);
  }));
  return alunos.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

// Cria a turma e inclui a lista de alunos numa única gravação
export async function criarTurma({ nome, disciplina, semestre, alunos, professor }) {
  const ref = doc(collection(db, "turmas"));
  const lote = writeBatch(db);
  lote.set(ref, {
    nome, disciplina, semestre,
    professorUid: professor.uid,
    professorNome: professor.nome,
    professorEmail: professor.email,
    criadaEm: serverTimestamp(),
  });
  incluirNoLote(lote, ref.id, alunos);
  await lote.commit();
  auditar("Criou turma", `${nome} (${disciplina}, ${semestre}) com ${alunos.length} aluno(s)`);
  return ref.id;
}

export async function incluirAlunos(turmaId, alunos) {
  const lote = writeBatch(db);
  incluirNoLote(lote, turmaId, alunos);
  await lote.commit();
  auditar("Incluiu alunos", `${alunos.length} aluno(s) na turma ${turmaId}: ${alunos.map((a) => a.matricula).join(", ")}`);
}

function incluirNoLote(lote, turmaId, alunos) {
  alunos.forEach(({ nome, matricula }) => {
    lote.set(doc(db, "turmas", turmaId, "alunos", matricula), { nome, matricula, incluidoEm: serverTimestamp() });
    // merge: não apaga o vínculo (uid) de quem já entrou antes
    lote.set(doc(db, "matriculas", matricula), { nome, turmas: arrayUnion(turmaId) }, { merge: true });
  });
}

export async function removerAluno(turmaId, matricula) {
  const lote = writeBatch(db);
  lote.delete(doc(db, "turmas", turmaId, "alunos", matricula));
  lote.update(doc(db, "matriculas", matricula), { turmas: arrayRemove(turmaId) });
  await lote.commit();
  auditar("Retirou aluno da turma", `matrícula ${matricula}, turma ${turmaId}`);
}

// Libera a matrícula para ser vinculada a outra conta Google
export async function desvincularMatricula(matricula) {
  const lote = writeBatch(db);
  lote.update(doc(db, "matriculas", matricula), { uid: null, vinculadoEm: null });
  await lote.commit();
  auditar("Desvinculou matrícula", `matrícula ${matricula} liberada para outra conta Google`);
}

export async function excluirTurma(turmaId) {
  const alunos = await getDocs(collection(db, "turmas", turmaId, "alunos"));
  const lote = writeBatch(db);
  alunos.docs.forEach((a) => {
    lote.delete(a.ref);
    lote.update(doc(db, "matriculas", a.id), { turmas: arrayRemove(turmaId) });
    lote.delete(doc(db, "empresas", `${turmaId}_${a.id}`)); // empresa do aluno nesta turma
  });
  // listas de exercícios, notas e boletins da turma
  for (const sub of ["listas", "avaliacoes", "boletim"]) {
    const s = await getDocs(collection(db, "turmas", turmaId, sub)).catch(() => null);
    s?.docs.forEach((d) => lote.delete(d.ref));
  }
  lote.delete(doc(db, "turmas", turmaId));
  await lote.commit();
  auditar("Excluiu turma", `turma ${turmaId} com ${alunos.size} aluno(s)`);
}
