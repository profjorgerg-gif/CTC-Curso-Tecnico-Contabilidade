// Modo de teste (aprovado em 06/10/2026): o professor ou o administrador vê o CTC como um aluno
// da turma, com o próprio login, sem criar turma nem aluno de mentira. A conta de teste tem uma
// matrícula fictícia fixa por professor (TESTE-XXXXXX), não entra na lista de alunos da turma e
// fica fora das notas, do acompanhamento e do backup. O modo vale só nesta aba do navegador.
import { collection, deleteDoc, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { idEmpresa } from "./empresas";
import { auditar } from "./auditoria";

const CHAVE = "ctc-modo-teste";
export const NOME_CONTA_TESTE = "Conta de teste do professor"; // nome na tela do Modo de teste
export const NOME_ALUNO_TESTE = "Aluno de Teste"; // nome do aluno dentro do modo (saudação, empresa)

export const matriculaDeTeste = (uid) => `TESTE-${String(uid || "").replace(/[^A-Za-z0-9]/g, "").slice(0, 6).toUpperCase()}`;
export const ehMatriculaTeste = (m) => /^TESTE-/.test(String(m || ""));
export const ehEmpresaTeste = (id) => /_TESTE-/.test(String(id || ""));

// { uid, turmaId, turmaNome } ou null
export function lerModoTeste(uid) {
  try {
    const m = JSON.parse(sessionStorage.getItem(CHAVE) || "null");
    return m && m.uid === uid ? m : null;
  } catch { return null; }
}

const avisar = () => window.dispatchEvent(new Event("ctc-modo-teste"));

export function entrarModoTeste(uid, turma) {
  try { sessionStorage.setItem(CHAVE, JSON.stringify({ uid, turmaId: turma.id, turmaNome: turma.nome })); } catch { /* sem sessionStorage */ }
  auditar("Entrou no modo de teste", turma.nome);
  window.location.hash = "inicio";
  avisar();
}

export function sairModoTeste() {
  try { sessionStorage.removeItem(CHAVE); } catch { /* sem sessionStorage */ }
  window.location.hash = "teste";
  avisar();
}

// a turma do modo de teste (lida de novo, para vir com os dados atuais)
export async function turmaDoTeste(turmaId) {
  const t = await getDoc(doc(db, "turmas", turmaId));
  return t.exists() ? [{ id: t.id, ...t.data() }] : [];
}

// apaga tudo o que a conta de teste fez na turma: empresa, livros, respostas e o progresso
// de estudo guardado neste navegador
export async function zerarDadosTeste(uid, turma) {
  const m = matriculaDeTeste(uid);
  const eid = idEmpresa(turma.id, m);
  for (const livro of ["saldos", "diario"]) await deleteDoc(doc(db, "empresas", eid, "livros", livro)).catch(() => {});
  const lx = await getDocs(collection(db, "empresas", eid, "lixeira")).catch(() => null);
  for (const d of lx?.docs || []) await deleteDoc(d.ref).catch(() => {});
  await deleteDoc(doc(db, "empresas", eid)).catch(() => {});
  const rs = await getDocs(query(collection(db, "turmas", turma.id, "respostas"), where("matricula", "==", m))).catch(() => null);
  for (const r of rs?.docs || []) await deleteDoc(r.ref).catch(() => {});
  try {
    Object.keys(localStorage)
      .filter((k) => /^ctc-(estudado|pratica)-/.test(k) || k.endsWith(`-${eid}`))
      .forEach((k) => localStorage.removeItem(k));
  } catch { /* sem armazenamento */ }
  auditar("Zerou os dados de teste", turma.nome);
}
