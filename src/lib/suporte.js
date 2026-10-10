// Suporte por chamados (numerado desde 10/10/2026, a partir do kit da CI Unidade II).
// Cada chamado vai para o professor da turma (dúvidas de conteúdo, tarefas, notas) ou para o
// administrador (acesso, erro no sistema, sugestão). O administrador vê todos.
// Participantes: autorUid (quem abriu), professorUid (professor da turma, quando é para ele) e
// paraUid (o aluno, quando é o professor que abre — ex.: tarefa devolvida).
// Número sequencial único em contadores/suporte (transação). Se o contador ainda não estiver
// liberado nas regras, o chamado é criado normalmente, sem número.
import {
  addDoc, arrayUnion, collection, doc, getDoc, getDocs, orderBy, query, runTransaction, serverTimestamp, Timestamp, updateDoc, where,
} from "firebase/firestore";
import { db } from "../firebase";
import { auditar } from "./auditoria";

// tipo do chamado → para quem vai, por padrão
export const CATEGORIAS = [
  ["Dúvida de conteúdo (teoria / módulo)", "professor"],
  ["Exercício do módulo", "professor"],
  ["Escrituração da minha empresa", "professor"],
  ["Questionário", "professor"],
  ["Notas", "professor"],
  ["Acesso / matrícula", "admin"],
  ["Erro no sistema", "admin"],
  ["Sugestão", "admin"],
  ["Outro", "professor"],
];
export const destinoPadrao = (categoria) => CATEGORIAS.find(([c]) => c === categoria)?.[1] || "admin";
export const STATUS = { aberto: ["Aguardando resposta", "ocre"], respondido: ["Respondido", "verde"], encerrado: ["Encerrado", "cinza"] };
export const DESTINOS = { professor: "Professor da turma", admin: "Administrador (sistema)" };

function eu(sessao) {
  return { uid: sessao.usuario.uid, nome: sessao.perfil?.nome || sessao.usuario.displayName || "", papel: sessao.papel };
}

// cria o chamado já com número (transação no contador); plano B: sem número
async function criarNumerado(dados) {
  const contRef = doc(db, "contadores", "suporte");
  const novoRef = doc(collection(db, "chamados"));
  try {
    const numero = await runTransaction(db, async (t) => {
      const s = await t.get(contRef);
      const n = (s.exists() && Number.isFinite(s.data().ultimo) ? s.data().ultimo : 0) + 1;
      t.set(contRef, { ultimo: n });
      t.set(novoRef, { ...dados, numero: n });
      return n;
    });
    return { id: novoRef.id, numero };
  } catch {
    const ref = await addDoc(collection(db, "chamados"), dados);
    return { id: ref.id, numero: null };
  }
}

// aluno, professor ou administrador abre um chamado
export async function abrirChamado(sessao, { categoria, assunto, mensagem, destino, turma, relacionado }) {
  const p = eu(sessao);
  const paraProfessor = destino === "professor" && turma?.professorUid;
  const r = await criarNumerado({
    categoria, assunto: assunto.trim(), mensagem: mensagem.trim(), status: "aberto",
    destino: paraProfessor ? "professor" : "admin",
    turmaId: turma?.id || "", turmaNome: turma?.nome || "", professorUid: paraProfessor ? turma.professorUid : "",
    relacionado: (relacionado || "").trim(),
    autorUid: p.uid, autorNome: p.nome, autorPapel: p.papel,
    autorEmail: (sessao.usuario.email || "").toLowerCase(),
    autorMatricula: sessao.perfil?.matricula || "",
    iniciadoPor: p.papel,
    respostas: [], criadoEm: serverTimestamp(), atualizadoEm: serverTimestamp(),
  });
  auditar("Abriu chamado", `${r.numero ? `Nº ${fmtNumero(r.numero)} · ` : ""}${categoria}: ${assunto.trim()}`);
  return r;
}

// o professor abre um chamado PARA o aluno (ex.: tarefa devolvida, aviso)
export async function abrirChamadoParaAluno(sessao, { turma, aluno, paraUid, assunto, mensagem, categoria = "Tarefa devolvida", devolucao }) {
  const p = eu(sessao);
  const r = await criarNumerado({
    categoria, assunto: assunto.trim(), mensagem: mensagem.trim(), status: "respondido",
    destino: "professor", turmaId: turma.id, turmaNome: turma.nome || "", professorUid: turma.professorUid || p.uid,
    relacionado: devolucao?.resumo || "", paraUid: paraUid || "", paraNome: aluno.nome || "", paraMatricula: aluno.matricula,
    autorUid: p.uid, autorNome: p.nome, autorPapel: p.papel, autorEmail: (sessao.usuario.email || "").toLowerCase(), autorMatricula: "",
    iniciadoPor: p.papel, devolucao: devolucao || null,
    respostas: [], criadoEm: serverTimestamp(), atualizadoEm: serverTimestamp(),
  });
  auditar("Abriu chamado para aluno", `${r.numero ? `Nº ${fmtNumero(r.numero)} · ` : ""}${aluno.nome} (${aluno.matricula}): ${assunto.trim()}`);
  return r;
}

