import { DISCIPLINAS } from "../dados/disciplinas";
import { useEffect, useState } from "react";
import { useTurmas } from "../lib/useTurmas";
import { lerUltimoBackup } from "../lib/backup";
import { UltimoBackup } from "./Backup";
import PainelProfessor from "./PainelProfessor";

const INTRO = {
  aluno: "Aqui ficam as suas disciplinas, as turmas em que você está matriculado e as consultas ao Banco de Dados do curso.",
  professor: "Crie turmas com a lista de alunos, acompanhe as disciplinas e mantenha o Banco de Dados comum do curso.",
  admin: "Você autoriza professores e administradores, mantém o Banco de Dados e enxerga todas as turmas.",
};

export default function Inicio({ sessao, papel, ir }) {
  const { turmas, carregando, erro } = useTurmas(sessao);
  const minhas = new Set(turmas.map((t) => t.disciplina));
  const primeiroNome = (sessao.perfil?.nome || sessao.usuario.displayName || "").split(" ")[0];

  return (
    <>
      <div>
        <h1>Olá, {primeiroNome}</h1>
        <p className="suave" style={{ maxWidth: 680 }}>{INTRO[papel]}</p>
      </div>

      {papel === "admin" && <AvisoBackup ir={ir} />}
      {papel !== "aluno" && <PainelProfessor sessao={sessao} ir={ir} />}

      <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2>Trilha do curso</h2>
        {papel === "aluno" && (
          <p className="suave pequeno">Você acessa as etapas em que está matriculado. As bloqueadas aparecem para você saber onde está no curso.</p>
        )}
        {erro && <div className="aviso erro">{erro}</div>}
        <div className="trilha">
          {DISCIPLINAS.map((d) => {
            const bloqueada = papel === "aluno" && !minhas.has(d.id);
            const status = papel === "aluno"
              ? (bloqueada ? ["Bloqueada", "cinza"] : ["Em andamento", "cheio"])
              : (minhas.has(d.id) ? [papel === "admin" ? "Com turma" : "Sua turma", "verde"] : ["Sem turma", "cinza"]);
            return (
              <button key={d.id} className={`etapa${bloqueada ? " bloqueada" : ""}${!bloqueada && minhas.has(d.id) ? " atual" : ""}`}
                disabled={bloqueada || carregando} onClick={() => ir("disciplinas", d.id)}
                aria-label={`${d.nome} — ${status[0]}`}>
                <span className="mono pequeno suave">ETAPA {d.etapa}</span>
                <span className="sigla">{d.sigla}</span>
                <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.3 }}>{d.nome}</span>
                <span className={`selo ${status[1]}`} style={{ alignSelf: "flex-start" }}>{carregando ? "…" : status[0]}</span>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}

// Administrador: lembrete do último backup completo (alerta depois de 30 dias)
function AvisoBackup({ ir }) {
  const [ultimo, setUltimo] = useState(undefined);
  useEffect(() => { lerUltimoBackup().then(setUltimo).catch(() => setUltimo(null)); }, []);
  return (
    <section style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ flex: "1 1 420px" }}><UltimoBackup ultimo={ultimo} /></div>
      <button className="botao secundario pequeno" onClick={() => ir("backup")}>Ir para Backup</button>
    </section>
  );
}
