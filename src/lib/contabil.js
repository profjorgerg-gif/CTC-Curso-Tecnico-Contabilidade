// Motor contábil do CTC (base: SECCHH — Sistema de Escrituração Contábil da CB).
// Partidas dobradas simples: cada lançamento tem uma conta a débito e uma a crédito,
// no mesmo valor. Os saldos somam o saldo inicial com a movimentação do período.
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { carregarTabela, chaveCodigo } from "./arquivos";

// ---------- plano de contas (o gravado no banco; se não houver, o oficial do site) ----------
let planoEmCache = null;
export async function carregarPlano() {
  if (!planoEmCache) {
    planoEmCache = (async () => {
      let contas;
      try {
        const s = await getDoc(doc(db, "config", "planoContas"));
        contas = s.exists() ? s.data().contas : null;
      } catch { contas = null; }
      if (!contas) contas = await carregarTabela("plano-contas");
      contas = [...contas].sort((a, b) => chaveCodigo(a.codigo).localeCompare(chaveCodigo(b.codigo)));
      const porCodigo = Object.fromEntries(contas.map((c) => [c.codigo, c]));
      const lancaveis = contas.filter((c) => c.aceitaLancamento);
      return { contas, porCodigo, lancaveis };
    })().catch((e) => { planoEmCache = null; throw e; });
  }
  return planoEmCache;
}
export function usePlano() {
  const [plano, setPlano] = useState(null);
  const [erro, setErro] = useState("");
  useEffect(() => { carregarPlano().then(setPlano).catch((e) => setErro(e.message)); }, []);
  return { plano, erro };
}

// conta de estoque de mercadorias (pede quantidade nos lançamentos)
export const CONTAS_ESTOQUE = ["1.1.3.01"];

