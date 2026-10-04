// Listas de exercícios geradas pelo professor (aprovado em 04/10/2026):
// o professor escolhe quantidade, tipos de operação, faixa de valores e período;
// o CTC monta uma sequência coerente de fatos, cada um com o gabarito
// (débito, crédito e valor). A mesma lista vai para a turma inteira.
// Fatos de baixa do CMV não têm valor fixo no gabarito: o custo depende do
// estoque e do método de cada aluno, e é calculado na correção.
import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../firebase";
import { auditar } from "./auditoria";
import { arred, dinheiro, dataBR } from "./contabil";

export const TIPOS = [
  { id: "compras", nome: "Compras de mercadorias", desc: "à vista e a prazo" },
  { id: "vendas", nome: "Vendas de mercadorias", desc: "à vista e a prazo, com a baixa do CMV" },
  { id: "liquidacoes", nome: "Pagamentos e recebimentos", desc: "de fornecedores e de clientes" },
  { id: "despesas", nome: "Despesas operacionais", desc: "aluguel, energia, telefone, salários, propaganda…" },
  { id: "financeiras", nome: "Operações financeiras", desc: "empréstimo, aplicação, rendimentos, juros e tarifas" },
  { id: "imobilizado", nome: "Imobilizado", desc: "compra de móveis, computadores, veículos" },
];

// contas equivalentes aceitas na correção
export const CLIENTES = ["1.1.2.02", "1.1.2.01"];
export const FORNECEDORES = ["2.1.1.01", "2.1.1.02"];
const BANCOS = [["1.1.1.02.01", "Banco X"], ["1.1.1.02.02", "Banco Y"]];
const DESPESAS = [
  ["5.1.14", "aluguel do mês"], ["5.1.04", "a conta de energia elétrica"], ["5.1.05", "a conta de telefone e internet"],
  ["5.1.09", "material de escritório"], ["5.2.01", "uma campanha de propaganda"], ["5.1.02", "os salários do mês"],
  ["5.1.08", "a manutenção do ar-condicionado"], ["5.1.06", "serviços de contabilidade terceirizados"],
];
const IMOBILIZADOS = [["1.2.3.02", "móveis para a loja"], ["1.2.3.07", "computadores"], ["1.2.3.03", "um veículo utilitário"], ["1.2.3.05", "uma máquina"]];

// sorteio reproduzível (a mesma "semente" gera a mesma lista)
function sorteador(semente) {
  let s = semente >>> 0;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  return {
    rnd,
    int: (a, b) => a + Math.floor(rnd() * (b - a + 1)),
    item: (lista) => lista[Math.floor(rnd() * lista.length)],
    valor: (min, max, passo = 10) => Math.max(passo, Math.round((min + rnd() * (max - min)) / passo) * passo),
  };
}

const moeda = (v) => dinheiro(v).replace(/ /g, " ");

