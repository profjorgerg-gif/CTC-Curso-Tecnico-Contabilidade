// Suporte por chamados
import { useEffect, useState } from "react";
import { traduzirErro, NOME_PAPEL } from "../lib/sessao";
import { abrirChamado, CATEGORIAS, listarChamados, mudarStatus, responder, STATUS } from "../lib/suporte";

const quando = (ts) => ts?.toDate?.().toLocaleString("pt-BR") || "agora";

export default function Suporte({ sessao, papel, ir, rota }) {
  const ehAdmin = papel === "admin";
  const [chamados, setChamados] = useState(null);
  const [filtro, setFiltro] = useState(ehAdmin ? "aberto" : "");
  const [erro, setErro] = useState("");
  const carregar = () => listarChamados(sessao).then(setChamados).catch((e) => setErro(traduzirErro(e)));
  useEffect(() => { carregar(); }, []);

  const atual = rota[0] && chamados?.find((c) => c.id === rota[0]);
  if (atual) return <Chamado sessao={sessao} ehAdmin={ehAdmin} c={atual} voltar={() => ir("suporte")} aoMudar={carregar} />;

  const lista = (chamados || []).filter((c) => !filtro || c.status === filtro);
  const conta = (s) => (chamados || []).filter((c) => c.status === s).length;

  return (
    <>
      <div>
        <h1>Suporte</h1>
        <p className="suave" style={{ maxWidth: 720 }}>
          {ehAdmin
            ? "Chamados abertos por alunos e professores. Ao responder, o chamado fica como Respondido; quem abriu pode responder de volta ou encerrar."
            : "Tem uma dúvida, encontrou um erro ou quer sugerir algo? Abra um chamado — a resposta aparece aqui."}
        </p>
      </div>
      {!ehAdmin && <NovoChamado sessao={sessao} aoCriar={carregar} />}
      <section className="cartao sem-padding">
        <div className="cartao-topo">
          <h2>{ehAdmin ? "Chamados" : "Meus chamados"}</h2>
          <div className="abas" role="tablist" style={{ margin: 0 }}>
            {[["", "Todos"], ["aberto", `Abertos (${conta("aberto")})`], ["respondido", `Respondidos (${conta("respondido")})`], ["encerrado", "Encerrados"]].map(([v, r]) => (
              <button key={v} role="tab" aria-selected={filtro === v} className={filtro === v ? "ativo" : ""} onClick={() => setFiltro(v)}>{r}</button>
            ))}
          </div>
        </div>
        {erro && <div className="aviso erro" style={{ margin: 16 }}>{erro}</div>}
        {!chamados && !erro && <p className="suave" style={{ padding: 18 }}>Carregando…</p>}
        {chamados && lista.length === 0 && <p className="suave" style={{ padding: 18 }}>Nenhum chamado aqui.</p>}
        {lista.map((c) => (
          <button key={c.id} className="linha-chamado" onClick={() => ir("suporte", c.id)}>
            <span className={`selo ${STATUS[c.status]?.[1] || "cinza"}`}>{STATUS[c.status]?.[0] || c.status}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <strong>{c.assunto}</strong>
              <span className="pequeno suave" style={{ display: "block" }}>
                {c.categoria}{ehAdmin ? ` · ${c.autorNome} (${NOME_PAPEL[c.autorPapel] || c.autorPapel}${c.autorMatricula ? `, matr. ${c.autorMatricula}` : ""})` : ""}
              </span>
            </span>
            <span className="pequeno suave mono">{quando(c.atualizadoEm)}</span>
          </button>
        ))}
      </section>
    </>
  );
}

