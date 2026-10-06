// Auditoria: registra quem entrou no CTC e as ações importantes (turmas,
// matrículas, professores, backup). Só o administrador lê; ninguém altera
// nem apaga um registro (ver firestore.rules).
import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { auth, db } from "../firebase";

// quem está usando o sistema agora (o App atualiza ao carregar a sessão)
let atual = { papel: "", nome: "" };
export function definirSessaoAuditoria(sessao) {
  atual = { papel: sessao?.papel || "", nome: sessao?.perfil?.nome || sessao?.usuario?.displayName || "" };
}

// tipo: "acesso" (entrada no sistema) ou "acao" (algo foi alterado)
export async function auditar(acao, detalhe = "", tipo = "acao") {
  const u = auth.currentUser;
  if (!u) return;
  let teste = false; // ação feita no modo de teste (ver lib/modoTeste.js)
  try { teste = JSON.parse(sessionStorage.getItem("ctc-modo-teste") || "null")?.uid === u.uid; } catch { /* sem sessionStorage */ }
  if (teste && !/modo de teste/i.test(acao)) acao = `${acao} (modo de teste)`;
  try {
    await addDoc(collection(db, "auditoria"), {
      tipo, acao, detalhe: String(detalhe).slice(0, 500),
      uid: u.uid, email: (u.email || "").toLowerCase(),
      nome: atual.nome || u.displayName || "", papel: atual.papel,
      em: serverTimestamp(),
    });
  } catch {
    // a auditoria nunca impede o uso do sistema
  }
}

// uma entrada por sessão do navegador (não registra de novo a cada F5)
export function registrarAcesso(sessao) {
  const chave = `ctc-acesso-${sessao.usuario.uid}`;
  try { if (sessionStorage.getItem(chave)) return; sessionStorage.setItem(chave, "1"); } catch { /* sem sessionStorage */ }
  auditar("Entrou no CTC", navigator.userAgent.includes("Mobile") ? "celular" : "computador", "acesso");
}

export async function lerAuditoria({ tipo = "", dias = 30 } = {}) {
  const desde = new Date(Date.now() - dias * 86400000);
  const filtros = [where("em", ">=", desde), orderBy("em", "desc"), limit(500)];
  const q = query(collection(db, "auditoria"), ...filtros);
  const s = await getDocs(q);
  const itens = s.docs.map((d) => ({ id: d.id, ...d.data() }));
  return tipo ? itens.filter((i) => i.tipo === tipo) : itens;
}
