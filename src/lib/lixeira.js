// Lixeira de segurança (aprovada em 10/10/2026, a partir do kit da CI Unidade II).
// Antes de apagar ou substituir algo do trabalho do aluno ou da turma, o CTC guarda uma cópia
// aqui. Se a cópia falhar, nada é apagado. Só o professor da turma (e o administrador) vê a
// lixeira e restaura. O plano gratuito não tem rotina automática: os itens antigos são
// apagados à mão ("Esvaziar itens com mais de 90 dias").
//  - empresas/{id}/lixeira/{auto}: lançamento excluído, lançamento antes de ser corrigido,
//    encerramento desfeito, saldos iniciais substituídos
//  - turmas/{t}/lixeira/{auto}: lista excluída, aluno retirado da turma, respostas apagadas
import {
  addDoc, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, runTransaction, serverTimestamp, setDoc, Timestamp, writeBatch,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { auditar } from "./auditoria";

export const DIAS_NA_LIXEIRA = 90;
export const TIPOS_LIXEIRA = {
  lancamento: "Lançamento excluído",
  "lancamento-alterado": "Lançamento antes da correção",
  encerramento: "Encerramento desfeito",
  saldos: "Saldos iniciais substituídos",
  lista: "Lista excluída",
  aluno: "Aluno retirado da turma",
  resposta: "Respostas apagadas",
};

// os dados vão como texto JSON: preserva tudo como estava, sem depender do formato de cada tipo
const empacotar = (dados) => JSON.stringify(dados ?? null);
export const desempacotar = (item) => { try { return JSON.parse(item.dados); } catch { return null; } };

function base(tipo, dados, resumo, motivo, papel) {
  const u = auth.currentUser;
  return {
    tipo, dados: empacotar(dados), resumo: String(resumo || "").slice(0, 300), motivo: motivo || "",
    por: u?.email || "", porUid: u?.uid || "", porPapel: papel || "", em: serverTimestamp(),
  };
}
export async function guardarNaLixeiraDaEmpresa(empresaId, { tipo, dados, resumo, motivo, papel }) {
  await addDoc(collection(db, "empresas", empresaId, "lixeira"), base(tipo, dados, resumo, motivo, papel));
}
export async function guardarNaLixeiraDaTurma(turmaId, { tipo, dados, resumo, motivo }) {
  await addDoc(collection(db, "turmas", turmaId, "lixeira"), base(tipo, dados, resumo, motivo, "professor"));
}

async function lerColecao(...caminho) {
  const s = await getDocs(collection(db, ...caminho));
  return s.docs.map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.em?.toMillis?.() || 0) - (a.em?.toMillis?.() || 0));
}
export const lerLixeiraDaEmpresa = (empresaId) => lerColecao("empresas", empresaId, "lixeira");
export const lerLixeiraDaTurma = (turmaId) => lerColecao("turmas", turmaId, "lixeira");

const refDiario = (empresaId) => doc(db, "empresas", empresaId, "livros", "diario");