// ---------- formatação ----------
export const dinheiro = (n) => (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const numero = (n) => (Number(n) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const dataBR = (d) => (d && d.length === 10 ? `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}` : d || "");
export const arred = (n) => Math.round((Number(n) || 0) * 100) / 100;

// ---------- lançamento composto (aprovado em 04/10/2026) ----------
// Cada lançamento tem várias partidas: { d: "D" | "C", conta, valor, quantidade?, valorUnitario?, efeito? }.
// Lançamentos antigos (uma conta a débito e uma a crédito) são convertidos na leitura.
export function partidasDe(l) {
  if (Array.isArray(l?.partidas)) return l.partidas;
  if (!l?.contaDebito) return [];
  const q = Number(l.quantidade) || 0;
  const estD = CONTAS_ESTOQUE.includes(l.contaDebito);
  const estC = CONTAS_ESTOQUE.includes(l.contaCredito);
  return [
    { d: "D", conta: l.contaDebito, valor: Number(l.valor), ...(estD && q ? { quantidade: q, valorUnitario: Number(l.valorUnitario) || Number(l.valor) / q } : {}) },
    { d: "C", conta: l.contaCredito, valor: Number(l.valor), ...(estC && q ? { quantidade: q } : {}) },
  ];
}
export const totalDoLancamento = (l) => arred(partidasDe(l).filter((p) => p.d === "D").reduce((s, p) => s + Number(p.valor || 0), 0));
export const contasDoLado = (l, lado) => partidasDe(l).filter((p) => p.d === lado).map((p) => p.conta);
export const usaConta = (l, codigo) => partidasDe(l).some((p) => p.conta === codigo);

// ---------- saldos ----------
export function totaisDaConta(lancamentos, saldos, codigo) {
  const ini = saldos?.[codigo] || {};
  let deb = Number(ini.devedor || 0);
  let cred = Number(ini.credor || 0);
  for (const l of lancamentos || []) {
    for (const p of partidasDe(l)) {
      if (p.conta !== codigo) continue;
      if (p.d === "D") deb += Number(p.valor); else cred += Number(p.valor);
    }
  }
  return { deb: arred(deb), cred: arred(cred) };
}

// saldo respeitando a natureza: fica do lado em que a conta "pesa"
export function saldoDaConta(lancamentos, saldos, conta) {
  const { deb, cred } = totaisDaConta(lancamentos, saldos, conta.codigo);
  const dif = arred(deb - cred);
  return { deb, cred, dev: dif > 0 ? dif : 0, cre: dif < 0 ? -dif : 0 };
}

// balancete de verificação: contas lançáveis com movimento ou saldo inicial
export function balancete(plano, lancamentos, saldos) {
  const linhas = [];
  const tot = { deb: 0, cred: 0, dev: 0, cre: 0 };
  for (const c of plano.lancaveis) {
    const s = saldoDaConta(lancamentos, saldos, c);
    if (!s.deb && !s.cred) continue;
    linhas.push({ conta: c, ...s });
    tot.deb += s.deb; tot.cred += s.cred; tot.dev += s.dev; tot.cre += s.cre;
  }
  Object.keys(tot).forEach((k) => { tot[k] = arred(tot[k]); });
  return { linhas, tot, fecha: Math.abs(tot.deb - tot.cred) < 0.005 && Math.abs(tot.dev - tot.cre) < 0.005 };
}

export const ordenarLancamentos = (lista) => [...(lista || [])]
  .sort((a, b) => (a.data || "").localeCompare(b.data || "") || (a.criadoEm || "").localeCompare(b.criadoEm || ""));

// razão (extrato) de uma conta, com saldo acumulado no sentido da natureza da conta
export function razao(conta, lancamentos, saldos) {
  const ini = saldos?.[conta.codigo] || {};
  const sinal = conta.natureza === "Credora" ? -1 : 1; // saldo positivo = do lado da natureza
  let acumulado = arred(sinal * (Number(ini.devedor || 0) - Number(ini.credor || 0)));
  const inicial = acumulado;
  const linhas = [];
  for (const l of ordenarLancamentos(lancamentos)) {
    const partidas = partidasDe(l);
    partidas.forEach((p, i) => {
      if (p.conta !== conta.codigo) return;
      const debito = p.d === "D";
      acumulado = arred(acumulado + sinal * (debito ? 1 : -1) * Number(p.valor));
      const outras = [...new Set(partidas.filter((x) => x.d !== p.d).map((x) => x.conta))];
      linhas.push({ l, chave: `${l.id}-${i}`, debito, valor: Number(p.valor), contrapartida: outras.length === 1 ? outras[0] : null, contrapartidas: outras, acumulado });
    });
  }
  return { inicial, linhas, final: acumulado };
}

// ---------- conferência de um lançamento (partidas dobradas) ----------
export function conferirLancamento(f, plano) {
  const erros = [];
  if (!f.data) erros.push("Informe a data.");
  if (!f.historico?.trim()) erros.push("Escreva o histórico (o que aconteceu).");
  const partidas = f.partidas || [];
  const deb = partidas.filter((p) => p.d === "D");
  const cred = partidas.filter((p) => p.d === "C");
  if (!deb.length || !cred.length) erros.push("O lançamento precisa de pelo menos uma conta a débito e uma a crédito.");
  partidas.forEach((p, i) => {
    const onde = `Linha ${i + 1} (${p.d === "D" ? "débito" : "crédito"}${p.efeito ? ` — ${p.efeito}` : ""})`;
    if (!plano.porCodigo[p.conta]?.aceitaLancamento) erros.push(`${onde}: escolha a conta.`);
    if (!(Number(p.valor) > 0)) erros.push(`${onde}: informe o valor.`);
    if (CONTAS_ESTOQUE.includes(p.conta) && !(Number(p.quantidade) > 0)) erros.push(`${onde}: movimenta o estoque de mercadorias — informe a quantidade.`);
  });
  const contasD = new Set(deb.map((p) => p.conta));
  if (cred.some((p) => p.conta && contasD.has(p.conta))) erros.push("A mesma conta não pode estar a débito e a crédito no mesmo lançamento.");
  const somaD = arred(deb.reduce((s, p) => s + (Number(p.valor) || 0), 0));
  const somaC = arred(cred.reduce((s, p) => s + (Number(p.valor) || 0), 0));
  if (somaD > 0 && somaC > 0 && Math.abs(somaD - somaC) > 0.005) erros.push(`Os débitos (${dinheiro(somaD)}) precisam ser iguais aos créditos (${dinheiro(somaC)}).`);
  return erros;
}

// ---------- os 8 fatos orientados da CB (base SECCHH; a venda já inclui a baixa do CMV) ----------
export const FATOS_ORIENTADOS = [
  { tipo: "compra", texto: "A empresa comprou 100 unidades de mercadorias, pagando à vista em dinheiro (Caixa), a R$ 20,00 cada — total de R$ 2.000,00." },
  { tipo: "compra", texto: "A empresa comprou 50 unidades de mercadorias a prazo do fornecedor, a R$ 25,00 cada — total de R$ 1.250,00, para pagamento futuro." },
  { tipo: "venda", texto: "A empresa vendeu 40 unidades de mercadorias à vista, recebendo R$ 3.000,00 no Banco X. Registre a venda e a baixa do custo das mercadorias vendidas (CMV)." },
  { tipo: "venda", texto: "A empresa vendeu 30 unidades de mercadorias a prazo para um cliente, no valor de R$ 2.400,00. Registre a venda e a baixa do CMV." },
  { tipo: "pagamento", texto: "A empresa pagou ao fornecedor a duplicata referente à compra do fato 2, através do Banco Y." },
  { tipo: "recebimento", texto: "A empresa recebeu do cliente a duplicata referente à venda do fato 4, através do Banco X." },
  { tipo: "despesa", texto: "A empresa pagou R$ 800,00 de aluguel do mês, através do Banco Y." },
  { tipo: "despesa", texto: "A empresa pagou R$ 3.500,00 de salários dos funcionários, através do Banco X." },
];

// contas mais usadas no lançamento de abertura (saldos iniciais)
export const CONTAS_ABERTURA = [
  "3.1.01", "1.1.1.01", "1.1.1.02.01", "1.1.1.02.02",
  "1.2.3.01", "1.2.3.02", "1.2.3.03", "1.2.3.05", "1.2.3.07", "1.2.3.08", "1.2.3.09",
];
