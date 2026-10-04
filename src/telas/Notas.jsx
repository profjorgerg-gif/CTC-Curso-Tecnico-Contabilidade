// Notas: quadro do professor (na página da turma) e "Minhas notas" do aluno.
// Regras do PPC (seção VIII): média ≥ 6,0, frequência ≥ 75%, mínimo de instrumentos
// pelo número de aulas semanais e recuperação paralela para cada instrumento.
import { useEffect, useMemo, useState } from "react";
import { traduzirErro } from "../lib/sessao";
import { useTurmas } from "../lib/useTurmas";
import { disciplinaPorId } from "../dados/disciplinas";
import {
  csvDasNotas, excluirAvaliacao, fmtNota, FONTE_PPC, FREQUENCIA_MINIMA, lerBoletim, lerNotasDaTurma, MEDIA_MINIMA, mediaDoAluno,
  minimoDeInstrumentos, notaFinal, novoIdAvaliacao, publicarBoletins, salvarConfigAvaliacao, salvarNotas, situacao,
} from "../lib/notas";

const caixaNota = { width: 64, textAlign: "right", minHeight: 32, padding: "2px 6px" };

// ---------------- professor ----------------
export function NotasDaTurma({ turma, alunos, aoSalvarTurma }) {
  const [avaliacoes, setAvaliacoes] = useState(null);
  const [frequencias, setFrequencias] = useState({});
  const [alterado, setAlterado] = useState(false);
  const [msg, setMsg] = useState({});
  const [ocupado, setOcupado] = useState(false);
  const [nova, setNova] = useState(null);
  const cfg = turma.avaliacao || {};
  const [aulas, setAulas] = useState(cfg.aulasSemanais || "");

  const carregar = () => lerNotasDaTurma(turma.id)
    .then((r) => { setAvaliacoes(r.avaliacoes); setFrequencias(r.frequencias); setAlterado(false); })
    .catch((e) => setMsg({ tipo: "erro", texto: traduzirErro(e) }));
  useEffect(() => { carregar(); }, [turma.id]);

  const mudarNota = (avId, m, campo, v) => {
    setAvaliacoes((lista) => lista.map((av) => (av.id !== avId ? av : { ...av, notas: { ...av.notas, [m]: { ...av.notas?.[m], [campo]: v === "" ? null : v } } })));
    setAlterado(true);
  };
  const mudarAv = (avId, campo, v) => { setAvaliacoes((lista) => lista.map((av) => (av.id === avId ? { ...av, [campo]: v } : av))); setAlterado(true); };

  const conferir = () => {
    for (const av of avaliacoes) {
      for (const n of Object.values(av.notas || {})) {
        for (const v of [n?.nota, n?.rec]) if (v != null && v !== "" && !(Number(v) >= 0 && Number(v) <= 10)) return `Em "${av.titulo}": as notas vão de 0 a 10.`;
      }
    }
    for (const v of Object.values(frequencias)) if (v != null && v !== "" && !(Number(v) >= 0 && Number(v) <= 100)) return "A frequência vai de 0 a 100%.";
    return "";
  };
  const limpar = (av) => ({
    ...av, peso: Number(av.peso) || 1,
    notas: Object.fromEntries(Object.entries(av.notas || {}).map(([m, n]) => [m, {
      nota: n?.nota === "" || n?.nota == null ? null : Number(n.nota), rec: n?.rec === "" || n?.rec == null ? null : Number(n.rec),
    }])),
  });
  const salvar = async (publicar) => {
    const erro = conferir();
    if (erro) return setMsg({ tipo: "erro", texto: erro });
    setOcupado(true); setMsg({});
    try {
      const limpas = avaliacoes.map(limpar);
      const freq = Object.fromEntries(Object.entries(frequencias).filter(([, v]) => v !== "" && v != null).map(([m, v]) => [m, Number(v)]));
      await salvarNotas(turma, limpas, freq);
      if (Number(aulas || 0) !== Number(cfg.aulasSemanais || 0)) { await salvarConfigAvaliacao(turma, { ...cfg, aulasSemanais: Number(aulas) || null }); await aoSalvarTurma?.(); }
      if (publicar) await publicarBoletins(turma, alunos, limpas, freq);
      setMsg({ texto: publicar ? `Notas salvas e publicadas: os alunos veem ${limpas.filter((a) => a.publicada).length} avaliação(ões) em "Minhas notas".` : "Notas salvas." });
      await carregar();
    } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
    setOcupado(false);
  };
  const encerrar = async (valor) => {
    if (valor && !window.confirm("Encerrar o semestre? A situação de cada aluno passa a ser Aprovado ou Reprovado (média ≥ 6,0 e frequência ≥ 75%). Depois, clique em \"Salvar e publicar\" para os alunos verem.")) return;
    try { await salvarConfigAvaliacao(turma, { ...cfg, semestreEncerrado: valor }); await aoSalvarTurma?.(); } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
  };
  const incluir = () => {
    if (!nova?.titulo?.trim()) return;
    setAvaliacoes((l) => [...l, { id: novoIdAvaliacao(), titulo: nova.titulo.trim(), tipo: "manual", peso: Number(nova.peso) || 1, publicada: false, ordem: Date.now(), notas: {} }]);
    setNova(null); setAlterado(true);
  };
  const excluir = async (av) => {
    if (!window.confirm(`Excluir a avaliação "${av.titulo}" e as notas dela?`)) return;
    try {
      await excluirAvaliacao(turma, av);
      setAvaliacoes((l) => l.filter((x) => x.id !== av.id));
    } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
  };
  const baixarCsv = () => {
    const blob = new Blob(["﻿" + csvDasNotas(turma, alunos, avaliacoes.map(limpar), frequencias)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `Notas-${turma.nome.replace(/[^\w-]+/g, "_")}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
  };

  const minimo = minimoDeInstrumentos(aulas);
  const instrumentos = avaliacoes?.length || 0;
  const comRecuperacao = (avaliacoes || []).filter((av) => av.recuperacaoListaId || Object.values(av.notas || {}).some((n) => n?.rec != null && n?.rec !== "")).length;
  const encerrado = !!cfg.semestreEncerrado;

  return (
    <section className="cartao">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <h2>Notas da turma</h2>
          <span className="pequeno suave">Média mínima {fmtNota(MEDIA_MINIMA)} e frequência mínima {FREQUENCIA_MINIMA}% (PPC, seção VIII). Vale a maior nota entre o instrumento e a sua recuperação.</span>
        </div>
        <span className={`selo ${encerrado ? "verde" : "cinza"}`}>{encerrado ? "Semestre encerrado" : "Semestre em andamento"}</span>
      </div>

      <div className="linha-form" style={{ alignItems: "flex-end" }}>
        <div className="campo" style={{ flex: "0 1 170px" }}>
          <label htmlFor="nt-aulas">Aulas semanais</label>
          <input id="nt-aulas" type="number" min="1" max="10" className="mono" value={aulas} onChange={(e) => { setAulas(e.target.value); setAlterado(true); }} />
        </div>
        <div className="pequeno" style={{ flex: "1 1 360px", display: "flex", flexDirection: "column", gap: 4 }}>
          {minimo == null
            ? <span className="suave">Informe as aulas semanais para o CTC conferir o número mínimo de instrumentos.</span>
            : <span>Instrumentos avaliativos: <strong>{instrumentos}</strong> de no mínimo <strong>{minimo}</strong>{instrumentos < minimo && <span style={{ color: "var(--ocre)" }}> — faltam {minimo - instrumentos}</span>}</span>}
          <span>Instrumentos com recuperação paralela: <strong>{comRecuperacao}</strong> de {instrumentos}{comRecuperacao < instrumentos && instrumentos > 0 && <span className="suave"> (o PPC pede recuperação para cada instrumento)</span>}</span>
        </div>
      </div>

      {!avaliacoes && <p className="suave pequeno">Carregando…</p>}
      {avaliacoes && (
        <div className="tabela-caixa">
          <table>
            <thead>
              <tr>
                <th>Aluno</th>
                {avaliacoes.map((av) => (
                  <th key={av.id} style={{ minWidth: 150, verticalAlign: "top" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span>{av.titulo}</span>
                      <span className="pequeno suave" style={{ fontWeight: 400 }}>{av.tipo === "lista" ? "lista avaliativa" : "avaliação manual"}</span>
                      <label className="pequeno" style={{ fontWeight: 400, display: "flex", gap: 6, alignItems: "center" }}>
                        peso <input aria-label={`Peso de ${av.titulo}`} type="number" min="0.5" step="0.5" className="mono" value={av.peso ?? 1} onChange={(e) => mudarAv(av.id, "peso", e.target.value)} style={{ ...caixaNota, width: 56 }} />
                      </label>
                      <label className="pequeno" style={{ fontWeight: 400, display: "flex", gap: 6, alignItems: "center" }}>
                        <input type="checkbox" style={{ minHeight: 0 }} checked={!!av.publicada} onChange={(e) => mudarAv(av.id, "publicada", e.target.checked)} /> publicar
                      </label>
                      <button type="button" className="botao perigo pequeno" style={{ alignSelf: "flex-start" }} onClick={() => excluir(av)}>Excluir</button>
                    </div>
                  </th>
                ))}
                <th style={{ textAlign: "right" }}>Média</th>
                <th>Frequência (%)</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {alunos.length === 0 && <tr><td colSpan={avaliacoes.length + 4} className="suave">Nenhum aluno na turma.</td></tr>}
              {alunos.map((a) => {
                const media = mediaDoAluno(avaliacoes.map(limpar), a.matricula);
                const sit = situacao(media, frequencias[a.matricula], encerrado);
                return (
                  <tr key={a.matricula}>
                    <td>{a.nome}<span className="pequeno suave mono" style={{ display: "block" }}>{a.matricula}</span></td>
                    {avaliacoes.map((av) => {
                      const n = av.notas?.[a.matricula] || {};
                      const fin = notaFinal(limpar({ notas: { x: n } }).notas.x);
                      const daLista = av.tipo === "lista";
                      return (
                        <td key={av.id}>
                          <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                            <input aria-label={`${av.titulo} — nota de ${a.nome}`} title={daLista ? "Calculada pela lista (acertos ÷ total × 10)" : "Nota"} type="number" min="0" max="10" step="0.1" className="mono"
                              value={n.nota ?? ""} readOnly={daLista} onChange={(e) => mudarNota(av.id, a.matricula, "nota", e.target.value)} style={caixaNota} />
                            <input aria-label={`${av.titulo} — recuperação de ${a.nome}`} title={av.recuperacaoListaId ? "Calculada pela lista de recuperação" : "Recuperação paralela"} placeholder="rec." type="number" min="0" max="10" step="0.1" className="mono"
                              value={n.rec ?? ""} readOnly={!!av.recuperacaoListaId} onChange={(e) => mudarNota(av.id, a.matricula, "rec", e.target.value)} style={caixaNota} />
                          </div>
                          {fin != null && fin < MEDIA_MINIMA && <span className="pequeno" style={{ color: "var(--ocre)" }}>abaixo da média</span>}
                        </td>
                      );
                    })}
                    <td className="mono" style={{ textAlign: "right", fontWeight: 600 }}>{fmtNota(media)}</td>
                    <td>
                      <input aria-label={`Frequência de ${a.nome}`} type="number" min="0" max="100" className="mono" value={frequencias[a.matricula] ?? ""}
                        onChange={(e) => { setFrequencias({ ...frequencias, [a.matricula]: e.target.value }); setAlterado(true); }} style={caixaNota} />
                    </td>
                    <td><span className={`selo ${sit.selo}`}>{sit.texto}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {nova ? (
        <div className="linha-form" style={{ alignItems: "flex-end" }}>
          <div className="campo" style={{ flex: "1 1 260px" }}>
            <label htmlFor="nt-tit">Nova avaliação (prova, seminário, trabalho…)</label>
            <input id="nt-tit" value={nova.titulo} onChange={(e) => setNova({ ...nova, titulo: e.target.value })} maxLength={50} placeholder="Ex.: Prova 1 — Balanço Patrimonial" />
          </div>
          <div className="campo" style={{ flex: "0 1 110px" }}>
            <label htmlFor="nt-peso">Peso</label>
            <input id="nt-peso" type="number" min="0.5" step="0.5" className="mono" value={nova.peso} onChange={(e) => setNova({ ...nova, peso: e.target.value })} />
          </div>
          <button type="button" className="botao" onClick={incluir}>Incluir</button>
          <button type="button" className="botao secundario" onClick={() => setNova(null)}>Cancelar</button>
        </div>
      ) : (
        <p className="pequeno suave" style={{ margin: 0 }}>As listas avaliativas entram aqui quando você clica em "Fechar e lançar notas" no quadro de exercícios. Avaliações feitas fora do CTC entram como avaliação manual.</p>
      )}

      {msg.texto && <div className={`aviso ${msg.tipo || ""}`} role="status">{msg.texto}</div>}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {!nova && <button type="button" className="botao secundario" onClick={() => setNova({ titulo: "", peso: 1 })}>+ Avaliação manual</button>}
        <button type="button" className="botao secundario" disabled={ocupado || !avaliacoes} onClick={() => salvar(false)}>Salvar</button>
        <button type="button" className="botao" disabled={ocupado || !avaliacoes} onClick={() => salvar(true)}>{ocupado ? "Gravando…" : "Salvar e publicar para os alunos"}</button>
        <button type="button" className="botao secundario" disabled={!avaliacoes?.length} onClick={baixarCsv}>Exportar .csv</button>
        <button type="button" className="botao secundario" style={{ marginLeft: "auto" }} onClick={() => encerrar(!encerrado)}>{encerrado ? "Reabrir o semestre" : "Encerrar o semestre"}</button>
        {alterado && <span className="pequeno" style={{ color: "var(--ocre)" }}>Há alterações não salvas.</span>}
      </div>
      <p className="pequeno suave" style={{ margin: 0 }}>Os alunos só veem as avaliações marcadas em "publicar", depois de "Salvar e publicar".</p>
    </section>
  );
}

// ---------------- aluno ----------------
export default function MinhasNotas({ sessao }) {
  const { turmas, carregando, erro } = useTurmas(sessao);
  const matricula = sessao.perfil?.matricula;
  return (
    <>
      <div>
        <h1>Minhas notas</h1>
        <p className="suave" style={{ maxWidth: 760 }}>
          As notas que o professor publicou em cada turma. Para aprovação: média igual ou superior a {fmtNota(MEDIA_MINIMA)} e frequência igual ou superior a {FREQUENCIA_MINIMA}%.
          Em cada avaliação vale a maior nota entre a original e a da recuperação paralela.
        </p>
      </div>
      {erro && <div className="aviso erro">{erro}</div>}
      {!carregando && turmas.length === 0 && <div className="aviso atencao">Você ainda não está em nenhuma turma.</div>}
      {turmas.map((t) => <BoletimDaTurma key={t.id} turma={t} matricula={matricula} />)}
      <p className="pequeno suave">Fonte das regras: {FONTE_PPC}</p>
    </>
  );
}

function BoletimDaTurma({ turma, matricula }) {
  const [b, setB] = useState(undefined);
  const [erro, setErro] = useState("");
  useEffect(() => { lerBoletim(turma.id, matricula).then(setB).catch((e) => setErro(traduzirErro(e))); }, [turma.id, matricula]);
  const sit = useMemo(() => (b?.itens ? situacao(b.media, b.frequencia, b.encerrado) : null), [b]);
  return (
    <section className="cartao sem-padding">
      <div className="cartao-topo">
        <h2>{turma.nome} <span className="pequeno suave">· {disciplinaPorId(turma.disciplina)?.sigla} · {turma.semestre}</span></h2>
        {sit && <span className={`selo ${sit.selo}`}>{sit.texto}</span>}
      </div>
      {erro && <div className="aviso erro" style={{ margin: 16 }}>{erro}</div>}
      {b === undefined && !erro && <p className="suave pequeno" style={{ padding: "8px 18px" }}>Carregando…</p>}
      {b !== undefined && !b?.itens?.length && !erro && <p className="suave pequeno" style={{ padding: "8px 18px 16px" }}>Nenhuma nota publicada ainda.</p>}
      {b?.itens?.length > 0 && (
        <div className="tabela-caixa">
          <table>
            <thead><tr><th>Avaliação</th><th style={{ textAlign: "right" }}>Peso</th><th style={{ textAlign: "right" }}>Nota</th><th style={{ textAlign: "right" }}>Recuperação</th><th style={{ textAlign: "right" }}>Nota que vale</th></tr></thead>
            <tbody>
              {b.itens.map((i) => (
                <tr key={i.id}>
                  <td>{i.titulo}</td>
                  <td className="mono" style={{ textAlign: "right" }}>{i.peso}</td>
                  <td className="mono" style={{ textAlign: "right" }}>{fmtNota(i.nota)}</td>
                  <td className="mono" style={{ textAlign: "right" }}>{fmtNota(i.rec)}</td>
                  <td className="mono" style={{ textAlign: "right", fontWeight: 600, color: i.final != null && i.final < MEDIA_MINIMA ? "var(--ocre)" : undefined }}>{fmtNota(i.final)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr><td colSpan={4}><strong>Média{b.encerrado ? " final" : " parcial"}</strong></td><td className="mono" style={{ textAlign: "right" }}><strong>{fmtNota(b.media)}</strong></td></tr>
              <tr><td colSpan={4}>Frequência</td><td className="mono" style={{ textAlign: "right" }}>{b.frequencia == null ? "—" : `${b.frequencia}%`}</td></tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  );
}