// restaura um item da lixeira da empresa; o que estiver no lugar vai para a lixeira antes
export async function restaurarDaEmpresa(empresaId, item) {
  const dados = desempacotar(item);
  if (dados == null) throw new Error("Item da lixeira ilegível.");
  if (item.tipo === "saldos") {
    const atual = await getDoc(doc(db, "empresas", empresaId, "livros", "saldos"));
    if (atual.exists()) await guardarNaLixeiraDaEmpresa(empresaId, { tipo: "saldos", dados: atual.data().contas || {}, resumo: "Saldos antes de restaurar", motivo: "restauração" });
    await setDoc(doc(db, "empresas", empresaId, "livros", "saldos"), { contas: dados, atualizadoEm: serverTimestamp() });
  } else {
    let substituidos = [];
    await runTransaction(db, async (t) => {
      const s = await t.get(refDiario(empresaId));
      let lista = s.exists() ? s.data().lancamentos || [] : [];
      if (item.tipo === "lancamento") {
        if (!lista.some((l) => l.id === dados.id)) lista = [...lista, dados];
      } else if (item.tipo === "lancamento-alterado") {
        substituidos = lista.filter((l) => l.id === dados.id);
        lista = lista.some((l) => l.id === dados.id) ? lista.map((l) => (l.id === dados.id ? dados : l)) : [...lista, dados];
      } else if (item.tipo === "encerramento") {
        substituidos = lista.filter((l) => l.encerramento);
        lista = [...lista.filter((l) => !l.encerramento), ...dados];
      }
      t.set(refDiario(empresaId), { lancamentos: lista, atualizadoEm: serverTimestamp() });
    });
    if (item.tipo === "lancamento-alterado" && substituidos[0]) await guardarNaLixeiraDaEmpresa(empresaId, { tipo: "lancamento-alterado", dados: substituidos[0], resumo: substituidos[0].historico, motivo: "restauração" });
    if (item.tipo === "encerramento" && substituidos.length) await guardarNaLixeiraDaEmpresa(empresaId, { tipo: "encerramento", dados: substituidos, resumo: `${substituidos.length} lançamento(s) de encerramento`, motivo: "restauração" });
  }
  await deleteDoc(doc(db, "empresas", empresaId, "lixeira", item.id));
  auditar("Restaurou da lixeira", `${empresaId}: ${TIPOS_LIXEIRA[item.tipo] || item.tipo} — ${item.resumo}`);
}

// restaura um item da lixeira da turma
export async function restaurarDaTurma(turmaId, item) {
  const dados = desempacotar(item);
  if (dados == null) throw new Error("Item da lixeira ilegível.");
  if (item.tipo === "lista") {
    const { id, ...resto } = dados;
    await setDoc(doc(db, "turmas", turmaId, "listas", id), reviverDatas(resto));
  } else if (item.tipo === "aluno") {
    const lote = writeBatch(db);
    lote.set(doc(db, "turmas", turmaId, "alunos", dados.matricula), { nome: dados.nome, matricula: dados.matricula, incluidoEm: serverTimestamp() });
    lote.set(doc(db, "matriculas", dados.matricula), { nome: dados.nome, turmas: arrayUnion(turmaId) }, { merge: true });
    await lote.commit();
  } else if (item.tipo === "resposta") {
    const { id, ...resto } = dados;
    await setDoc(doc(db, "turmas", turmaId, "respostas", id), reviverDatas(resto));
  }
  await deleteDoc(doc(db, "turmas", turmaId, "lixeira", item.id));
  auditar("Restaurou da lixeira da turma", `${turmaId}: ${TIPOS_LIXEIRA[item.tipo] || item.tipo} — ${item.resumo}`);
}

// datas do Firestore viram { seconds, nanoseconds } no JSON: voltam a ser datas
function reviverDatas(v) {
  if (Array.isArray(v)) return v.map(reviverDatas);
  if (v && typeof v === "object") {
    const ks = Object.keys(v);
    if (ks.length <= 3 && "seconds" in v && "nanoseconds" in v) return new Timestamp(v.seconds, v.nanoseconds);
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, reviverDatas(x)]));
  }
  return v;
}

export async function apagarDaLixeira(caminho, item) {
  await deleteDoc(doc(db, ...caminho, "lixeira", item.id));
  auditar("Apagou item da lixeira", `${caminho.join("/")}: ${TIPOS_LIXEIRA[item.tipo] || item.tipo} — ${item.resumo}`);
}

// apaga os itens com mais de N dias; devolve quantos apagou
export async function esvaziarAntigos(caminho, itens, dias = DIAS_NA_LIXEIRA) {
  const limite = Date.now() - dias * 86400000;
  const velhos = itens.filter((i) => (i.em?.toMillis?.() || Date.now()) < limite);
  for (const i of velhos) await deleteDoc(doc(db, ...caminho, "lixeira", i.id));
  if (velhos.length) auditar("Esvaziou a lixeira", `${caminho.join("/")}: ${velhos.length} item(ns) com mais de ${dias} dias`);
  return velhos.length;
}
