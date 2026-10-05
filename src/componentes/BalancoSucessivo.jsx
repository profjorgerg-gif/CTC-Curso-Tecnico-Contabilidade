// Exercício interativo de balanços sucessivos: o aluno monta o Balanço Patrimonial depois
// de cada fato, conferindo na hora. Cada fato começa do balanço correto do fato anterior.
// O progresso fica só neste navegador (não vale nota).
import { useEffect, useMemo, useState } from "react";
import { CONTAS_BALANCO, GRUPOS_BALANCO } from "../dados/praticas";

const CONTA = Object.fromEntries(CONTAS_BALANCO.map((c) => [c.id, c]));
const fmt = (v) => Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// aceita "70.000,00", "70000", "70000.5" e "R$ 70.000"
export function lerValor(txt) {
  let s = String(txt ?? "").replace(/[R$\s]/g, "");
  if (!s) return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

const linhasDe = (saldos) => Object.entries(saldos || {}).map(([conta, v]) => ({ conta, valor: fmt(v) }));

// confere as linhas do aluno com o gabarito do fato
export function conferirBalanco(linhas, saldos) {
  const marcas = {};
  for (const l of linhas) {
    const v = lerValor(l.valor);
    if (!(l.conta in saldos)) marcas[l.conta] = "sobra";
    else marcas[l.conta] = v !== null && Math.abs(v - saldos[l.conta]) < 0.005 ? "ok" : "valor";
  }
  const faltam = Object.keys(saldos).filter((c) => !linhas.some((l) => l.conta === c)).length;
  const ok = faltam === 0 && Object.values(marcas).every((m) => m === "ok");
  return { marcas, faltam, ok };
}

function totais(linhas) {
  const t = { ativo: 0, passivo: 0, pl: 0 };
  for (const l of linhas) {
    const c = CONTA[l.conta];
    const v = (lerValor(l.valor) || 0) * (c.redutora ? -1 : 1);
    if (c.grupo === "pl") t.pl += v;
    else if (c.grupo === "pc" || c.grupo === "pnc") t.passivo += v;
    else t.ativo += v;
  }
  return t;
}

const chave = (id) => `ctc-pratica-${id}`;
function lerProgresso(id) { try { return JSON.parse(localStorage.getItem(chave(id)) || "null"); } catch { return null; } }
function gravarProgresso(id, p) { try { localStorage.setItem(chave(id), JSON.stringify(p)); } catch { /* sem armazenamento: segue só na memória */ } }

const inicial = (ex) => ({ fato: 0, linhas: [], tentativas: 0, resultados: [], estado: "montando" });

export default function BalancoSucessivo({ ex }) {
  const [p, setP] = useState(() => lerProgresso(ex.id) || inicial(ex));
  const [conf, setConf] = useState(null);
  useEffect(() => { gravarProgresso(ex.id, p); }, [p]);

  const fim = p.fato >= ex.fatos.length;
  const fato = ex.fatos[p.fato];
  const t = useMemo(() => totais(p.linhas), [p.linhas]);
  const fecha = Math.abs(t.ativo - (t.passivo + t.pl)) < 0.005 && t.ativo > 0;
  const travado = p.estado !== "montando";
  const usadas = new Set(p.linhas.map((l) => l.conta));

  const mudar = (linhas) => { setP({ ...p, linhas }); setConf(null); };
  const adicionar = (id) => id && mudar([...p.linhas, { conta: id, valor: "" }]);
  const alterar = (id, valor) => mudar(p.linhas.map((l) => (l.conta === id ? { ...l, valor } : l)));
  const remover = (id) => mudar(p.linhas.filter((l) => l.conta !== id));

  const conferir = () => {
    const r = conferirBalanco(p.linhas, fato.saldos);
    setConf(r);
    const tentativas = p.tentativas + 1;
    if (r.ok) setP({ ...p, tentativas, estado: "certo", resultados: [...p.resultados, { tentativas, viu: false }] });
    else setP({ ...p, tentativas });
  };
  const verResposta = () => {
    setConf(null);
    setP({ ...p, linhas: linhasDe(fato.saldos), estado: "viu", resultados: [...p.resultados, { tentativas: p.tentativas, viu: true }] });
  };
  const proximo = () => {
    setConf(null);
    setP({ ...p, fato: p.fato + 1, linhas: linhasDe(fato.saldos), tentativas: 0, estado: "montando" });
  };
  const recomecar = () => { if (window.confirm("Recomeçar o exercício do fato 01?")) { setConf(null); setP(inicial(ex)); } };

  if (fim) {
    const primeira = p.resultados.filter((r) => !r.viu && r.tentativas === 1).length;
    return (
      <section className="cartao" style={{ gap: 12 }}>
        <h2>{ex.titulo}</h2>
        <div className="aviso">Exercício concluído: {primeira} de {ex.fatos.length} balanços certos na primeira tentativa.</div>
        <div className="tabela-caixa">
          <table>
            <thead><tr><th>Fato</th><th>Resultado</th></tr></thead>
            <tbody>
              {p.resultados.map((r, i) => (
                <tr key={i}>
                  <td className="mono">{String(i + 1).padStart(2, "0")}</td>
                  <td>{r.viu ? <span className="selo ocre">viu a resposta{r.tentativas ? ` após ${r.tentativas} tentativa(s)` : ""}</span>
                    : <span className={`selo ${r.tentativas === 1 ? "verde" : "ocre"}`}>certo {r.tentativas === 1 ? "na 1ª tentativa" : `em ${r.tentativas} tentativas`}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div><button className="botao secundario" onClick={recomecar}>Recomeçar</button></div>
      </section>
    );
  }

  const lado = (qual) => GRUPOS_BALANCO.filter((g) => g.lado === qual).map((g) => {
    const ls = p.linhas.filter((l) => CONTA[l.conta].grupo === g.id);
    return (
      <div key={g.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span className="pequeno" style={{ fontWeight: 600, color: "var(--destaque)" }}>{g.nome}</span>
        {ls.length === 0 && <span className="pequeno suave">—</span>}
        {ls.map((l) => {
          const m = conf?.marcas[l.conta];
          return (
            <div key={l.conta} style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ flex: "1 1 120px", minWidth: 0 }}>{CONTA[l.conta].nome}</span>
              <span style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: "auto" }}>
              <input className="mono" inputMode="decimal" aria-label={`Saldo de ${CONTA[l.conta].nome}`} value={l.valor} disabled={travado}
                onChange={(e) => alterar(l.conta, e.target.value)} placeholder="0,00"
                style={{ width: 120, flexShrink: 0, textAlign: "right", minHeight: 0, padding: "4px 8px", borderColor: m === "ok" ? "var(--verde-texto)" : m ? "var(--vermelho)" : undefined }} />
              {!travado && <button className="botao secundario pequeno" aria-label={`Remover ${CONTA[l.conta].nome}`} onClick={() => remover(l.conta)} style={{ padding: "2px 8px" }}>×</button>}
              {m && <span title={m === "ok" ? "Certo" : m === "sobra" ? "Esta conta não entra no balanço (ou está no grupo errado)" : "Valor errado"} style={{ width: 16, flexShrink: 0, fontWeight: 700, color: m === "ok" ? "var(--verde-texto)" : "var(--vermelho)" }}>{m === "ok" ? "✓" : "✗"}</span>}
              </span>
            </div>
          );
        })}
      </div>
    );
  });

  return (
    <section className="cartao" style={{ gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
        <h2>{ex.titulo}</h2>
        <span className="pequeno suave">Fato {p.fato + 1} de {ex.fatos.length} · não vale nota</span>
      </div>
      {p.fato === 0 && p.linhas.length === 0 && <p className="pequeno suave" style={{ margin: 0 }}>{ex.instrucao}</p>}
      <div style={{ borderLeft: "4px solid var(--destaque)", padding: "8px 14px", background: "rgba(199, 154, 86, .1)", borderRadius: "0 8px 8px 0" }}>
        <strong className="mono">{String(p.fato + 1).padStart(2, "0")} — </strong>{fato.texto}
      </div>

      {!travado && (
        <div className="campo" style={{ maxWidth: 420, flex: "none" }}>
          <label htmlFor="bs-conta">Adicionar conta ao balanço</label>
          <select id="bs-conta" value="" onChange={(e) => adicionar(e.target.value)}>
            <option value="">Escolha o grupo e a conta…</option>
            {GRUPOS_BALANCO.map((g) => (
              <optgroup key={g.id} label={g.nome}>
                {CONTAS_BALANCO.filter((c) => c.grupo === g.id && !usadas.has(c.id)).map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>
        <div style={{ border: "1px solid var(--linha)", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          <strong>ATIVO</strong>
          {lado("ativo")}
          <div style={{ borderTop: "1px solid var(--linha)", paddingTop: 6, display: "flex", justifyContent: "space-between" }}><strong>Total do Ativo</strong><strong className="mono">{fmt(t.ativo)}</strong></div>
        </div>
        <div style={{ border: "1px solid var(--linha)", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          <strong>PASSIVO + PATRIMÔNIO LÍQUIDO</strong>
          {lado("passivo")}
          <div style={{ borderTop: "1px solid var(--linha)", paddingTop: 6, display: "flex", justifyContent: "space-between" }}><strong>Total do Passivo + PL</strong><strong className="mono">{fmt(t.passivo + t.pl)}</strong></div>
        </div>
      </div>
      {p.linhas.length > 0 && <span className={`selo ${fecha ? "verde" : "ocre"}`} style={{ alignSelf: "flex-start" }}>{fecha ? "Ativo = Passivo + PL" : "Ativo ≠ Passivo + PL"}</span>}

      {conf && !conf.ok && (
        <div className="aviso erro" role="status">
          Ainda não está certo.{conf.faltam > 0 ? ` Falta${conf.faltam > 1 ? "m" : ""} ${conf.faltam} conta${conf.faltam > 1 ? "s" : ""} no balanço.` : ""}
          {Object.values(conf.marcas).includes("sobra") ? " Há conta que não deveria estar no balanço (ou está no grupo errado)." : ""}
          {Object.values(conf.marcas).includes("valor") ? " Há saldo com valor errado." : ""}
        </div>
      )}
      {travado && (
        <div className="aviso" role="status">
          <strong>{p.estado === "certo" ? "Certo!" : "Resposta:"}</strong> {fato.explicacao}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {!travado && <button className="botao" onClick={conferir} disabled={p.linhas.length === 0}>Conferir balanço</button>}
        {!travado && p.tentativas > 0 && <button className="botao secundario" onClick={verResposta}>Ver a resposta</button>}
        {travado && <button className="botao" onClick={proximo}>{p.fato + 1 < ex.fatos.length ? `Próximo fato (${String(p.fato + 2).padStart(2, "0")})` : "Ver o resultado"}</button>}
        {!travado && p.tentativas > 0 && <span className="pequeno suave">{p.tentativas} tentativa(s)</span>}
        {(p.fato > 0 || p.linhas.length > 0) && <button className="botao secundario pequeno" style={{ marginLeft: "auto" }} onClick={recomecar}>Recomeçar</button>}
      </div>
    </section>
  );
}
