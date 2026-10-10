// Progresso do aluno que antes ficava só no navegador dele (aprovado em 10/10/2026, Painel por etapa):
// módulos marcados como estudados e demonstrações montadas (DRE, DLPA, Balanço) passam a ser
// gravados também na empresa do aluno (campo "progresso"), para o professor ver no Painel.
// Gravação silenciosa: se falhar, nada muda para o aluno (a marca local continua valendo).
import { deleteField, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export function registrarProgresso(empresaId, chave, feito = true) {
  if (!empresaId) return;
  updateDoc(doc(db, "empresas", empresaId), { [`progresso.${chave}`]: feito ? new Date().toISOString() : deleteField() }).catch(() => {});
}

export const modulosEstudados = (empresa, disciplina = "cb") =>
  Object.keys(empresa?.progresso || {}).filter((k) => k.startsWith(`estudado-${disciplina}-`)).length;
