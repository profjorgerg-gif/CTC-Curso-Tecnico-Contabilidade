// Razonetes interativos (Módulo 03 — Débito e Crédito): o aluno lança cada fato em débito e
// crédito; o lançamento conferido vai para os razonetes ("T"). No fim, apura o saldo de cada
// razonete e confere se o total dos saldos devedores é igual ao dos credores.
// O progresso fica só neste navegador (não vale nota).
import { useEffect, useMemo, useState } from "react";
import { CONTAS_RAZONETE } from "../dados/praticas";
import { lerValor } from "./BalancoSucessivo";

const NOME = Object.fromEntries(CONTAS_RAZONETE.map((c) => [c.codigo, c.nome]));
const fmt = (v) => Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const igual = (a, b) => Math.abs(a - b) < 0.005;
const n2 = (i) => String(i).padStart(2, "0");

// soma por lado+conta (o aluno pode repartir um valor em duas linhas)
function agrupar(partidas) {
  const m = {};
  for (const p of partidas) {
    if (!p.conta) continue;
    const k = `${p.d}|${p.conta}`;
    m[k] = (m[k] || 0) + (typeof p.valor === "number" ? p.valor : lerValor(p.valor) || 0);
  }
  return m;
}

export function conferirLancamento(linhas, gabarito) {
  const a = agrupar(linhas);
  const g = agrupar(gabarito);
  const contasGab = new Set(gabarito.map((p) => p.conta));
  const marcas = linhas.map((l) => {
    if (!l.conta) return "conta";
    const k = `${l.d}|${l.conta}`;
    if (!(k in g)) return contasGab.has(l.conta) ? "lado" : "sobra";
    return igual(a[k], g[k]) ? "ok" : "valor";
  });
  const contasAluno = new Set(linhas.map((l) => l.conta));
  const faltam = Object.keys(g).filter((k) => !contasAluno.has(k.split("|")[1])).length;
  const ok = faltam === 0 && marcas.every((m) => m === "ok") && Object.keys(a).length === Object.keys(g).length;
  return { marcas, faltam, ok };
}

// saldo de cada razonete a partir dos lançamentos dos fatos já concluídos
function razonetes(fatos) {
  const r = {};
  fatos.forEach((f, i) => f.partidas.forEach((p) => {
    r[p.conta] = r[p.conta] || { D: [], C: [] };
    r[p.conta][p.d].push({ n: i + 1, valor: p.valor });
  }));
  return Object.entries(r)
    .sort(([a], [b]) => a.localeCompare(b, "pt-BR", { numeric: true }))
    .map(([conta, x]) => {
      const d = x.D.reduce((s, e) => s + e.valor, 0);
      const c = x.C.reduce((s, e) => s + e.valor, 0);
      return { conta, ...x, totalD: d, totalC: c, saldo: Math.abs(d - c), natureza: igual(d, c) ? "N" : d > c ? "D" : "C" };
    });
}

const chave = (id) => `ctc-pratica-${id}`;
function lerProgresso(id) { try { return JSON.parse(localStorage.getItem(chave(id)) || "null"); } catch { return null; } }
function gravarProgresso(id, p) { try { localStorage.setItem(chave(id), JSON.stringify(p)); } catch { /* sem armazenamento */ } }
const linhasVazias = () => [{ d: "D", conta: "", valor: "" }, { d: "C", conta: "", valor: "" }];
const inicial = () => ({ fato: 0, linhas: linhasVazias(), tentativas: 0, resultados: [], estado: "montando", saldos: {}, concluido: false });