export function gerarLista({ quantidade, tipos, minimo, maximo, inicio, fim, semente = Date.now() }) {
  const r = sorteador(semente);
  const dias = [];
  const d0 = new Date(`${inicio}T12:00:00`);
  const d1 = new Date(`${fim}T12:00:00`);
  const total = Math.max(1, Math.round((d1 - d0) / 86400000));
  const estoque = []; // lotes comprados dentro da lista: { qtd, unit }
  let fornecedores = []; // compras a prazo em aberto
  let clientes = []; // vendas a prazo em aberto
  let emprestimo = 0;
  let aplicacao = 0;
  const fatos = [];
  const qtdEstoque = () => estoque.reduce((s, l) => s + l.qtd, 0);

  const possiveis = () => {
    const p = [];
    if (tipos.includes("compras")) p.push("compraVista", "compraPrazo", "compraPrazo");
    // uma venda precisa de mais um fato depois dela (a baixa do CMV)
    if (tipos.includes("vendas") && qtdEstoque() >= 5 && fatos.length < quantidade - 1) p.push("vendaVista", "vendaPrazo", "vendaPrazo");
    if (tipos.includes("liquidacoes")) { if (fornecedores.length) p.push("pagaFornecedor"); if (clientes.length) p.push("recebeCliente"); }
    if (tipos.includes("despesas")) p.push("despesa", "despesa");
    if (tipos.includes("financeiras")) { p.push(emprestimo ? "juros" : "emprestimo", aplicacao ? "rendimento" : "aplicacao"); }
    if (tipos.includes("imobilizado")) p.push("imobilizado");
    // se só há vendas marcadas, garante compras para ter estoque
    if (!p.length && tipos.includes("vendas")) p.push("compraVista");
    return p;
  };

  while (fatos.length < quantidade) {
    const opcoes = possiveis();
    if (!opcoes.length) break;
    const tipo = r.item(opcoes);
    const banco = r.item(BANCOS);
    const lim = (v) => Math.min(Math.max(v, minimo), maximo);
    let f = null;
    if (tipo === "compraVista" || tipo === "compraPrazo") {
      const unit = r.valor(Math.max(minimo / 50, 5), Math.max(maximo / 20, 10), 1);
      const qtd = Math.max(5, Math.round(lim(r.valor(minimo, maximo, 10)) / unit / 5) * 5);
      const valor = arred(qtd * unit);
      estoque.push({ qtd, unit });
      if (tipo === "compraVista") {
        const caixa = r.rnd() < 0.4;
        f = { tipo: "compra", texto: `A empresa comprou ${qtd} unidades de mercadorias a ${moeda(unit)} cada, pagando à vista ${caixa ? "em dinheiro (Caixa)" : `pelo ${banco[1]}`} — total de ${moeda(valor)}.`,
          gabarito: { contaDebito: "1.1.3.01", contaCredito: caixa ? "1.1.1.01" : banco[0], valor, quantidade: qtd } };
      } else {
        fornecedores.push({ valor, n: fatos.length + 1 });
        f = { tipo: "compra", texto: `A empresa comprou ${qtd} unidades de mercadorias a prazo do fornecedor, a ${moeda(unit)} cada — total de ${moeda(valor)}.`,
          gabarito: { contaDebito: "1.1.3.01", contaCredito: FORNECEDORES, valor, quantidade: qtd } };
      }
    } else if (tipo === "vendaVista" || tipo === "vendaPrazo") {
      const disponivel = qtdEstoque();
      const qtd = Math.max(1, Math.min(disponivel, Math.round(disponivel * (0.2 + r.rnd() * 0.5))));
      // custo médio dos lotes da lista, só para o preço de venda ficar realista
      const custoMedio = estoque.reduce((s, l) => s + l.qtd * l.unit, 0) / disponivel;
      const valor = arred(Math.round(qtd * custoMedio * (1.3 + r.rnd() * 0.6) / 10) * 10);
      let falta = qtd;
      while (falta > 0 && estoque.length) { const l = estoque[0]; const u = Math.min(l.qtd, falta); l.qtd -= u; falta -= u; if (!l.qtd) estoque.shift(); }
      if (tipo === "vendaVista") {
        f = { tipo: "venda", texto: `A empresa vendeu ${qtd} unidades de mercadorias à vista, recebendo ${moeda(valor)} no ${banco[1]}.`,
          gabarito: { contaDebito: banco[0], contaCredito: "4.1.1.01", valor } };
      } else {
        clientes.push({ valor, n: fatos.length + 1 });
        f = { tipo: "venda", texto: `A empresa vendeu ${qtd} unidades de mercadorias a prazo para um cliente, no valor de ${moeda(valor)}.`,
          gabarito: { contaDebito: CLIENTES, contaCredito: "4.1.1.01", valor } };
      }
      fatos.push({ ...f, n: fatos.length + 1 });
      if (fatos.length < quantidade) {
        f = { tipo: "cmv", soPermanente: true, texto: `Registre a baixa do custo das mercadorias vendidas (CMV) referente à venda do fato ${fatos.length} (${qtd} unidades).`,
          gabarito: { contaDebito: "6.2.01", contaCredito: "1.1.3.01", valor: null, quantidade: qtd } };
      } else f = null;
    } else if (tipo === "pagaFornecedor") {
      const c = fornecedores.shift();
      f = { tipo: "liquidacao", texto: `A empresa pagou ao fornecedor a duplicata referente à compra do fato ${c.n} (${moeda(c.valor)}), pelo ${banco[1]}.`,
        gabarito: { contaDebito: FORNECEDORES, contaCredito: banco[0], valor: c.valor } };
    } else if (tipo === "recebeCliente") {
      const c = clientes.shift();
      f = { tipo: "liquidacao", texto: `A empresa recebeu do cliente a duplicata referente à venda do fato ${c.n} (${moeda(c.valor)}), no ${banco[1]}.`,
        gabarito: { contaDebito: banco[0], contaCredito: CLIENTES, valor: c.valor } };
    } else if (tipo === "despesa") {
      const [conta, nome] = r.item(DESPESAS);
      const valor = r.valor(Math.max(minimo / 5, 50), Math.max(maximo / 3, 100), 10);
      const caixa = r.rnd() < 0.3;
      f = { tipo: "despesa", texto: `A empresa pagou ${nome}, no valor de ${moeda(valor)}, ${caixa ? "em dinheiro (Caixa)" : `pelo ${banco[1]}`}.`,
        gabarito: { contaDebito: conta, contaCredito: caixa ? "1.1.1.01" : banco[0], valor } };
    } else if (tipo === "emprestimo") {
      const valor = r.valor(minimo, maximo * 2, 100);
      emprestimo = valor;
      f = { tipo: "financeira", texto: `A empresa obteve um empréstimo bancário de curto prazo de ${moeda(valor)}, creditado no ${banco[1]}.`,
        gabarito: { contaDebito: banco[0], contaCredito: "2.1.9.01", valor } };
    } else if (tipo === "juros") {
      const valor = arred(Math.max(10, Math.round(emprestimo * (0.01 + r.rnd() * 0.02))));
      f = { tipo: "financeira", texto: `O banco debitou ${moeda(valor)} de juros do empréstimo no ${banco[1]}.`,
        gabarito: { contaDebito: "5.3.01", contaCredito: banco[0], valor } };
    } else if (tipo === "aplicacao") {
      const valor = r.valor(minimo, maximo, 100);
      aplicacao = valor;
      f = { tipo: "financeira", texto: `A empresa aplicou ${moeda(valor)} do Banco X em uma aplicação de liquidez imediata no próprio Banco X.`,
        gabarito: { contaDebito: "1.1.1.03.01", contaCredito: "1.1.1.02.01", valor } };
    } else if (tipo === "rendimento") {
      const valor = arred(Math.max(5, Math.round(aplicacao * (0.005 + r.rnd() * 0.01))));
      f = { tipo: "financeira", texto: `A aplicação do Banco X rendeu ${moeda(valor)} no mês (rendimento creditado na própria aplicação).`,
        gabarito: { contaDebito: "1.1.1.03.01", contaCredito: "4.3.02", valor } };
    } else if (tipo === "imobilizado") {
      const [conta, nome] = r.item(IMOBILIZADOS);
      const valor = r.valor(minimo, maximo, 50);
      const prazo = r.rnd() < 0.4;
      f = { tipo: "imobilizado", texto: `A empresa comprou ${nome} para uso próprio por ${moeda(valor)}, ${prazo ? "a prazo (financiamento bancário)" : `pagando à vista pelo ${banco[1]}`}.`,
        gabarito: { contaDebito: conta, contaCredito: prazo ? "2.1.9.02" : banco[0], valor } };
    }
    if (f) fatos.push({ ...f, n: fatos.length + 1 });
  }
  // datas em ordem crescente dentro do período
  const passo = total / Math.max(fatos.length, 1);
  fatos.forEach((f, i) => {
    const d = new Date(d0); d.setDate(d0.getDate() + Math.min(total, Math.round(i * passo)));
    f.data = d.toISOString().slice(0, 10);
    f.texto = `${dataBR(f.data)} — ${f.texto}`;
  });
  return fatos.slice(0, quantidade);
}

