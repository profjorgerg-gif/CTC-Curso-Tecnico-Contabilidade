// Aluno: listas de questões teóricas enviadas pelo professor (de sala, avaliativas e recuperação)
import { useEffect, useState } from "react";
import FluxoEtapa from "../componentes/FluxoEtapa";
import { devolucoesDoAluno } from "../lib/devolucao";
import { useTurmas } from "../lib/useTurmas";
import { traduzirErro } from "../lib/sessao";
import { disciplinaPorId } from "../dados/disciplinas";
import { dataBR } from "../lib/contabil";
import { ehQuestoes, finalidadeDe, FINALIDADES, listasDaTurma, valeNota } from "../lib/exercicios";
import { lerBoletim, fmtNota } from "../lib/notas";
import { lerResposta, notaDasQuestoes, salvarResposta } from "../lib/questoes";
import Questao from "../componentes/Questao";
import { useRascunho } from "../lib/rascunho";
import { AvisoRascunho, SeloNaoSalvo } from "../componentes/Rascunho";

const hoje = () => new Date().toLocaleDateString("sv-SE");

export default function Questionarios({ sessao }) {
  const { turmas, carregando, erro } = useTurmas(sessao);
  const matricula = sessao.perfil?.matricula;
  const [aberta, setAberta] = useState(null); // { turma, lista, devolucao }
  if (aberta) return <Responder {...aberta} matricula={matricula} aoVoltar={() => setAberta(null)} />;
  return (
    <>
      <div>
        <h1>Questionários</h1>
        <p className="suave" style={{ maxWidth: 760 }}>Questões teóricas enviadas pelo professor: múltipla escolha, verdadeiro ou falso e afirmações. Nos exercícios de sala você vê a correção na hora; nos avaliativos, quando o professor liberar o resultado.</p>
      </div>
      <FluxoEtapa etapa="questionarios" />
      {erro && <div className="aviso erro">{erro}</div>}
      {!carregando && turmas.length === 0 && <div className="aviso atencao">Você ainda não está em nenhuma turma.</div>}
      {turmas.map((t) => <ListasDaTurma key={t.id} turma={t} matricula={matricula} abrir={(lista, devolucao) => setAberta({ turma: t, lista, devolucao })} />)}
    </>
  );
}

