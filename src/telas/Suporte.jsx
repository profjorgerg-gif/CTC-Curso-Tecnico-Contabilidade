// Suporte por chamados numerados (10/10/2026): o aluno escreve ao professor da turma (conteúdo,
// tarefas, notas) ou ao administrador (acesso, erro, sugestão). O professor atende os da turma
// dele; o administrador vê todos. Exportar .txt, imprimir/PDF e copiar só leem.
import { useEffect, useMemo, useState } from "react";
import { traduzirErro, NOME_PAPEL } from "../lib/sessao";
import { useTurmas } from "../lib/useTurmas";
import { disciplinaPorId } from "../dados/disciplinas";
import {
  abrirChamado, atende, baixarTxt, CATEGORIAS, copiarTexto, DESTINOS, destinoPadrao, fmtNumero, gravarModelos, imprimirTexto, lerModelos,
  listarChamados, MODELOS_PADRAO, mudarStatus, nomeArquivo, numerarChamadosAntigos, responder, STATUS, textoChamado, textoVariosChamados,
} from "../lib/suporte";
import { useRascunho } from "../lib/rascunho";
import { AvisoRascunho, SeloNaoSalvo } from "../componentes/Rascunho";
import DevolverTarefa from "../componentes/DevolverTarefa";

const quando = (ts) => ts?.toDate?.().toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) || "agora";
const Numero = ({ n }) => <span className="selo-numero mono">Nº {fmtNumero(n)}</span>;

