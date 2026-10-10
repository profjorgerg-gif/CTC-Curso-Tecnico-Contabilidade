// Guia Pedagógico do professor (aprovado em 04/10/2026): Slides, Plano Semestral,
// Plano de Aula Mensal, Manual do Professor e Manual do Aluno.
import { useEffect, useState } from "react";
import { useTurmas } from "../lib/useTurmas";
import { traduzirErro } from "../lib/sessao";
import { disciplinaPorId } from "../dados/disciplinas";
import { listasDaTurma } from "../lib/exercicios";
import {
  excluirPlano, imprimirPlano, lerPlanos, noModeloAtual, nomeDoMes, planoMensalPadrao, planoSemestralPadrao, salvarPlano,
} from "../lib/planos";
import { dataBR } from "../lib/contabil";
import { Slides } from "./Slides";
import { ManualDoAluno, ManualDoProfessor } from "./Manuais";
import GuiaProfessor from "./GuiaProfessor";

const ABAS = [["roteiro", "🧭 Guia do professor"], ["slides", "Slides"], ["semestral", "Plano Semestral"], ["mensal", "Sequência Didática (Plano de Aula)"], ["professor", "Manual do Professor"], ["aluno", "Manual do Aluno"]];

export default function Guia({ sessao, rota, ir }) {
  const aba = ABAS.some(([id]) => id === rota[0]) ? rota[0] : "roteiro";
  return (
    <>
      <div>
        <h1>Guia Pedagógico</h1>
        <p className="suave" style={{ maxWidth: 780 }}>
          O mapa do CTC para o dia a dia e o material de apoio às aulas: slides para projetar, os planos exigidos pela SED/SC (preenchidos a partir da ementa e do que já está no CTC)
          e os manuais do professor e do aluno.
        </p>
      </div>
      <div className="abas" role="tablist">
        {ABAS.map(([id, rotulo]) => (
          <button key={id} role="tab" aria-selected={aba === id} className={aba === id ? "ativo" : ""} onClick={() => ir("guia", id)}>{rotulo}</button>
        ))}
      </div>
      {aba === "roteiro" && <GuiaProfessor sessao={sessao} ir={ir} />}
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
      // planos salvos antes do modelo do CEDUP recebem os campos novos com os textos-padrão
      if (tipo === "semestral") setEditando({ id: "semestral", plano: noModeloAtual(p.semestral, planoSemestralPadrao(turma, professor, l)), novo: !p.semestral });
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
      {!dados.semestral && <div className="aviso atencao pequeno">Dica: salve primeiro o Plano Semestral — a sequência didática herda dele os campos comuns (objetos, habilidades, metodologia, recuperação, referências).</div>}
      {!editando && (
        <section className="cartao sem-padding">
          <div className="cartao-topo">
            <h2>Sequências didáticas (plano de aula)</h2>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input aria-label="Mês do novo plano" type="month" value={novoMes} onChange={(e) => setNovoMes(e.target.value)} />
              <button className="botao pequeno" onClick={criar}>Nova sequência didática</button>
            </div>
          </div>
          <div className="tabela-caixa">
            <table>
              <thead><tr><th>Mês</th><th>Período</th><th>Situação</th><th></th></tr></thead>
              <tbody>
                {dados.mensais.length === 0 && <tr><td colSpan={4} className="suave">Nenhuma sequência didática ainda. Escolha o mês e clique em "Nova sequência didática".</td></tr>}
                {dados.mensais.map((m) => (
                  <tr key={m.id}>
                    <td style={{ textTransform: "capitalize" }}>{nomeDoMes(m.mes)}</td>
                    <td className="mono pequeno">{dataBR(m.inicio)} a {dataBR(m.fim)}</td>
                    <td><span className={`selo ${m.status === "Pronto" ? "verde" : "ocre"}`}>{m.status}</span></td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button className="botao secundario pequeno" onClick={() => setEditando({ id: m.id, plano: noModeloAtual(m, planoMensalPadrao(turma, professor, dados.semestral, listas, m.mes)) })}>Editar</button>{" "}
                      <button className="botao secundario pequeno" onClick={() => imprimir(noModeloAtual(m, planoMensalPadrao(turma, professor, dados.semestral, listas, m.mes)))}>Imprimir / PDF</button>{" "}
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

// ---------------- formulário (semestral ou sequência didática), no formato do CEDUP ----------------
const CAMPOS_SEMESTRAL = [
  ["ementa", "Ementa", 4, "Vem da ementa oficial (PPC)."],
  ["habilidades", "Habilidades", 5],
  ["bases", "Bases tecnológicas / conteúdos por unidade", 6, "Uma unidade por linha. Use **texto** para negrito (ex.: **Unidade 1 – Fundamentos:** conteúdos…)."],
  ["objetoConhecimento", "Objeto do conhecimento", 3],
  ["metodologia", "Metodologia de ensino-aprendizagem", 4],
  ["recursos", "Recursos utilizados", 2],
  ["instrumentos", "Instrumentos diversificados de avaliação", 6],
  ["datasAvaliacao", "Datas previstas de avaliações e recuperações", 5, "As listas avaliativas e de recuperação com prazo já entram aqui."],
  ["recuperacao", "Recuperação paralela de aprendizagem", 6],
  ["adaptacoes", "Adaptações e observações", 4],
  ["referencias", "Referências bibliográficas", 6, "Uma referência por linha."],
];
const CAMPOS_SEQUENCIA = [
  ["objetos", "Objetos de conhecimento", 4],
  ["habilidades", "Habilidades", 5],
  ["competenciaGeral", "Competência geral da unidade curricular", 4],
  ["observacaoMetodologica", "Observação metodológica", 2],
  ["objetivo", "Objetivo de aprendizagem", 5, "Conteúdos do período. Use **texto** para negrito."],
  ["metodologia", "Metodologia de ensino-aprendizagem", 4],
  ["recursos", "Recursos utilizados", 2],
  ["instrumentos", "Instrumentos diversificados de avaliação", 6],
  ["datasAvaliacao", "Datas previstas de avaliações e recuperações", 5, "As listas avaliativas e de recuperação com prazo dentro do período já entram aqui."],
  ["recuperacao", "Recuperação paralela de aprendizagem", 6],
  ["adaptacoes", "Adaptações e observações", 4],
  ["referencias", "Referências bibliográficas", 6, "Uma referência por linha."],
];

function FormPlano({ plano, semestral, aoSalvar, aoImprimir, aoCancelar, turma, msg }) {
  const [p, setP] = useState(plano);
  const [salvando, setSalvando] = useState(false);
  const muda = (k) => (e) => setP({ ...p, [k]: e.target.value });
  const Texto = (k, rotulo, linhas = 4, ajuda) => (
    <div key={k} className="campo" style={{ flex: "none" }}>
      <label htmlFor={`pl-${k}`}>{rotulo}</label>
      <textarea id={`pl-${k}`} rows={linhas} value={p[k] || ""} onChange={muda(k)} style={{ minHeight: 0, fontFamily: "inherit" }} />
      {ajuda && <span className="pequeno suave">{ajuda}</span>}
    </div>
  );
  const Linha = (k, rotulo, largura = "1 1 220px", tipo = "text") => (
    <div key={k} className="campo" style={{ flex: largura }}>
      <label htmlFor={`pl-${k}`}>{rotulo}</label>
      <input id={`pl-${k}`} type={tipo} value={p[k] || ""} onChange={muda(k)} />
    </div>
  );
  const salvar = async () => { setSalvando(true); await aoSalvar(p); setSalvando(false); };
  const modulos = disciplinaPorId(turma.disciplina)?.modulos || [];

  return (
    <section className="cartao">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <h2>{semestral ? `Plano Semestral Pós-Médio ${p.periodo || ""} — ${p.disciplina}` : `Sequência didática — ${nomeDoMes(p.mes)}`}</h2>
        <div className="campo" style={{ flex: "0 0 160px" }}>
          <label htmlFor="pl-status">Situação</label>
          <select id="pl-status" value={p.status} onChange={muda("status")}><option>Pendente</option><option>Pronto</option></select>
        </div>
      </div>
      <p className="pequeno suave" style={{ margin: 0 }}>Mesmo formato do modelo do CEDUP Hermann Hering (A4 paisagem, com o cabeçalho da escola). Os campos já vêm com os textos-padrão do modelo; ajuste o que precisar.</p>
      {p.modeloAntigo && <div className="aviso atencao pequeno">Este plano tinha sido salvo no modelo anterior e foi convertido para o modelo do CEDUP, com os textos-padrão. Revise os campos e clique em Salvar.</div>}
      <h3 className="pequeno" style={{ margin: 0, color: "var(--destaque)" }}>Identificação</h3>
      {semestral ? (
        <>
          <div className="linha-form">
            {Linha("curso", "Curso")}
            {Linha("disciplina", "Disciplina")}
            {Linha("periodo", "Período (ano)", "0 1 130px")}
          </div>
          <div className="linha-form">
            {Linha("modulo", "Módulo", "0 1 110px")}
            {Linha("turma", "Turma", "0 1 160px")}
            {Linha("professor", "Professor")}
            {Linha("aulasSemanais", "Nº aulas", "0 1 110px")}
          </div>
        </>
      ) : (
        <>
          <div className="linha-form">
            {Linha("inicio", "Período: de", "0 1 180px", "date")}
            {Linha("fim", "até", "0 1 180px", "date")}
            {Linha("curso", "Curso")}
          </div>
          <div className="linha-form">
            {Linha("professor", "Professor(a)")}
            {Linha("area", "Área(s) do conhecimento")}
            {Linha("turma", "Turma(s)", "0 1 140px")}
            {Linha("aulasSemanais", "Nº aulas semanais", "0 1 150px")}
          </div>
          <div className="linha-form">{Linha("componente", "Componente curricular", "1 1 400px")}</div>
        </>
      )}
      <h3 className="pequeno" style={{ margin: "6px 0 0", color: "var(--destaque)" }}>Conteúdo</h3>
      {(semestral ? CAMPOS_SEMESTRAL : CAMPOS_SEQUENCIA).map(([k, r, n, a]) => (
        <div key={k}>
          {Texto(k, r, n, a)}
          {((semestral && k === "bases") || (!semestral && k === "objetivo")) && modulos.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
              <span className="pequeno suave">Incluir módulo:</span>
              {modulos.map((m) => (
                <button key={m} type="button" className="botao secundario pequeno" onClick={() => setP({ ...p, [k]: [p[k], m].filter(Boolean).join("\n") })}>{m.length > 40 ? `${m.slice(0, 40)}…` : m}</button>
              ))}
            </div>
          )}
        </div>
      ))}
      {semestral && (
        <div className="linha-form">
          {Linha("local", "Local", "0 1 220px")}
          {Linha("dataDocumento", "Data", "0 1 180px", "date")}
        </div>
      )}
      {msg?.texto && <div className={`aviso ${msg.tipo || ""}`} role="status">{msg.texto}</div>}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="botao" disabled={salvando} onClick={salvar}>{salvando ? "Salvando…" : "Salvar"}</button>
        <button className="botao secundario" onClick={() => aoImprimir(p)}>Imprimir / PDF</button>
        {aoCancelar && <button className="botao secundario" onClick={aoCancelar}>Voltar</button>}
      </div>
      <p className="pequeno suave" style={{ margin: 0 }}>Para gerar o PDF, escolha "Salvar como PDF" na janela de impressão do navegador (o layout já vem em paisagem). Desmarque "Cabeçalhos e rodapés" nas opções para não sair o endereço da página.</p>
    </section>
  );
}
