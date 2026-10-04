// Banco de Dados comum: Plano de Contas, CFOP, NCM e cronograma IBS/CBS
import { useEffect, useMemo, useState } from "react";
import {
  addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query,
  runTransaction, serverTimestamp, setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { carregarTabela, chaveCodigo, semAcento } from "../lib/arquivos";
import { traduzirErro } from "../lib/sessao";
import { useTurmas } from "../lib/useTurmas";
import { disciplinaPorId } from "../dados/disciplinas";
import { CRONOGRAMA_IBS_CBS } from "../dados/ibsCbs";

const ABAS = [
  ["plano", "Plano de Contas", "Plano de Contas"],
  ["cfop", "CFOP", "CFOP"],
  ["ncm", "NCM", "NCM"],
  ["ibs", "IBS/CBS", "IBS/CBS"],
  ["historico", "Histórico de alterações", null],
];

export default function BancoDados({ sessao, papel }) {
  const { turmas } = useTurmas(sessao);
  // o aluno vê só as tabelas usadas pelas disciplinas em que está matriculado
  const permitidas = useMemo(() => {
    if (papel !== "aluno") return ABAS;
    const usa = new Set(turmas.flatMap((t) => disciplinaPorId(t.disciplina)?.usa || []));
    return ABAS.filter(([, , chave]) => chave && usa.has(chave));
  }, [papel, turmas]);
  const [aba, setAba] = useState("plano");
  const atual = permitidas.some(([id]) => id === aba) ? aba : permitidas[0]?.[0];
  const pode = { editarPlano: papel !== "aluno", editarIbs: papel === "admin" };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <h1>{papel === "aluno" ? "Consultas" : "Banco de Dados"}</h1>
          <p className="suave">
            {papel === "aluno"
              ? "Você consulta as tabelas usadas pelas suas disciplinas."
              : "Base única consultada por todas as disciplinas. Toda alteração fica no histórico."}
          </p>
        </div>
        <span className={`selo ${papel === "aluno" ? "cinza" : "verde"}`}>{papel === "aluno" ? "Somente consulta" : "Edição com histórico"}</span>
      </div>
      {permitidas.length === 0 && <div className="aviso atencao">Nenhuma tabela disponível para as suas disciplinas ainda.</div>}
      {permitidas.length > 0 && (
        <div className="abas" role="tablist">
          {permitidas.map(([id, rotulo]) => (
            <button key={id} role="tab" aria-selected={atual === id} className={atual === id ? "ativo" : ""} onClick={() => setAba(id)}>{rotulo}</button>
          ))}
        </div>
      )}
      {atual === "plano" && <PlanoDeContas sessao={sessao} papel={papel} podeEditar={pode.editarPlano} />}
      {atual === "cfop" && <Cfop />}
      {atual === "ncm" && <Ncm />}
      {atual === "ibs" && <IbsCbs sessao={sessao} podeEditar={pode.editarIbs} />}
      {atual === "historico" && <Historico />}
    </>
  );
}

// registra quem alterou o quê (o histórico não pode ser apagado — ver firestore.rules)
async function registrar(sessao, tabela, item, antes, depois) {
  await addDoc(collection(db, "historico"), {
    tabela, item, antes, depois,
    porUid: sessao.usuario.uid,
    porNome: sessao.perfil?.nome || sessao.usuario.displayName,
    em: serverTimestamp(),
  });
}

