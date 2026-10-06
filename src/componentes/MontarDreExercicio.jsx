// Exercício "Monte a DRE" (Módulo 09): a partir das contas de resultado do balancete,
// o aluno monta a DRE linha a linha. A resposta vem da mesma função da aba DRE do CTC.
import { useMemo } from "react";
import { dre } from "../lib/demonstracoes";
import MontarDemonstracao from "./MontarDemonstracao";

const fmt = (v) => Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (a, b) => (b ? `${(a / b * 100).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%` : "—");

export default function MontarDreExercicio({ ex }) {
  const d = useMemo(() => {
    const plano = { lancaveis: ex.contas.map((c) => ({ codigo: c.codigo, nome: c.nome })) };
    const saldos = Object.fromEntries(ex.contas.map((c) => [c.codigo, c.natureza === "D" ? { devedor: c.saldo } : { credor: c.saldo }]));
    return dre(plano, [], saldos);
  }, [ex]);
  const rl = d.linhas.find((l) => l.rotulo.includes("Receita Líquida"))?.valor || 0;
  const rb = d.linhas.find((l) => l.rotulo.includes("Resultado Bruto"))?.valor || 0;
  return (
    <>
      <section className="cartao" style={{ gap: 10 }}>
        <h2>{ex.titulo}</h2>
        <p className="pequeno suave" style={{ margin: 0 }}>{ex.instrucao}</p>
        <div className="tabela-caixa" style={{ border: "1px solid var(--linha)", borderRadius: 10, maxWidth: 620 }}>
          <table>
            <thead><tr><th>Conta de resultado (balancete)</th><th style={{ textAlign: "right" }}>Saldo</th></tr></thead>
            <tbody>
              {ex.contas.map((c) => (
                <tr key={c.codigo}><td><span className="mono pequeno suave">{c.codigo}</span> {c.nome}</td><td className="mono" style={{ textAlign: "right" }}>{fmt(c.saldo)} {c.natureza}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <MontarDemonstracao
        titulo="Monte a DRE"
        subtitulo={`${ex.empresa} · não vale nota`}
        linhas={d.linhas}
        chave={`ctc-pratica-${ex.id}`}
        dica="Preencha cada linha e os subtotais, na ordem. Linhas sem valor não aparecem."
        depois={`Resultado líquido de R$ ${fmt(d.resultado)}. Margem bruta: ${pct(rb, rl)}; margem líquida: ${pct(d.resultado, rl)}.`}
      />
    </>
  );
}
