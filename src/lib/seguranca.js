// Confirmação a cada entrada (aprovado em 03/10/2026):
//  - Professor/administrador: senha do CTC (além da conta Google).
//  - Aluno: confirma a matrícula.
// A confirmação vale até fechar o navegador ou por no máximo 12 horas, e a pessoa
// sai sozinha depois de 30 minutos sem usar o sistema.
//
// Segurança de verdade (não é só uma tela): as regras do Firestore exigem o
// documento sessoes/{uid} válido para quase tudo. A senha fica guardada só como
// hash (SHA-256 com sal) em segredos/{email}, que ninguém consegue ler.
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, Timestamp, writeBatch } from "firebase/firestore";
import { useEffect } from "react";
import { auth, db } from "../firebase";
import { auditar } from "./auditoria";

export const VALIDADE_HORAS = 12;
export const INATIVIDADE_MIN = 30;
export const SENHA_MINIMA = 8;

const chave = (uid) => `ctc-confirmado-${uid}`;
const CHAVE_ATIVIDADE = "ctc-ultima-atividade";
export const CHAVE_SAIU_INATIVO = "ctc-saiu-inativo";

// ---------- confirmação guardada neste navegador ----------
// Cookie de sessão: vale para todas as abas e some quando o navegador é fechado.
function lerCookie(nome) {
  try {
    const par = document.cookie.split("; ").find((c) => c.startsWith(`${nome}=`));
    return par ? decodeURIComponent(par.slice(nome.length + 1)) : "";
  } catch { return ""; }
}
function gravarCookie(nome, valor) {
  try { document.cookie = `${nome}=${encodeURIComponent(valor)}; path=/; SameSite=Strict${location.protocol === "https:" ? "; Secure" : ""}`; } catch { /* */ }
}
function apagarCookie(nome) {
  try { document.cookie = `${nome}=; path=/; max-age=0`; } catch { /* */ }
}
const marcarAtividade = () => gravarCookie(CHAVE_ATIVIDADE, String(Date.now()));

export function confirmadoNesteNavegador(uid) {
  return Number(lerCookie(chave(uid)) || 0) > Date.now();
}
function guardarConfirmacao(uid, validoAte) {
  gravarCookie(chave(uid), String(validoAte));
  marcarAtividade();
}
function esquecerConfirmacao(uid) {
  apagarCookie(chave(uid));
}

async function gravarSessao(uid, extra) {
  const validoAte = Date.now() + VALIDADE_HORAS * 3600000 - 600000; // 10 min de folga para diferença de relógio
  await setDoc(doc(db, "sessoes", uid), { ...extra, validoAte: Timestamp.fromMillis(validoAte), criadaEm: serverTimestamp() });
  guardarConfirmacao(uid, validoAte);
}

// ---------- senha do professor ----------
async function sha256(texto) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(bytes)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
const novoSal = () => Array.from(crypto.getRandomValues(new Uint8Array(16))).map((b) => b.toString(16).padStart(2, "0")).join("");

// situação da senha (o sal não é segredo; o hash fica em outro documento, ilegível)
export async function lerSituacaoSenha(email) {
  const s = await getDoc(doc(db, "senhas", email));
  return s.exists() ? s.data() : null;
}

export function conferirSenhaNova(senha, repetir) {
  if (senha.length < SENHA_MINIMA) return `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`;
  if (!/[A-Za-z]/.test(senha) || !/\d/.test(senha)) return "Use letras e números na senha.";
  if (senha !== repetir) return "As duas senhas não são iguais.";
  return "";
}

export async function criarSenha(usuario, senha) {
  const email = usuario.email.toLowerCase();
  const sal = novoSal();
  const senhaHash = await sha256(`${sal}:${senha}`);
  const lote = writeBatch(db);
  lote.set(doc(db, "senhas", email), { definida: true, sal, definidaEm: serverTimestamp() });
  lote.set(doc(db, "segredos", email), { senhaHash });
  await lote.commit();
  await gravarSessao(usuario.uid, { tipo: "professor", prova: senhaHash });
  auditar("Criou a senha do CTC", email);
}

export async function confirmarSenha(usuario, situacao, senha) {
  const prova = await sha256(`${situacao.sal}:${senha}`);
  try {
    await gravarSessao(usuario.uid, { tipo: "professor", prova });
  } catch (e) {
    if (e?.code === "permission-denied") {
      auditar("Senha incorreta", usuario.email, "acesso");
      throw new Error("Senha incorreta.");
    }
    throw e;
  }
}

// administrador: apaga a senha; a pessoa cria outra no próximo acesso
export async function redefinirSenha(email) {
  const lote = writeBatch(db);
  lote.delete(doc(db, "senhas", email));
  lote.delete(doc(db, "segredos", email));
  await lote.commit();
  auditar("Redefiniu a senha de", email);
}

// ---------- matrícula do aluno ----------
export async function confirmarMatricula(usuario, matricula) {
  const m = String(matricula).replace(/[.\-\s]/g, "");
  try {
    await gravarSessao(usuario.uid, { tipo: "aluno", matricula: m });
  } catch (e) {
    if (e?.code === "permission-denied") {
      auditar("Matrícula não confere", `digitou ${m}`, "acesso");
      throw new Error("A matrícula não confere com a desta conta Google.");
    }
    throw e;
  }
}

// ---------- saída ----------
export async function encerrarConfirmacao() {
  const u = auth.currentUser;
  if (!u) return;
  esquecerConfirmacao(u.uid);
  await deleteDoc(doc(db, "sessoes", u.uid)).catch(() => {});
}

// sai sozinho depois de 30 minutos sem atividade (mouse, teclado, toque ou rolagem)
// também sai quando a confirmação passa das 12 horas
export function useSaidaPorInatividade(uid, aoSair) {
  useEffect(() => {
    if (!uid) return undefined;
    const eventos = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    let ultimaMarca = 0;
    const aoMexer = () => { if (Date.now() - ultimaMarca > 15000) { ultimaMarca = Date.now(); marcarAtividade(); } };
    eventos.forEach((e) => window.addEventListener(e, aoMexer, { passive: true }));
    marcarAtividade();
    // a última atividade vale para todas as abas abertas do CTC
    const relogio = setInterval(() => {
      const ultima = Number(lerCookie(CHAVE_ATIVIDADE) || Date.now());
      if (Date.now() - ultima > INATIVIDADE_MIN * 60000 || !confirmadoNesteNavegador(uid)) {
        try { sessionStorage.setItem(CHAVE_SAIU_INATIVO, "1"); } catch { /* */ }
        aoSair();
      }
    }, 30000);
    return () => { eventos.forEach((e) => window.removeEventListener(e, aoMexer)); clearInterval(relogio); };
  }, [uid]);
}
