// Professor: gerar, revisar e enviar listas de exercícios para a turma
import { useEffect, useState } from "react";
import { traduzirErro } from "../lib/sessao";
import { dataBR, dinheiro, usePlano } from "../lib/contabil";
import { configLancamentos, NIVEIS_AJUDA } from "../lib/modelos";
import { ehQuestoes, emPartidas, excluirLista, finalidadeDe, FINALIDADES, gerarLista, liberarResultado, listasDaTurma, salvarLista, TIPOS, valeNota } from "../lib/exercicios";
import { lerBanco, lerGabarito, sortearQuestoes, TIPOS_QUESTAO } from "../lib/questoes";
import Questao from "../componentes/Questao";
import { alunosParaRecuperacao, fecharLista, fmtNota, marcarRecuperacao, MEDIA_MINIMA } from "../lib/notas";

const QUANTIDADES = [5, 10, 15, 20];

export function ExerciciosDaTurma({ turma, alunos = [], aoMudarNotas }) {
  const [listas, setListas] = useState(null);
  const [editando, setEditando] = useState(null); // lista em edição (nova ou rascunho)
  const [msg, setMsg] = useState({});
  const [ocupado, setOcupado] = useState("");
  const carregar = () => listasDaTurma(turma.id, false).then(setListas).catch((e) => setMsg({ tipo: "erro", texto: traduzirErro(e) }));
  useEffect(() => { carregar(); }, [turma.id]);

  const ano = String(turma.semestre || "").slice(0, 4) || String(new Date().getFullYear());
  const nova = () => setEditando({
    titulo: `Lista ${(listas?.length || 0) + 1}`, fatos: [], prazo: "", finalidade: "sala", peso: 1, tipoLista: "escrituracao",
    configuracao: { quantidade: 10, tipos: TIPOS.map((t) => t.id).slice(0, 4), minimo: 200, maximo: 5000, inicio: `${ano}-02-01`, fim: `${ano}-02-28` },
  });
  const novaDeQuestoes = () => setEditando({
    titulo: `Questionário ${(listas?.filter(ehQuestoes).length || 0) + 1}`, fatos: [], questoes: [], prazo: "", finalidade: "sala", peso: 1, tipoLista: "questoes",
    configuracao: { quantidade: 10, tipos: TIPOS_QUESTAO.map((t) => t.id), modulos: [] },
  });
  const acao = async (id, fn, ok) => {
    setOcupado(id); setMsg({});
    try { const r = await fn(); setMsg({ texto: typeof ok === "function" ? ok(r) : ok }); await carregar(); aoMudarNotas?.(); }
    catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
    setOcupado("");
  };
  const fechar = (l) => {
    const antesDoPrazo = l.prazo && hojeISO() <= l.prazo;
    if (!window.confirm(`Fechar "${l.titulo}" e lançar as notas?${antesDoPrazo ? `\n\nAtenção: o prazo (${dataBR(l.prazo)}) ainda não terminou.` : ""}\n\nA nota de cada aluno (acertos ÷ total × 10) fica gravada e a lista não aceita mais lançamentos.`)) return;
    acao(l.id, () => fecharLista(turma, l, alunos), (notas) => {
      const v = Object.values(notas);
      const abaixo = v.filter((x) => x.nota < MEDIA_MINIMA).length;
      return `Notas lançadas para ${v.length} aluno(s)${abaixo ? ` — ${abaixo} abaixo de ${fmtNota(MEDIA_MINIMA)}` : ""}. Veja o quadro "Notas da turma".`;
    });
  };
  const gerarRecuperacao = async (l) => {
    setMsg({});
    try {
      const alvos = await alunosParaRecuperacao(turma, l.id);
      if (!alvos.length) return setMsg({ texto: `Nenhum aluno ficou abaixo de ${fmtNota(MEDIA_MINIMA)} em "${l.titulo}".` });
      setEditando(ehQuestoes(l)
        ? { titulo: `Recuperação — ${l.titulo}`, fatos: [], questoes: [], prazo: "", finalidade: "recuperacao", recuperacaoDe: l.id, peso: l.peso || 1, tipoLista: "questoes",
          configuracao: { ...l.configuracao, quantidade: (l.questoes || []).length }, alvos, excluir: (l.questoes || []).map((q) => q.id) }
        : { titulo: `Recuperação — ${l.titulo}`, fatos: [], prazo: "", finalidade: "recuperacao", recuperacaoDe: l.id, peso: l.peso || 1,
          configuracao: { ...l.configuracao, quantidade: l.fatos.length }, alvos });
    } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
  };
  const temRecuperacao = (l) => listas?.some((x) => x.recuperacaoDe === l.id);
  const tituloDe = (id) => listas?.find((x) => x.id === id)?.titulo || "lista excluída";

  return (
    <section className="cartao">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <h2>Exercícios da turma</h2>
          <span className="pequeno suave">Além dos 8 fatos orientados, gere listas de escrituração ou de questões teóricas — de sala (para praticar) ou avaliativas (compõem a nota).</span>
        </div>
        {!editando && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="botao" onClick={nova}>Lista de escrituração</button>
            <button className="botao" onClick={novaDeQuestoes}>Lista de questões teóricas</button>
          </div>
        )}
      </div>
      {msg.texto && <div className={`aviso ${msg.tipo || ""}`} role="status">{msg.texto}</div>}
      {!editando && listas && listas.length > 0 && (
        <div className="tabela-caixa">
          <table>
            <thead><tr><th>Lista</th><th>Finalidade</th><th>Itens</th><th>Prazo</th><th>Situação</th><th></th></tr></thead>
            <tbody>
              {listas.map((l) => {
                const fin = finalidadeDe(l);
                return (
                  <tr key={l.id}>
                    <td>{l.titulo}{fin === "recuperacao" && <span className="pequeno suave" style={{ display: "block" }}>de: {tituloDe(l.recuperacaoDe)}</span>}</td>
                    <td><span className={`selo ${FINALIDADES[fin].selo}`}>{FINALIDADES[fin].curto}</span>{valeNota(l) && fin === "avaliativa" && <span className="pequeno suave"> · peso {l.peso || 1}</span>}</td>
                    <td className="pequeno">{ehQuestoes(l) ? `${(l.questoes || []).length} questões` : `${l.fatos.length} fatos`}</td>
                    <td className="mono pequeno">{l.prazo ? dataBR(l.prazo) : "—"}</td>
                    <td>
                      {!l.enviada ? <span className="selo cinza">Rascunho</span>
                        : l.fechada ? <span className="selo verde">Fechada · notas lançadas</span>
                          : <span className="selo verde">Enviada</span>}
                      {valeNota(l) && l.enviada && <span className="pequeno suave" style={{ display: "block" }}>{l.resultadoLiberado ? "Correção visível aos alunos" : "Correção oculta aos alunos"}</span>}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                        <button className="botao secundario pequeno" onClick={() => setEditando(l)}>{l.enviada ? "Ver" : "Editar"}</button>
                        {valeNota(l) && l.enviada && !l.fechada && (
                          <button className="botao pequeno" disabled={!!ocupado} onClick={() => fechar(l)}>{ocupado === l.id ? "Calculando…" : "Fechar e lançar notas"}</button>
                        )}
                        {valeNota(l) && l.enviada && (
                          <button className="botao secundario pequeno" disabled={!!ocupado}
                            onClick={() => acao(`lib-${l.id}`, () => liberarResultado(turma, l, !l.resultadoLiberado), l.resultadoLiberado ? "Correção oculta aos alunos." : "Correção liberada: os alunos já veem a correção.")}>
                            {l.resultadoLiberado ? "Ocultar resultado" : "Liberar resultado"}
                          </button>
                        )}
                        {fin === "avaliativa" && l.fechada && !temRecuperacao(l) && (
                          <button className="botao secundario pequeno" onClick={() => gerarRecuperacao(l)}>Gerar recuperação</button>
                        )}
                        <button className="botao perigo pequeno" onClick={async () => {
                          const aviso = valeNota(l) && l.fechada ? " As notas já lançadas continuam no quadro de notas (você pode excluir a avaliação lá)." : "";
                          if (!window.confirm(`Excluir "${l.titulo}"? Os lançamentos que os alunos já fizeram continuam no Diário deles, mas sem a correção.${aviso}`)) return;
                          try { await excluirLista(turma, l); carregar(); } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
                        }}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {!editando && listas?.length === 0 && <p className="pequeno suave">Nenhuma lista ainda.</p>}
      {editando && (ehQuestoes(editando)
        ? <EditorQuestoes turma={turma} inicial={editando} aoFechar={() => { setEditando(null); carregar(); }} />
        : <EditorLista turma={turma} inicial={editando} aoFechar={() => { setEditando(null); carregar(); }} />)}
    </section>
  );
}

const hojeISO = () => new Date().toLocaleDateString("sv-SE");

function EditorLista({ turma, inicial, aoFechar }) {
  const { plano } = usePlano();
  const [lista, setLista] = useState(inicial);
  const [cfg, setCfg] = useState(inicial.configuracao || {});
  const [msg, setMsg] = useState({});
  const [salvando, setSalvando] = useState(false);
  const somenteLeitura = !!inicial.enviada;
  const nome = (c) => (Array.isArray(c) ? c : [c]).map((x) => `${x} ${plano?.porCodigo[x]?.nome || ""}`).join(" ou ");

  const gerar = () => {
    if (!cfg.tipos?.length) return setMsg({ tipo: "erro", texto: "Escolha pelo menos um tipo de operação." });
    if (!(Number(cfg.maximo) > Number(cfg.minimo))) return setMsg({ tipo: "erro", texto: "O valor máximo precisa ser maior que o mínimo." });
    if (!cfg.inicio || !cfg.fim || cfg.fim < cfg.inicio) return setMsg({ tipo: "erro", texto: "Confira o período (início e fim)." });
    setMsg({});
    const fatos = gerarLista({ ...cfg, quantidade: Number(cfg.quantidade), minimo: Number(cfg.minimo), maximo: Number(cfg.maximo), semente: Date.now() });
    setLista({ ...lista, fatos, configuracao: cfg });
  };
  const remover = (n) => setLista({ ...lista, fatos: lista.fatos.filter((f) => f.n !== n).map((f, i) => ({ ...f, n: i + 1 })) });
  const fin = finalidadeDe(lista);
  const salvar = async (enviar) => {
    if (!lista.fatos.length) return setMsg({ tipo: "erro", texto: "Gere os fatos antes de salvar." });
    if (enviar && valeNota(lista) && !lista.prazo) return setMsg({ tipo: "erro", texto: "Exercício avaliativo e recuperação precisam de prazo: depois dele, a lista não aceita mais lançamentos." });
    let alvos = lista.alvos;
    if (enviar && fin === "recuperacao" && !alvos) {
      try { alvos = await alunosParaRecuperacao(turma, lista.recuperacaoDe); } catch (e) { return setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
    }
    const para = fin === "recuperacao" ? `os ${alvos?.length || 0} aluno(s) abaixo da média` : "todos os alunos da turma";
    if (enviar && !window.confirm(`Enviar "${lista.titulo}" (${lista.fatos.length} fatos) para ${para}? Depois de enviada, a lista não pode mais ser alterada.`)) return;
    setSalvando(true);
    try {
      const id = await salvarLista(turma, lista, enviar);
      if (enviar && fin === "recuperacao" && alvos?.length) await marcarRecuperacao(turma, alvos, id);
      aoFechar();
    } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); setSalvando(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, borderTop: "1px solid var(--linha-suave)", paddingTop: 12 }}>
      <div className="linha-form">
        <div className="campo" style={{ flex: "1 1 240px" }}>
          <label htmlFor="ex-tit">Título da lista</label>
          <input id="ex-tit" value={lista.titulo} disabled={somenteLeitura} onChange={(e) => setLista({ ...lista, titulo: e.target.value })} maxLength={60} />
        </div>
        {fin !== "recuperacao" && (
          <div className="campo" style={{ flex: "0 1 230px" }}>
            <label htmlFor="ex-fin">Finalidade</label>
            <select id="ex-fin" value={fin} disabled={somenteLeitura} onChange={(e) => setLista({ ...lista, finalidade: e.target.value })}>
              <option value="sala">Exercício de sala (praticar)</option>
              <option value="avaliativa">Exercício avaliativo (compõe a nota)</option>
            </select>
          </div>
        )}
        {fin === "avaliativa" && (
          <div className="campo" style={{ flex: "0 1 110px" }}>
            <label htmlFor="ex-peso">Peso na média</label>
            <input id="ex-peso" type="number" min="0.5" max="10" step="0.5" className="mono" value={lista.peso ?? 1} disabled={somenteLeitura} onChange={(e) => setLista({ ...lista, peso: e.target.value })} />
          </div>
        )}
        <div className="campo" style={{ flex: "0 1 230px" }}>
          <label htmlFor="ex-ajuda">Ajuda nos lançamentos</label>
          <select id="ex-ajuda" value={lista.ajuda || ""} disabled={somenteLeitura} onChange={(e) => setLista({ ...lista, ajuda: e.target.value })}>
            <option value="">{valeNota(lista) ? "Padrão: livre (sem ajuda)" : `Padrão da turma (${(NIVEIS_AJUDA.find((n) => n.valor === configLancamentos(turma).ajuda)?.rotulo || "").toLowerCase()})`}</option>
            {NIVEIS_AJUDA.map((n) => <option key={n.valor} value={n.valor}>{n.rotulo} — {n.ajuda.toLowerCase().replace(/\.$/, "")}</option>)}
          </select>
        </div>
        <div className="campo" style={{ flex: "0 1 200px" }}>
          <label htmlFor="ex-prazo">Prazo{valeNota(lista) ? "" : " (opcional)"}</label>
          <input id="ex-prazo" type="date" value={lista.prazo || ""} disabled={somenteLeitura} onChange={(e) => setLista({ ...lista, prazo: e.target.value })} />
        </div>
      </div>
      <p className="pequeno suave" style={{ margin: 0 }}>
        {fin === "sala" && "Exercício de sala: o aluno vê a correção (Confere/Diferente) na hora. Não gera nota."}
        {fin === "avaliativa" && "Exercício avaliativo: a correção fica oculta até você liberar o resultado; depois do prazo a lista não aceita mais lançamentos. Ao fechar, a nota de cada aluno (acertos ÷ total × 10) vai para o quadro de notas."}
        {fin === "recuperacao" && `Recuperação paralela (PPC, seção VIII): vai só para ${lista.alvos ? `os ${lista.alvos.length} aluno(s)` : "os alunos"} abaixo de ${fmtNota(MEDIA_MINIMA)}. Ao fechar, a nota entra como recuperação do instrumento; vale a maior entre a original e a da recuperação.`}
      </p>

      {!somenteLeitura && (
        <>
          <div className="linha-form">
            <div className="campo" style={{ flex: "0 1 280px" }}>
              <span className="pequeno" style={{ color: "var(--tinta-media)" }}>Quantidade de fatos</span>
              <div className="abas" style={{ margin: 0, borderBottom: 0, paddingBottom: 0 }}>
                {QUANTIDADES.map((q) => (
                  <button key={q} type="button" className={Number(cfg.quantidade) === q ? "ativo" : ""} onClick={() => setCfg({ ...cfg, quantidade: q })}>{q}</button>
                ))}
                <input aria-label="Outra quantidade" type="number" min="1" max="60" value={cfg.quantidade} onChange={(e) => setCfg({ ...cfg, quantidade: e.target.value })} style={{ width: 80 }} />
              </div>
            </div>
            <div className="campo" style={{ flex: "0 1 150px" }}>
              <label htmlFor="ex-min">Valor mínimo (R$)</label>
              <input id="ex-min" type="number" min="10" className="mono" value={cfg.minimo} onChange={(e) => setCfg({ ...cfg, minimo: e.target.value })} />
            </div>
            <div className="campo" style={{ flex: "0 1 150px" }}>
              <label htmlFor="ex-max">Valor máximo (R$)</label>
              <input id="ex-max" type="number" min="20" className="mono" value={cfg.maximo} onChange={(e) => setCfg({ ...cfg, maximo: e.target.value })} />
            </div>
            <div className="campo" style={{ flex: "0 1 170px" }}>
              <label htmlFor="ex-ini">Período: de</label>
              <input id="ex-ini" type="date" value={cfg.inicio} onChange={(e) => setCfg({ ...cfg, inicio: e.target.value })} />
            </div>
            <div className="campo" style={{ flex: "0 1 170px" }}>
              <label htmlFor="ex-fim">até</label>
              <input id="ex-fim" type="date" value={cfg.fim} onChange={(e) => setCfg({ ...cfg, fim: e.target.value })} />
            </div>
          </div>
          <fieldset style={{ border: 0, padding: 0, margin: 0, display: "flex", flexWrap: "wrap", gap: "6px 18px" }}>
            <legend className="pequeno" style={{ color: "var(--tinta-media)", marginBottom: 6 }}>Tipos de operação</legend>
            {TIPOS.map((t) => (
              <label key={t.id} className="pequeno" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="checkbox" style={{ minHeight: 0 }} checked={cfg.tipos?.includes(t.id) || false}
                  onChange={(e) => setCfg({ ...cfg, tipos: e.target.checked ? [...(cfg.tipos || []), t.id] : cfg.tipos.filter((x) => x !== t.id) })} />
                <span><strong>{t.nome}</strong> <span className="suave">— {t.desc}</span></span>
              </label>
            ))}
          </fieldset>
          <div><button type="button" className="botao secundario" onClick={gerar}>{lista.fatos.length ? "Sortear de novo" : "Gerar os fatos"}</button></div>
        </>
      )}

      {lista.fatos.length > 0 && (
        <div className="tabela-caixa">
          <table>
            <thead><tr><th>#</th><th>Fato</th><th>Gabarito</th>{!somenteLeitura && <th></th>}</tr></thead>
            <tbody>
              {lista.fatos.map((f) => (
                <tr key={f.n}>
                  <td className="mono">{f.n}</td>
                  <td>{f.texto}</td>
                  <td className="pequeno" style={{ minWidth: 260 }}>
                    {emPartidas(f.gabarito).partidas.map((p, i) => (
                      <div key={i} style={p.soPermanente ? { opacity: 0.8 } : undefined}>
                        <strong>{p.d}</strong> {nome(p.conta)} ·{" "}
                        <span className="mono">{p.valor == null ? "custo pelo estoque e método de cada aluno" : dinheiro(p.valor)}</span>
                        {p.quantidade ? ` · ${p.quantidade} un.` : ""}
                      </div>
                    ))}
                    {emPartidas(f.gabarito).partidas.some((p) => p.soPermanente) && <span className="suave">Baixa do CMV só no inventário permanente.</span>}
                  </td>
                  {!somenteLeitura && <td><button type="button" className="botao perigo pequeno" onClick={() => remover(f.n)}>Remover</button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {msg.texto && <div className={`aviso ${msg.tipo || ""}`} role="status">{msg.texto}</div>}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {!somenteLeitura && <button type="button" className="botao" disabled={salvando || !lista.fatos.length} onClick={() => salvar(true)}>Enviar para a turma</button>}
        {!somenteLeitura && <button type="button" className="botao secundario" disabled={salvando || !lista.fatos.length} onClick={() => salvar(false)}>Salvar como rascunho</button>}
        <button type="button" className="botao secundario" onClick={aoFechar}>{somenteLeitura ? "Fechar" : "Cancelar"}</button>
      </div>
    </div>
  );
}

// ---------------- lista de questões teóricas ----------------
function EditorQuestoes({ turma, inicial, aoFechar }) {
  const [lista, setLista] = useState(inicial);
  const [cfg, setCfg] = useState(inicial.configuracao || {});
  const [banco, setBanco] = useState(null);
  const [msg, setMsg] = useState({});
  const [salvando, setSalvando] = useState(false);
  const somenteLeitura = !!inicial.enviada;
  const fin = finalidadeDe(lista);

  useEffect(() => {
    lerBanco(turma.disciplina).then((b) => {
      setBanco(b);
      if (!cfg.modulos?.length && b.length) setCfg((c) => ({ ...c, modulos: [b[0].id] }));
    }).catch((e) => setMsg({ tipo: "erro", texto: traduzirErro(e) }));
    // lista já salva: o gabarito volta do registro do professor
    if (inicial.id) lerGabarito(turma.id, inicial.id).then((g) => setLista((l) => ({ ...l, questoes: (l.questoes || []).map((q) => ({ ...q, ...(g[q.id] || {}) })) }))).catch(() => {});
  }, []);

  const usadas = () => [...(inicial.excluir || []), ...(lista.questoes || []).map((q) => q.id)];
  const gerar = () => {
    if (!cfg.modulos?.length) return setMsg({ tipo: "erro", texto: "Escolha pelo menos um módulo." });
    if (!cfg.tipos?.length) return setMsg({ tipo: "erro", texto: "Escolha pelo menos um tipo de questão." });
    setMsg({});
    const questoes = sortearQuestoes(banco, { ...cfg, quantidade: Number(cfg.quantidade), excluir: inicial.excluir || [] });
    if (questoes.length < Number(cfg.quantidade)) setMsg({ tipo: "atencao", texto: `O banco tem só ${questoes.length} questão(ões) com essas escolhas.` });
    setLista({ ...lista, questoes, configuracao: cfg });
  };
  const trocar = (i) => {
    const q = lista.questoes[i];
    const [nova] = sortearQuestoes(banco, { modulos: cfg.modulos, quantidade: 1, tipos: [q.tipo], excluir: usadas() });
    if (!nova) return setMsg({ tipo: "atencao", texto: "Não há outra questão desse tipo no banco." });
    setLista({ ...lista, questoes: lista.questoes.map((x, k) => (k === i ? nova : x)) });
  };
  const remover = (i) => setLista({ ...lista, questoes: lista.questoes.filter((_, k) => k !== i) });
  const salvar = async (enviar) => {
    if (!lista.questoes?.length) return setMsg({ tipo: "erro", texto: "Gere as questões antes de salvar." });
    if (enviar && valeNota(lista) && !lista.prazo) return setMsg({ tipo: "erro", texto: "Questionário avaliativo e recuperação precisam de prazo." });
    let alvos = lista.alvos;
    if (enviar && fin === "recuperacao" && !alvos) {
      try { alvos = await alunosParaRecuperacao(turma, lista.recuperacaoDe); } catch (e) { return setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
    }
    const para = fin === "recuperacao" ? `os ${alvos?.length || 0} aluno(s) abaixo da média` : "todos os alunos da turma";
    if (enviar && !window.confirm(`Enviar "${lista.titulo}" (${lista.questoes.length} questões) para ${para}? Depois de enviada, a lista não pode mais ser alterada.`)) return;
    setSalvando(true);
    try {
      const id = await salvarLista(turma, { ...lista, configuracao: cfg }, enviar);
      if (enviar && fin === "recuperacao" && alvos?.length) await marcarRecuperacao(turma, alvos, id);
      aoFechar();
    } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); setSalvando(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, borderTop: "1px solid var(--linha-suave)", paddingTop: 12 }}>
      <span className="selo cheio" style={{ alignSelf: "flex-start" }}>Lista de questões teóricas</span>
      <div className="linha-form">
        <div className="campo" style={{ flex: "1 1 240px" }}>
          <label htmlFor="eq-tit">Título da lista</label>
          <input id="eq-tit" value={lista.titulo} disabled={somenteLeitura} onChange={(e) => setLista({ ...lista, titulo: e.target.value })} maxLength={60} />
        </div>
        {fin !== "recuperacao" && (
          <div className="campo" style={{ flex: "0 1 230px" }}>
            <label htmlFor="eq-fin">Finalidade</label>
            <select id="eq-fin" value={fin} disabled={somenteLeitura} onChange={(e) => setLista({ ...lista, finalidade: e.target.value })}>
              <option value="sala">Exercício de sala (praticar)</option>
              <option value="avaliativa">Exercício avaliativo (compõe a nota)</option>
            </select>
          </div>
        )}
        {fin === "avaliativa" && (
          <div className="campo" style={{ flex: "0 1 110px" }}>
            <label htmlFor="eq-peso">Peso na média</label>
            <input id="eq-peso" type="number" min="0.5" max="10" step="0.5" className="mono" value={lista.peso ?? 1} disabled={somenteLeitura} onChange={(e) => setLista({ ...lista, peso: e.target.value })} />
          </div>
        )}
        <div className="campo" style={{ flex: "0 1 200px" }}>
          <label htmlFor="eq-prazo">Prazo{valeNota(lista) ? "" : " (opcional)"}</label>
          <input id="eq-prazo" type="date" value={lista.prazo || ""} disabled={somenteLeitura} onChange={(e) => setLista({ ...lista, prazo: e.target.value })} />
        </div>
      </div>
      <p className="pequeno suave" style={{ margin: 0 }}>
        {fin === "sala" && "De sala: o aluno responde e vê a correção e a explicação na hora. Não gera nota."}
        {fin === "avaliativa" && "Avaliativo: o gabarito fica guardado só para você; o aluno vê a correção quando você liberar o resultado. Ao fechar, a nota (acertos ÷ total × 10) vai para o quadro de notas."}
        {fin === "recuperacao" && "Recuperação paralela: questões diferentes das da lista original, só para os alunos abaixo de 6,0. Vale a maior nota."}
      </p>

      {!somenteLeitura && (
        <>
          {banco && banco.length === 0 && <div className="aviso atencao">O banco de questões desta disciplina ainda não foi importado (Banco de Dados → Banco de questões).</div>}
          {banco && banco.length > 0 && (
            <>
              <fieldset style={{ border: 0, padding: 0, margin: 0, display: "flex", flexWrap: "wrap", gap: "6px 18px" }}>
                <legend className="pequeno" style={{ color: "var(--tinta-media)", marginBottom: 6 }}>Módulos</legend>
                {banco.map((m) => (
                  <label key={m.id} className="pequeno" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="checkbox" style={{ minHeight: 0 }} checked={cfg.modulos?.includes(m.id) || false}
                      onChange={(e) => setCfg({ ...cfg, modulos: e.target.checked ? [...(cfg.modulos || []), m.id] : cfg.modulos.filter((x) => x !== m.id) })} />
                    <span><strong>Módulo {String(m.modulo).padStart(2, "0")}</strong> — {m.titulo} <span className="suave">({m.questoes.length} questões)</span></span>
                  </label>
                ))}
              </fieldset>
              <div className="linha-form" style={{ alignItems: "flex-end" }}>
                <div className="campo" style={{ flex: "0 1 280px" }}>
                  <span className="pequeno" style={{ color: "var(--tinta-media)" }}>Quantidade de questões</span>
                  <div className="abas" style={{ margin: 0, borderBottom: 0, paddingBottom: 0 }}>
                    {QUANTIDADES.map((q) => <button key={q} type="button" className={Number(cfg.quantidade) === q ? "ativo" : ""} onClick={() => setCfg({ ...cfg, quantidade: q })}>{q}</button>)}
                  </div>
                </div>
                <fieldset style={{ border: 0, padding: 0, margin: 0, display: "flex", flexWrap: "wrap", gap: "6px 18px" }}>
                  <legend className="pequeno" style={{ color: "var(--tinta-media)", marginBottom: 6 }}>Tipos</legend>
                  {TIPOS_QUESTAO.map((t) => (
                    <label key={t.id} className="pequeno" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input type="checkbox" style={{ minHeight: 0 }} checked={cfg.tipos?.includes(t.id) || false}
                        onChange={(e) => setCfg({ ...cfg, tipos: e.target.checked ? [...(cfg.tipos || []), t.id] : cfg.tipos.filter((x) => x !== t.id) })} />
                      {t.nome}
                    </label>
                  ))}
                </fieldset>
              </div>
              <div><button type="button" className="botao secundario" onClick={gerar}>{lista.questoes?.length ? "Sortear de novo" : "Sortear as questões"}</button></div>
            </>
          )}
        </>
      )}

      {lista.questoes?.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span className="pequeno suave">{lista.questoes.length} questão(ões) — gabarito em verde (só você vê). Na múltipla escolha, a ordem das alternativas muda para cada aluno.</span>
          {lista.questoes.map((q, i) => (
            <div key={q.id}>
              <Questao q={q} n={i + 1} modo="gabarito" explicacao={q.explicacao} />
              {!somenteLeitura && (
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <button type="button" className="botao secundario pequeno" onClick={() => trocar(i)}>Trocar</button>
                  <button type="button" className="botao perigo pequeno" onClick={() => remover(i)}>Remover</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {msg.texto && <div className={`aviso ${msg.tipo || ""}`} role="status">{msg.texto}</div>}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {!somenteLeitura && <button type="button" className="botao" disabled={salvando || !lista.questoes?.length} onClick={() => salvar(true)}>Enviar para a turma</button>}
        {!somenteLeitura && <button type="button" className="botao secundario" disabled={salvando || !lista.questoes?.length} onClick={() => salvar(false)}>Salvar como rascunho</button>}
        <button type="button" className="botao secundario" onClick={aoFechar}>{somenteLeitura ? "Fechar" : "Cancelar"}</button>
      </div>
    </div>
  );
}
