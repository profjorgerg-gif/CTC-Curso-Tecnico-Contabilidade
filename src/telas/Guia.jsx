// Guia Pedagógico do professor (aprovado em 04/10/2026): Slides, Plano Semestral,
// Plano de Aula Mensal, Manual do Professor e Manual do Aluno.
import { useEffect, useState } from "react";
import { useTurmas } from "../lib/useTurmas";
import { traduzirErro } from "../lib/sessao";
import { disciplinaPorId } from "../dados/disciplinas";
import { listasDaTurma } from "../lib/exercicios";
import {
  excluirPlano, imprimirPlano, INSTRUMENTOS, lerPlanos, nomeDoMes, planoMensalPadrao, planoSemestralPadrao, salvarPlano,
} from "../lib/planos";
import { dataBR } from "../lib/contabil";
import { Slides } from "./Slides";
import { ManualDoAluno, ManualDoProfessor } from "./Manuais";

const ABAS = [["slides", "Slides"], ["semestral", "Plano Semestral"], ["mensal", "Plano de Aula Mensal"], ["professor", "Manual do Professor"], ["aluno", "Manual do Aluno"]];

export default function Guia({ sessao, rota, ir }) {
  const aba = ABAS.some(([id]) => id === rota[0]) ? rota[0] : "slides";
  return (
    <>
      <div>
        <h1>Guia Pedagógico</h1>
        <p className="suave" style={{ maxWidth: 780 }}>
          Material de apoio às aulas: slides para projetar, os planos exigidos pela SED/SC (preenchidos a partir da ementa e do que já está no CTC)
          e os manuais do professor e do aluno.
        </p>
      </div>
      <div className="abas" role="tablist">
        {ABAS.map(([id, rotulo]) => (
          <button key={id} role="tab" aria-selected={aba === id} className={aba === id ? "ativo" : ""} onClick={() => ir("guia", id)}>{rotulo}</button>
        ))}
      </div>
      {aba === "slides" && <Slides sessao={sessao} />}
      {(aba === "semestral" || aba === "mensal") && <Planos key={aba} sessao={sessao} tipo={aba} />}
      {aba === "professor" && <ManualDoProfessor />}
      {aba === "aluno" && <ManualDoAluno />}
    </>
  );
}

// ---------------- planos ----------------
function Planos({ sessao, tipo }) {
  const { turmas, carregando, erro } = useTurmas(sessao);
  const [turmaId, setTurmaId] = useState("");
  const turma = turmas.find((t) => t.id === turmaId) || turmas[0];
  return (
    <>
      {erro && <div className="aviso erro">{erro}</div>}
      {!carregando && turmas.length === 0 && <div className="aviso atencao">Crie uma turma em "Turmas e matrículas" para fazer os planos.</div>}
      {turmas.length > 0 && (
        <div className="campo" style={{ maxWidth: 520, flex: "none" }}>
          <label htmlFor="pl-turma">Turma</label>
          <select id="pl-turma" value={turma?.id || ""} onChange={(e) => setTurmaId(e.target.value)}>
            {turmas.map((t) => <option key={t.id} value={t.id}>{t.nome} · {disciplinaPorId(t.disciplina)?.sigla} · {t.semestre}</option>)}
          </select>
        </div>
      )}
      {turma && <PlanosDaTurma key={`${turma.id}-${tipo}`} sessao={sessao} turma={turma} tipo={tipo} />}
    </>
  );
}

