// "Montar e conferir" uma demonstração (aprovado em 05–06/10/2026): o aluno preenche o valor de
// cada linha (itens e subtotais) e o CTC confere linha a linha. Usado no exercício do módulo
// e nas abas da Escrituração (DRE; depois DLPA e Balanço).
// Linhas: [{ rotulo, valor, tipo: "item" | "subtotal" | "final" }]. Itens com valor zero não
// aparecem. Nas linhas "(-)", vale o valor com ou sem sinal; nas demais, o sinal conta.
// O progresso fica neste navegador; se a assinatura (os valores) mudar, a montagem recomeça.
import { useEffect, useMemo, useState } from "react";
import { lerValor } from "./BalancoSucessivo";

const fmt = (v) => Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const igual = (a, b) => a !== null && Math.abs(a - b) < 0.005;
const ehDeducao = (rotulo) => /^\(\s*[-−]\s*\)/.test(rotulo);
function lerProgresso(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } }
function gravarProgresso(k, p) { try { localStorage.setItem(k, JSON.stringify(p)); } catch { /* sem armazenamento */ } }

export function montagemConcluida(chave, assinatura) {
  const p = lerProgresso(chave);
  return !!p && p.concluido && (assinatura === undefined || p.assinatura === assinatura);
}

export default function MontarDemonstracao({ titulo, subtitulo, linhas, chave, assinatura = "", aoConcluir, dica, depois }) {
  const visiveis = useMemo(() => linhas.map((l, i) => ({ ...l, i })).filter((l) => l.tipo !== "item" || Math.abs(l.valor) >= 0.005), [linhas]);
  const inicial = () => ({ assinatura, resp: {}, tentativas: 0, concluido: false });
  const [p, setP] = useState(() => { const s = lerProgresso(chave); return s && s.assinatura === assinatura ? s : inicial(); });
  const [conf, setConf] = useState(null);
  useEffect(() => { const s = lerProgresso(chave); setP(s && s.assinatura === assinatura ? s : inicial()); setConf(null); }, [chave, assinatura]);
  useEffect(() => { gravarProgresso(chave, p); }, [p]);

  const certo = (l) => {
    const v = lerValor(p.resp[l.i] ?? "");
    if (v === null) return false;
    return ehDeducao(l.rotulo) ? igual(Math.abs(v), Math.abs(l.valor)) : igual(v, l.valor);
  };
  const conferir = () => {
    const marcas = Object.fromEntries(visiveis.map((l) => [l.i, certo(l)]));
    const ok = Object.values(marcas).every(Boolean);
    setConf({ marcas, ok });
    setP({ ...p, tentativas: p.tentativas + 1, concluido: ok || p.concluido });
    if (ok) aoConcluir?.();
  };
  const verResposta = () => {
    setConf(null);
    setP({ ...p, resp: Object.fromEntries(visiveis.map((l) => [l.i, fmt(l.valor)])), concluido: true, viu: true });
    aoConcluir?.();
  };
  const recomecar = () => { if (window.confirm("Montar de novo?")) { setConf(null); setP(inicial()); } };

  return (
    <section className="cartao" style={{ gap: 12 }}>
      <div>
        <h2>{titulo}</h2>
        {subtitulo && <span className="pequeno suave">{subtitulo}</span>}
      </div>
      {dica && !p.concluido && <p className="pequeno suave" style={{ margin: 0 }}>{dica}</p>}
      <div style={{ maxWidth: 760, display: "flex", flexDirection: "column" }}>
        {visiveis.map((l) => {
          const forte = l.tipo !== "item";
          const m = conf?.marcas[l.i];
          return (
            <div key={l.i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "6px 0", borderTop: forte ? "1px solid var(--linha)" : 0, fontWeight: forte ? 600 : 400, color: l.tipo === "final" ? "var(--destaque)" : undefined }}>
              <span style={{ flex: "1 1 auto", minWidth: 0 }}>{l.rotulo}</span>
              <input className="mono" inputMode="decimal" aria-label={`Valor — ${l.rotulo}`} placeholder="0,00" value={p.resp[l.i] ?? ""} disabled={p.concluido}
                onChange={(e) => { setConf(null); setP({ ...p, resp: { ...p.resp, [l.i]: e.target.value } }); }}
                style={{ width: 130, flexShrink: 0, minHeight: 0, padding: "4px 8px", textAlign: "right", fontWeight: forte ? 600 : 400, borderColor: m === true ? "var(--verde-texto)" : m === false ? "var(--vermelho)" : undefined }} />
            </div>
          );
        })}
      </div>
      {conf && !conf.ok && <div className="aviso erro" role="status">Há {Object.values(conf.marcas).filter((x) => !x).length} linha(s) com valor errado (borda vermelha). Some as contas de cada linha e faça os subtotais na ordem; nas linhas "(-)" pode digitar o valor sem sinal; resultado negativo leva o sinal de menos.</div>}
      {p.concluido && <div className="aviso" role="status"><strong>{p.viu ? "Resposta:" : "Certo!"}</strong> {depois || ""}</div>}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {!p.concluido && <button className="botao" onClick={conferir}>Conferir</button>}
        {!p.concluido && p.tentativas > 0 && <button className="botao secundario" onClick={verResposta}>Ver a resposta</button>}
        <button className="botao secundario pequeno" style={{ marginLeft: "auto" }} onClick={recomecar}>Montar de novo</button>
      </div>
    </section>
  );
}
