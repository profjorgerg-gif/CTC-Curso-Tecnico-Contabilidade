// Controle de Estoque (CB): ficha de controle (kardex) por PEPS, UEPS e Média
// Ponderada Móvel, montada a partir dos lançamentos da empresa (base: SECCHH).
// Entrada = débito na conta de estoque; saída = crédito na conta de estoque.
import { CONTAS_ESTOQUE, arred, ordenarLancamentos, partidasDe } from "./contabil";

export const METODOS = {
  peps: { nome: "PEPS", longo: "PEPS — Primeiro que Entra, Primeiro que Sai" },
  ueps: { nome: "UEPS", longo: "UEPS — Último que Entra, Primeiro que Sai" },
  media: { nome: "Média Ponderada", longo: "Média Ponderada Móvel" },
};
export const METODO_PADRAO = "peps";

export function movimentosDeEstoque(lancamentos) {
  const movs = [];
  for (const l of ordenarLancamentos(lancamentos)) {
    partidasDe(l).forEach((p, i) => {
      const q = Number(p.quantidade) || 0;
      if (!q || !CONTAS_ESTOQUE.includes(p.conta)) return;
      const base = { id: `${l.id}-${i}`, lancamentoId: l.id, data: l.data, historico: l.historico, quantidade: q, valorLancado: Number(p.valor), fato: l.fatoOrientado || l.roteiro?.n || l.lista?.n };
      if (p.d === "D") movs.push({ ...base, tipo: "Entrada", valorUnit: Number(p.valorUnitario) || Number(p.valor) / q });
      else movs.push({ ...base, tipo: "Saída" });
    });
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
  const anteriores = movimentosDeEstoque((lancamentos || []).filter((l) => l.id !== ignorarId && !l.apuracaoCMV && (l.data || "") <= (data || "9999")));
  const k = kardex([...anteriores, { id: "_nova", tipo: "Saída", quantidade: Number(quantidade) || 0 }], metodo);
  const ultima = k.linhas[k.linhas.length - 1];
  return { custo: ultima?.custoSaida || 0, insuficiente: !!ultima?.insuficiente, disponivel: anteriores.length ? k.linhas[k.linhas.length - 2]?.saldoQtd || 0 : 0 };
}

// ---------- inventário periódico: CMV = Estoque Inicial + Compras − Estoque Final ----------
// O estoque final é a contagem física informada pelo aluno, avaliada pelo método:
// PEPS → as unidades que sobram são as das compras mais recentes;
// Média Ponderada (fixa do período) → custo médio de tudo o que esteve disponível.
export function apuracaoPeriodica(lancamentos, saldos, metodo, qtdInicial, qtdFinal) {
  const ei = Number(saldos?.["1.1.3.01"]?.devedor || 0) - Number(saldos?.["1.1.3.01"]?.credor || 0);
  const compras = [];
  for (const l of ordenarLancamentos(lancamentos)) {
    if (l.apuracaoCMV) continue;
    for (const p of partidasDe(l)) {
      if (p.d !== "D" || !CONTAS_ESTOQUE.includes(p.conta)) continue;
      const q = Number(p.quantidade) || 0;
      compras.push({ id: l.id, data: l.data, historico: l.historico, quantidade: q, valor: Number(p.valor), unit: Number(p.valorUnitario) || (q ? Number(p.valor) / q : 0) });
    }
  }
  const qEI = Number(qtdInicial) || 0;
  const qC = compras.reduce((s, c) => s + c.quantidade, 0);
  const vC = arred(compras.reduce((s, c) => s + c.valor, 0));
  const disponivelQ = qEI + qC;
  const qEF = Math.max(0, Number(qtdFinal) || 0);
  let ef = 0;
  if (metodo === "media") {
    ef = disponivelQ > 0 ? ((ei + vC) / disponivelQ) * qEF : 0;
  } else {
    // PEPS: o que sobra são as últimas compras (e, se faltar, o estoque inicial)
    let falta = qEF;
    for (const c of [...compras].reverse()) {
      if (falta <= 0) break;
      const usa = Math.min(falta, c.quantidade);
      ef += usa * c.unit; falta -= usa;
    }
    if (falta > 0 && qEI > 0) ef += falta * (ei / qEI);
  }
  ef = arred(ef);
  return {
    ei: arred(ei), qEI, compras, qC, vC, qEF, ef,
    cmv: arred(ei + vC - ef), qVendida: Math.max(0, disponivelQ - qEF),
    excede: qEF > disponivelQ,
    jaApurado: (lancamentos || []).some((l) => l.apuracaoCMV),
  };
}
