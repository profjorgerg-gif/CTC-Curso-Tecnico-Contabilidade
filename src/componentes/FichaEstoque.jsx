// Ficha de controle de estoque interativa (Módulo 06): o aluno preenche, pelo PEPS e pela
// Média Ponderada Móvel, o custo de cada saída e o saldo depois de cada movimento.
// O gabarito vem do mesmo cálculo do Controle de Estoque do CTC (lib/estoque.js).
// O progresso fica só neste navegador (não vale nota).
import { useEffect, useMemo, useState } from "react";
import { kardex, METODOS } from "../lib/estoque";
import { lerValor } from "./BalancoSucessivo";

const fmt = (v) => Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const perto = (a, b) => a !== null && Math.abs(a - b) <= 0.011;
const chave = (id) => `ctc-pratica-${id}`;
function lerProgresso(id) { try { return JSON.parse(localStorage.getItem(chave(id)) || "null"); } catch { return null; } }
function gravarProgresso(id, p) { try { localStorage.setItem(chave(id), JSON.stringify(p)); } catch { /* sem armazenamento */ } }

export default function FichaEstoque({ ex }) {
  const movs = useMemo(() => ex.movimentos.map((m) => ({ tipo: m.tipo, quantidade: m.quantidade, valorUnit: m.valorUnit })), [ex]);
  const gab = useMemo(() => Object.fromEntries(["peps", "media", "ueps"].map((mt) => [mt, kardex(movs, mt)])), [movs]);
  const [p, setP] = useState(() => lerProgresso(ex.id) || { aba: ex.metodos[0], respostas: {}, feitos: {}, tentativas: {}, concluido: false });
  const [conf, setConf] = useState(null);
  useEffect(() => { gravarProgresso(ex.id, p); }, [p]);

  const mt = p.aba;
  const linhas = gab[mt].linhas;
  const resp = p.respostas[mt] || {};
  const feito = p.feitos[mt];
  const campo = (i, c) => resp[`${i}.${c}`] ?? "";
  const mudar = (i, c, v) => { setConf(null); setP({ ...p, respostas: { ...p.respostas, [mt]: { ...resp, [`${i}.${c}`]: v } } }); };

  const conferir = () => {
    const marcas = {};
    linhas.forEach((l, i) => {
      if (l.tipo === "Saída") marcas[`${i}.custo`] = perto(lerValor(campo(i, "custo")), l.custoSaida);
      marcas[`${i}.qtd`] = perto(lerValor(campo(i, "qtd")), l.saldoQtd);
      marcas[`${i}.valor`] = perto(lerValor(campo(i, "valor")), l.saldoValor);
    });
    const ok = Object.values(marcas).every(Boolean);
    setConf({ marcas, ok });
    const tentativas = { ...p.tentativas, [mt]: (p.tentativas[mt] || 0) + 1 };
    const feitos = ok ? { ...p.feitos, [mt]: { tentativas: tentativas[mt], viu: false } } : p.feitos;
    setP({ ...p, tentativas, feitos, concluido: ex.metodos.every((m) => feitos[m]) });
  };
  const verResposta = () => {
    const r = {};
    linhas.forEach((l, i) => {
      if (l.tipo === "Saída") r[`${i}.custo`] = fmt(l.custoSaida);
      r[`${i}.qtd`] = String(l.saldoQtd);
      r[`${i}.valor`] = fmt(l.saldoValor);
    });
    const feitos = { ...p.feitos, [mt]: { tentativas: p.tentativas[mt] || 0, viu: true } };
    setConf(null);
    setP({ ...p, respostas: { ...p.respostas, [mt]: r }, feitos, concluido: ex.metodos.every((m) => feitos[m]) });
  };
  const recomecar = () => { if (window.confirm("Recomeçar a ficha de estoque?")) { setConf(null); setP({ aba: ex.metodos[0], respostas: {}, feitos: {}, tentativas: {}, concluido: false }); } };

  const cor = (k) => (conf?.marcas[k] === true ? "var(--verde-texto)" : conf?.marcas[k] === false ? "var(--vermelho)" : undefined);
  const entrada = (i, c, rotulo) => (
    <input className="mono" inputMode="decimal" aria-label={rotulo} placeholder={c === "qtd" ? "0" : "0,00"} value={campo(i, c)} disabled={!!feito}
      onChange={(e) => mudar(i, c, e.target.value)} style={{ width: c === "qtd" ? 70 : 110, minHeight: 0, padding: "4px 8px", textAlign: "right", borderColor: cor(`${i}.${c}`) }} />
  );
  const receita = ex.movimentos.reduce((s, m) => s + (m.receita || 0), 0);

  return (
    <section className="cartao" style={{ gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
        <h2>{ex.titulo}</h2>
        <span className="pequeno suave">não vale nota</span>
      </div>
      <p className="pequeno suave" style={{ margin: 0 }}>{ex.instrucao}</p>
      <div className="abas" role="tablist" aria-label="Método" style={{ margin: 0 }}>
        {ex.metodos.map((m) => (
          <button key={m} role="tab" aria-selected={mt === m} className={mt === m ? "ativo" : ""} onClick={() => { setConf(null); setP({ ...p, aba: m }); }}>
            {p.feitos[m] ? "✓ " : ""}{METODOS[m].longo}
          </button>
        ))}
      </div>
      <div className="tabela-caixa" style={{ border: "1px solid var(--linha)", borderRadius: 10 }}>
        <table>
          <thead>
            <tr><th>Movimento</th><th style={{ textAlign: "right" }}>Entrada (R$)</th><th style={{ textAlign: "right" }}>Custo da saída (R$)</th><th style={{ textAlign: "right" }}>Saldo (un)</th><th style={{ textAlign: "right" }}>Saldo (R$)</th></tr>
          </thead>
          <tbody>
            {linhas.map((l, i) => {
              const m = ex.movimentos[i];
              return (
                <tr key={i}>
                  <td>{m.texto}</td>
                  <td className="mono" style={{ textAlign: "right" }}>{l.tipo === "Entrada" ? `${l.quantidade} × ${fmt(l.valorUnit)} = ${fmt(l.quantidade * l.valorUnit)}` : ""}</td>
                  <td style={{ textAlign: "right" }}>{l.tipo === "Saída" ? entrada(i, "custo", `Custo da saída — ${m.texto}`) : ""}</td>
                  <td style={{ textAlign: "right" }}>{entrada(i, "qtd", `Saldo em unidades — ${m.texto}`)}</td>
                  <td style={{ textAlign: "right" }}>{entrada(i, "valor", `Saldo em reais — ${m.texto}`)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {mt === "media" && !feito && <p className="pequeno suave" style={{ margin: 0 }}>Dica: na média ponderada, custo médio = saldo em reais ÷ saldo em unidades; arredonde os valores em reais para 2 casas.</p>}
      {conf && !conf.ok && <div className="aviso erro" role="status">Há {Object.values(conf.marcas).filter((x) => !x).length} valor(es) errado(s) (borda vermelha). {mt === "peps" ? "No PEPS, a saída usa primeiro o lote mais antigo." : "Na média, a saída usa o custo médio do saldo."}</div>}
      {feito && <div className="aviso" role="status"><strong>{feito.viu ? "Resposta:" : "Certo!"}</strong> CMV {mt === "media" ? "pela" : "pelo"} {METODOS[mt].nome}: R$ {fmt(gab[mt].cmv)}; estoque final: {gab[mt].finalQtd} un, R$ {fmt(gab[mt].finalValor)}.</div>}

      {p.concluido && (
        <>
          <h3 style={{ margin: "6px 0 0", fontSize: 15 }}>Comparativo (receita das vendas: R$ {fmt(receita)})</h3>
          <div className="tabela-caixa" style={{ border: "1px solid var(--linha)", borderRadius: 10 }}>
            <table>
              <thead><tr><th>Método</th><th style={{ textAlign: "right" }}>CMV</th><th style={{ textAlign: "right" }}>Lucro bruto</th><th style={{ textAlign: "right" }}>Estoque final</th></tr></thead>
              <tbody>
                {["peps", "media", "ueps"].map((m) => (
                  <tr key={m}>
                    <td>{METODOS[m].nome}{m === "ueps" ? <span className="pequeno suave"> (não permitido — só comparação)</span> : ""}</td>
                    <td className="mono" style={{ textAlign: "right" }}>{fmt(gab[m].cmv)}</td>
                    <td className="mono" style={{ textAlign: "right" }}>{fmt(receita - gab[m].cmv)}</td>
                    <td className="mono" style={{ textAlign: "right" }}>{fmt(gab[m].finalValor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="pequeno suave" style={{ margin: 0 }}>Com preços em alta, o PEPS dá o maior lucro bruto e o maior estoque final; a Média fica no meio.</p>
        </>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {!feito && <button className="botao" onClick={conferir}>Conferir a ficha</button>}
        {!feito && (p.tentativas[mt] || 0) > 0 && <button className="botao secundario" onClick={verResposta}>Ver a resposta</button>}
        {feito && !p.concluido && <button className="botao" onClick={() => { setConf(null); setP({ ...p, aba: ex.metodos.find((m) => !p.feitos[m]) }); }}>Fazer pelo outro método</button>}
        <button className="botao secundario pequeno" style={{ marginLeft: "auto" }} onClick={recomecar}>Recomeçar</button>
      </div>
    </section>
  );
}