// ---------- gravação (turmas/{id}/listas) ----------
export async function listasDaTurma(turmaId, soEnviadas) {
  const ref = collection(db, "turmas", turmaId, "listas");
  const s = await getDocs(soEnviadas ? query(ref, where("enviada", "==", true)) : ref);
  return s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.criadaEm?.toMillis?.() || 0) - (b.criadaEm?.toMillis?.() || 0));
}

export async function salvarLista(turma, lista, enviar) {
  const dados = { titulo: lista.titulo, fatos: lista.fatos, prazo: lista.prazo || "", enviada: !!enviar, configuracao: lista.configuracao || {} };
  if (enviar) dados.enviadaEm = serverTimestamp();
  if (lista.id) await updateDoc(doc(db, "turmas", turma.id, "listas", lista.id), dados);
  else await addDoc(collection(db, "turmas", turma.id, "listas"), { ...dados, criadaEm: serverTimestamp() });
  auditar(enviar ? "Enviou lista de exercícios" : "Salvou lista de exercícios", `${lista.titulo} (${lista.fatos.length} fatos) — ${turma.nome}`);
}

export async function excluirLista(turma, lista) {
  await deleteDoc(doc(db, "turmas", turma.id, "listas", lista.id));
  auditar("Excluiu lista de exercícios", `${lista.titulo} — ${turma.nome}`);
}

