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
function razonetes(fatos, iniciais = []) {
  const r = {};
  // saldos iniciais (já existentes antes do primeiro fato) entram como movimento "SI"
  [{ partidas: iniciais, si: true }, ...fatos].forEach((f, k) => f.partidas.forEach((p) => {
    const i = f.si ? -1 : k - 1;
    r[p.conta] = r[p.conta] || { D: [], C: [] };
    r[p.conta][p.d].push({ n: i + 1, valor: p.valor });
    r[p.conta].movs = r[p.conta].movs || [];
    r[p.conta].movs.push({ n: i + 1, d: p.d, valor: p.valor });
  }));
  return Object.entries(r)
    .sort(([a], [b]) => a.localeCompare(b, "pt-BR", { numeric: true }))
    .map(([conta, x]) => {
      const d = x.D.reduce((s, e) => s + e.valor, 0);
      const c = x.C.reduce((s, e) => s + e.valor, 0);
      let corrido = 0;
      const movs = x.movs.map((m) => { corrido += m.d === "D" ? m.valor : -m.valor; return { ...m, saldo: Math.abs(corrido), natureza: igual(corrido, 0) ? "N" : corrido > 0 ? "D" : "C" }; });
      return { conta, ...x, movs, totalD: d, totalC: c, saldo: Math.abs(d - c), natureza: igual(d, c) ? "N" : d > c ? "D" : "C" };
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
  const rz = useMemo(() => razonetes(lancados, ex.saldosIniciais || []), [lancados.length]);

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
  const emRazao = ex.formato === "razao";
  const itens = emRazao
    ? rz.flatMap((r) => r.movs.map((m, k) => ({ chave: `${r.conta}#${k}`, conta: r.conta, saldo: m.saldo, natureza: m.natureza, ultimo: k === r.movs.length - 1 })))
    : rz.map((r) => ({ chave: r.conta, conta: r.conta, saldo: r.saldo, natureza: r.natureza, ultimo: true }));
  const saldoDoAluno = (c) => p.saldos[c] || { valor: "", natureza: "" };
  const mudarSaldo = (c, campo, v) => { setApur(null); setP({ ...p, saldos: { ...p.saldos, [c]: { ...saldoDoAluno(c), [campo]: v } } }); };
  const conferirSaldos = () => {
    const marcas = {};
    for (const r of itens) {
      const s = saldoDoAluno(r.chave);
      const v = r.natureza === "N" ? lerValor(s.valor) ?? 0 : lerValor(s.valor);
      marcas[r.chave] = s.natureza === r.natureza && v !== null && igual(v, r.saldo);
    }
    // no razão, a conta fica vermelha se qualquer linha estiver errada
    for (const r of rz) if (emRazao) marcas[r.conta] = itens.filter((i) => i.conta === r.conta).every((i) => marcas[i.chave]);
    const ok = itens.every((i) => marcas[i.chave]);
    setApur({ marcas, ok, erradas: emRazao ? rz.filter((r) => !marcas[r.conta]).length : itens.filter((i) => !marcas[i.chave]).length });
    if (ok) setP({ ...p, concluido: true, tentativasSaldo: (p.tentativasSaldo || 0) + 1 });
    else setP({ ...p, tentativasSaldo: (p.tentativasSaldo || 0) + 1 });
  };
  const verSaldos = () => {
    setApur(null);
    setP({ ...p, concluido: true, viuSaldos: true, saldos: Object.fromEntries(itens.map((r) => [r.chave, { valor: r.natureza === "N" ? "0,00" : fmt(r.saldo), natureza: r.natureza }])) });
  };
  const somaSaldos = (nat) => itens.filter((i) => i.ultimo).reduce((s, r) => s + (saldoDoAluno(r.chave).natureza === nat ? lerValor(saldoDoAluno(r.chave).valor) || 0 : 0), 0);

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
                  {r[lado].map((e, k) => <span key={k} style={{ whiteSpace: "nowrap", fontSize: 12 }}>({e.n === 0 ? "SI" : n2(e.n)}) {fmt(e.valor)}</span>)}
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

  // Livro Diário dos fatos já lançados (formato razão)
  const livroDiario = lancados.length > 0 && (
    <div className="tabela-caixa" style={{ border: "1px solid var(--linha)", borderRadius: 10 }}>
      <table>
        <thead><tr><th>Data</th><th>Histórico</th><th style={{ textAlign: "right" }}>Débito</th><th style={{ textAlign: "right" }}>Crédito</th></tr></thead>
        <tbody>
          {lancados.flatMap((f, i) => [
            ...f.partidas.map((x, k) => (
              <tr key={`${i}-${k}`}>
                <td className="mono pequeno">{k === 0 ? f.data : ""}</td>
                <td style={{ paddingLeft: x.d === "C" ? 28 : undefined }}>{x.d} – {x.conta} {NOME[x.conta]}</td>
                <td className="mono" style={{ textAlign: "right" }}>{x.d === "D" ? fmt(x.valor) : ""}</td>
                <td className="mono" style={{ textAlign: "right" }}>{x.d === "C" ? fmt(x.valor) : ""}</td>
              </tr>
            )),
            <tr key={`${i}-h`}><td /><td className="pequeno suave" colSpan={3} style={{ fontStyle: "italic" }}>{f.historico}</td></tr>,
          ])}
        </tbody>
      </table>
    </div>
  );

  // Livro Razão em colunas: o aluno informa o saldo depois de cada movimento
  const quadroRazao = (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {rz.map((r) => {
        const m = apur?.marcas[r.conta];
        return (
          <div key={r.conta} className="tabela-caixa" style={{ border: `1px solid ${m === true ? "var(--verde-texto)" : m === false ? "var(--vermelho)" : "var(--linha)"}`, borderRadius: 10 }}>
            <div style={{ padding: "8px 12px", fontWeight: 600 }}>Razão — {r.conta} {NOME[r.conta]}</div>
            <table>
              <thead><tr><th>Data</th><th>Histórico</th><th style={{ textAlign: "right" }}>Débito</th><th style={{ textAlign: "right" }}>Crédito</th><th style={{ textAlign: "right" }}>Saldo</th><th>D/C</th></tr></thead>
              <tbody>
                {r.movs.map((mv, k) => {
                  const chave = `${r.conta}#${k}`;
                  const s = saldoDoAluno(chave);
                  const f = mv.n === 0 ? { data: "SI", historico: "Saldo inicial" } : ex.fatos[mv.n - 1];
                  const ok = apur?.marcas[chave];
                  return (
                    <tr key={k}>
                      <td className="mono pequeno">{f.data}</td>
                      <td className="pequeno">{f.historico}</td>
                      <td className="mono" style={{ textAlign: "right" }}>{mv.d === "D" ? fmt(mv.valor) : ""}</td>
                      <td className="mono" style={{ textAlign: "right" }}>{mv.d === "C" ? fmt(mv.valor) : ""}</td>
                      <td style={{ textAlign: "right" }}>
                        <input className="mono" inputMode="decimal" aria-label={`Saldo de ${NOME[r.conta]} em ${f.data}`} placeholder="0,00" value={s.valor} disabled={p.concluido} onChange={(e) => mudarSaldo(chave, "valor", e.target.value)}
                          style={{ width: 110, minHeight: 0, padding: "4px 8px", textAlign: "right", borderColor: ok === true ? "var(--verde-texto)" : ok === false ? "var(--vermelho)" : undefined }} />
                      </td>
                      <td>
                        <select aria-label={`D/C do saldo de ${NOME[r.conta]} em ${f.data}`} value={s.natureza} disabled={p.concluido} onChange={(e) => mudarSaldo(chave, "natureza", e.target.value)} style={{ minHeight: 0, padding: "4px 6px", width: 64 }}>
                          <option value="" /><option value="D">D</option><option value="C">C</option><option value="N">0</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
          {emRazao
            ? <>Todos os fatos estão no Diário. Agora <strong>monte o Livro Razão</strong>: em cada conta, informe o saldo depois de cada movimento e se ele é devedor (D) ou credor (C).</>
            : <>Todos os fatos foram lançados. Agora <strong>apure o saldo de cada razonete</strong>: some os débitos e os créditos, informe se o saldo é devedor, credor ou nulo e o valor.</>}
        </div>
        {emRazao ? quadroRazao : quadroRazonetes}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <span className="mono">Saldos devedores: <strong>{fmt(sd)}</strong></span>
          <span className="mono">Saldos credores: <strong>{fmt(sc)}</strong></span>
          {(sd > 0 || sc > 0) && <span className={`selo ${igual(sd, sc) ? "verde" : "ocre"}`}>{igual(sd, sc) ? "Devedores = credores" : "Devedores ≠ credores"}</span>}
        </div>
        {apur && !apur.ok && <div className="aviso erro" role="status">Há {apur.erradas} {emRazao ? "conta(s) com saldo errado em alguma linha" : "razonete(s) com saldo errado"} (borda vermelha). {emRazao ? "Some ou subtraia cada movimento do saldo anterior." : "Confira a soma de cada lado."}</div>}
        {p.concluido && (
          <div className="aviso" role="status">
            <strong>{p.viuSaldos ? "Resposta:" : "Certo!"}</strong> A soma dos saldos devedores ({fmt(rz.filter((r) => r.natureza === "D").reduce((s, r) => s + r.saldo, 0))}) é igual à dos saldos credores ({fmt(rz.filter((r) => r.natureza === "C").reduce((s, r) => s + r.saldo, 0))}) — é o que o balancete de verificação confirma. {ex.conclusao || ""}
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
        <strong className="mono">{fato.data ? `${fato.data} — ` : `${n2(p.fato + 1)} — `}</strong>{fato.texto}
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

      {lancados.length > 0 && <h3 style={{ margin: "6px 0 0", fontSize: 15 }}>{emRazao ? "Livro Diário" : "Razonetes"}</h3>}
      {emRazao ? livroDiario : quadroRazonetes}
    </section>
  );
}
