// "Monte o balancete" (Módulo 08): a partir do movimento de cada conta, o aluno preenche as
// 4 colunas do balancete de verificação (Débito, Crédito, Saldo Débito, Saldo Crédito).
// O progresso fica só neste navegador (não vale nota).
import { useEffect, useMemo, useState } from "react";
import { CONTAS_RAZONETE } from "../dados/praticas";
import { lerValor } from "./BalancoSucessivo";

const NOME = Object.fromEntries(CONTAS_RAZONETE.map((c) => [c.codigo, c.nome]));
const fmt = (v) => Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const igual = (a, b) => Math.abs(a - b) < 0.005;
const COLS = [["d", "Débito"], ["c", "Crédito"], ["sd", "Saldo Débito"], ["sc", "Saldo Crédito"]];
const chave = (id) => `ctc-pratica-${id}`;
function lerProgresso(id) { try { return JSON.parse(localStorage.getItem(chave(id)) || "null"); } catch { return null; } }
function gravarProgresso(id, p) { try { localStorage.setItem(chave(id), JSON.stringify(p)); } catch { /* sem armazenamento */ } }
const n2 = (i) => String(i).padStart(2, "0");

export default function BalanceteExercicio({ ex }) {
  // movimento e saldo de cada conta, na ordem do plano
  const linhas = useMemo(() => {
    const m = {};
    ex.fatos.forEach((f, i) => f.partidas.forEach((p) => {
      m[p.conta] = m[p.conta] || { conta: p.conta, d: 0, c: 0, movs: [] };
      m[p.conta][p.d === "D" ? "d" : "c"] += p.valor;
      m[p.conta].movs.push({ n: i + 1, lado: p.d, valor: p.valor });
    }));
    return Object.values(m).sort((a, b) => a.conta.localeCompare(b.conta, "pt-BR", { numeric: true }))
      .map((l) => ({ ...l, sd: l.d > l.c ? l.d - l.c : 0, sc: l.c > l.d ? l.c - l.d : 0 }));
  }, [ex]);
  const [p, setP] = useState(() => lerProgresso(ex.id) || { resp: {}, tentativas: 0, concluido: false });
  const [conf, setConf] = useState(null);
  useEffect(() => { gravarProgresso(ex.id, p); }, [p]);

  const val = (conta, col) => p.resp[`${conta}.${col}`] ?? "";
  const num = (conta, col) => lerValor(val(conta, col)) ?? 0;
  const mudar = (conta, col, v) => { setConf(null); setP({ ...p, resp: { ...p.resp, [`${conta}.${col}`]: v } }); };
  const totais = Object.fromEntries(COLS.map(([k]) => [k, linhas.reduce((s, l) => s + num(l.conta, k), 0)]));
  const certo = Object.fromEntries(COLS.map(([k]) => [k, linhas.reduce((s, l) => s + l[k], 0)]));

  const conferir = () => {
    const marcas = {};
    for (const l of linhas) for (const [k] of COLS) marcas[`${l.conta}.${k}`] = igual(num(l.conta, k), l[k]);
    const ok = Object.values(marcas).every(Boolean);
    setConf({ marcas, ok });
    setP({ ...p, tentativas: p.tentativas + 1, concluido: ok || p.concluido });
  };
  const verResposta = () => {
    const resp = {};
    for (const l of linhas) for (const [k] of COLS) resp[`${l.conta}.${k}`] = l[k] ? fmt(l[k]) : "";
    setConf(null);
    setP({ ...p, resp, concluido: true, viu: true });
  };
  const recomecar = () => { if (window.confirm("Recomeçar o balancete?")) { setConf(null); setP({ resp: {}, tentativas: 0, concluido: false }); } };
  const travado = p.concluido;

  return (
    <section className="cartao" style={{ gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
        <h2>{ex.titulo}</h2>
        <span className="pequeno suave">não vale nota</span>
      </div>
      <p className="pequeno suave" style={{ margin: 0 }}>{ex.instrucao}</p>
      <details>
        <summary className="pequeno" style={{ cursor: "pointer" }}>Ver os fatos do período</summary>
        <ol className="pequeno" style={{ margin: "8px 0 0", paddingLeft: 22, display: "flex", flexDirection: "column", gap: 4 }}>
          {ex.fatos.map((f, i) => <li key={i}>{f.texto}</li>)}
        </ol>
      </details>
      <div className="tabela-caixa" style={{ border: "1px solid var(--linha)", borderRadius: 10 }}>
        <table>
          <thead>
            <tr><th>Conta</th><th>Movimento no Razão</th>{COLS.map(([k, r]) => <th key={k} style={{ textAlign: "right" }}>{r}</th>)}</tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.conta}>
                <td><span className="mono pequeno suave">{l.conta}</span><br />{NOME[l.conta] || l.conta}</td>
                <td className="mono pequeno">{l.movs.map((m, i) => <span key={i} style={{ display: "block", whiteSpace: "nowrap" }}>({n2(m.n)}) {m.lado} {fmt(m.valor)}</span>)}</td>
                {COLS.map(([k, r]) => {
                  const mk = conf?.marcas[`${l.conta}.${k}`];
                  return (
                    <td key={k} style={{ textAlign: "right" }}>
                      <input className="mono" inputMode="decimal" aria-label={`${r} de ${NOME[l.conta] || l.conta}`} placeholder="—" value={val(l.conta, k)} disabled={travado}
                        onChange={(e) => mudar(l.conta, k, e.target.value)}
                        style={{ width: 110, minHeight: 0, padding: "4px 8px", textAlign: "right", borderColor: mk === true ? "var(--verde-texto)" : mk === false ? "var(--vermelho)" : undefined }} />
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td colSpan={2}><strong>Totais</strong></td>
              {COLS.map(([k]) => <td key={k} className="mono" style={{ textAlign: "right", fontWeight: 700 }}>{fmt(totais[k])}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span className={`selo ${igual(totais.d, totais.c) && totais.d > 0 ? "verde" : "ocre"}`}>{igual(totais.d, totais.c) && totais.d > 0 ? "Débitos = créditos" : "Débitos ≠ créditos"}</span>
        <span className={`selo ${igual(totais.sd, totais.sc) && totais.sd > 0 ? "verde" : "ocre"}`}>{igual(totais.sd, totais.sc) && totais.sd > 0 ? "Saldos devedores = credores" : "Saldos devedores ≠ credores"}</span>
      </div>
      {conf && !conf.ok && <div className="aviso erro" role="status">Há {Object.values(conf.marcas).filter((x) => !x).length} valor(es) errado(s) (borda vermelha). Some os débitos e os créditos de cada conta; o saldo vai na coluna do lado maior. Deixe em branco o que for zero.</div>}
      {travado && (
        <div className="aviso" role="status">
          <strong>{p.viu ? "Resposta:" : "Certo!"}</strong> Movimento: {fmt(certo.d)} a débito = {fmt(certo.c)} a crédito. Saldos: {fmt(certo.sd)} devedores = {fmt(certo.sc)} credores. {ex.conclusao || ""}
        </div>
      )}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {!travado && <button className="botao" onClick={conferir}>Conferir o balancete</button>}
        {!travado && p.tentativas > 0 && <button className="botao secundario" onClick={verResposta}>Ver a resposta</button>}
        <button className="botao secundario pequeno" style={{ marginLeft: "auto" }} onClick={recomecar}>Recomeçar</button>
      </div>
    </section>
  );
}