export async function listarChamados(sessao) {
  const ref = collection(db, "chamados");
  const uid = sessao.usuario.uid;
  let itens;
  if (sessao.papel === "admin" && !sessao.teste) {
    itens = (await getDocs(query(ref, orderBy("atualizadoEm", "desc")))).docs.map((d) => ({ id: d.id, ...d.data() }));
  } else {
    const consultas = [where("autorUid", "==", uid), where("paraUid", "==", uid)];
    if (sessao.papel !== "aluno") consultas.push(where("professorUid", "==", uid));
    const res = await Promise.all(consultas.map((w) => getDocs(query(ref, w)).catch(() => null)));
    const mapa = new Map();
    res.forEach((s) => s?.docs.forEach((d) => mapa.set(d.id, { id: d.id, ...d.data() })));
    itens = [...mapa.values()];
    // no modo de teste, o "aluno" só vê o que é dele como aluno (não os chamados de professor)
    if (sessao.teste) itens = itens.filter((c) => c.autorMatricula === sessao.perfil?.matricula || c.paraMatricula === sessao.perfil?.matricula);
  }
  // ordenado aqui (evita criar índice no Firestore)
  return itens.sort((a, b) => (b.atualizadoEm?.toMillis?.() || 0) - (a.atualizadoEm?.toMillis?.() || 0));
}

// quem atende o chamado: o administrador, ou o professor da turma quando é para ele
export const atende = (sessao, c) => (sessao.papel === "admin" && !sessao.teste) || (sessao.papel !== "aluno" && c.professorUid === sessao.usuario.uid);

// chamados aguardando resposta de quem está logado (para o número no menu)
export function aguardandoMim(sessao, chamados) {
  return (chamados || []).filter((c) => c.status === "aberto" && atende(sessao, c)).length;
}

export async function responder(sessao, chamado, texto) {
  const p = eu(sessao);
  await updateDoc(doc(db, "chamados", chamado.id), {
    respostas: arrayUnion({ texto: texto.trim(), porNome: p.nome, porPapel: p.papel, porUid: p.uid, em: Timestamp.now() }),
    status: atende(sessao, chamado) ? "respondido" : "aberto",
    atualizadoEm: serverTimestamp(),
  });
  auditar("Respondeu chamado", `${chamado.numero ? `Nº ${fmtNumero(chamado.numero)} · ` : ""}${chamado.assunto}`);
}

export async function mudarStatus(chamado, status) {
  await updateDoc(doc(db, "chamados", chamado.id), { status, atualizadoEm: serverTimestamp() });
  auditar(status === "encerrado" ? "Encerrou chamado" : "Reabriu chamado", chamado.assunto);
}

// administrador: dá número aos chamados antigos, na ordem em que foram abertos (só acrescenta "numero")
export async function numerarChamadosAntigos(chamados) {
  const sem = (chamados || []).filter((c) => !c.numero).sort((a, b) => (a.criadoEm?.toMillis?.() || 0) - (b.criadoEm?.toMillis?.() || 0));
  const contRef = doc(db, "contadores", "suporte");
  for (const c of sem) {
    const chRef = doc(db, "chamados", c.id);
    await runTransaction(db, async (t) => {
      const [s, ch] = await Promise.all([t.get(contRef), t.get(chRef)]);
      if (!ch.exists() || ch.data().numero) return;
      const n = (s.exists() && Number.isFinite(s.data().ultimo) ? s.data().ultimo : 0) + 1;
      t.set(contRef, { ultimo: n });
      t.update(chRef, { numero: n });
    });
  }
  if (sem.length) auditar("Numerou chamados antigos", `${sem.length} chamado(s)`);
  return sem.length;
}

// o uid da conta Google ligada à matrícula (para o aluno ver o chamado que o professor abriu)
export async function uidDoAluno(matricula) {
  const m = await getDoc(doc(db, "matriculas", matricula)).catch(() => null);
  return m?.exists() ? m.data().uid || "" : "";
}

// ---------- exportar / imprimir / copiar (só leitura) ----------
export const fmtNumero = (n) => (Number.isFinite(n) && n > 0 ? String(n).padStart(4, "0") : "—");
const dt = (v) => { const d = v?.toDate ? v.toDate() : v ? new Date(v) : null; return d && !Number.isNaN(d.getTime()) ? d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""; };
const PAPEL = { aluno: "ALUNO", professor: "PROFESSOR", admin: "ADMINISTRADOR" };