function PlanosDaTurma({ sessao, turma, tipo }) {
  const [dados, setDados] = useState(null);
  const [listas, setListas] = useState([]);
  const [editando, setEditando] = useState(null); // { id, plano }
  const [novoMes, setNovoMes] = useState("");
  const [msg, setMsg] = useState({});
  const professor = sessao.perfil?.nome || sessao.usuario.displayName || "";

  const carregar = async () => {
    try {
      const [p, l] = await Promise.all([lerPlanos(turma.id), listasDaTurma(turma.id, false)]);
      setDados(p); setListas(l);
      if (tipo === "semestral") setEditando({ id: "semestral", plano: p.semestral || planoSemestralPadrao(turma, professor, l), novo: !p.semestral });
    } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
  };
  useEffect(() => { carregar(); }, [turma.id]);

  const salvar = async (id, plano) => {
    try { await salvarPlano(turma, id, plano); setMsg({ texto: "Plano salvo." }); await carregar(); if (tipo === "mensal") setEditando(null); }
    catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
  };
  const imprimir = (plano) => { try { imprimirPlano(plano); } catch (e) { setMsg({ tipo: "erro", texto: e.message }); } };

  if (!dados) return <p className="suave">{msg.texto || "Carregando os planos…"}</p>;

  if (tipo === "semestral") {
    return editando && (
      <>
        {editando.novo && <div className="aviso pequeno">Plano ainda não salvo: os campos vieram da ementa oficial da disciplina e do que já existe na turma. Revise e salve.</div>}
        <FormPlano plano={editando.plano} semestral aoSalvar={(p) => salvar("semestral", p)} aoImprimir={imprimir} listas={listas} turma={turma} msg={msg} />
      </>
    );
  }

  const criar = () => {
    if (!novoMes) return setMsg({ tipo: "erro", texto: "Escolha o mês." });
    if (dados.mensais.some((m) => m.mes === novoMes)) return setMsg({ tipo: "erro", texto: `Já existe o plano de ${nomeDoMes(novoMes)}.` });
    setMsg({});
    setEditando({ id: `m-${novoMes}`, plano: planoMensalPadrao(turma, professor, dados.semestral, listas, novoMes), novo: true });
  };
  return (
    <>
      {!dados.semestral && <div className="aviso atencao pequeno">Dica: salve primeiro o Plano Semestral — o plano mensal herda dele os campos comuns (habilidades, recursos, recuperação, referências).</div>}
      {!editando && (
        <section className="cartao sem-padding">
          <div className="cartao-topo">
            <h2>Planos de aula mensais</h2>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input aria-label="Mês do novo plano" type="month" value={novoMes} onChange={(e) => setNovoMes(e.target.value)} />
              <button className="botao pequeno" onClick={criar}>Novo plano mensal</button>
            </div>
          </div>
          <div className="tabela-caixa">
            <table>
              <thead><tr><th>Mês</th><th>Período</th><th>Situação</th><th></th></tr></thead>
              <tbody>
                {dados.mensais.length === 0 && <tr><td colSpan={4} className="suave">Nenhum plano mensal ainda. Escolha o mês e clique em "Novo plano mensal".</td></tr>}
                {dados.mensais.map((m) => (
                  <tr key={m.id}>
                    <td style={{ textTransform: "capitalize" }}>{nomeDoMes(m.mes)}</td>
                    <td className="mono pequeno">{dataBR(m.inicio)} a {dataBR(m.fim)}</td>
                    <td><span className={`selo ${m.status === "Pronto" ? "verde" : "ocre"}`}>{m.status}</span></td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button className="botao secundario pequeno" onClick={() => setEditando({ id: m.id, plano: m })}>Editar</button>{" "}
                      <button className="botao secundario pequeno" onClick={() => imprimir(m)}>Imprimir / PDF</button>{" "}
                      <button className="botao perigo pequeno" onClick={async () => {
                        if (!window.confirm(`Excluir o plano de ${nomeDoMes(m.mes)}?`)) return;
                        try { await excluirPlano(turma, m.id); await carregar(); } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
                      }}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {msg.texto && <div className={`aviso ${msg.tipo || ""}`} style={{ margin: "0 18px 16px" }} role="status">{msg.texto}</div>}
        </section>
      )}
      {editando && (
        <FormPlano plano={editando.plano} aoSalvar={(p) => salvar(editando.id, p)} aoImprimir={imprimir} aoCancelar={() => setEditando(null)} listas={listas} turma={turma} msg={msg} />
      )}
    </>
  );
}

// ---------------- formulário (semestral ou mensal) ----------------
function FormPlano({ plano, semestral, aoSalvar, aoImprimir, aoCancelar, turma, msg }) {
  const [p, setP] = useState(plano);
  const [salvando, setSalvando] = useState(false);
  const muda = (k) => (e) => setP({ ...p, [k]: e.target.value });
  const Texto = ({ k, rotulo, linhas = 4, ajuda }) => (
    <div className="campo" style={{ flex: "none" }}>
      <label htmlFor={`pl-${k}`}>{rotulo}</label>
      <textarea id={`pl-${k}`} rows={linhas} value={p[k] || ""} onChange={muda(k)} style={{ minHeight: 0, fontFamily: "inherit" }} />
      {ajuda && <span className="pequeno suave">{ajuda}</span>}
    </div>
  );
  const Linha = ({ k, rotulo, largura = "1 1 220px", tipo = "text" }) => (
    <div className="campo" style={{ flex: largura }}>
      <label htmlFor={`pl-${k}`}>{rotulo}</label>
      <input id={`pl-${k}`} type={tipo} value={p[k] || ""} onChange={muda(k)} />
    </div>
  );
  const salvar = async () => { setSalvando(true); await aoSalvar(p); setSalvando(false); };
  const modulos = disciplinaPorId(turma.disciplina)?.modulos || [];

  return (
    <section className="cartao">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <h2>{semestral ? `Plano Semestral — ${p.componente}` : `Plano de aula — ${nomeDoMes(p.mes)}`}</h2>
        <div className="campo" style={{ flex: "0 0 160px" }}>
          <label htmlFor="pl-status">Situação</label>
          <select id="pl-status" value={p.status} onChange={muda("status")}><option>Pendente</option><option>Pronto</option></select>
        </div>
      </div>
      <h3 className="pequeno" style={{ margin: 0, color: "var(--destaque)" }}>Identificação</h3>
      <div className="linha-form">
        {Linha({ k: "escola", rotulo: "Unidade escolar", largura: "1 1 260px" })}
        {Linha({ k: "curso", rotulo: "Curso" })}
        {Linha({ k: "modalidade", rotulo: "Modalidade", largura: "1 1 280px" })}
      </div>
      <div className="linha-form">
        {Linha({ k: "componente", rotulo: "Componente curricular" })}
        {Linha({ k: "turma", rotulo: "Turma", largura: "0 1 200px" })}
        {Linha({ k: "semestre", rotulo: "Semestre", largura: "0 1 120px" })}
        {Linha({ k: "aulasSemanais", rotulo: "Aulas semanais", largura: "0 1 130px" })}
        {Linha({ k: "professor", rotulo: "Professor(a)" })}
      </div>
      {!semestral && (
        <div className="linha-form">
          {Linha({ k: "inicio", rotulo: "Início", tipo: "date", largura: "0 1 180px" })}
          {Linha({ k: "fim", rotulo: "Fim", tipo: "date", largura: "0 1 180px" })}
        </div>
      )}

      <h3 className="pequeno" style={{ margin: "6px 0 0", color: "var(--destaque)" }}>Conteúdo</h3>
      {semestral ? (
        <>
          {Texto({ k: "objetos", rotulo: "Objetos de conhecimento", linhas: 4, ajuda: "Vem da ementa oficial (PPC). Ajuste se precisar." })}
          {Texto({ k: "habilidades", rotulo: "Habilidades", linhas: 5 })}
          {Texto({ k: "objetivo", rotulo: "Objetivo de aprendizagem", linhas: 3 })}
          {Texto({ k: "modulos", rotulo: "Organização dos conteúdos (módulos)", linhas: 6 })}
        </>
      ) : (
        <>
          <div className="campo" style={{ flex: "none" }}>
            <label htmlFor="pl-objetos">Objetos de conhecimento do mês</label>
            <textarea id="pl-objetos" rows={4} value={p.objetos || ""} onChange={muda("objetos")} style={{ minHeight: 0, fontFamily: "inherit" }} />
            {modulos.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                <span className="pequeno suave">Incluir módulo:</span>
                {modulos.map((m) => (
                  <button key={m} type="button" className="botao secundario pequeno" onClick={() => setP({ ...p, objetos: [p.objetos, m].filter(Boolean).join("\n") })}>{m.length > 40 ? `${m.slice(0, 40)}…` : m}</button>
                ))}
              </div>
            )}
          </div>
          {Texto({ k: "habilidades", rotulo: "Habilidades", linhas: 4 })}
          {Texto({ k: "expectativas", rotulo: "Expectativas de aprendizagem", linhas: 3 })}
          {Texto({ k: "atividades", rotulo: "Experiências de aprendizagem (atividades)", linhas: 5, ajuda: "As listas de exercícios do mês já entram aqui. Acrescente as aulas, slides e demais atividades." })}
        </>
      )}

      <h3 className="pequeno" style={{ margin: "6px 0 0", color: "var(--destaque)" }}>Metodologia e avaliação</h3>
      {semestral && Texto({ k: "metodologia", rotulo: "Metodologia", linhas: 4 })}
      {Texto({ k: "recursos", rotulo: "Recursos didáticos", linhas: 3 })}
      <fieldset style={{ border: 0, padding: 0, margin: 0, display: "flex", flexWrap: "wrap", gap: "6px 18px" }}>
        <legend className="pequeno" style={{ color: "var(--tinta-media)", marginBottom: 6 }}>Instrumentos de avaliação</legend>
        {INSTRUMENTOS.map((i) => (
          <label key={i} className="pequeno" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" style={{ minHeight: 0 }} checked={(p.instrumentos || []).includes(i)}
              onChange={(e) => setP({ ...p, instrumentos: e.target.checked ? [...(p.instrumentos || []), i] : p.instrumentos.filter((x) => x !== i) })} />
            {i}
          </label>
        ))}
      </fieldset>
      <div className="linha-form">{Linha({ k: "outrosInstrumentos", rotulo: "Outros instrumentos", largura: "1 1 400px" })}</div>
      {Texto({ k: "datasAvaliacao", rotulo: "Datas das avaliações", linhas: 3, ajuda: "As listas avaliativas e de recuperação com prazo já entram aqui." })}
      {Texto({ k: "recuperacao", rotulo: "Recuperação paralela", linhas: 3 })}
      {Texto({ k: "adaptacoes", rotulo: "Adaptações curriculares", linhas: 2 })}
      {!semestral && Texto({ k: "observacoes", rotulo: "Observações gerais", linhas: 2 })}
      {Texto({ k: "referencias", rotulo: "Referências", linhas: 5 })}
      <div className="linha-form">
        {Linha({ k: "local", rotulo: "Local", largura: "0 1 220px" })}
        {Linha({ k: "dataDocumento", rotulo: "Data", tipo: "date", largura: "0 1 180px" })}
      </div>
      {msg?.texto && <div className={`aviso ${msg.tipo || ""}`} role="status">{msg.texto}</div>}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="botao" disabled={salvando} onClick={salvar}>{salvando ? "Salvando…" : "Salvar"}</button>
        <button className="botao secundario" onClick={() => aoImprimir(p)}>Imprimir / PDF</button>
        {aoCancelar && <button className="botao secundario" onClick={aoCancelar}>Voltar</button>}
      </div>
      <p className="pequeno suave" style={{ margin: 0 }}>Para gerar o PDF, escolha "Salvar como PDF" na janela de impressão do navegador.</p>
    </section>
  );
}
