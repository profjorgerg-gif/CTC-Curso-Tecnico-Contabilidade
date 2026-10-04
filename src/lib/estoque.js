// Controle de Estoque (CB): ficha de controle (kardex) por PEPS, UEPS e Média
// Ponderada Móvel, montada a partir dos lançamentos da empresa (base: SECCHH).
// Entrada = débito na conta de estoque; saída = crédito na conta de estoque.
import { CONTAS_ESTOQUE, arred } from "./contabil";

export const METODOS = {
  peps: { nome: "PEPS", longo: "PEPS — Primeiro que Entra, Primeiro que Sai" },
  ueps: { nome: "UEPS", longo: "UEPS — Último que Entra, Primeiro que Sai" },
  media: { nome: "Média Ponderada", longo: "Média Ponderada Móvel" },
};
export const METODO_PADRAO = "peps";

export function movimentosDeEstoque(lancamentos, ateId = null) {
  const ordenados = [...(lancamentos || [])]
    .sort((a, b) => (a.data || "").localeCompare(b.data || "") || (a.criadoEm || "").localeCompare(b.criadoEm || ""));
  const movs = [];
  for (const l of ordenados) {
    if (ateId && l.id === ateId) break;
    const q = Number(l.quantidade) || 0;
    if (!q) continue;
    if (CONTAS_ESTOQUE.includes(l.contaDebito)) {
      movs.push({ id: l.id, data: l.data, historico: l.historico, tipo: "Entrada", quantidade: q,
        valorUnit: Number(l.valorUnitario) || Number(l.valor) / q, valorLancado: Number(l.valor), fato: l.fatoOrientado });
    } else if (CONTAS_ESTOQUE.includes(l.contaCredito)) {
      movs.push({ id: l.id, data: l.data, historico: l.historico, tipo: "Saída", quantidade: q, valorLancado: Number(l.valor), fato: l.fatoOrientado });
    }
  }
  return movs;
}

// lotes: PEPS baixa do mais antigo, UEPS do mais recente
function porLotes(movs, doFim) {
  const lotes = [];
  let cmv = 0;
  const linhas = movs.map((m) => {
    let custo = 0;
    let falta = m.tipo === "Saída" ? m.quantidade : 0;
    if (m.tipo === "Entrada") {
      lotes.push({ qtd: m.quantidade, unit: m.valorUnit });
    } else {
      while (falta > 1e-6 && lotes.length) {
        const lote = doFim ? lotes[lotes.length - 1] : lotes[0];
        const usa = Math.min(lote.qtd, falta);
        custo += usa * lote.unit;
        lote.qtd -= usa; falta -= usa;
        if (lote.qtd <= 1e-6) (doFim ? lotes.pop() : lotes.shift());
      }
      custo = arred(custo);
      cmv += custo;
    }
    return {
      ...m, custoSaida: m.tipo === "Saída" ? custo : null, insuficiente: falta > 1e-6,
      saldoQtd: lotes.reduce((s, l) => s + l.qtd, 0),
      saldoValor: arred(lotes.reduce((s, l) => s + l.qtd * l.unit, 0)),
      lotes: lotes.map((l) => ({ ...l })),
    };
  });
  const ultima = linhas[linhas.length - 1];
  return { linhas, cmv: arred(cmv), finalQtd: ultima?.saldoQtd || 0, finalValor: ultima?.saldoValor || 0 };
}

function mediaPonderada(movs) {
  let qtd = 0;
  let valor = 0;
  let cmv = 0;
  const linhas = movs.map((m) => {
    let custo = null;
    let insuficiente = false;
    if (m.tipo === "Entrada") {
      qtd += m.quantidade;
      valor += m.quantidade * m.valorUnit;
    } else {
      insuficiente = m.quantidade > qtd + 1e-6;
      const sai = Math.min(m.quantidade, qtd);
      const medio = qtd > 0 ? valor / qtd : 0;
      custo = arred(sai * medio);
      cmv += custo;
      qtd -= sai;
      valor = qtd > 1e-6 ? valor - custo : 0;
    }
    return { ...m, custoSaida: custo, insuficiente, saldoQtd: qtd, saldoValor: arred(valor), medio: qtd > 0 ? valor / qtd : 0 };
  });
  return { linhas, cmv: arred(cmv), finalQtd: qtd, finalValor: arred(valor) };
}

export function kardex(movs, metodo) {
  if (metodo === "ueps") return porLotes(movs, true);
  if (metodo === "media") return mediaPonderada(movs);
  return porLotes(movs, false);
}

// custo que uma saída teria pelo método, considerando só o que veio antes dela
export function custoDaSaida(lancamentos, metodo, quantidade, data, ignorarId = null) {
  const anteriores = movimentosDeEstoque((lancamentos || []).filter((l) => l.id !== ignorarId && (l.data || "") <= (data || "9999")));
  const k = kardex([...anteriores, { id: "_nova", tipo: "Saída", quantidade: Number(quantidade) || 0 }], metodo);
  const ultima = k.linhas[k.linhas.length - 1];
  return { custo: ultima?.custoSaida || 0, insuficiente: !!ultima?.insuficiente, disponivel: anteriores.length ? k.linhas[k.linhas.length - 2]?.saldoQtd || 0 : 0 };
}
