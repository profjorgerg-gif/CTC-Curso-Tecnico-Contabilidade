// Demonstrações da CB: DRE, Encerramento (ARE), DLPA e Balanço Patrimonial
// (base: SECCHH; estrutura conforme a Lei 6.404/76 e a NBC TG 26).
// Os lançamentos de encerramento levam a marca `encerramento: true`, para que a
// DRE continue mostrando o resultado do período mesmo depois do fechamento.
import { arred, partidasDe, totaisDaConta } from "./contabil";

export const CONTA_ARE = "7.1.01";
export const CONTA_LUCROS = "3.9"; // Resultado do Exercício (lucros acumulados)
export const CONTA_PREJUIZOS = "3.6"; // (-) Prejuízos Acumulados

export const semEncerramento = (lancamentos) => (lancamentos || []).filter((l) => !l.encerramento);
const doRamo = (codigo, prefixo) => codigo === prefixo || codigo.startsWith(`${prefixo}.`);

// soma (crédito − débito) das contas lançáveis de um ramo; devolve também o detalhe por conta
export function credorMenosDevedor(plano, lancamentos, saldos, prefixo) {
  const contas = [];
  let total = 0;
  for (const c of plano.lancaveis) {
    if (!doRamo(c.codigo, prefixo)) continue;
    const { deb, cred } = totaisDaConta(lancamentos, saldos, c.codigo);
    const v = arred(cred - deb);
    if (Math.abs(v) >= 0.005) { contas.push({ conta: c, valor: v }); total += v; }
  }
  return { total: arred(total), contas };
}

// ---------- DRE ----------
export function dre(plano, lancamentos, saldos) {
  const l = semEncerramento(lancamentos);
  const g = (p) => credorMenosDevedor(plano, l, saldos, p);
  const linhas = [];
  const add = (rotulo, partes, tipo = "item") => {
    const contas = partes.flatMap((p) => p.contas);
    const valor = arred(partes.reduce((s, p) => s + p.total, 0));
    linhas.push({ rotulo, valor, tipo, contas });
    return valor;
  };
  const sub = (rotulo, valor, tipo = "subtotal") => { linhas.push({ rotulo, valor: arred(valor), tipo, contas: [] }); return arred(valor); };

  const rb = add("Receita Bruta de Vendas e Serviços", [g("4.1")]);
  const ded = add("(-) Deduções da Receita", [g("4.2")]);
  const rl = sub("(=) Receita Líquida", rb + ded);
  const custo = add("(-) Custo das Mercadorias, Produtos e Serviços Vendidos", [g("6")]);
  const rbruto = sub("(=) Resultado Bruto", rl + custo);
  const adm = add("(-) Despesas Administrativas", [g("5.1")]);
  const com = add("(-) Despesas Comerciais", [g("5.2")]);
  const outrasRec = add("(+) Outras Receitas Operacionais", [g("4.4")]);
  const antesFin = sub("(=) Resultado antes do Resultado Financeiro", rbruto + adm + com + outrasRec);
  const recFin = add("(+) Receitas Financeiras", [g("4.3")]);
  const despFin = add("(-) Despesas Financeiras", [g("5.3")]);
  const operacional = sub("(=) Resultado Operacional", antesFin + recFin + despFin);
  const ganhos = add("(+) Ganhos de Capital e Resultado de Investimentos", [g("4.5"), g("4.6")]);
  const outrasDesp = add("(-) Outras Despesas", [g("5.4")]);
  const antesIR = sub("(=) Resultado antes do IRPJ e da CSLL", operacional + ganhos + outrasDesp);
  const ir = add("(-) Provisão para IRPJ e CSLL", [g("7.2")]);
  const liquido = sub("(=) RESULTADO LÍQUIDO DO EXERCÍCIO", antesIR + ir, "final");
  return { linhas, resultado: liquido, receitaBruta: rb };
}

// ---------- Encerramento (ARE) ----------
// propõe os lançamentos: cada conta de resultado com saldo vai para a ARE,
// e o saldo da ARE (lucro ou prejuízo) vai para o Patrimônio Líquido
export function propostaEncerramento(plano, lancamentos, saldos) {
  const propostos = [];
  let receitas = 0;
  let despesasCustos = 0;
  for (const c of plano.lancaveis) {
    if (!["4", "5", "6"].includes(c.codigo.split(".")[0]) && !doRamo(c.codigo, "7.2")) continue;
    const { deb, cred } = totaisDaConta(lancamentos, saldos, c.codigo);
    const saldo = arred(cred - deb);
    if (Math.abs(saldo) < 0.005) continue;
    if (saldo > 0) {
      propostos.push({ historico: `Encerramento — ${c.nome}`, contaDebito: c.codigo, contaCredito: CONTA_ARE, valor: saldo });
      receitas += saldo;
    } else {
      propostos.push({ historico: `Encerramento — ${c.nome}`, contaDebito: CONTA_ARE, contaCredito: c.codigo, valor: -saldo });
      despesasCustos += -saldo;
    }
  }
  const resultado = arred(receitas - despesasCustos);
  if (Math.abs(resultado) >= 0.005) {
    propostos.push(resultado > 0
      ? { historico: "Transferência do lucro líquido do exercício para o Patrimônio Líquido", contaDebito: CONTA_ARE, contaCredito: CONTA_LUCROS, valor: resultado }
      : { historico: "Transferência do prejuízo do exercício para o Patrimônio Líquido", contaDebito: CONTA_PREJUIZOS, contaCredito: CONTA_ARE, valor: -resultado });
  }
  return { propostos, receitas: arred(receitas), despesasCustos: arred(despesasCustos), resultado };
}
export const jaEncerrado = (lancamentos) => (lancamentos || []).some((l) => l.encerramento);

