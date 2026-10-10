// Painel por etapa (aprovado em 10/10/2026, a partir do kit da CI Unidade II): no Início do
// professor, o andamento de cada aluno da turma em todas as etapas, quem está parado e o que
// aguarda você. Lê os livros uma vez e guarda enquanto a página estiver aberta ("Atualizar" relê).
import { useEffect, useState } from "react";
import { useTurmas } from "../lib/useTurmas";
import { traduzirErro } from "../lib/sessao";
import { usePlano } from "../lib/contabil";
import { disciplinaPorId } from "../dados/disciplinas";
import { alunosDaTurma } from "../lib/turmas";
import { ehQuestoes, finalidadeDe, listasDaTurma } from "../lib/exercicios";
import { lerGabarito } from "../lib/questoes";
import { acompanharAluno, DIAS_SEM_ATIVIDADE } from "../lib/acompanhamento";
import { gerarRelatorio } from "../lib/relatorioOrientacao";
import { modulosEstudados } from "../lib/progresso";
import { atende, listarChamados } from "../lib/suporte";

const cache = new Map(); // turmaId → painel já lido nesta visita

function quando(d) {
  if (!d) return ["nunca", "vermelho"];
  const dias = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (dias <= 0) return [`hoje ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`, "verde"];
  if (dias === 1) return ["ontem", "verde"];
  return [`há ${dias} dias`, dias > DIAS_SEM_ATIVIDADE ? "vermelho" : "ocre"];
}

async function lerPainel(sessao, turma, plano) {
  const [alunos, listasTodas, chamados] = await Promise.all([alunosDaTurma(turma.id), listasDaTurma(turma.id, false), listarChamados(sessao).catch(() => [])]);
  const listas = listasTodas.filter((l) => l.enviada);
  const gabaritos = {};
  for (const l of listas.filter(ehQuestoes)) gabaritos[l.id] = await lerGabarito(turma.id, l.id).catch(() => ({}));
  const linhas = [];
  for (const a of alunos) {
    const x = await acompanharAluno(turma, a, listas, plano, gabaritos);
    const rel = gerarRelatorio({ aluno: a, turma, empresa: x.bruto?.empresa || null, esc: x.bruto?.esc, listas, respostas: x.bruto?.respostas, gabaritos, boletim: x.bruto?.boletim, plano });
    linhas.push({ x, rel });
  }
  const aguardando = chamados.filter((c) => c.turmaId === turma.id && c.status === "aberto" && atende(sessao, c)).length;
  return { linhas, listas, aguardando, lidoEm: new Date() };
}

