// Proteção contra digitação perdida (aprovada em 10/10/2026, a partir do kit da CI Unidade II).
// Enquanto um formulário tem alteração não salva, o que foi digitado é guardado sozinho
// neste navegador (rascunho local). Se a pessoa trocar de aba, de menu, recarregar a página,
// fechar o navegador ou sair por inatividade, ao voltar o CTC oferece "Restaurar" ou "Descartar".
// O rascunho é por pessoa (uid) e por formulário, some ao salvar e vence em 14 dias.
// Nada vai para o banco de dados: o rascunho fica só neste computador.
import { useEffect, useRef, useState } from "react";
import { auth } from "../firebase";

const PREFIXO = "ctc-rasc-";
const VALIDADE_DIAS = 14;

const chaveCompleta = (chave) => (chave && auth.currentUser ? `${PREFIXO}${auth.currentUser.uid}-${chave}` : null);
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function ler(k) {
  try {
    const r = JSON.parse(localStorage.getItem(k) || "null");
    if (!r) return null;
    if (Date.now() - new Date(r.em).getTime() > VALIDADE_DIAS * 86400000) { localStorage.removeItem(k); return null; }
    return r;
  } catch { return null; }
}
function gravar(k, dados) { try { localStorage.setItem(k, JSON.stringify({ dados, em: new Date().toISOString() })); } catch { /* sem armazenamento */ } }
function apagar(k) { try { localStorage.removeItem(k); } catch { /* sem armazenamento */ } }

// quantos formulários estão com alteração não salva agora (para o aviso ao fechar a página)
const sujos = new Set();
let ouvindo = false;
function avisoAoSair(e) { if (sujos.size) { e.preventDefault(); e.returnValue = ""; } }
function marcar(id, sujo) {
  if (sujo) sujos.add(id); else sujos.delete(id);
  if (sujos.size && !ouvindo) { window.addEventListener("beforeunload", avisoAoSair); ouvindo = true; }
  if (!sujos.size && ouvindo) { window.removeEventListener("beforeunload", avisoAoSair); ouvindo = false; }
}

// chave: identifica o formulário (null desliga); valor: o que está na tela;
// sujo: há alteração não salva? aoRestaurar(dados): devolve o rascunho para a tela.
// Devolve { encontrado, restaurar, descartar, limpar }.
export function useRascunho({ chave, valor, sujo, aoRestaurar }) {
  const k = chaveCompleta(chave);
  const [encontrado, setEncontrado] = useState(null);
  const id = useRef(Math.random().toString(36).slice(2));
  const valorRef = useRef(valor); valorRef.current = valor;
  const sujoRef = useRef(sujo); sujoRef.current = sujo;

  // ao abrir o formulário: há um rascunho diferente do que está na tela?
  useEffect(() => {
    setEncontrado(null);
    if (!k) return;
    const r = ler(k);
    if (r && !igual(r.dados, valorRef.current)) setEncontrado(r);
    else if (r) apagar(k);
  }, [k]);

  // enquanto houver alteração não salva, guarda o rascunho (meio segundo depois da última tecla)
  useEffect(() => {
    if (!k || !sujo || encontrado) return undefined;
    const t = setTimeout(() => gravar(k, valor), 500);
    return () => clearTimeout(t);
  }, [k, sujo, valor, encontrado]);

  // aviso do navegador ao fechar/recarregar; ao sair da tela, grava na hora o que ainda não foi guardado
  useEffect(() => { marcar(id.current, !!sujo); }, [sujo]);
  useEffect(() => () => {
    marcar(id.current, false);
    if (k && sujoRef.current) gravar(k, valorRef.current);
  }, [k]);

  return {
    encontrado,
    restaurar: () => { if (encontrado) { aoRestaurar(encontrado.dados); setEncontrado(null); } },
    descartar: () => { if (k) apagar(k); setEncontrado(null); },
    limpar: () => { if (k) apagar(k); setEncontrado(null); },
  };
}

// apaga os rascunhos vencidos deste navegador (chamado uma vez ao abrir o CTC)
export function limparRascunhosVencidos() {
  try { Object.keys(localStorage).filter((k) => k.startsWith(PREFIXO)).forEach((k) => ler(k)); } catch { /* sem armazenamento */ }
}
