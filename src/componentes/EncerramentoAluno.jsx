// Encerramento feito pelo aluno (aprovado em 06/10/2026): para cada conta de resultado com
// saldo, o aluno escolhe o lado (debitar ou creditar a conta) e o valor que a zera contra a
// ARE; depois, transfere o resultado para o PL. O CTC confere com a proposta e só então
// libera a gravação. O progresso fica neste navegador; se os saldos mudarem, recomeça.
import { useEffect, useMemo, useState } from "react";
import { lerValor } from "./BalancoSucessivo";

const ARE = "7.1.01";
const fmt = (v) => Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const igual = (a, b) => a !== null && Math.abs(a - b) < 0.005;
function ler(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } }
function gravar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem armazenamento */ } }

export default function EncerramentoAluno({ propostos, nome, chave, aoConferir }) {
  // contas a encerrar (sem a transferência final) e a transferência do resultado
  const contas = useMemo(() => propostos.filter((x) => x.contaDebito === ARE || x.contaCredito === ARE)
    .filter((x) => !(x.contaDebito === ARE && x.contaCredito.startsWith("3")) && !(x.contaCredito === ARE && x.contaDebito.startsWith("3")))
    .map((x) => (x.contaCredito === ARE
      ? { conta: x.contaDebito, saldo: x.valor, natureza: "C", lado: "D" }
      : { conta: x.contaCredito, saldo: x.valor, natureza: "D", lado: "C" })), [propostos]);
  const transf = propostos.find((x) => (x.contaDebito === ARE && x.contaCredito.startsWith("3")) || (x.contaCredito === ARE && x.contaDebito.startsWith("3")));
  const tipoCerto = transf ? (transf.contaDebito === ARE ? "lucro" : "prejuizo") : "nenhum";
  const assinatura = propostos.map((x) => `${x.contaDebito}>${x.contaCredito}:${x.valor}`).join("|");

  const inicial = () => ({ assinatura, resp: {}, tipo: "", valorRes: "", tentativas: 0, concluido: false });
  const [p, setP] = useState(() => { const s = ler(chave); return s && s.assinatura === assinatura ? s : inicial(); });
  const [conf, setConf] = useState(null);
  useEffect(() => { gravar(chave, p); if (p.concluido) aoConferir?.(); }, [p]);

  const r = (c) => p.resp[c] || { lado: "", valor: "" };
  const mudar = (c, campo, v) => { setConf(null); setP({ ...p, resp: { ...p.resp, [c]: { ...r(c), [campo]: v } } }); };
  const conferir = () => {
    const marcas = {};
    for (const x of contas) marcas[x.conta] = r(x.conta).lado === x.lado && igual(lerValor(r(x.conta).valor), x.saldo);
    marcas._res = p.tipo === tipoCerto && (tipoCerto === "nenhum" || igual(lerValor(p.valorRes), transf.valor));
    const ok = Object.values(marcas).every(Boolean);
    setConf({ marcas, ok });
    setP({ ...p, tentativas: p.tentativas + 1, concluido: ok });
  };
  const verResposta = () => {
    setConf(null);
    setP({ ...p, resp: Object.fromEntries(contas.map((x) => [x.conta, { lado: x.lado, valor: fmt(x.saldo) }])), tipo: tipoCerto, valorRes: transf ? fmt(transf.valor) : "", concluido: true, viu: true });
  };
  const cor = (k) => (conf?.marcas[k] === true ? "var(--verde-texto)" : conf?.marcas[k] === false ? "var(--vermelho)" : undefined);

  return (
    <section className="cartao" style={{ gap: 12 }}>
      <div>
        <h2>Faça os lançamentos de encerramento</h2>
        <span className="pequeno suave">Para zerar cada conta de resultado contra a {nome(ARE)}, lance o valor do saldo no lado contrário. Depois, transfira o resultado da ARE para o Patrimônio Líquido.</span>
      </div>
      <div className="tabela-caixa" style={{ border: "1px solid var(--linha)", borderRadius: 10 }}>
        <table>
          <thead><tr><th>Conta de resultado</th><th style={{ textAlign: "right" }}>Saldo</th><th>Na conta, lançar a</th><th style={{ textAlign: "right" }}>Valor</th></tr></thead>
          <tbody>
            {contas.map((x) => (
              <tr key={x.conta}>
                <td className="pequeno">{nome(x.conta)}</td>
                <td className="mono" style={{ textAlign: "right" }}>{fmt(x.saldo)} {x.natureza}</td>
                <td>
                  <select aria-label={`Lado do encerramento de ${nome(x.conta)}`} value={r(x.conta).lado} disabled={p.concluido} onChange={(e) => mudar(x.conta, "lado", e.target.value)} style={{ minHeight: 0, padding: "4px 6px", borderColor: cor(x.conta) }}>
                    <option value="">—</option><option value="D">Débito (ARE a crédito)</option><option value="C">Crédito (ARE a débito)</option>
                  </select>
                </td>
                <td style={{ textAlign: "right" }}>
                  <input className="mono" inputMode="decimal" aria-label={`Valor do encerramento de ${nome(x.conta)}`} placeholder="0,00" value={r(x.conta).valor} disabled={p.concluido} onChange={(e) => mudar(x.conta, "valor", e.target.value)}
                    style={{ width: 120, minHeight: 0, padding: "4px 8px", textAlign: "right", borderColor: cor(x.conta) }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="linha-form" style={{ alignItems: "flex-end" }}>
        <div className="campo" style={{ flex: "1 1 320px" }}>
          <label htmlFor="are-transf">Transferência do resultado</label>
          <select id="are-transf" value={p.tipo} disabled={p.concluido} onChange={(e) => { setConf(null); setP({ ...p, tipo: e.target.value }); }} style={{ borderColor: cor("_res") }}>
            <option value="">Escolha…</option>
            <option value="lucro">Lucro: D {nome(ARE)} / C 3.9 Resultado do Exercício</option>
            <option value="prejuizo">Prejuízo: D 3.6 (−) Prejuízos Acumulados / C {nome(ARE)}</option>
            <option value="nenhum">Resultado zero: não há transferência</option>
          </select>
        </div>
        {p.tipo && p.tipo !== "nenhum" && (
          <div className="campo" style={{ flex: "0 1 160px" }}>
            <label htmlFor="are-valor">Valor</label>
            <input id="are-valor" className="mono" inputMode="decimal" placeholder="0,00" value={p.valorRes} disabled={p.concluido} onChange={(e) => { setConf(null); setP({ ...p, valorRes: e.target.value }); }} style={{ textAlign: "right", borderColor: cor("_res") }} />
          </div>
        )}
      </div>
      {conf && !conf.ok && <div className="aviso erro" role="status">Há {Object.values(conf.marcas).filter((x) => !x).length} item(ns) errado(s) (borda vermelha). Receita (saldo credor) se encerra a débito; despesa e custo (saldo devedor), a crédito. O resultado é receitas − despesas e custos.</div>}
      {p.concluido && <div className="aviso" role="status"><strong>{p.viu ? "Resposta:" : "Certo!"}</strong> Confira abaixo os lançamentos de encerramento e grave-os.</div>}
      {!p.concluido && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="botao" onClick={conferir}>Conferir o encerramento</button>
          {p.tentativas > 0 && <button className="botao secundario" onClick={verResposta}>Ver a resposta</button>}
        </div>
      )}
    </section>
  );
}