// ---------- correção: compara o lançamento do aluno com o gabarito ----------
// valorEsperado: para a baixa do CMV, o custo calculado pelo estoque e método do aluno
export function corrigir(lancamento, fato, valorEsperado) {
  if (!lancamento || !fato) return null;
  const g = fato.gabarito;
  const esperado = g.valor ?? valorEsperado;
  const erros = [];
  const aceita = (v, ok) => (Array.isArray(ok) ? ok.includes(v) : v === ok);
  if (!aceita(lancamento.contaDebito, g.contaDebito)) erros.push("conta a débito");
  if (!aceita(lancamento.contaCredito, g.contaCredito)) erros.push("conta a crédito");
  if (esperado != null && Math.abs(Number(lancamento.valor) - Number(esperado)) > 0.005) erros.push("valor");
  if (g.quantidade && Number(lancamento.quantidade) !== Number(g.quantidade)) erros.push("quantidade");
  return { ok: erros.length === 0, erros };
}

// gabarito dos 10 fatos orientados da CB (contas equivalentes também são aceitas)
export const GABARITO_ORIENTADOS = [
  { contaDebito: "1.1.3.01", contaCredito: "1.1.1.01", valor: 2000, quantidade: 100 },
  { contaDebito: "1.1.3.01", contaCredito: FORNECEDORES, valor: 1250, quantidade: 50 },
  { contaDebito: "1.1.1.02.01", contaCredito: "4.1.1.01", valor: 3000 },
  { contaDebito: "6.2.01", contaCredito: "1.1.3.01", valor: null, quantidade: 40 },
  { contaDebito: CLIENTES, contaCredito: "4.1.1.01", valor: 2400 },
  { contaDebito: "6.2.01", contaCredito: "1.1.3.01", valor: null, quantidade: 30 },
  { contaDebito: FORNECEDORES, contaCredito: "1.1.1.02.02", valor: 1250 },
  { contaDebito: "1.1.1.02.01", contaCredito: CLIENTES, valor: 2400 },
  { contaDebito: "5.1.14", contaCredito: "1.1.1.02.02", valor: 800 },
  { contaDebito: "5.1.02", contaCredito: "1.1.1.02.01", valor: 3500 },
];