// ---------- DLPA ----------
export function dlpa(plano, lancamentos, saldos) {
  const ini = (c) => Number(saldos?.[c]?.credor || 0) - Number(saldos?.[c]?.devedor || 0);
  const saldoInicial = arred(ini(CONTA_LUCROS) + ini(CONTA_PREJUIZOS));
  const resultado = dre(plano, lancamentos, saldos).resultado;
  // destinações: lançamentos que tiram dos lucros (débito em 3.9) para reservas ou dividendos
  const destino = (c) => doRamo(c, "3.4") || doRamo(c, "2.1.7") || doRamo(c, "3.2");
  const destinacoes = [];
  const outras = [];
  for (const l of semEncerramento(lancamentos)) {
    const ps = partidasDe(l);
    const tiraDosLucros = ps.some((p) => p.d === "D" && p.conta === CONTA_LUCROS);
    ps.forEach((p, i) => {
      if (tiraDosLucros && p.d === "C" && destino(p.conta)) {
        destinacoes.push({ l, chave: `${l.id}-${i}`, conta: plano.porCodigo[p.conta], valor: Number(p.valor) });
      }
    });
    // outras movimentações diretas em 3.9 / 3.6 (ex.: compensação de prejuízos, ajustes)
    ps.forEach((p, i) => {
      if (p.conta !== CONTA_LUCROS && p.conta !== CONTA_PREJUIZOS) return;
      if (tiraDosLucros && p.conta === CONTA_LUCROS && p.d === "D" && ps.filter((x) => x.d === "C").every((x) => destino(x.conta))) return;
      outras.push({ l, chave: `${l.id}-${i}`, valor: arred((p.d === "C" ? 1 : -1) * Number(p.valor)) });
    });
  }
  const totalDest = arred(destinacoes.reduce((s, d) => s + d.valor, 0));
  const totalOutras = arred(outras.reduce((s, d) => s + d.valor, 0));
  const saldoFinal = arred(saldoInicial + totalOutras + resultado - totalDest);
  return { saldoInicial, outras, totalOutras, resultado, destinacoes, totalDest, saldoFinal };
}

// ---------- Balanço Patrimonial ----------
function arvore(plano, lancamentos, saldos, raiz, ladoAtivo) {
  const nos = {};
  for (const c of plano.contas) if (doRamo(c.codigo, raiz)) nos[c.codigo] = { conta: c, filhos: [], valor: 0 };
  for (const c of Object.keys(nos)) {
    if (c === raiz) continue;
    const pai = c.split(".").slice(0, -1).join(".");
    if (nos[pai]) nos[pai].filhos.push(nos[c]);
  }
  const calcular = (no) => {
    no.filhos.forEach(calcular);
    let proprio = 0;
    if (no.conta.aceitaLancamento) {
      const { deb, cred } = totaisDaConta(lancamentos, saldos, no.conta.codigo);
      proprio = ladoAtivo ? deb - cred : cred - deb;
    }
    no.valor = arred(proprio + no.filhos.reduce((s, f) => s + f.valor, 0));
    no.filhos = no.filhos.filter((f) => Math.abs(f.valor) >= 0.005 || f.filhos.length);
  };
  if (!nos[raiz]) return null;
  calcular(nos[raiz]);
  return nos[raiz];
}

export function balanco(plano, lancamentos, saldos) {
  const ativo = arvore(plano, lancamentos, saldos, "1", true);
  const passivo = arvore(plano, lancamentos, saldos, "2", false);
  const pl = arvore(plano, lancamentos, saldos, "3", false);
  // enquanto o exercício não for encerrado, o resultado ainda está nas contas de resultado
  let pendente = 0;
  for (const g of ["4", "5", "6", "7"]) pendente += credorMenosDevedor(plano, lancamentos, saldos, g).total;
  pendente = arred(pendente);
  const totAtivo = ativo?.valor || 0;
  const totPassivo = passivo?.valor || 0;
  const totPL = arred((pl?.valor || 0) + pendente);
  return { ativo, passivo, pl, pendente, totAtivo, totPassivo, totPL, fecha: Math.abs(totAtivo - (totPassivo + totPL)) < 0.005 };
}