export function textoChamado(c, geradoEm = new Date()) {
  const L = [];
  L.push(`CHAMADO ${c.numero ? `Nº ${fmtNumero(c.numero)} ` : ""}— ${c.assunto || ""}`);
  L.push(`Tipo: ${c.categoria || ""} · Para: ${DESTINOS[c.destino] || DESTINOS.admin}${c.turmaNome ? ` · Turma: ${c.turmaNome}` : ""}${c.relacionado ? ` · Relacionado a: ${c.relacionado}` : ""}`);
  L.push(`Aberto por: ${c.autorNome || ""} (${(PAPEL[c.autorPapel] || c.autorPapel || "").toLowerCase()}${c.autorMatricula ? `, matrícula ${c.autorMatricula}` : ""})${c.paraNome ? ` · Para o aluno: ${c.paraNome} (matrícula ${c.paraMatricula})` : ""}`);
  L.push(`Situação: ${STATUS[c.status]?.[0] || c.status} · Aberto em ${dt(c.criadoEm)} · Última atualização ${dt(c.atualizadoEm)} · Gerado em ${dt(geradoEm)}`);
  L.push("--------------------------------------------------------");
  L.push(`[${dt(c.criadoEm)}] ${PAPEL[c.autorPapel] || ""} ${c.autorNome || ""}: ${c.mensagem || ""}`);
  for (const r of c.respostas || []) L.push(`[${dt(r.em)}] ${PAPEL[r.porPapel] || ""} ${r.porNome || ""}: ${r.texto || ""}`);
  return L.join("\n");
}
export function textoVariosChamados(lista, titulo = "CHAMADOS DO SUPORTE") {
  const agora = new Date();
  const ord = [...lista].sort((a, b) => (a.numero || 1e9) - (b.numero || 1e9));
  return `${titulo} — ${ord.length} chamado(s) — gerado em ${dt(agora)}\n\n${ord.map((c) => textoChamado(c, agora)).join("\n\n========================================================\n\n")}`;
}
export function nomeArquivo(base) {
  const d = new Date(); const z = (x) => String(x).padStart(2, "0");
  return `${base} - ${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}_${z(d.getHours())}h${z(d.getMinutes())}`.replace(/[\\/:*?"<>|]/g, "");
}
export function baixarTxt(nome, texto) {
  const url = URL.createObjectURL(new Blob(["﻿" + texto], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a"); a.href = url; a.download = `${nome}.txt`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
}
export async function copiarTexto(texto) {
  try { await navigator.clipboard.writeText(texto); return true; } catch {
    try { const ta = document.createElement("textarea"); ta.value = texto; document.body.appendChild(ta); ta.select(); const ok = document.execCommand("copy"); ta.remove(); return ok; } catch { return false; }
  }
}
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export function imprimirTexto(titulo, texto) {
  const f = document.createElement("iframe");
  f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(f);
  const d = f.contentWindow.document;
  d.open(); d.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(titulo)}</title><style>body{font:13px/1.5 Arial,sans-serif;margin:24px;color:#000}pre{white-space:pre-wrap;word-wrap:break-word;font:inherit}</style></head><body><pre>${esc(texto)}</pre></body></html>`); d.close();
  const anterior = document.title; document.title = titulo;
  const limpar = () => { document.title = anterior; setTimeout(() => f.remove(), 500); window.removeEventListener("afterprint", limpar); };
  window.addEventListener("afterprint", limpar);
  setTimeout(() => { try { f.contentWindow.focus(); f.contentWindow.print(); } catch { limpar(); } }, 250);
}

// ---------- respostas rápidas (modelos do professor, guardados neste navegador) ----------
export const MODELOS_PADRAO = [
  "Obrigado pela mensagem! Vou verificar e respondo em seguida.",
  "Confira o lançamento no Livro Diário (Escrituração → Lançamentos) e use \"Corrigir\". Depois me avise por aqui.",
  "Releia a teoria do módulo e o quadro \"Como funciona esta etapa\" no topo da tela. Se a dúvida continuar, me chame na aula.",
  "Reabri a tarefa para você refazer, com a orientação abaixo. Ao terminar, responda este chamado.",
  "Resolvido. Se precisar de mais alguma coisa, abra um novo chamado.",
];
const CHAVE_MODELOS = "ctc-modelos-resposta";
export function lerModelos() { try { const m = JSON.parse(localStorage.getItem(CHAVE_MODELOS) || "null"); return Array.isArray(m) && m.length ? m : MODELOS_PADRAO; } catch { return MODELOS_PADRAO; } }
export function gravarModelos(m) { try { localStorage.setItem(CHAVE_MODELOS, JSON.stringify(m)); } catch { /* sem armazenamento */ } }