function NovoChamado({ sessao, aoCriar }) {
  const [form, setForm] = useState({ categoria: CATEGORIAS[0], assunto: "", mensagem: "" });
  const [msg, setMsg] = useState({});
  const [enviando, setEnviando] = useState(false);
  const enviar = async (e) => {
    e.preventDefault();
    if (!form.assunto.trim() || !form.mensagem.trim()) return setMsg({ tipo: "erro", texto: "Preencha o assunto e a mensagem." });
    setEnviando(true);
    try {
      await abrirChamado(sessao, form);
      setForm({ categoria: CATEGORIAS[0], assunto: "", mensagem: "" });
      setMsg({ texto: "Chamado aberto. Acompanhe a resposta na lista abaixo." });
      aoCriar();
    } catch (err) { setMsg({ tipo: "erro", texto: traduzirErro(err) }); }
    setEnviando(false);
  };
  return (
    <form className="cartao" onSubmit={enviar}>
      <h2>Abrir chamado</h2>
      <div className="linha-form">
        <div className="campo" style={{ flex: "0 1 240px" }}>
          <label htmlFor="ch-cat">Tipo</label>
          <select id="ch-cat" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="ch-ass">Assunto</label>
          <input id="ch-ass" maxLength={120} value={form.assunto} onChange={(e) => setForm({ ...form, assunto: e.target.value })} placeholder="Ex.: Não consigo ver a disciplina CB" />
        </div>
      </div>
      <div className="campo">
        <label htmlFor="ch-msg">Mensagem</label>
        <textarea id="ch-msg" maxLength={3000} value={form.mensagem} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} style={{ fontFamily: "inherit", minHeight: 110 }} />
      </div>
      <div><button className="botao" disabled={enviando}>{enviando ? "Enviando…" : "Enviar chamado"}</button></div>
      {msg.texto && <div className={`aviso ${msg.tipo || ""}`} role="status">{msg.texto}</div>}
    </form>
  );
}

function Chamado({ sessao, ehAdmin, c, voltar, aoMudar }) {
  const [texto, setTexto] = useState("");
  const [msg, setMsg] = useState({});
  const [ocupado, setOcupado] = useState(false);
  const fazer = async (f) => {
    setOcupado(true); setMsg({});
    try { await f(); await aoMudar(); } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
    setOcupado(false);
  };
  const encerrado = c.status === "encerrado";
  return (
    <>
      <button className="botao secundario pequeno" style={{ alignSelf: "flex-start" }} onClick={voltar}>← Todos os chamados</button>
      <div>
        <span className={`selo ${STATUS[c.status]?.[1] || "cinza"}`}>{STATUS[c.status]?.[0]}</span>
        <h1 style={{ marginTop: 8 }}>{c.assunto}</h1>
        <p className="suave pequeno">
          {c.categoria} · aberto por {c.autorNome} ({NOME_PAPEL[c.autorPapel] || c.autorPapel}{c.autorMatricula ? `, matr. ${c.autorMatricula}` : ""}) em {quando(c.criadoEm)}
          {ehAdmin && c.autorEmail ? ` · ${c.autorEmail}` : ""}
        </p>
      </div>
      <section className="cartao">
        <Mensagem nome={c.autorNome} papel={c.autorPapel} em={c.criadoEm} texto={c.mensagem} />
        {(c.respostas || []).map((r, i) => <Mensagem key={i} nome={r.porNome} papel={r.porPapel} em={r.em} texto={r.texto} destaque={r.porPapel === "admin"} />)}
      </section>
      {!encerrado && (
        <section className="cartao">
          <label htmlFor="ch-resp"><h2>{ehAdmin ? "Responder" : "Responder ao suporte"}</h2></label>
          <textarea id="ch-resp" maxLength={3000} value={texto} onChange={(e) => setTexto(e.target.value)} style={{ fontFamily: "inherit", minHeight: 100 }} />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="botao" disabled={ocupado || !texto.trim()} onClick={() => fazer(async () => { await responder(sessao, c, texto); setTexto(""); })}>Enviar resposta</button>
            <button className="botao secundario" disabled={ocupado} onClick={() => fazer(() => mudarStatus(c, "encerrado"))}>Encerrar chamado</button>
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
      <p style={{ whiteSpace: "pre-wrap" }}>{texto}</p>
    </div>
  );
}
