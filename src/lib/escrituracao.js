// Escrituração da empresa do aluno: saldos iniciais e Livro Diário.
// Ficam em 2 documentos dentro da empresa (1 leitura cada, para caber na cota
// gratuita do Firebase): empresas/{id}/livros/saldos e empresas/{id}/livros/diario.
import { doc, getDoc, runTransaction, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { auditar } from "./auditoria";

const refSaldos = (empresaId) => doc(db, "empresas", empresaId, "livros", "saldos");
const refDiario = (empresaId) => doc(db, "empresas", empresaId, "livros", "diario");
const novoId = () => `l${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function autor(sessao) {
  return { uid: sessao.usuario.uid, nome: sessao.perfil?.nome || sessao.usuario.displayName || "", papel: sessao.papel };
}
// professor/admin mexendo na empresa de um aluno fica na auditoria
function auditarSeProfessor(sessao, acao, detalhe) {
  if (sessao.papel !== "aluno") auditar(acao, detalhe);
}

export async function lerEscrituracao(empresaId) {
  const [s, d] = await Promise.all([getDoc(refSaldos(empresaId)), getDoc(refDiario(empresaId))]);
  return {
    saldos: s.exists() ? s.data().contas || {} : {},
    saldosGravados: s.exists(),
    lancamentos: d.exists() ? d.data().lancamentos || [] : [],
  };
}

export async function salvarSaldos(sessao, empresaId, contas) {
  const limpo = {};
  for (const [codigo, v] of Object.entries(contas)) {
    const devedor = Math.round((Number(v?.devedor) || 0) * 100) / 100;
    const credor = Math.round((Number(v?.credor) || 0) * 100) / 100;
    if (devedor || credor) limpo[codigo] = { devedor, credor };
  }
  await setDoc(refSaldos(empresaId), { contas: limpo, atualizadoEm: serverTimestamp(), por: autor(sessao) });
  auditarSeProfessor(sessao, "Alterou saldos iniciais", empresaId);
}

// todas as gravações do diário passam por transação: aluno e professor podem
// mexer ao mesmo tempo sem um apagar o trabalho do outro
async function alterarDiario(empresaId, mudar) {
  await runTransaction(db, async (t) => {
    const s = await t.get(refDiario(empresaId));
    const lista = s.exists() ? s.data().lancamentos || [] : [];
    t.set(refDiario(empresaId), { lancamentos: mudar(lista), atualizadoEm: serverTimestamp() });
  });
}

function dadosDoForm(f) {
  const d = {
    data: f.data, historico: f.historico.trim(), documento: (f.documento || "").trim(),
    contaDebito: f.contaDebito, contaCredito: f.contaCredito,
    valor: Math.round(Number(f.valor) * 100) / 100,
  };
  if (Number(f.quantidade) > 0) d.quantidade = Number(f.quantidade);
  if (Number(f.valorUnitario) > 0) d.valorUnitario = Math.round(Number(f.valorUnitario) * 100) / 100;
  return d;
}

export async function incluirLancamento(sessao, empresaId, f, fatoOrientado, extras = {}) {
  const novo = { id: novoId(), ...dadosDoForm(f), ...extras, criadoEm: new Date().toISOString(), criadoPor: autor(sessao) };
  if (fatoOrientado) novo.fatoOrientado = fatoOrientado;
  await alterarDiario(empresaId, (lista) => [...lista, novo]);
  auditarSeProfessor(sessao, "Incluiu lançamento", `${empresaId}: ${novo.historico}`);
}

export async function alterarLancamento(sessao, empresaId, id, f) {
  // a correção nunca muda a qual fato orientado o lançamento pertence
  await alterarDiario(empresaId, (lista) => lista.map((l) => (l.id === id
    ? { ...l, ...dadosDoForm(f), alteradoEm: new Date().toISOString(), alteradoPor: autor(sessao) }
    : l)));
  auditarSeProfessor(sessao, "Corrigiu lançamento", `${empresaId}: ${f.historico}`);
}

export async function excluirLancamento(sessao, empresaId, l) {
  await alterarDiario(empresaId, (lista) => lista.filter((x) => x.id !== l.id));
  auditarSeProfessor(sessao, "Excluiu lançamento", `${empresaId}: ${l.historico}`);
}

// encerramento do exercício: grava de uma vez os lançamentos de encerramento (marcados)
export async function gravarEncerramento(sessao, empresaId, propostos, data) {
  const quem = autor(sessao);
  const agora = new Date().toISOString();
  const novos = propostos.map((p, i) => ({
    id: `${novoId()}${i}`, data, historico: p.historico, documento: "",
    contaDebito: p.contaDebito, contaCredito: p.contaCredito, valor: Math.round(p.valor * 100) / 100,
    encerramento: true, criadoEm: `${agora}#${String(i).padStart(3, "0")}`, criadoPor: quem,
  }));
  await alterarDiario(empresaId, (lista) => [...lista.filter((l) => !l.encerramento), ...novos]);
  auditar("Encerrou o exercício", `${empresaId}: ${novos.length} lançamento(s)`);
}

export async function desfazerEncerramento(sessao, empresaId) {
  await alterarDiario(empresaId, (lista) => lista.filter((l) => !l.encerramento));
  auditar("Desfez o encerramento do exercício", empresaId);
}
