import { DISCIPLINAS, disciplinaPorId } from "../dados/disciplinas";
import { useTurmas } from "../lib/useTurmas";
import { EMENTAS, FONTE_EMENTAS } from "../dados/ementas";
import { teoriaDo } from "../dados/teoria";
import Teoria from "../componentes/Teoria";
import { praticasDo } from "../dados/praticas";
import BalancoSucessivo from "../componentes/BalancoSucessivo";
import Razonetes from "../componentes/Razonetes";
import FichaEstoque from "../componentes/FichaEstoque";
import { useEffect, useState } from "react";
import { usePlano } from "../lib/contabil";
import { estudado, marcarEstudado, passoDo, situacaoDoAluno } from "../lib/trilha";

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

  // aluno: situação em cada módulo (estudado · questionário · prática)
  const { plano } = usePlano();
  const [situacao, setSituacao] = useState(null);
  const turmaDaDisc = atual && papel === "aluno" ? turmas.find((t) => t.disciplina === atual.id) : null;
  useEffect(() => {
    setSituacao(null);
    if (!turmaDaDisc || !plano || rota[1]) return;
    situacaoDoAluno(turmaDaDisc, sessao.perfil?.matricula, plano, atual.id, atual.modulos.length).then(setSituacao).catch(() => setSituacao(null));
  }, [turmaDaDisc?.id, !!plano, rota[1]]);

  // módulo aberto: teoria (rota disciplinas/{id}/m01)
  const nModulo = atual && /^m\d+$/.test(rota[1] || "") ? Number(rota[1].slice(1)) : null;
  const teoria = nModulo ? teoriaDo(atual.id, nModulo) : null;
  if (atual && teoria && (papel !== "aluno" || minhas.has(atual.id))) {
    return (
      <>
        <button className="botao secundario pequeno" style={{ alignSelf: "flex-start" }} onClick={() => ir("disciplinas", atual.id)}>← {atual.nome}</button>
        <div>
          <span className="mono pequeno suave">{atual.sigla} · MÓDULO {String(nModulo).padStart(2, "0")}</span>
          <h1>{teoria.titulo}</h1>
          <p className="suave">{teoria.resumo}</p>
        </div>
        <Teoria teoria={teoria} />
        {praticasDo(atual.id, nModulo).map((ex) => (ex.tipo === "balanco-sucessivo" ? <BalancoSucessivo key={ex.id} ex={ex} /> : ex.tipo === "razonetes" ? <Razonetes key={ex.id} ex={ex} /> : ex.tipo === "ficha-estoque" ? <FichaEstoque key={ex.id} ex={ex} /> : null))}
        <ProximoPasso disciplina={atual} n={nModulo} papel={papel} ir={ir} />
      </>
    );
  }

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
          <div className="cartao-topo"><h2>Módulos</h2></div>
          {atual.modulos.length === 0 && <p className="suave" style={{ padding: 18 }}>Módulos ainda não definidos — aguardando a ementa.</p>}
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {atual.modulos.map((m, i) => {
              const tem = !!teoriaDo(atual.id, i + 1);
              return (
                <li key={m} style={{ display: "flex", gap: 14, padding: "12px 18px", borderTop: "1px solid var(--linha-suave)", alignItems: "center" }}>
                  <span className="mono" style={{ color: "var(--destaque)", fontWeight: 600, minWidth: 28 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                    {m}
                    {tem && situacao?.[i + 1] && <SeloTrilha s={situacao[i + 1]} />}
                  </span>
                  {tem ? <button className="botao pequeno" onClick={() => ir("disciplinas", atual.id, `m${String(i + 1).padStart(2, "0")}`)}>Estudar</button> : <span className="selo cinza">Em preparação</span>}
                </li>
              );
            })}
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

// selos da trilha no card do módulo (aluno)
function SeloTrilha({ s }) {
  const selo = (estado, rotulo) => estado && <span className={`selo ${estado === "feito" ? "verde" : "cinza"}`}>{estado === "feito" ? "✓ " : ""}{rotulo}</span>;
  return (
    <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {selo(s.estudado ? "feito" : "pendente", "Estudado")}
      {selo(s.questionario, "Questionário")}
      {selo(s.pratica, "Prática no CTC")}
    </span>
  );
}

// fim da página do módulo: o que fazer agora (aluno) ou como usar com a turma (professor)
function ProximoPasso({ disciplina, n, papel, ir }) {
  const passo = passoDo(disciplina.id, n);
  const [feito, setFeito] = useState(() => estudado(disciplina.id, n));
  const proximo = n < disciplina.modulos.length && teoriaDo(disciplina.id, n + 1) ? n + 1 : null;
  const irProximo = proximo && (
    <button className="botao secundario" onClick={() => ir("disciplinas", disciplina.id, `m${String(proximo).padStart(2, "0")}`)}>Próximo módulo: {String(proximo).padStart(2, "0")} →</button>
  );
  if (papel !== "aluno") {
    return (
      <section className="cartao" style={{ gap: 10 }}>
        <h2>Próximo passo do aluno</h2>
        {passo && <p style={{ margin: 0 }}>{passo.texto}</p>}
        <p className="pequeno suave" style={{ margin: 0 }}>Questionários deste módulo: Turmas e matrículas → turma → Exercícios da turma → Lista de questões teóricas. Nas listas de escrituração, escolha o nível de ajuda de cada lista.</p>
        {irProximo && <div>{irProximo}</div>}
      </section>
    );
  }
  const alternar = () => { marcarEstudado(disciplina.id, n, !feito); setFeito(!feito); };
  return (
    <section className="cartao" style={{ gap: 12 }}>
      <h2>Próximo passo</h2>
      <ol style={{ margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 8, lineHeight: 1.55 }}>
        <li>Releia os destaques e os exemplos deste módulo.</li>
        {passo && <li>{passo.texto}</li>}
        <li>Responda o questionário do módulo quando o professor enviar (menu Questionários).</li>
      </ol>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {passo?.destino && <button className="botao" onClick={() => ir(...passo.destino)}>{passo.botao}</button>}
        <button className={`botao ${feito ? "secundario" : ""}`} onClick={alternar}>{feito ? "✓ Estudado (desmarcar)" : "Marcar como estudado"}</button>
        {irProximo}
      </div>
    </section>
  );
}