// ---------------- Plano de Contas ----------------
function PlanoDeContas({ sessao, papel, podeEditar }) {
  const [contas, setContas] = useState(null);
  const [noBanco, setNoBanco] = useState(false);
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState(null);
  const [msg, setMsg] = useState({});

  const [novasOficiais, setNovasOficiais] = useState([]);
  const carregar = async () => {
    try {
      const snap = await getDoc(doc(db, "config", "planoContas"));
      const oficial = await carregarTabela("plano-contas");
      if (snap.exists()) {
        const doBanco = snap.data().contas;
        setContas(doBanco); setNoBanco(true);
        // contas incluídas no plano oficial depois que ele foi gravado no banco
        const existentes = new Set(doBanco.map((c) => c.codigo));
        setNovasOficiais(oficial.filter((c) => !existentes.has(c.codigo)));
      } else { setContas(oficial); setNoBanco(false); setNovasOficiais([]); }
    } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
  };

  // inclui no banco só as contas novas do plano oficial, sem mexer nas que já existem (nem nas correções feitas)
  const incluirNovas = async () => {
    try {
      let incluidas = [];
      await runTransaction(db, async (t) => {
        const ref = doc(db, "config", "planoContas");
        const snap = await t.get(ref);
        const lista = snap.data().contas;
        const existentes = new Set(lista.map((c) => c.codigo));
        incluidas = novasOficiais.filter((c) => !existentes.has(c.codigo));
        t.update(ref, { contas: [...lista, ...incluidas], atualizadoEm: serverTimestamp() });
      });
      await registrar(sessao, "Plano de Contas", incluidas.map((c) => c.codigo).join(", "), null, `Incluída(s) do plano oficial: ${incluidas.map((c) => `${c.codigo} ${c.nome}`).join("; ")}`);
      setMsg({ texto: `${incluidas.length} conta(s) nova(s) incluída(s) no banco. A alteração ficou no histórico.` });
      carregar();
    } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
  };
  useEffect(() => { carregar(); }, []);

  const gravarOficial = async () => {
    try {
      const oficial = await carregarTabela("plano-contas");
      await setDoc(doc(db, "config", "planoContas"), { contas: oficial, atualizadoEm: serverTimestamp() });
      await registrar(sessao, "Plano de Contas", "plano completo", null, `${oficial.length} contas do plano oficial`);
      setMsg({ texto: `Plano oficial gravado no banco: ${oficial.length} contas.` });
      carregar();
    } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
  };

  const salvar = async () => {
    const { codigo, nome, natureza } = editando;
    try {
      let antes;
      await runTransaction(db, async (t) => {
        const ref = doc(db, "config", "planoContas");
        const snap = await t.get(ref);
        const lista = snap.data().contas.map((c) => {
          if (c.codigo !== codigo) return c;
          antes = `${c.nome} (${c.natureza})`;
          return { ...c, nome: nome.trim(), natureza };
        });
        t.update(ref, { contas: lista, atualizadoEm: serverTimestamp() });
      });
      await registrar(sessao, "Plano de Contas", codigo, antes, `${nome.trim()} (${natureza})`);
      setEditando(null);
      setMsg({ texto: `Conta ${codigo} atualizada. A alteração ficou no histórico.` });
      carregar();
    } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
  };

  const visiveis = useMemo(() => {
    if (!contas) return [];
    const b = semAcento(busca);
    return [...contas]
      .sort((a, c) => chaveCodigo(a.codigo).localeCompare(chaveCodigo(c.codigo)))
      .filter((c) => !b || c.codigo.startsWith(busca) || semAcento(c.nome).includes(b));
  }, [contas, busca]);

  return (
    <section className="cartao sem-padding">
      <div className="cartao-topo">
        <h2>Plano de Contas {contas && <span className="suave pequeno">· {contas.length} contas</span>}</h2>
        <input aria-label="Buscar conta" placeholder="Buscar por código ou nome" value={busca} onChange={(e) => setBusca(e.target.value)} style={{ flex: "0 1 280px" }} />
      </div>
      {!noBanco && contas && papel !== "aluno" && (
        <div className="aviso atencao" style={{ margin: 16 }}>
          O plano ainda não foi gravado no banco; você está vendo a versão oficial do site.
          {papel === "admin" && <> <button className="botao pequeno" onClick={gravarOficial}>Gravar plano oficial no banco</button></>}
          {papel === "professor" && " Peça ao administrador para gravá-lo antes de editar."}
        </div>
      )}
      {noBanco && novasOficiais.length > 0 && papel !== "aluno" && (
        <div className="aviso atencao" style={{ margin: 16, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span>O plano oficial tem {novasOficiais.length} conta(s) nova(s) que ainda não estão no banco: {novasOficiais.map((c) => `${c.codigo} ${c.nome}`).join(" · ")}.</span>
          {papel === "admin" ? <button className="botao pequeno" onClick={incluirNovas}>Incluir no banco</button> : <span>Peça ao administrador para incluir.</span>}
        </div>
      )}
      {msg.texto && <div className={`aviso ${msg.tipo || ""}`} style={{ margin: 16 }} role="status">{msg.texto}</div>}
      <div className="tabela-caixa" style={{ maxHeight: 620, overflowY: "auto" }}>
        <table>
          <thead><tr><th>Código</th><th>Conta</th><th>Natureza</th><th>Tipo</th><th>Vai para</th>{podeEditar && noBanco && <th></th>}</tr></thead>
          <tbody>
            {!contas && <tr><td colSpan={6} className="suave">Carregando…</td></tr>}
            {visiveis.map((c) => (
              <tr key={c.codigo}>
                <td className="mono">{c.codigo}</td>
                <td style={{ paddingLeft: 16 + (c.nivel - 1) * 14, fontWeight: c.nivel <= 2 ? 600 : 400 }}>
                  {editando?.codigo === c.codigo
                    ? <input aria-label="Nome da conta" value={editando.nome} onChange={(e) => setEditando({ ...editando, nome: e.target.value })} style={{ width: "100%" }} />
                    : c.nome}
                </td>
                <td>
                  {editando?.codigo === c.codigo
                    ? (
                      <select aria-label="Natureza" value={editando.natureza} onChange={(e) => setEditando({ ...editando, natureza: e.target.value })}>
                        <option>Devedora</option><option>Credora</option><option>Variável</option>
                      </select>
                    )
                    : <span className="pequeno">{c.natureza}</span>}
                </td>
                <td className="pequeno suave">{c.tipo}</td>
                <td className="pequeno mono">{c.destino}</td>
                {podeEditar && noBanco && (
                  <td style={{ whiteSpace: "nowrap" }}>
                    {editando?.codigo === c.codigo
                      ? <><button className="botao pequeno" onClick={salvar}>Salvar</button> <button className="botao secundario pequeno" onClick={() => setEditando(null)}>Cancelar</button></>
                      : <button className="botao secundario pequeno" onClick={() => setEditando({ codigo: c.codigo, nome: c.nome, natureza: c.natureza })}>Corrigir</button>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ---------------- CFOP ----------------
function Cfop() {
  const [dados, setDados] = useState(null);
  const [busca, setBusca] = useState("");
  useEffect(() => { carregarTabela("cfop").then(setDados); }, []);
  const lista = useMemo(() => {
    if (!dados) return [];
    const b = semAcento(busca).replace(/\./g, "");
    return dados.filter((c) => !b || c.codigo.startsWith(b) || semAcento(c.titulo).includes(b)).slice(0, 100);
  }, [dados, busca]);
  return (
    <section className="cartao sem-padding">
      <div className="cartao-topo">
        <h2>CFOP {dados && <span className="suave pequeno">· {dados.length} códigos oficiais</span>}</h2>
        <input aria-label="Buscar CFOP" placeholder="Código (5102) ou palavra" value={busca} onChange={(e) => setBusca(e.target.value)} style={{ flex: "0 1 280px" }} />
      </div>
      <div className="tabela-caixa" style={{ maxHeight: 620, overflowY: "auto" }}>
        <table>
          <thead><tr><th>Código</th><th>Descrição</th></tr></thead>
          <tbody>
            {!dados && <tr><td colSpan={2} className="suave">Carregando…</td></tr>}
            {lista.map((c) => (
              <tr key={c.codigo}>
                <td className="mono">{c.codigo.replace(/^(\d)/, "$1.")}</td>
                <td>{c.titulo}{c.encerrado && <span className="selo cinza" style={{ marginLeft: 8 }}>encerrado</span>}
                  <div className="pequeno suave">{c.descricao}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {dados && lista.length === 100 && <p className="pequeno suave" style={{ padding: "8px 16px" }}>Mostrando os 100 primeiros. Refine a busca.</p>}
    </section>
  );
}

// ---------------- NCM ----------------
function Ncm() {
  const [dados, setDados] = useState(null);
  const [busca, setBusca] = useState("");
  const [capitulo, setCapitulo] = useState("");
  useEffect(() => { carregarTabela("ncm").then(setDados); }, []);
  const so = (c) => c.replace(/\D/g, "");
  // sem busca: lista os capítulos (2 dígitos); ao abrir um capítulo, mostra todos os códigos dele
  const capitulos = useMemo(() => (dados || []).filter((n) => so(n.codigo).length === 2), [dados]);
  const lista = useMemo(() => {
    if (!dados) return [];
    if (busca.trim().length >= 2) {
      const b = semAcento(busca);
      const digitos = b.replace(/\D/g, "");
      return dados.filter((n) => (digitos && so(n.codigo).startsWith(digitos)) || semAcento(n.descricao).includes(b)).slice(0, 300);
    }
    if (capitulo) return dados.filter((n) => so(n.codigo).startsWith(capitulo));
    return [];
  }, [dados, busca, capitulo]);
  const buscando = busca.trim().length >= 2;
  const nivel = (c) => Math.min(Math.max(so(c).length - 2, 0), 8);
  return (
    <section className="cartao sem-padding">
      <div className="cartao-topo">
        <h2>NCM {dados && <span className="suave pequeno">· {dados.length.toLocaleString("pt-BR")} códigos oficiais</span>}</h2>
        <input aria-label="Buscar NCM" placeholder="Código (6109) ou descrição (camiseta)" value={busca} onChange={(e) => setBusca(e.target.value)} style={{ flex: "0 1 300px" }} />
      </div>
      {!buscando && capitulo && (
        <div style={{ padding: "10px 16px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button className="botao secundario pequeno" onClick={() => setCapitulo("")}>← Todos os capítulos</button>
          <span className="pequeno suave">Capítulo {capitulo} · {lista.length.toLocaleString("pt-BR")} códigos</span>
        </div>
      )}
      {buscando && <p className="pequeno suave" style={{ padding: "10px 16px 0" }}>{lista.length >= 300 ? "Mostrando os 300 primeiros resultados — refine a busca." : `${lista.length} resultado(s).`}</p>}
      <div className="tabela-caixa" style={{ maxHeight: 620, overflowY: "auto" }}>
        <table>
          <thead><tr><th>{!buscando && !capitulo ? "Capítulo" : "Código"}</th><th>Descrição</th></tr></thead>
          <tbody>
            {!dados && <tr><td colSpan={2} className="suave">Carregando a tabela…</td></tr>}
            {dados && !buscando && !capitulo && capitulos.map((n) => (
              <tr key={n.codigo} onClick={() => setCapitulo(so(n.codigo))} style={{ cursor: "pointer" }} title="Abrir o capítulo">
                <td className="mono" style={{ color: "var(--destaque)", fontWeight: 600 }}>{n.codigo}</td>
                <td>{n.descricao}</td>
              </tr>
            ))}
            {(buscando || capitulo) && lista.map((n) => (
              <tr key={n.codigo}>
                <td className="mono" style={{ paddingLeft: 16 + nivel(n.codigo) * 6, whiteSpace: "nowrap" }}>{n.codigo}</td>
                <td style={{ fontWeight: so(n.codigo).length <= 4 ? 600 : 400 }}>{n.descricao}</td>
              </tr>
            ))}
            {dados && buscando && lista.length === 0 && <tr><td colSpan={2} className="suave">Nenhum código encontrado.</td></tr>}
          </tbody>
        </table>
      </div>
      {!buscando && !capitulo && dados && <p className="pequeno suave" style={{ padding: "8px 16px 14px" }}>Clique num capítulo para ver todos os códigos dele, ou use a busca.</p>}
    </section>
  );
}

// ---------------- IBS/CBS ----------------
function IbsCbs({ sessao, podeEditar }) {
  const [linhas, setLinhas] = useState(null);
  const [rascunho, setRascunho] = useState(null);
  const [msg, setMsg] = useState({});
  const carregar = async () => {
    try {
      const snap = await getDoc(doc(db, "config", "ibsCbs"));
      setLinhas(snap.exists() ? snap.data().linhas : CRONOGRAMA_IBS_CBS);
    } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
  };
  useEffect(() => { carregar(); }, []);

  const salvar = async () => {
    try {
      await setDoc(doc(db, "config", "ibsCbs"), { linhas: rascunho, atualizadoEm: serverTimestamp() });
      await registrar(sessao, "Cronograma IBS/CBS", "tabela", JSON.stringify(linhas), JSON.stringify(rascunho));
      setRascunho(null); setMsg({ texto: "Cronograma salvo." }); carregar();
    } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
  };

  const campos = [["ano", "Ano"], ["cbs", "CBS"], ["ibs", "IBS"], ["icmsIss", "ICMS/ISS mantidos"], ["observacao", "Observação"]];
  const vista = rascunho || linhas || [];
  return (
    <section className="cartao sem-padding">
      <div className="cartao-topo">
        <h2>IBS/CBS — cronograma da transição <span className="suave pequeno">· LC 214/2025</span></h2>
        {podeEditar && !rascunho && <button className="botao secundario pequeno" onClick={() => setRascunho(linhas.map((l) => ({ ...l })))}>Editar</button>}
        {rascunho && <span style={{ display: "flex", gap: 8 }}><button className="botao pequeno" onClick={salvar}>Salvar</button><button className="botao secundario pequeno" onClick={() => setRascunho(null)}>Cancelar</button></span>}
      </div>
      {msg.texto && <div className={`aviso ${msg.tipo || ""}`} style={{ margin: 16 }}>{msg.texto}</div>}
      <div className="tabela-caixa">
        <table>
          <thead><tr>{campos.map(([, r]) => <th key={r}>{r}</th>)}</tr></thead>
          <tbody>
            {vista.map((l, i) => (
              <tr key={i}>
                {campos.map(([k, r]) => (
                  <td key={k} className={k === "ano" ? "mono" : ""}>
                    {rascunho
                      ? <input aria-label={`${r} ${l.ano}`} value={l[k]} onChange={(e) => setRascunho(rascunho.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)))} style={{ width: "100%", minWidth: k === "observacao" ? 220 : 90 }} />
                      : l[k]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="pequeno suave" style={{ padding: "8px 16px 14px" }}>Os valores de referência da CBS e do IBS são definidos pelo governo; o administrador atualiza esta tabela quando forem publicados.</p>
    </section>
  );
}

// ---------------- Histórico ----------------
function Historico() {
  const [itens, setItens] = useState(null);
  const [erro, setErro] = useState("");
  useEffect(() => {
    getDocs(query(collection(db, "historico"), orderBy("em", "desc"), limit(100)))
      .then((s) => setItens(s.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .catch((e) => setErro(traduzirErro(e)));
  }, []);
  return (
    <section className="cartao sem-padding">
      <div className="cartao-topo"><h2>Histórico de alterações</h2><span className="pequeno suave">últimas 100</span></div>
      {erro && <div className="aviso erro" style={{ margin: 16 }}>{erro}</div>}
      <div className="tabela-caixa">
        <table>
          <thead><tr><th>Quando</th><th>Quem</th><th>Tabela</th><th>Item</th><th>Antes</th><th>Depois</th></tr></thead>
          <tbody>
            {!itens && !erro && <tr><td colSpan={6} className="suave">Carregando…</td></tr>}
            {itens?.length === 0 && <tr><td colSpan={6} className="suave">Nenhuma alteração registrada.</td></tr>}
            {itens?.map((h) => (
              <tr key={h.id}>
                <td className="pequeno mono">{h.em?.toDate?.().toLocaleString("pt-BR") || "…"}</td>
                <td>{h.porNome}</td>
                <td>{h.tabela}</td>
                <td className="mono">{h.item}</td>
                <td className="pequeno suave" style={{ maxWidth: 260, overflowWrap: "anywhere" }}>{h.antes ?? "—"}</td>
                <td className="pequeno" style={{ maxWidth: 260, overflowWrap: "anywhere" }}>{h.depois}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