function ListasDaTurma({ turma, matricula, abrir }) {
  const [listas, setListas] = useState(null);
  const [respostas, setRespostas] = useState({});
  const [devolucoes, setDevolucoes] = useState({});
  const [erro, setErro] = useState("");
  useEffect(() => {
    (async () => {
      try {
        const [ls, boletim, devs] = await Promise.all([listasDaTurma(turma.id, true), lerBoletim(turma.id, matricula).catch(() => null), devolucoesDoAluno(turma.id, matricula).catch(() => ({}))]);
        setDevolucoes(devs);
        const minhas = ls.filter((l) => ehQuestoes(l) && (finalidadeDe(l) !== "recuperacao" || boletim?.recuperacoes?.includes(l.id)));
        setListas(minhas);
        const r = {};
        for (const l of minhas) r[l.id] = await lerResposta(turma.id, l.id, matricula).catch(() => null);
        setRespostas(r);
      } catch (e) { setErro(traduzirErro(e)); }
    })();
  }, [turma.id]);

  return (
    <section className="cartao sem-padding">
      <div className="cartao-topo"><h2>{turma.nome} <span className="pequeno suave">· {disciplinaPorId(turma.disciplina)?.sigla} · {turma.semestre}</span></h2></div>
      {erro && <div className="aviso erro" style={{ margin: 16 }}>{erro}</div>}
      {!listas && !erro && <p className="suave pequeno" style={{ padding: "8px 18px" }}>Carregando…</p>}
      {listas?.length === 0 && <p className="suave pequeno" style={{ padding: "8px 18px 16px" }}>Nenhum questionário enviado ainda.</p>}
      {listas?.length > 0 && (
        <div className="tabela-caixa">
          <table>
            <thead><tr><th>Questionário</th><th>Tipo</th><th>Prazo</th><th>Situação</th><th></th></tr></thead>
            <tbody>
              {listas.map((l) => {
                const fin = finalidadeDe(l);
                const r = respostas[l.id];
                const encerrada = valeNota(l) && (l.fechada || (l.prazo && hoje() > l.prazo)) && !devolucoes[l.id];
                const qtd = Object.keys(r?.respostas || {}).length;
                return (
                  <tr key={l.id}>
                    <td>{l.titulo}<span className="pequeno suave" style={{ display: "block" }}>{(l.questoes || []).length} questões</span></td>
                    <td><span className={`selo ${FINALIDADES[fin].selo}`}>{FINALIDADES[fin].curto}</span></td>
                    <td className="mono pequeno">{l.prazo ? dataBR(l.prazo) : "—"}</td>
                    <td>
                      {qtd === 0 ? <span className="selo cinza">Não respondido</span> : <span className="selo verde">{qtd} de {(l.questoes || []).length} respondidas</span>}
                      {encerrada && <span className="pequeno suave" style={{ display: "block" }}>Encerrado</span>}
                      {devolucoes[l.id] && <span className="pequeno" style={{ display: "block", color: "var(--ocre)" }}>↩ Devolvido para refazer até {devolucoes[l.id].ate?.toDate?.().toLocaleDateString("pt-BR")}</span>}
                      {valeNota(l) && l.resultadoLiberado && l.gabarito && r && <span className="pequeno" style={{ display: "block" }}>Nota: <strong className="mono">{fmtNota(notaDasQuestoes(l.questoes, r.respostas, l.gabarito).nota)}</strong></span>}
                    </td>
                    <td style={{ textAlign: "right" }}><button className="botao pequeno" onClick={() => abrir(l, devolucoes[l.id])}>{encerrada || (valeNota(l) && l.resultadoLiberado) ? "Ver" : qtd ? "Continuar" : "Responder"}</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Responder({ turma, lista, matricula, aoVoltar, devolucao }) {
  const fin = finalidadeDe(lista);
  const avaliativa = valeNota(lista);
  const encerrada = avaliativa && (lista.fechada || (lista.prazo && hoje() > lista.prazo)) && !devolucao;
  const liberada = avaliativa && lista.resultadoLiberado && lista.gabarito && !devolucao; // devolvido: volta a responder
  const [resp, setResp] = useState({});
  const [salvo, setSalvo] = useState({}); // o que já está gravado no banco
  const [carregou, setCarregou] = useState(false);
  const [corrigida, setCorrigida] = useState(false);
  const [msg, setMsg] = useState({});
  const [salvando, setSalvando] = useState(false);
  useEffect(() => {
    lerResposta(turma.id, lista.id, matricula).then((r) => { if (r) { setResp(r.respostas || {}); setSalvo(r.respostas || {}); if (!avaliativa && Object.keys(r.respostas || {}).length === lista.questoes.length) setCorrigida(true); } }).catch(() => {}).finally(() => setCarregou(true));
  }, []);

  const questoes = lista.questoes || [];
  const travada = encerrada || liberada || (!avaliativa && corrigida);
  // proteção contra digitação perdida: respostas marcadas e ainda não salvas ficam guardadas neste navegador
  const naoSalvo = carregou && !travada && JSON.stringify(resp) !== JSON.stringify(salvo);
  const rasc = useRascunho({ chave: carregou && !travada ? `quest-${turma.id}-${lista.id}-${matricula}` : null, valor: resp, sujo: naoSalvo, aoRestaurar: setResp });
  const modo = liberada || (!avaliativa && corrigida) ? "correcao" : "responder";
  const gab = (q) => (liberada ? lista.gabarito[q.id] : { correta: q.correta, explicacao: q.explicacao });
  const respondidas = questoes.filter((q) => resp[q.id] !== undefined).length;
  const nota = modo === "correcao" ? notaDasQuestoes(questoes, resp, liberada ? lista.gabarito : null) : null;

  const salvar = async (final) => {
    if (final && respondidas < questoes.length && !window.confirm(`Você respondeu ${respondidas} de ${questoes.length} questões. Enviar assim mesmo?`)) return;
    setSalvando(true); setMsg({});
    try {
      await salvarResposta(turma.id, lista.id, matricula, resp);
      setSalvo(resp); rasc.limpar();
      if (!avaliativa && final) setCorrigida(true);
      setMsg({ texto: avaliativa ? "Respostas salvas. Você pode alterá-las até o prazo; a correção aparece quando o professor liberar o resultado." : final ? "Respostas enviadas — veja a correção abaixo." : "Respostas salvas." });
    } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
    setSalvando(false);
  };
  const refazer = () => { setResp({}); setCorrigida(false); setMsg({}); };

  return (
    <>
      <button className="botao secundario pequeno" style={{ alignSelf: "flex-start" }} onClick={aoVoltar}>← Questionários</button>
      <div>
        <span className="mono pequeno suave">{FINALIDADES[fin].nome.toUpperCase()}{lista.prazo ? ` · PRAZO ${dataBR(lista.prazo)}` : ""}</span>
        <h1>{lista.titulo}</h1>
        <p className="suave">{turma.nome} · {questoes.length} questões</p>
      </div>
      {devolucao && (
        <div className="aviso atencao" role="status">
          <strong>↩ O professor devolveu este questionário para você refazer</strong> (até {devolucao.ate?.toDate?.().toLocaleDateString("pt-BR")}).
          <span style={{ display: "block", whiteSpace: "pre-wrap" }}>{devolucao.orientacao}</span>
        </div>
      )}
      {encerrada && !liberada && <div className="aviso atencao">Este questionário está encerrado. A correção aparece quando o professor liberar o resultado.</div>}
      {avaliativa && !encerrada && !liberada && <div className="aviso pequeno">Questionário avaliativo: as respostas ficam salvas e podem ser alteradas até o prazo. A correção aparece quando o professor liberar o resultado.</div>}
      {nota && <div className="aviso"><strong>Resultado:</strong> {nota.acertos} de {nota.total} certas — nota <strong className="mono">{fmtNota(nota.nota)}</strong>{!avaliativa ? " (exercício de sala, não vale nota)" : ""}.</div>}
      <AvisoRascunho r={rasc} oque="as respostas deste questionário" />
      <section className="cartao">
        {questoes.map((q, i) => (
          <Questao key={q.id} q={q} n={i + 1} modo={modo} matricula={matricula} resposta={resp[q.id]} desabilitada={travada}
            correta={modo === "correcao" ? gab(q)?.correta : undefined} explicacao={modo === "correcao" ? gab(q)?.explicacao : undefined}
            aoResponder={(v) => setResp({ ...resp, [q.id]: v })} />
        ))}
      </section>
      {msg.texto && <div className={`aviso ${msg.tipo || ""}`} role="status">{msg.texto}</div>}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {!travada && <span className="pequeno suave">{respondidas} de {questoes.length} respondidas</span>}
        <SeloNaoSalvo sujo={naoSalvo} />
        {!travada && avaliativa && <button className="botao" disabled={salvando} onClick={() => salvar(true)}>{salvando ? "Salvando…" : "Salvar respostas"}</button>}
        {!travada && !avaliativa && <button className="botao secundario" disabled={salvando} onClick={() => salvar(false)}>Salvar e continuar depois</button>}
        {!travada && !avaliativa && <button className="botao" disabled={salvando} onClick={() => salvar(true)}>Enviar e ver a correção</button>}
        {!avaliativa && corrigida && <button className="botao secundario" onClick={refazer}>Refazer</button>}
      </div>
    </>
  );
}
