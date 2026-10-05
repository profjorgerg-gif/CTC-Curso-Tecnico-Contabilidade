// Questões teóricas (aprovado em 04/10/2026): múltipla escolha (a–d), verdadeiro/falso
// e afirmações (I, II, III). O banco fica no Firestore, só para professores — o
// repositório é público, então o gabarito nunca vai para o código.
//
// Firestore:
//  - bancoQuestoes/{disciplina}-{mm}: { disciplina, modulo, titulo, questoes: [...] }  (professor lê; admin grava)
//  - turmas/{t}/gabaritos/{listaId}: { itens: { idQuestao: { correta, explicacao } } }  (só o professor da turma)
//  - turmas/{t}/respostas/{listaId}_{matricula}: { listaId, matricula, respostas: { idQuestao: valor } }  (o aluno grava a própria)
// Questão: { id, tipo: "me" | "vf" | "af", enunciado, alternativas?, afirmacoes?, correta, explicacao }
import { collection, deleteDoc, deleteField, doc, getDoc, getDocs, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { auditar } from "./auditoria";

export const TIPOS_QUESTAO = [
  { id: "me", nome: "Múltipla escolha (a, b, c, d)" },
  { id: "vf", nome: "Verdadeiro ou falso" },
  { id: "af", nome: "Afirmações (I, II, III)" },
];
export const LETRAS = ["a", "b", "c", "d", "e"];
export const ROMANOS = ["I", "II", "III", "IV", "V"];

// ---------- banco ----------
export async function lerBanco(disciplina) {
  const s = await getDocs(collection(db, "bancoQuestoes"));
  return s.docs.map((d) => ({ id: d.id, ...d.data() }))
    .filter((m) => !disciplina || m.disciplina === disciplina)
    .sort((a, b) => a.disciplina.localeCompare(b.disciplina) || a.modulo - b.modulo);
}

export function conferirArquivoBanco(texto) {
  let d;
  try { d = JSON.parse(texto); } catch { throw new Error("Não foi possível ler o arquivo (.json)."); }
  if (d?.tipo !== "banco-questoes" || !d.disciplina || !d.modulo || !Array.isArray(d.questoes)) throw new Error("Este arquivo não é um banco de questões do CTC.");
  d.questoes.forEach((q, i) => {
    const onde = `Questão ${i + 1} (${q.id || "sem id"})`;
    if (!q.id || !q.enunciado || !["me", "vf", "af"].includes(q.tipo)) throw new Error(`${onde}: incompleta.`);
    if (q.tipo === "vf" ? typeof q.correta !== "boolean" : !(Number.isInteger(q.correta) && q.alternativas?.[q.correta])) throw new Error(`${onde}: gabarito inválido.`);
    if (q.tipo === "af" && !q.afirmacoes?.length) throw new Error(`${onde}: faltam as afirmações.`);
  });
  return d;
}

export async function importarBanco(d) {
  const id = `${d.disciplina}-${String(d.modulo).padStart(2, "0")}`;
  await setDoc(doc(db, "bancoQuestoes", id), {
    disciplina: d.disciplina, modulo: Number(d.modulo), titulo: d.titulo || "", questoes: d.questoes, importadoEm: serverTimestamp(),
  });
  auditar("Importou banco de questões", `${id}: ${d.questoes.length} questões`);
  return id;
}

export async function excluirModuloBanco(m) {
  await deleteDoc(doc(db, "bancoQuestoes", m.id));
  auditar("Excluiu banco de questões", m.id);
}

// ---------- sorteio ----------
function sorteador(semente) {
  let s = semente >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
function misturar(lista, rnd) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// sorteia as questões dos módulos escolhidos, equilibrando os tipos
export function sortearQuestoes(banco, { modulos, quantidade, tipos, excluir = [], semente = Date.now() }) {
  const rnd = sorteador(semente);
  const pool = banco.filter((m) => modulos.includes(m.id))
    .flatMap((m) => m.questoes.map((q) => ({ ...q, modulo: m.id })))
    .filter((q) => tipos.includes(q.tipo) && !excluir.includes(q.id));
  const porTipo = Object.fromEntries(tipos.map((t) => [t, misturar(pool.filter((q) => q.tipo === t), rnd)]));
  const escolhidas = [];
  while (escolhidas.length < quantidade && tipos.some((t) => porTipo[t].length)) {
    for (const t of tipos) if (escolhidas.length < quantidade && porTipo[t].length) escolhidas.push(porTipo[t].shift());
  }
  return escolhidas;
}

// o que o aluno recebe (sem gabarito)
export const semGabarito = ({ correta, explicacao, ...resto }) => resto;
export const gabaritoDe = (questoes) => Object.fromEntries(questoes.map((q) => [q.id, { correta: q.correta, explicacao: q.explicacao || "" }]));

// ordem das alternativas da múltipla escolha, diferente para cada aluno (a resposta guarda o índice original)
export function ordemDasAlternativas(q, matricula) {
  const n = q.alternativas?.length || 0;
  const ids = [...Array(n).keys()];
  if (q.tipo !== "me") return ids;
  let h = 0;
  for (const c of `${matricula}|${q.id}`) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return misturar(ids, sorteador(h));
}

export function acertou(q, resposta, gab) {
  const certa = gab?.correta ?? q.correta;
  if (resposta === undefined || resposta === null || certa === undefined) return false;
  return q.tipo === "vf" ? resposta === certa : Number(resposta) === Number(certa);
}

export function notaDasQuestoes(questoes, respostas, gabarito) {
  const total = questoes.length;
  let acertos = 0;
  let respondidas = 0;
  for (const q of questoes) {
    const r = respostas?.[q.id];
    if (r === undefined || r === null) continue;
    respondidas++;
    if (acertou(q, r, gabarito?.[q.id])) acertos++;
  }
  return { nota: total ? Math.round((acertos / total) * 100) / 10 : 0, acertos, total, respondidas, lancados: respondidas };
}

// ---------- gabaritos e respostas ----------
export async function salvarGabarito(turmaId, listaId, questoes) {
  await setDoc(doc(db, "turmas", turmaId, "gabaritos", listaId), { itens: gabaritoDe(questoes) });
}
export async function lerGabarito(turmaId, listaId) {
  const s = await getDoc(doc(db, "turmas", turmaId, "gabaritos", listaId));
  return s.exists() ? s.data().itens || {} : {};
}
// libera (copia o gabarito para a lista) ou oculta a correção de uma lista avaliativa de questões
export async function liberarGabarito(turma, lista, liberar) {
  const ref = doc(db, "turmas", turma.id, "listas", lista.id);
  if (liberar) await updateDoc(ref, { resultadoLiberado: true, gabarito: await lerGabarito(turma.id, lista.id) });
  else await updateDoc(ref, { resultadoLiberado: false, gabarito: deleteField() });
  auditar(liberar ? "Liberou o resultado da lista" : "Ocultou o resultado da lista", `${lista.titulo} — ${turma.nome}`);
}

const idResposta = (listaId, matricula) => `${listaId}_${matricula}`;
export async function lerResposta(turmaId, listaId, matricula) {
  const s = await getDoc(doc(db, "turmas", turmaId, "respostas", idResposta(listaId, matricula)));
  return s.exists() ? s.data() : null;
}
export async function salvarResposta(turmaId, listaId, matricula, respostas) {
  await setDoc(doc(db, "turmas", turmaId, "respostas", idResposta(listaId, matricula)), {
    listaId, matricula, respostas, enviadaEm: serverTimestamp(),
  });
}