export default function Suporte({ sessao, papel, ir, rota }) {
  const ehAdmin = papel === "admin";
  const [chamados, setChamados] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState("");
  const [msg, setMsg] = useState("");
  const carregar = () => listarChamados(sessao).then(setChamados).catch((e) => setErro(traduzirErro(e)));
  useEffect(() => { carregar(); }, []);

  const atual = rota[0] && chamados?.find((c) => c.id === rota[0]);
  const lista = useMemo(() => {
    const b = busca.trim().toLowerCase();
    return (chamados || []).filter((c) => !filtro || c.status === filtro).filter((c) => !b ||
      [fmtNumero(c.numero), String(c.numero || ""), c.assunto, c.autorNome, c.autorMatricula, c.paraNome, c.paraMatricula, c.turmaNome, c.relacionado].some((x) => String(x || "").toLowerCase().includes(b)));
  }, [chamados, filtro, busca]);
  if (atual) return <Chamado sessao={sessao} c={atual} voltar={() => ir("suporte")} aoMudar={carregar} />;

  const conta = (s) => (chamados || []).filter((c) => c.status === s).length;
  const semNumero = (chamados || []).filter((c) => !c.numero).length;
  const exportar = () => baixarTxt(nomeArquivo("Chamados do Suporte"), textoVariosChamados(lista));

  return (
    <>
      <div>
        <h1>Suporte</h1>
        <p className="suave" style={{ maxWidth: 760 }}>
          {papel === "aluno"
            ? "Dúvida de conteúdo, tarefa ou nota? Escreva ao professor da turma. Problema de acesso, erro no sistema ou sugestão? Escreva ao administrador. Cada chamado tem um número; a resposta aparece aqui."
            : ehAdmin
              ? "Todos os chamados, numerados. Você atende os do administrador (acesso, erro, sugestão); os de conteúdo vão para o professor da turma, mas você também vê."
              : "Os chamados dos alunos das suas turmas e os que você abriu ao administrador. Responda, use as respostas rápidas ou devolva a tarefa ao aluno com orientação."}
        </p>
      </div>
      {!ehAdmin && <NovoChamado sessao={sessao} papel={papel} aoCriar={(r) => { carregar(); setMsg(r.numero ? `Chamado Nº ${fmtNumero(r.numero)} aberto. Acompanhe a resposta na lista abaixo.` : "Chamado aberto. Acompanhe a resposta na lista abaixo."); }} />}
      {msg && <div className="aviso" role="status">{msg}</div>}
      <section className="cartao sem-padding">
        <div className="cartao-topo" style={{ flexWrap: "wrap", gap: 8 }}>
          <h2>{papel === "aluno" ? "Meus chamados" : "Chamados"}</h2>
          <div className="abas" role="tablist" style={{ margin: 0 }}>
            {[["", "Todos"], ["aberto", `Aguardando resposta (${conta("aberto")})`], ["respondido", `Respondidos (${conta("respondido")})`], ["encerrado", "Encerrados"]].map(([v, r]) => (
              <button key={v} role="tab" aria-selected={filtro === v} className={filtro === v ? "ativo" : ""} onClick={() => setFiltro(v)}>{r}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "10px 18px", alignItems: "center" }}>
          <input aria-label="Buscar chamado" placeholder={papel === "aluno" ? "Buscar (número ou assunto)" : "Buscar (número, aluno, matrícula, assunto)"} value={busca} onChange={(e) => setBusca(e.target.value)} style={{ flex: "1 1 260px" }} />
          <button type="button" className="botao secundario pequeno" disabled={!lista.length} onClick={exportar}>⬇ Exportar {busca || filtro ? "os filtrados" : "todos"} (.txt)</button>
          {ehAdmin && semNumero > 0 && (
            <button type="button" className="botao secundario pequeno" onClick={async () => { try { const n = await numerarChamadosAntigos(chamados); setMsg(`${n} chamado(s) antigo(s) numerado(s).`); carregar(); } catch (e) { setErro(traduzirErro(e)); } }}>Numerar {semNumero} chamado(s) antigo(s)</button>
          )}
        </div>
        {erro && <div className="aviso erro" style={{ margin: 16 }}>{erro}</div>}
        {!chamados && !erro && <p className="suave" style={{ padding: 18 }}>Carregando…</p>}
        {chamados && lista.length === 0 && <p className="suave" style={{ padding: 18 }}>Nenhum chamado aqui.</p>}
        {lista.map((c) => {
          const meu = atende(sessao, c) && c.status === "aberto";
          return (
            <button key={c.id} className="linha-chamado" onClick={() => ir("suporte", c.id)}>
              <Numero n={c.numero} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <strong>{c.assunto}</strong>
                <span className="pequeno suave" style={{ display: "block" }}>
                  {c.categoria} · para {c.destino === "professor" ? "o professor" : "o administrador"}{c.turmaNome ? ` · ${c.turmaNome}` : ""}
                  {papel !== "aluno" ? ` · ${c.paraNome ? `para ${c.paraNome} (${c.paraMatricula})` : `${c.autorNome} (${NOME_PAPEL[c.autorPapel] || c.autorPapel}${c.autorMatricula ? `, matr. ${c.autorMatricula}` : ""})`}` : ""}
                  {c.relacionado ? ` · ${c.relacionado}` : ""}
                </span>
              </span>
              <span className={`selo ${STATUS[c.status]?.[1] || "cinza"}`}>{meu ? "Aguardando você" : STATUS[c.status]?.[0] || c.status}</span>
              <span className="pequeno suave mono">{quando(c.atualizadoEm)}</span>
            </button>
          );
        })}
      </section>
    </>
  );
}

const SUGESTOES_RELACIONADO = ["Módulo 01", "Módulo 05", "Fatos orientados", "Lista de exercícios", "Escrituração → Lançamentos", "Escrituração → Saldos iniciais", "Escrituração → DRE", "Escrituração → Encerramento (ARE)", "Questionário", "Minha empresa", "Parametrização"];

function NovoChamado({ sessao, papel, aoCriar }) {
  const { turmas } = useTurmas(sessao);
  const vazio = { categoria: papel === "aluno" ? CATEGORIAS[0][0] : "Erro no sistema", destino: papel === "aluno" ? "professor" : "admin", turmaId: "", relacionado: "", assunto: "", mensagem: "" };
  const [form, setForm] = useState(vazio);
  const [msg, setMsg] = useState({});
  const [enviando, setEnviando] = useState(false);
  const naoSalvo = !!(form.assunto.trim() || form.mensagem.trim());
  const rasc = useRascunho({ chave: "suporte-novo", valor: form, sujo: naoSalvo, aoRestaurar: setForm });
  const turma = turmas.find((t) => t.id === form.turmaId) || turmas[0];
  // no modo de teste, o chamado vai só para o professor (você mesmo); o professor escreve ao administrador
  const destinos = sessao.teste ? ["professor"] : papel === "aluno" ? ["professor", "admin"] : ["admin"];

  const enviar = async (e) => {
    e.preventDefault();
    if (!form.assunto.trim() || !form.mensagem.trim()) return setMsg({ tipo: "erro", texto: "Preencha o assunto e a mensagem." });
    if (form.destino === "professor" && !turma) return setMsg({ tipo: "erro", texto: "Você ainda não está em nenhuma turma: escreva ao administrador." });
    setEnviando(true); setMsg({});
    try {
      const r = await abrirChamado(sessao, { ...form, turma: form.destino === "professor" ? turma : turmas[0] });
      rasc.limpar(); setForm(vazio);
      aoCriar(r);
    } catch (err) { setMsg({ tipo: "erro", texto: traduzirErro(err) }); }
    setEnviando(false);
  };
  return (
    <form className="cartao" onSubmit={enviar}>
      <h2>Abrir chamado</h2>
      <AvisoRascunho r={rasc} oque="o chamado que você estava escrevendo" />
      <div className="linha-form">
        <div className="campo" style={{ flex: "0 1 280px" }}>
          <label htmlFor="ch-cat">Tipo</label>
          <select id="ch-cat" value={form.categoria} onChange={(e) => { const categoria = e.target.value; const d = destinoPadrao(categoria); setForm({ ...form, categoria, destino: destinos.includes(d) ? d : destinos[0] }); }}>
            {CATEGORIAS.map(([c]) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <fieldset className="campo" style={{ border: 0, padding: 0, margin: 0, flex: "0 1 300px" }}>
          <legend className="pequeno" style={{ marginBottom: 4 }}>Para quem</legend>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {destinos.map((d) => (
              <label key={d} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input type="radio" name="ch-destino" checked={form.destino === d} onChange={() => setForm({ ...form, destino: d })} style={{ minHeight: 0 }} /> {DESTINOS[d]}
              </label>
            ))}
          </div>
        </fieldset>
        {form.destino === "professor" && turmas.length > 1 && (
          <div className="campo" style={{ flex: "0 1 300px" }}>
            <label htmlFor="ch-turma">Turma</label>
            <select id="ch-turma" value={turma?.id || ""} onChange={(e) => setForm({ ...form, turmaId: e.target.value })}>
              {turmas.map((t) => <option key={t.id} value={t.id}>{t.nome} · {disciplinaPorId(t.disciplina)?.sigla}</option>)}
            </select>
          </div>
        )}
      </div>
      <div className="linha-form">
        <div className="campo" style={{ flex: "0 1 280px" }}>
          <label htmlFor="ch-rel">Relacionado a (opcional)</label>
          <input id="ch-rel" list="ch-rel-lista" maxLength={80} value={form.relacionado} onChange={(e) => setForm({ ...form, relacionado: e.target.value })} placeholder="Ex.: Módulo 05, aba DRE" />
          <datalist id="ch-rel-lista">{SUGESTOES_RELACIONADO.map((s) => <option key={s} value={s} />)}</datalist>
        </div>
        <div className="campo">
          <label htmlFor="ch-ass">Assunto</label>
          <input id="ch-ass" maxLength={120} value={form.assunto} onChange={(e) => setForm({ ...form, assunto: e.target.value })} placeholder="Ex.: Meu balancete não fecha" />
        </div>
      </div>
      <div className="campo">
        <label htmlFor="ch-msg">Mensagem</label>
        <textarea id="ch-msg" maxLength={3000} value={form.mensagem} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} style={{ fontFamily: "inherit", minHeight: 110 }} />
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button className="botao" disabled={enviando}>{enviando ? "Enviando…" : "Enviar chamado"}</button>
        <SeloNaoSalvo sujo={naoSalvo} />
      </div>
      {msg.texto && <div className={`aviso ${msg.tipo || ""}`} role="status">{msg.texto}</div>}
    </form>
  );
}

function Chamado({ sessao, c, voltar, aoMudar }) {
  const [texto, setTexto] = useState("");
  const [msg, setMsg] = useState({});
  const [ocupado, setOcupado] = useState(false);
  const [modelos, setModelos] = useState(lerModelos);
  const [devolvendo, setDevolvendo] = useState(false);
  const souAtendente = atende(sessao, c);
  const rasc = useRascunho({ chave: `suporte-resp-${c.id}`, valor: texto, sujo: !!texto.trim(), aoRestaurar: setTexto });
  const fazer = async (f, ok) => {
    setOcupado(true); setMsg({});
    try { await f(); await aoMudar(); if (ok) setMsg({ texto: ok }); } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
    setOcupado(false);
  };
  const encerrado = c.status === "encerrado";
  const titulo = `Chamado ${c.numero ? `Nº ${fmtNumero(c.numero)}` : ""} - ${c.assunto}`;
  // aluno do chamado (para devolver a tarefa): quem abriu, se for aluno, ou para quem o professor escreveu
  const alunoDoChamado = c.paraMatricula ? { matricula: c.paraMatricula, nome: c.paraNome } : c.autorPapel === "aluno" && c.autorMatricula ? { matricula: c.autorMatricula, nome: c.autorNome } : null;
  const salvarModelo = () => {
    if (!texto.trim()) return;
    const n = [...modelos.filter((m) => m !== texto.trim()), texto.trim()].slice(-12);
    setModelos(n); gravarModelos(n); setMsg({ texto: "Resposta guardada nas respostas rápidas deste navegador." });
  };

  return (
    <>
      <button className="botao secundario pequeno" style={{ alignSelf: "flex-start" }} onClick={voltar}>← Todos os chamados</button>
      <div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <Numero n={c.numero} />
          <span className={`selo ${STATUS[c.status]?.[1] || "cinza"}`}>{STATUS[c.status]?.[0]}</span>
        </div>
        <h1 style={{ marginTop: 8 }}>{c.assunto}</h1>
        <p className="suave pequeno">
          {c.categoria} · para {DESTINOS[c.destino] || DESTINOS.admin}{c.turmaNome ? ` · ${c.turmaNome}` : ""}{c.relacionado ? ` · relacionado a: ${c.relacionado}` : ""}
          <br />aberto por {c.autorNome} ({NOME_PAPEL[c.autorPapel] || c.autorPapel}{c.autorMatricula ? `, matr. ${c.autorMatricula}` : ""}) em {quando(c.criadoEm)}
          {c.paraNome ? ` · para o aluno ${c.paraNome} (matr. ${c.paraMatricula})` : ""}
          {sessao.papel === "admin" && c.autorEmail ? ` · ${c.autorEmail}` : ""}
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <button type="button" className="botao secundario pequeno" onClick={() => imprimirTexto(nomeArquivo(titulo), textoChamado(c))}>🖨 Imprimir / salvar PDF</button>
          <button type="button" className="botao secundario pequeno" onClick={() => baixarTxt(nomeArquivo(titulo), textoChamado(c))}>⬇ Baixar texto (.txt)</button>
          <button type="button" className="botao secundario pequeno" onClick={async () => setMsg({ texto: (await copiarTexto(textoChamado(c))) ? "Chamado copiado." : "Não foi possível copiar." })}>📋 Copiar</button>
          {souAtendente && sessao.papel !== "aluno" && alunoDoChamado && c.turmaId && <button type="button" className="botao secundario pequeno" onClick={() => setDevolvendo(!devolvendo)}>↩ Devolver tarefa</button>}
        </div>
      </div>
      {devolvendo && alunoDoChamado && <DevolverTarefa sessao={sessao} turmaId={c.turmaId} aluno={alunoDoChamado} aoCancelar={() => setDevolvendo(false)} aoConcluir={() => aoMudar()} />}
      <section className="cartao">
        <Mensagem nome={c.autorNome} papel={c.autorPapel} em={c.criadoEm} texto={c.mensagem} destaque={c.autorPapel !== "aluno"} />
        {(c.respostas || []).map((r, i) => <Mensagem key={i} nome={r.porNome} papel={r.porPapel} em={r.em} texto={r.texto} destaque={r.porPapel !== "aluno"} />)}
      </section>
      {!encerrado && (
        <section className="cartao">
          <label htmlFor="ch-resp"><h2>Responder</h2></label>
          <AvisoRascunho r={rasc} oque="a resposta que você estava escrevendo" />
          {souAtendente && sessao.papel !== "aluno" && (
            <div className="campo" style={{ maxWidth: 640, flex: "none" }}>
              <label htmlFor="ch-modelo">Respostas rápidas</label>
              <select id="ch-modelo" value="" onChange={(e) => e.target.value && setTexto((t) => (t.trim() ? `${t}\n\n${e.target.value}` : e.target.value))}>
                <option value="">Escolha um modelo para inserir…</option>
                {modelos.map((m) => <option key={m} value={m}>{m.length > 90 ? `${m.slice(0, 90)}…` : m}</option>)}
              </select>
            </div>
          )}
          <textarea id="ch-resp" maxLength={3000} value={texto} onChange={(e) => setTexto(e.target.value)} style={{ fontFamily: "inherit", minHeight: 100 }} />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button className="botao" disabled={ocupado || !texto.trim()} onClick={() => fazer(async () => { await responder(sessao, c, texto); rasc.limpar(); setTexto(""); })}>Enviar resposta</button>
            <button className="botao secundario" disabled={ocupado} onClick={() => fazer(() => mudarStatus(c, "encerrado"))}>Encerrar chamado</button>
            {souAtendente && sessao.papel !== "aluno" && <button type="button" className="botao secundario pequeno" disabled={!texto.trim()} onClick={salvarModelo}>Guardar como resposta rápida</button>}
            {souAtendente && sessao.papel !== "aluno" && modelos !== MODELOS_PADRAO && <button type="button" className="botao secundario pequeno" onClick={() => { setModelos(MODELOS_PADRAO); gravarModelos(MODELOS_PADRAO); }}>Voltar aos modelos padrão</button>}
            <SeloNaoSalvo sujo={!!texto.trim()} />
          </div>
        </section>
      )}
      {encerrado && (
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span className="suave pequeno">Este chamado está encerrado.</span>
          <button className="botao secundario pequeno" disabled={ocupado} onClick={() => fazer(() => mudarStatus(c, "aberto"))}>Reabrir</button>
        </div>
      )}
      {msg.texto && <div className={`aviso ${msg.tipo || ""}`} role="status">{msg.texto}</div>}
    </>
  );
}

function Mensagem({ nome, papel, em, texto, destaque }) {
  return (
    <div style={{ borderLeft: `3px solid ${destaque ? "var(--destaque)" : "var(--linha)"}`, paddingLeft: 12, display: "flex", flexDirection: "column", gap: 4 }}>
      <span className="pequeno suave"><strong style={{ color: "var(--tinta-media)" }}>{nome}</strong> · {NOME_PAPEL[papel] || papel} · {quando(em)}</span>
      <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{texto}</p>
    </div>
  );
}