export default function PainelProfessor({ sessao, ir }) {
  const { turmas, carregando } = useTurmas(sessao);
  const { plano } = usePlano();
  const [turmaId, setTurmaId] = useState("");
  const turma = turmas.find((t) => t.id === turmaId) || turmas[0];
  const [painel, setPainel] = useState(null);
  const [erro, setErro] = useState("");
  const [lendo, setLendo] = useState(false);

  const carregar = async (forcar = false) => {
    if (!turma || !plano) return;
    if (!forcar && cache.has(turma.id)) return setPainel(cache.get(turma.id));
    setLendo(true); setErro("");
    try { const p = await lerPainel(sessao, turma, plano); cache.set(turma.id, p); setPainel(p); } catch (e) { setErro(traduzirErro(e)); }
    setLendo(false);
  };
  useEffect(() => { setPainel(null); carregar(); }, [turma?.id, !!plano]);

  if (carregando) return null;
  if (!turmas.length) return <div className="aviso atencao">Você ainda não tem turmas. Comece em "Turmas e matrículas" e veja o roteiro no Guia Pedagógico → Guia do professor.</div>;

  const linhas = painel?.linhas || [];
  const parados = linhas.filter(({ x }) => x.semEmpresa || !x.ultima || (Date.now() - x.ultima) / 86400000 > DIAS_SEM_ATIVIDADE).length;
  const comProfessor = linhas.reduce((s, { rel }) => s + rel.comProfessor, 0);
  const encerraram = linhas.filter(({ x }) => x.encerrado).length;
  const listasEsc = (painel?.listas || []).filter((l) => !ehQuestoes(l));
  const questionarios = (painel?.listas || []).filter(ehQuestoes);
  const aplica = (x, l) => !(finalidadeDe(l) === "recuperacao" && x.porLista?.[l.id]?.naoSeAplica);

  return (
    <section className="cartao">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <h2>Painel da turma</h2>
          <span className="pequeno suave">Andamento por etapa. {painel ? `Lido às ${painel.lidoEm.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.` : ""}</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
          {turmas.length > 1 && (
            <div className="campo" style={{ flex: "0 1 320px" }}>
              <label htmlFor="pn-turma">Turma</label>
              <select id="pn-turma" value={turma?.id || ""} onChange={(e) => setTurmaId(e.target.value)}>
                {turmas.map((t) => <option key={t.id} value={t.id}>{t.nome} · {disciplinaPorId(t.disciplina)?.sigla} · {t.semestre}</option>)}
              </select>
            </div>
          )}
          <button type="button" className="botao secundario pequeno" disabled={lendo || !plano} onClick={() => carregar(true)}>{lendo ? "Lendo…" : "Atualizar"}</button>
          <button type="button" className="botao secundario pequeno" onClick={() => ir("turmas", turma.id, "acompanhamento")}>Abrir a turma</button>
        </div>
      </div>
      {erro && <div className="aviso erro">{erro}</div>}
      {!painel && !erro && <p className="pequeno suave">Lendo os livros dos alunos…</p>}
      {painel && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            <Cartao valor={linhas.length} rotulo="alunos na turma" />
            <Cartao valor={painel.aguardando + comProfessor} rotulo={`aguardando você (${painel.aguardando} chamado(s) · ${comProfessor} item(ns))`} cor={painel.aguardando + comProfessor ? "var(--ocre)" : undefined}
              acao={painel.aguardando ? () => ir("suporte") : comProfessor ? () => ir("turmas", turma.id, "acompanhamento") : null} />
            <Cartao valor={parados} rotulo={`parados há mais de ${DIAS_SEM_ATIVIDADE} dias`} cor={parados ? "var(--vermelho)" : undefined} />
            <Cartao valor={encerraram} rotulo="encerraram o exercício" cor="var(--verde-texto)" />
          </div>
          {linhas.length === 0 && <p className="pequeno suave">Nenhum aluno na turma.</p>}
          {linhas.length > 0 && (
            <div className="tabela-caixa" style={{ border: "1px solid var(--linha)", borderRadius: 10 }}>
              <table>
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th style={{ textAlign: "center" }}>① Abertura</th>
                    <th style={{ textAlign: "center" }}>② Estudou</th>
                    <th style={{ textAlign: "center" }}>③ Fatos orientados</th>
                    <th style={{ textAlign: "center" }}>④ Listas</th>
                    <th style={{ textAlign: "center" }}>⑤ Questionários</th>
                    <th style={{ textAlign: "center" }}>⑥ Encerrou</th>
                    <th style={{ textAlign: "center" }}>⑦ Montou DRE · DLPA · BP</th>
                    <th>Última atividade</th>
                    <th>Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map(({ x, rel }) => {
                    const e = x.bruto?.empresa;
                    const pr = e?.progresso || {};
                    const [u, tomU] = quando(x.ultima);
                    const abertura = x.semEmpresa ? 0 : [x.cadastro, x.parametrizacao, x.saldos].filter(Boolean).length;
                    const listasFeitas = listasEsc.filter((l) => aplica(x, l) && x.porLista?.[l.id]?.lancados >= x.porLista?.[l.id]?.total).length;
                    const listasAplic = listasEsc.filter((l) => aplica(x, l)).length;
                    const qFeitos = questionarios.filter((l) => aplica(x, l) && x.porLista?.[l.id]?.respondidas >= (l.questoes || []).length).length;
                    const qAplic = questionarios.filter((l) => aplica(x, l)).length;
                    const montou = ["montou-dre", "montou-dlpa", "montou-bp"].filter((k) => pr[k]).length;
                    const situacao = x.semEmpresa || !x.ultima ? ["sem atividade", "vermelho"]
                      : (Date.now() - x.ultima) / 86400000 > DIAS_SEM_ATIVIDADE ? ["parado", "ocre"]
                        : x.encerrado && pr["montou-bp"] ? ["concluiu", "verde"]
                          : rel.comProfessor ? [`${rel.comProfessor} com você`, "ocre"] : ["em andamento", "verde"];
                    return (
                      <tr key={x.aluno.matricula}>
                        <td><button type="button" className="link-botao" onClick={() => ir("turmas", turma.id, "acompanhamento")}>{x.aluno.nome}</button><span className="pequeno suave mono" style={{ display: "block" }}>{x.aluno.matricula}</span></td>
                        <td className="mono" style={{ textAlign: "center" }}>{abertura}/3</td>
                        <td className="mono" style={{ textAlign: "center" }}>{e ? `${modulosEstudados(e, turma.disciplina)}/${disciplinaPorId(turma.disciplina)?.modulos.length || "–"}` : "–"}</td>
                        <td className="mono" style={{ textAlign: "center" }}>{x.semEmpresa ? "–" : `${x.orientados.lancados}/${x.orientados.total}`}</td>
                        <td className="mono" style={{ textAlign: "center" }}>{listasAplic ? `${listasFeitas}/${listasAplic}` : "–"}</td>
                        <td className="mono" style={{ textAlign: "center" }}>{qAplic ? `${qFeitos}/${qAplic}` : "–"}</td>
                        <td style={{ textAlign: "center" }}>{x.encerrado ? "✓" : "–"}</td>
                        <td className="mono" style={{ textAlign: "center" }}>{e ? `${montou}/3` : "–"}</td>
                        <td><span className={`selo ${tomU}`}>{u}</span></td>
                        <td><span className={`selo ${situacao[1]}`}>{situacao[0]}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <p className="pequeno suave" style={{ margin: 0 }}>① cadastro, parametrização e saldos · ② módulos marcados como estudados · ④ listas de escrituração completas · ⑤ questionários respondidos · ⑦ demonstrações montadas e conferidas na Escrituração. O detalhe de cada aluno está no Relatório de orientação (Acompanhamento da turma).</p>
        </>
      )}
    </section>
  );
}

function Cartao({ valor, rotulo, cor, acao }) {
  const conteudo = (
    <>
      <span className="mono" style={{ fontSize: 24, fontWeight: 600, color: cor || "var(--destaque)" }}>{valor}</span>
      <span className="pequeno suave">{rotulo}</span>
    </>
  );
  const estilo = { border: "1px solid var(--linha)", borderRadius: 10, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 2, textAlign: "left", background: "transparent", color: "inherit", font: "inherit" };
  return acao ? <button type="button" onClick={acao} style={{ ...estilo, cursor: "pointer" }}>{conteudo}</button> : <div style={estilo}>{conteudo}</div>;
}
