import { useCallback, useEffect, useState } from "react";
import { turmasDoAluno, turmasDoProfessor } from "./turmas";
import { traduzirErro } from "./sessao";

// Turmas que a pessoa logada enxerga: as dela (aluno), as que criou (professor) ou todas (admin)
export function useTurmas(sessao) {
  const [estado, setEstado] = useState({ carregando: true, turmas: [], erro: "" });

  const carregar = useCallback(async () => {
    setEstado((e) => ({ ...e, carregando: true }));
    try {
      const turmas = sessao.papel === "aluno"
        ? await turmasDoAluno(sessao.perfil?.matricula)
        : await turmasDoProfessor(sessao.usuario.uid, sessao.papel === "admin");
      setEstado({ carregando: false, turmas, erro: "" });
    } catch (e) {
      setEstado({ carregando: false, turmas: [], erro: traduzirErro(e) });
    }
  }, [sessao.papel, sessao.usuario.uid, sessao.perfil?.matricula]);

  useEffect(() => { carregar(); }, [carregar]);
  return { ...estado, recarregar: carregar };
}
