import { DISCIPLINAS, disciplinaPorId } from "../dados/disciplinas";
import { useTurmas } from "../lib/useTurmas";
import { EMENTAS, FONTE_EMENTAS } from "../dados/ementas";

// Ementa oficial do componente curricular (texto literal do documento da SED/SC)
function Ementa({ e }) {
  const titulo = { fontSize: 13, fontWeight: 600, color: "var(--destaque)", textTransform: "uppercase", letterSpacing: 0.4, margin: "0 0 6px" };
  const lista = { margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 };
  return (
    <section className="cartao" aria-labelledby="titulo-ementa">
      <h2 id="titulo-ementa">Ementa oficial</h2>
      <div>
        <h3 style={titulo}>Objeto do Conhecimento</h3>
        <p>{e.objeto}</p>
      </div>
      <div>
        <h3 style={titulo}>Habilidade</h3>
        <ul style={lista}>{e.habilidade.map((h) => <li key={h}>{h}</li>)}</ul>
      </div>
      <div>
        <h3 style={titulo}>Referência Bibliográfica Básica</h3>
        <ul style={lista}>{e.basica.map((r) => <li key={r}>{r}</li>)}</ul>
      </div>
      <div>
        <h3 style={titulo}>Referência Bibliográfica Complementar</h3>
        {e.complementar.length
          ? <ul style={lista}>{e.complementar.map((r) => <li key={r}>{r}</li>)}</ul>
          : <p className="suave">Não consta no documento para este componente.</p>}
      </div>
      <p className="pequeno suave" style={{ borderTop: "1px solid var(--linha-suave)", paddingTop: 10 }}>
        Fonte: {FONTE_EMENTAS.autor} <strong>{FONTE_EMENTAS.titulo}</strong>{FONTE_EMENTAS.resto} {e.paginas}.
      </p>
    </section>
  );
}

export default function Disciplinas({ sessao, papel, ir, rota }) {
  const { turmas, carregando } = useTurmas(sessao);
  const minhas = new Set(turmas.map((t) => t.disciplina));
  const lista = papel === "aluno" ? DISCIPLINAS.filter((d) => minhas.has(d.id)) : DISCIPLINAS;
  const atual = rota[0] && disciplinaPorId(rota[0]);

  if (atual && (papel !== "aluno" || minhas.has(atual.id))) {
    const turmasDaDisc = turmas.filter((t) => t.disciplina === atual.id);
    return (
      <>
        <button className="botao secundario pequeno" style={{ alignSelf: "flex-start" }} onClick={() => ir("disciplinas")}>← Todas as disciplinas</button>
        <div>
          <span className="mono pequeno suave">ETAPA {atual.etapa} · {atual.sigla}</span>
          <h1>{atual.nome}</h1>
        </div>
        {EMENTAS[atual.id] && <Ementa e={EMENTAS[atual.id]} />}
        <section className="cartao sem-padding">
          <div className="cartao-topo"><h2>Módulos</h2><span className="pequeno suave">O conteúdo entra nas próximas fases</span></div>
          {atual.modulos.length === 0 && <p className="suave" style={{ padding: 18 }}>Módulos ainda não definidos — aguardando a ementa.</p>}
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {atual.modulos.map((m, i) => (
              <li key={m} style={{ display: "flex", gap: 14, padding: "12px 18px", borderTop: "1px solid var(--linha-suave)" }}>
                <span className="mono" style={{ color: "var(--destaque)", fontWeight: 600, minWidth: 28 }}>{String(i + 1).padStart(2, "0")}</span>
                <span>{m}</span>
              </li>
            ))}
          </ol>
        </section>
        {papel !== "aluno" && (
          <section className="cartao">
            <h2>Turmas desta disciplina</h2>
            {turmasDaDisc.length === 0
              ? <p className="suave">Nenhuma turma ainda. <button className="botao secundario pequeno" onClick={() => ir("turmas")}>Criar turma</button></p>
              : turmasDaDisc.map((t) => <p key={t.id}>{t.nome} <span className="suave pequeno">· {t.semestre}</span></p>)}
          </section>
        )}
      </>
    );
  }

  return (
    <>
      <div>
        <h1>{papel === "aluno" ? "Minhas disciplinas" : "Disciplinas"}</h1>
        <p className="suave">
          {papel === "aluno"
            ? "Aparecem só as disciplinas das turmas em que a sua matrícula está."
            : "Cada disciplina é um módulo do CTC. Todas usam o mesmo login, as mesmas turmas e o mesmo Banco de Dados."}
        </p>
      </div>
      {!carregando && lista.length === 0 && <div className="aviso atencao">Você ainda não está em nenhuma turma.</div>}
      <div className="grade">
        {lista.map((d) => (
          <article key={d.id} className="cartao">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="mono" style={{ fontSize: 22, fontWeight: 600, color: "var(--destaque)" }}>{d.sigla}</span>
              <span className="mono pequeno suave">ETAPA {d.etapa}</span>
            </div>
            <h2>{d.nome}</h2>
            <button className="botao pequeno" style={{ alignSelf: "flex-end", marginTop: "auto" }} onClick={() => ir("disciplinas", d.id)}>Abrir</button>
          </article>
        ))}
      </div>
    </>
  );
}
