// Suporte por chamados: qualquer pessoa logada abre um chamado; o administrador
// vê todos e responde; quem abriu acompanha, responde de volta e encerra.
import {
  addDoc, arrayUnion, collection, doc, getDocs, orderBy, query, serverTimestamp, Timestamp, updateDoc, where,
} from "firebase/firestore";
import { db } from "../firebase";
import { auditar } from "./auditoria";

export const CATEGORIAS = ["Dúvida de conteúdo", "Problema de acesso", "Erro no sistema", "Sugestão", "Outro"];
export const STATUS = { aberto: ["Aberto", "ocre"], respondido: ["Respondido", "verde"], encerrado: ["Encerrado", "cinza"] };

function eu(sessao) {
  return {
    uid: sessao.usuario.uid,
    nome: sessao.perfil?.nome || sessao.usuario.displayName || "",
    papel: sessao.papel,
  };
}

export async function abrirChamado(sessao, { categoria, assunto, mensagem }) {
  const p = eu(sessao);
  const ref = await addDoc(collection(db, "chamados"), {
    categoria, assunto: assunto.trim(), mensagem: mensagem.trim(), status: "aberto",
    autorUid: p.uid, autorNome: p.nome, autorPapel: p.papel,
    autorEmail: (sessao.usuario.email || "").toLowerCase(),
    autorMatricula: sessao.perfil?.matricula || "",
    respostas: [], criadoEm: serverTimestamp(), atualizadoEm: serverTimestamp(),
  });
  auditar("Abriu chamado", `${categoria}: ${assunto.trim()}`);
  return ref.id;
}

export async function listarChamados(sessao) {
  const ref = collection(db, "chamados");
  const q = sessao.papel === "admin"
    ? query(ref, orderBy("atualizadoEm", "desc"))
    : query(ref, where("autorUid", "==", sessao.usuario.uid));
  const s = await getDocs(q);
  const itens = s.docs.map((d) => ({ id: d.id, ...d.data() }));
  // a lista de quem abriu é ordenada aqui (evita criar índice no Firestore)
  return itens.sort((a, b) => (b.atualizadoEm?.toMillis?.() || 0) - (a.atualizadoEm?.toMillis?.() || 0));
}

// resposta do administrador (status "respondido") ou de quem abriu (volta para "aberto")
export async function responder(sessao, chamado, texto) {
  const p = eu(sessao);
  await updateDoc(doc(db, "chamados", chamado.id), {
    respostas: arrayUnion({ texto: texto.trim(), porNome: p.nome, porPapel: p.papel, porUid: p.uid, em: Timestamp.now() }),
    status: sessao.papel === "admin" ? "respondido" : "aberto",
    atualizadoEm: serverTimestamp(),
  });
  auditar("Respondeu chamado", chamado.assunto);
}

export async function mudarStatus(chamado, status) {
  await updateDoc(doc(db, "chamados", chamado.id), { status, atualizadoEm: serverTimestamp() });
  auditar(status === "encerrado" ? "Encerrou chamado" : "Reabriu chamado", chamado.assunto);
}
