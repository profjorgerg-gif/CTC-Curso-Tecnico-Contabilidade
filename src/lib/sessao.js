// Descobre quem é a pessoa logada e qual o papel dela no CTC.
//  - admin / professor: e-mail em autorizados/{email}
//  - aluno: qualquer outra conta; precisa vincular a matrícula no primeiro acesso
import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";
import { encerrarConfirmacao } from "./seguranca";

export function useSessao() {
  const [estado, setEstado] = useState({ carregando: true, usuario: null, papel: null, perfil: null, erro: "" });

  const recarregar = async (u) => {
    if (!u) return setEstado({ carregando: false, usuario: null, papel: null, perfil: null, erro: "" });
    try {
      const email = (u.email || "").toLowerCase();
      const aut = await getDoc(doc(db, "autorizados", email));
      if (aut.exists()) {
        const papel = aut.data().papel === "admin" ? "admin" : "professor";
        return setEstado({ carregando: false, usuario: u, papel, perfil: { nome: aut.data().nome || u.displayName, email }, erro: "" });
      }
      const snap = await getDoc(doc(db, "usuarios", u.uid));
      let perfil = snap.exists() ? snap.data() : null;
      // se o professor liberou (desvinculou) a matrícula, o aluno refaz o primeiro acesso
      if (perfil?.matricula) {
        const m = await getDoc(doc(db, "matriculas", perfil.matricula));
        if (!m.exists() || m.data().uid !== u.uid) perfil = { ...perfil, matricula: "" };
      }
      setEstado({ carregando: false, usuario: u, papel: "aluno", perfil, erro: "" });
    } catch (e) {
      setEstado({ carregando: false, usuario: u, papel: null, perfil: null, erro: traduzirErro(e) });
    }
  };

  useEffect(() => onAuthStateChanged(auth, recarregar), []);

  return { ...estado, recarregar: () => recarregar(auth.currentUser) };
}

export async function entrarComGoogle() {
  await signInWithPopup(auth, googleProvider);
}

export async function sair() {
  await encerrarConfirmacao(); // a próxima entrada pede senha/matrícula de novo
  await signOut(auth);
}

export function traduzirErro(e) {
  const c = e?.code || "";
  const mapa = {
    "auth/popup-closed-by-user": "A janela do Google foi fechada antes de concluir. Tente de novo.",
    "auth/cancelled-popup-request": "Já existe uma janela de login aberta.",
    "auth/popup-blocked": "O navegador bloqueou a janela do Google. Libere pop-ups para este site.",
    "auth/unauthorized-domain": "Este endereço ainda não está autorizado no Firebase.",
    "permission-denied": "Você não tem permissão para esta ação.",
    unavailable: "Sem conexão com o servidor. Verifique a internet.",
  };
  return mapa[c] || `Algo deu errado (${c || e?.message || "erro desconhecido"}).`;
}

export const NOME_PAPEL = { admin: "Administrador", professor: "Professor", aluno: "Aluno" };