export default function Razonetes({ ex }) {
  const [p, setP] = useState(() => lerProgresso(ex.id) || inicial());
  const [conf, setConf] = useState(null);
  useEffect(() => { gravarProgresso(ex.id, p); }, [p]);

  const naApuracao = p.fato >= ex.fatos.length;
  const fato = ex.fatos[p.fato];
  const travado = p.estado !== "montando";
  // razonetes mostram os fatos já resolvidos (e o atual, depois de conferido ou revelado)
  const lancados = ex.fatos.slice(0, p.fato + (travado && !naApuracao ? 1 : 0));
  const rz = useMemo(() => razonetes(lancados), [lancados.length]);

  const totD = p.linhas.filter((l) => l.d === "D").reduce((s, l) => s + (lerValor(l.valor) || 0), 0);
  const totC = p.linhas.filter((l) => l.d === "C").reduce((s, l) => s + (lerValor(l.valor) || 0), 0);

  const mudarLinhas = (linhas) => { setP({ ...p, linhas }); setConf(null); };
  const alterar = (i, campo, v) => mudarLinhas(p.linhas.map((l, k) => (k === i ? { ...l, [campo]: v } : l)));
  const conferir = () => {
    const r = conferirLancamento(p.linhas, fato.partidas);
    setConf(r);
    const tentativas = p.tentativas + 1;
    setP(r.ok ? { ...p, tentativas, estado: "certo", resultados: [...p.resultados, { tentativas, viu: false }] } : { ...p, tentativas });
  };
  const verResposta = () => {
    setConf(null);
    setP({ ...p, linhas: fato.partidas.map((x) => ({ d: x.d, conta: x.conta, valor: fmt(x.valor) })), estado: "viu", resultados: [...p.resultados, { tentativas: p.tentativas, viu: true }] });
  };
  const proximo = () => { setConf(null); setP({ ...p, fato: p.fato + 1, linhas: linhasVazias(), tentativas: 0, estado: "montando" }); };
  const recomecar = () => { if (window.confirm("Recomeçar o exercício do fato 01?")) { setConf(null); setP(inicial()); } };

  // ---- apuração dos saldos ----
  const [apur, setApur] = useState(null);
  const saldoDoAluno = (c) => p.saldos[c] || { valor: "", natureza: "" };
  const mudarSaldo = (c, campo, v) => { setApur(null); setP({ ...p, saldos: { ...p.saldos, [c]: { ...saldoDoAluno(c), [campo]: v } } }); };
  const conferirSaldos = () => {
    const marcas = {};
    for (const r of rz) {
      const s = saldoDoAluno(r.conta);
      const v = r.natureza === "N" ? lerValor(s.valor) ?? 0 : lerValor(s.valor);
      marcas[r.conta] = s.natureza === r.natureza && v !== null && igual(v, r.saldo);
    }
    const ok = Object.values(marcas).every(Boolean);
    setApur({ marcas, ok });
    if (ok) setP({ ...p, concluido: true, tentativasSaldo: (p.tentativasSaldo || 0) + 1 });
    else setP({ ...p, tentativasSaldo: (p.tentativasSaldo || 0) + 1 });
  };
  const verSaldos = () => {
    setApur(null);
    setP({ ...p, concluido: true, viuSaldos: true, saldos: Object.fromEntries(rz.map((r) => [r.conta, { valor: r.natureza === "N" ? "0,00" : fmt(r.saldo), natureza: r.natureza }])) });
  };
  const somaSaldos = (nat) => rz.reduce((s, r) => s + (saldoDoAluno(r.conta).natureza === nat ? lerValor(saldoDoAluno(r.conta).valor) || 0 : 0), 0);

  const cabecalho = (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
      <h2>{ex.titulo}</h2>
      <span className="pequeno suave">{naApuracao ? "Apuração dos saldos" : `Fato ${p.fato + 1} de ${ex.fatos.length}`} · não vale nota</span>
    </div>
  );

  const quadroRazonetes = rz.length > 0 && (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 10 }}>
      {rz.map((r) => {
        const s = saldoDoAluno(r.conta);
        const m = apur?.marcas[r.conta];
        return (
          <div key={r.conta} style={{ border: `1px solid ${m === true ? "var(--verde-texto)" : m === false ? "var(--vermelho)" : "var(--linha)"}`, borderRadius: 10, padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ textAlign: "center", fontWeight: 600, fontSize: 14 }}>{NOME[r.conta]}<span className="mono pequeno suave" style={{ display: "block", fontWeight: 400 }}>{r.conta}</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "2px solid var(--destaque)" }}>
              {["D", "C"].map((lado) => (
                <div key={lado} className="mono pequeno" style={{ padding: "4px 6px", borderLeft: lado === "C" ? "2px solid var(--destaque)" : "none", textAlign: lado === "D" ? "left" : "right", display: "flex", flexDirection: "column", gap: 2, minHeight: 40 }}>
                  <span className="suave" style={{ fontFamily: "inherit" }}>{lado === "D" ? "Débito" : "Crédito"}</span>
                  {r[lado].map((e, k) => <span key={k} style={{ whiteSpace: "nowrap", fontSize: 12 }}>({n2(e.n)}) {fmt(e.valor)}</span>)}
                </div>
              ))}
            </div>
            {naApuracao && (
              <>
                {p.concluido && <div className="mono pequeno" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1px solid var(--linha)", paddingTop: 4 }}>
                  <span>{fmt(r.totalD)}</span><span style={{ textAlign: "right" }}>{fmt(r.totalC)}</span>
                </div>}
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <select aria-label={`Natureza do saldo de ${NOME[r.conta]}`} value={s.natureza} disabled={p.concluido} onChange={(e) => mudarSaldo(r.conta, "natureza", e.target.value)} style={{ minHeight: 0, padding: "4px 6px", flex: "0 0 104px" }}>
                    <option value="">Saldo…</option><option value="D">Devedor</option><option value="C">Credor</option><option value="N">Nulo</option>
                  </select>
                  <input className="mono" inputMode="decimal" aria-label={`Saldo de ${NOME[r.conta]}`} placeholder="0,00" value={s.valor} disabled={p.concluido} onChange={(e) => mudarSaldo(r.conta, "valor", e.target.value)} style={{ minHeight: 0, padding: "4px 8px", textAlign: "right", width: "100%", minWidth: 0 }} />
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );

  if (naApuracao) {
    const sd = somaSaldos("D");
    const sc = somaSaldos("C");
    return (
      <section className="cartao" style={{ gap: 12 }}>
        {cabecalho}
        <div style={{ borderLeft: "4px solid var(--destaque)", padding: "8px 14px", background: "rgba(199, 154, 86, .1)", borderRadius: "0 8px 8px 0" }}>
          Todos os fatos foram lançados. Agora <strong>apure o saldo de cada razonete</strong>: some os débitos e os créditos, informe se o saldo é devedor, credor ou nulo e o valor.
        </div>
        {quadroRazonetes}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <span className="mono">Saldos devedores: <strong>{fmt(sd)}</strong></span>
          <span className="mono">Saldos credores: <strong>{fmt(sc)}</strong></span>
          {(sd > 0 || sc > 0) && <span className={`selo ${igual(sd, sc) ? "verde" : "ocre"}`}>{igual(sd, sc) ? "Devedores = credores" : "Devedores ≠ credores"}</span>}
        </div>
        {apur && !apur.ok && <div className="aviso erro" role="status">Há {Object.values(apur.marcas).filter((x) => !x).length} razonete(s) com saldo errado (borda vermelha). Confira a soma de cada lado.</div>}
        {p.concluido && (
          <div className="aviso" role="status">
            <strong>{p.viuSaldos ? "Resposta:" : "Certo!"}</strong> A soma dos saldos devedores ({fmt(rz.filter((r) => r.natureza === "D").reduce((s, r) => s + r.saldo, 0))}) é igual à dos saldos credores ({fmt(rz.filter((r) => r.natureza === "C").reduce((s, r) => s + r.saldo, 0))}) — é o que o balancete de verificação confirma. Duplicatas a Pagar ficou com saldo nulo: a obrigação surgiu e foi paga.
            {" "}Lançamentos certos na 1ª tentativa: {p.resultados.filter((r) => !r.viu && r.tentativas === 1).length} de {ex.fatos.length}.
          </div>
        )}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {!p.concluido && <button className="botao" onClick={conferirSaldos}>Conferir saldos</button>}
          {!p.concluido && (p.tentativasSaldo || 0) > 0 && <button className="botao secundario" onClick={verSaldos}>Ver a resposta</button>}
          <button className="botao secundario pequeno" style={{ marginLeft: "auto" }} onClick={recomecar}>Recomeçar</button>
        </div>
      </section>
    );
  }

  return (
    <section className="cartao" style={{ gap: 12 }}>
      {cabecalho}
      {p.fato === 0 && !travado && <p className="pequeno suave" style={{ margin: 0 }}>{ex.instrucao}</p>}
      <div style={{ borderLeft: "4px solid var(--destaque)", padding: "8px 14px", background: "rgba(199, 154, 86, .1)", borderRadius: "0 8px 8px 0" }}>
        <strong className="mono">{n2(p.fato + 1)} — </strong>{fato.texto}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {p.linhas.map((l, i) => {
          const m = conf?.marcas[i];
          const cor = m === "ok" ? "var(--verde-texto)" : m ? "var(--vermelho)" : undefined;
          return (
            <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <select aria-label={`Lado da linha ${i + 1}`} value={l.d} disabled={travado} onChange={(e) => alterar(i, "d", e.target.value)} style={{ minHeight: 0, padding: "4px 6px", flex: "0 0 96px", borderColor: cor }}>
                <option value="D">Débito</option><option value="C">Crédito</option>
              </select>
              <select aria-label={`Conta da linha ${i + 1}`} value={l.conta} disabled={travado} onChange={(e) => alterar(i, "conta", e.target.value)} style={{ minHeight: 0, padding: "4px 6px", flex: "1 1 240px", minWidth: 0, borderColor: cor }}>
                <option value="">Escolha a conta…</option>
                {CONTAS_RAZONETE.map((c) => <option key={c.codigo} value={c.codigo}>{c.codigo} {c.nome}</option>)}
              </select>
              <span style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: "auto" }}>
                <input className="mono" inputMode="decimal" aria-label={`Valor da linha ${i + 1}`} placeholder="0,00" value={l.valor} disabled={travado} onChange={(e) => alterar(i, "valor", e.target.value)} style={{ width: 120, minHeight: 0, padding: "4px 8px", textAlign: "right", borderColor: cor }} />
                {!travado && p.linhas.length > 2 && <button className="botao secundario pequeno" aria-label={`Remover linha ${i + 1}`} style={{ padding: "2px 8px" }} onClick={() => mudarLinhas(p.linhas.filter((_, k) => k !== i))}>×</button>}
                {m && <span title={{ ok: "Certo", lado: "Conta certa, lado errado", sobra: "Esta conta não entra neste fato", valor: "Valor errado", conta: "Escolha a conta" }[m]} style={{ width: 16, fontWeight: 700, color: cor }}>{m === "ok" ? "✓" : "✗"}</span>}
              </span>
            </div>
          );
        })}
        {!travado && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="botao secundario pequeno" onClick={() => mudarLinhas([...p.linhas, { d: "D", conta: "", valor: "" }])}>+ Débito</button>
            <button className="botao secundario pequeno" onClick={() => mudarLinhas([...p.linhas, { d: "C", conta: "", valor: "" }])}>+ Crédito</button>
          </div>
        )}
        <div className="mono pequeno" style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <span>Débitos: <strong>{fmt(totD)}</strong></span><span>Créditos: <strong>{fmt(totC)}</strong></span>
          {(totD > 0 || totC > 0) && <span className={`selo ${igual(totD, totC) ? "verde" : "ocre"}`}>{igual(totD, totC) ? "Débitos = créditos" : "Débitos ≠ créditos"}</span>}
        </div>
      </div>

      {conf && !conf.ok && (
        <div className="aviso erro" role="status">
          Ainda não está certo.
          {conf.faltam > 0 ? ` Falta${conf.faltam > 1 ? "m" : ""} ${conf.faltam} partida${conf.faltam > 1 ? "s" : ""}.` : ""}
          {conf.marcas.includes("lado") ? " Há conta certa no lado errado (débito × crédito)." : ""}
          {conf.marcas.includes("sobra") ? " Há conta que não entra neste fato." : ""}
          {conf.marcas.includes("valor") ? " Há valor errado." : ""}
          {conf.marcas.includes("conta") ? " Há linha sem conta." : ""}
        </div>
      )}
      {travado && <div className="aviso" role="status"><strong>{p.estado === "certo" ? "Certo!" : "Resposta:"}</strong> {fato.explicacao}</div>}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {!travado && <button className="botao" onClick={conferir}>Conferir lançamento</button>}
        {!travado && p.tentativas > 0 && <button className="botao secundario" onClick={verResposta}>Ver a resposta</button>}
        {travado && <button className="botao" onClick={proximo}>{p.fato + 1 < ex.fatos.length ? `Próximo fato (${n2(p.fato + 2)})` : "Apurar os saldos"}</button>}
        {!travado && p.tentativas > 0 && <span className="pequeno suave">{p.tentativas} tentativa(s)</span>}
        {(p.fato > 0 || travado) && <button className="botao secundario pequeno" style={{ marginLeft: "auto" }} onClick={recomecar}>Recomeçar</button>}
      </div>

      {rz.length > 0 && <h3 style={{ margin: "6px 0 0", fontSize: 15 }}>Razonetes</h3>}
      {quadroRazonetes}
    </section>
  );
}
