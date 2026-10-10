// Listas de exercícios geradas pelo professor (aprovado em 04/10/2026):
// o professor escolhe quantidade, tipos de operação, faixa de valores e período;
// o CTC monta uma sequência coerente de fatos, cada um com o gabarito
// (débito, crédito e valor). A mesma lista vai para a turma inteira.
// Fatos de baixa do CMV não têm valor fixo no gabarito: o custo depende do
// estoque e do método de cada aluno, e é calculado na correção.
import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../firebase";
import { auditar } from "./auditoria";
import { guardarNaLixeiraDaTurma } from "./lixeira";
import { arred, CONTAS_ESTOQUE, dinheiro, dataBR, partidasDe } from "./contabil";
import { custoDaSaida } from "./estoque";
import { liberarGabarito, salvarGabarito, semGabarito } from "./questoes";
import { configLancamentos } from "./modelos";

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
    if (tipos.includes("compras")) p.push("compraVista", "compraPrazo", "compraPrazo", "compraMista");
    if (tipos.includes("vendas") && qtdEstoque() >= 5) p.push("vendaVista", "vendaPrazo", "vendaPrazo");
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
    if (tipo === "compraVista" || tipo === "compraPrazo" || tipo === "compraMista") {
      const unit = r.valor(Math.max(minimo / 50, 5), Math.max(maximo / 20, 10), 1);
      const qtd = Math.max(5, Math.round(lim(r.valor(minimo, maximo, 10)) / unit / 5) * 5);
      const valor = arred(qtd * unit);
      estoque.push({ qtd, unit });
      if (tipo === "compraMista") {
        // lançamento composto: parte à vista, parte a prazo
        const vista = arred(Math.round(valor * (0.3 + r.rnd() * 0.4) / 10) * 10);
        const prazo = arred(valor - vista);
        fornecedores.push({ valor: prazo, n: fatos.length + 1 });
        f = { tipo: "compra", texto: `A empresa comprou ${qtd} unidades de mercadorias a ${moeda(unit)} cada — total de ${moeda(valor)} —, pagando ${moeda(vista)} à vista pelo ${banco[1]} e o restante (${moeda(prazo)}) a prazo.`,
          gabarito: { partidas: [
            { d: "D", conta: "1.1.3.01", valor, quantidade: qtd },
            { d: "C", conta: banco[0], valor: vista },
            { d: "C", conta: FORNECEDORES, valor: prazo },
          ] } };
      } else if (tipo === "compraVista") {
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
      // a venda já inclui a baixa do CMV (custo pelo estoque e método de cada aluno; não se aplica no periódico)
      const cmv = [
        { d: "D", conta: "6.2.01", valor: null, soPermanente: true },
        { d: "C", conta: "1.1.3.01", valor: null, quantidade: qtd, soPermanente: true },
      ];
      if (tipo === "vendaVista") {
        f = { tipo: "venda", texto: `A empresa vendeu ${qtd} unidades de mercadorias à vista, recebendo ${moeda(valor)} no ${banco[1]}. Registre a venda e a baixa do CMV.`,
          gabarito: { partidas: [{ d: "D", conta: banco[0], valor }, { d: "C", conta: "4.1.1.01", valor }, ...cmv] } };
      } else {
        clientes.push({ valor, n: fatos.length + 1 });
        f = { tipo: "venda", texto: `A empresa vendeu ${qtd} unidades de mercadorias a prazo para um cliente, no valor de ${moeda(valor)}. Registre a venda e a baixa do CMV.`,
          gabarito: { partidas: [{ d: "D", conta: CLIENTES, valor }, { d: "C", conta: "4.1.1.01", valor }, ...cmv] } };
      }
    } else if (tipo === "pagaFornecedor") {
      const c = fornecedores.shift();
      f = { tipo: "pagamento", texto: `A empresa pagou ao fornecedor a duplicata referente à compra do fato ${c.n} (${moeda(c.valor)}), pelo ${banco[1]}.`,
        gabarito: { contaDebito: FORNECEDORES, contaCredito: banco[0], valor: c.valor } };
    } else if (tipo === "recebeCliente") {
      const c = clientes.shift();
      f = { tipo: "recebimento", texto: `A empresa recebeu do cliente a duplicata referente à venda do fato ${c.n} (${moeda(c.valor)}), no ${banco[1]}.`,
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
  // gabarito sempre em partidas (débitos e créditos)
  fatos.forEach((f) => { f.gabarito = emPartidas(f.gabarito); });
  // datas em ordem crescente dentro do período
  const passo = total / Math.max(fatos.length, 1);
  fatos.forEach((f, i) => {
    const d = new Date(d0); d.setDate(d0.getDate() + Math.min(total, Math.round(i * passo)));
    f.data = d.toISOString().slice(0, 10);
    f.texto = `${dataBR(f.data)} — ${f.texto}`;
  });
  return fatos.slice(0, quantidade);
}

// ---------- lista-modelo "Regime de competência" (aprovada em 06/10/2026) ----------
// mes = "AAAA-MM": a folha, o seguro, o aluguel a pagar e o aluguel a receber são do mês;
// pagamentos e recebimentos acontecem no mês seguinte. Usa 2.1.2.03 Aluguéis a Pagar.
export function listaModeloCompetencia(mes) {
  const [a, m] = mes.split("-").map(Number);
  const iso = (ano, mm, dia) => `${ano}-${String(mm).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
  const ultimo = new Date(a, m, 0).getDate();
  const [a2, m2] = m === 12 ? [a + 1, 1] : [a, m + 1];
  const d1 = iso(a, m, 1); const dFim = iso(a, m, ultimo);
  const d5 = iso(a2, m2, 5); const d7 = iso(a2, m2, 7); const d10 = iso(a2, m2, 10);
  const BX = "1.1.1.02.01";
  const P = (d, conta, valor) => ({ d, conta, valor });
  const fatos = [
    { data: d1, tipo: "livre", texto: "Pagou pelo Banco X o seguro anual da loja, R$ 2.400,00, com cobertura a partir deste mês.", partidas: [P("D", "1.1.4.01", 2400), P("C", BX, 2400)] },
    { data: dFim, tipo: "despesa", texto: "Apropriação do seguro do mês (1/12 do seguro anual): R$ 200,00.", partidas: [P("D", "5.1.07", 200), P("C", "1.1.4.01", 200)] },
    { data: dFim, tipo: "despesa", texto: "Folha de pagamento do mês: salários brutos de R$ 6.000,00, a pagar no dia 5 do mês seguinte.", partidas: [P("D", "5.1.02", 6000), P("C", "2.1.3.01", 6000)] },
    { data: dFim, tipo: "despesa", texto: "Encargos patronais da folha do mês: INSS patronal de 20% (R$ 1.200,00) e FGTS de 8% (R$ 480,00).", partidas: [P("D", "5.1.03", 1680), P("C", "2.1.4.01", 1200), P("C", "2.1.4.03", 480)] },
    { data: dFim, tipo: "livre", texto: "Descontos dos empregados na folha do mês: INSS de 9% (R$ 540,00) e IRRF de 2,5% (R$ 150,00).", partidas: [P("D", "2.1.3.01", 690), P("C", "2.1.8.11", 540), P("C", "2.1.8.10", 150)] },
    { data: dFim, tipo: "despesa", texto: "Aluguel da loja referente a este mês, R$ 1.500,00, a pagar no dia 10 do mês seguinte.", partidas: [P("D", "5.1.14", 1500), P("C", "2.1.2.03", 1500)] },
    { data: dFim, tipo: "livre", texto: "Aluguel de uma sala sublocada a terceiros, referente a este mês, R$ 800,00, a receber no dia 10 do mês seguinte.", partidas: [P("D", "1.1.2.10", 800), P("C", "4.4.01", 800)] },
    { data: d5, tipo: "pagamento", texto: "Pagou pelo Banco X os salários líquidos da folha do mês anterior.", partidas: [P("D", "2.1.3.01", 5310), P("C", BX, 5310)] },
    { data: d7, tipo: "pagamento", texto: "Recolheu pelo Banco X o INSS (patronal e retido dos empregados), o FGTS e o IRRF da folha do mês anterior.", partidas: [P("D", "2.1.4.01", 1200), P("D", "2.1.8.11", 540), P("D", "2.1.4.03", 480), P("D", "2.1.8.10", 150), P("C", BX, 2370)] },
    { data: d10, tipo: "pagamento", texto: "Pagou pelo Banco X o aluguel da loja do mês anterior.", partidas: [P("D", "2.1.2.03", 1500), P("C", BX, 1500)] },
    { data: d10, tipo: "recebimento", texto: "Recebeu no Banco X o aluguel da sala sublocada do mês anterior.", partidas: [P("D", BX, 800), P("C", "1.1.2.10", 800)] },
  ];
  return fatos.map((f, i) => ({ n: i + 1, tipo: f.tipo, data: f.data, texto: `${dataBR(f.data)} — ${f.texto}`, gabarito: emPartidas({ partidas: f.partidas }) }));
}

// ---------- gravação (turmas/{id}/listas) ----------
export async function listasDaTurma(turmaId, soEnviadas) {
  const ref = collection(db, "turmas", turmaId, "listas");
  const s = await getDocs(soEnviadas ? query(ref, where("enviada", "==", true)) : ref);
  return s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.criadaEm?.toMillis?.() || 0) - (b.criadaEm?.toMillis?.() || 0));
}

// finalidade: "sala" (praticar, correção na hora), "avaliativa" (compõe a nota) ou
// "recuperacao" (recuperação paralela de uma lista avaliativa — recuperacaoDe = id da original)
export const FINALIDADES = {
  sala: { nome: "Exercício de sala", curto: "Sala", selo: "cinza" },
  avaliativa: { nome: "Exercício avaliativo", curto: "Avaliativo", selo: "ocre" },
  recuperacao: { nome: "Recuperação paralela", curto: "Recuperação", selo: "ocre" },
};
export const finalidadeDe = (l) => l?.finalidade || "sala";
export const valeNota = (l) => ["avaliativa", "recuperacao"].includes(finalidadeDe(l));

// nível de ajuda dos lançamentos numa lista de escrituração (aprovado em 05/10/2026):
// o professor escolhe por lista; sem escolha, a avaliativa e a recuperação usam "livre"
// e o exercício de sala usa o padrão da turma
export function ajudaDaLista(lista, turma) {
  if (lista?.ajuda) return lista.ajuda;
  if (lista && valeNota(lista)) return "livre";
  return configLancamentos(turma).ajuda;
}

export const tipoListaDe = (l) => l?.tipoLista || "escrituracao";
export const ehQuestoes = (l) => tipoListaDe(l) === "questoes";

export async function salvarLista(turma, lista, enviar) {
  const questoes = ehQuestoes(lista);
  const fin = finalidadeDe(lista);
  const dados = {
    titulo: lista.titulo, fatos: questoes ? [] : lista.fatos, prazo: lista.prazo || "", enviada: !!enviar, configuracao: lista.configuracao || {},
    finalidade: fin, peso: Number(lista.peso) || 1, recuperacaoDe: lista.recuperacaoDe || null, tipoLista: tipoListaDe(lista),
    ajuda: questoes ? null : lista.ajuda || null,
  };
  // questões: no exercício de sala o gabarito vai junto (correção na hora); no avaliativo, fica num registro só do professor
  if (questoes) dados.questoes = fin === "sala" ? lista.questoes : lista.questoes.map(semGabarito);
  if (enviar) dados.enviadaEm = serverTimestamp();
  let id = lista.id;
  if (id) await updateDoc(doc(db, "turmas", turma.id, "listas", id), dados);
  else id = (await addDoc(collection(db, "turmas", turma.id, "listas"), { ...dados, criadaEm: serverTimestamp() })).id;
  if (questoes) await salvarGabarito(turma.id, id, lista.questoes);
  const qtd = questoes ? `${lista.questoes.length} questões` : `${lista.fatos.length} fatos`;
  auditar(enviar ? "Enviou lista de exercícios" : "Salvou lista de exercícios", `${lista.titulo} (${FINALIDADES[fin].nome}, ${qtd}) — ${turma.nome}`);
  return id;
}

// liberar (ou ocultar) para os alunos a correção de uma lista avaliativa
export async function liberarResultado(turma, lista, liberar) {
  if (ehQuestoes(lista)) return liberarGabarito(turma, lista, liberar);
  await updateDoc(doc(db, "turmas", turma.id, "listas", lista.id), { resultadoLiberado: !!liberar });
  auditar(liberar ? "Liberou o resultado da lista" : "Ocultou o resultado da lista", `${lista.titulo} — ${turma.nome}`);
}

export async function marcarListaFechada(turma, lista) {
  await updateDoc(doc(db, "turmas", turma.id, "listas", lista.id), { fechada: true, fechadaEm: serverTimestamp() });
}

export async function excluirLista(turma, lista) {
  // lixeira de segurança: a lista fica guardada (o gabarito e as respostas continuam no lugar)
  await guardarNaLixeiraDaTurma(turma.id, { tipo: "lista", dados: lista, resumo: lista.titulo, motivo: "exclusão" });
  await deleteDoc(doc(db, "turmas", turma.id, "listas", lista.id));
  auditar("Excluiu lista de exercícios", `${lista.titulo} — ${turma.nome}`);
}

// ---------- gabarito em partidas ----------
// formato simples { contaDebito, contaCredito, valor, quantidade } vira partidas
export function emPartidas(g) {
  if (!g || g.partidas) return g;
  const estoqueD = g.contaDebito === "1.1.3.01";
  return { partidas: [
    { d: "D", conta: g.contaDebito, valor: g.valor, ...(estoqueD && g.quantidade ? { quantidade: g.quantidade } : {}) },
    { d: "C", conta: g.contaCredito, valor: g.valor, ...(!estoqueD && g.quantidade ? { quantidade: g.quantidade } : {}) },
  ] };
}

// ---------- correção: compara as partidas do aluno com o gabarito ----------
// ctx.cmv: custo esperado da baixa (pelo estoque e método do aluno); ctx.periodico: ignora a baixa do CMV
export function corrigir(partidasAluno, fato, ctx = {}) {
  if (!fato?.gabarito) return null;
  const esperado = emPartidas(fato.gabarito).partidas.filter((p) => !(ctx.periodico && p.soPermanente));
  const aceita = (v, ok) => (Array.isArray(ok) ? ok.includes(v) : v === ok);
  const erros = new Set();
  const usadas = new Set();
  for (const e of esperado) {
    const i = partidasAluno.findIndex((p, k) => !usadas.has(k) && p.d === e.d && aceita(p.conta, e.conta));
    if (i < 0) { erros.add(e.d === "D" ? "conta a débito" : "conta a crédito"); continue; }
    usadas.add(i);
    const p = partidasAluno[i];
    const valorEsperado = e.valor ?? ctx.cmv;
    if (valorEsperado != null && Math.abs(Number(p.valor) - Number(valorEsperado)) > 0.005) erros.add("valor");
    if (e.quantidade && Number(p.quantidade) !== Number(e.quantidade)) erros.add("quantidade");
  }
  // com tributos ligados na turma, as linhas de ICMS/PIS/COFINS/Simples não contam como "a mais"
  const tributo = (c) => /^(4\.2\.|2\.1\.8\.|1\.1\.2\.1[1-5])/.test(c || "");
  partidasAluno.forEach((p, k) => {
    if (usadas.has(k) || (ctx.tributos && tributo(p.conta))) return;
    erros.add(p.d === "D" ? "conta a débito a mais" : "conta a crédito a mais");
  });
  return { ok: erros.size === 0, erros: [...erros] };
}

// correção de um lançamento do aluno: para a baixa do CMV, o custo vem do estoque e do método dele
export function corrigirLancamento(l, fato, lancamentos, ctx = {}) {
  if (!l || !fato) return null;
  const partidas = partidasDe(l);
  const q = partidas.filter((p) => p.d === "C" && CONTAS_ESTOQUE.includes(p.conta)).reduce((s, p) => s + (Number(p.quantidade) || 0), 0);
  const cmv = !ctx.periodico && q > 0 ? custoDaSaida(lancamentos, ctx.metodo || "peps", q, l.data, l.id).custo : null;
  return corrigir(partidas, fato, { cmv, periodico: ctx.periodico, tributos: ctx.tributos });
}

// nota de 0 a 10 numa lista: acertos ÷ total de fatos × 10 (fato não lançado conta como erro)
export function notaDaLista(lista, lancamentos, ctx) {
  const total = lista.fatos?.length || 0;
  if (!total) return { nota: 0, acertos: 0, total: 0, lancados: 0 };
  let acertos = 0;
  let lancados = 0;
  for (const f of lista.fatos) {
    const l = (lancamentos || []).find((x) => x.lista?.id === lista.id && x.lista?.n === f.n);
    if (!l) continue;
    lancados++;
    if (corrigirLancamento(l, f, lancamentos, ctx)?.ok) acertos++;
  }
  return { nota: Math.round((acertos / total) * 100) / 10, acertos, total, lancados };
}

// gabarito dos 8 fatos orientados da CB (contas equivalentes também são aceitas)
const CMV_ORIENTADO = (q) => [{ d: "D", conta: "6.2.01", valor: null, soPermanente: true }, { d: "C", conta: "1.1.3.01", valor: null, quantidade: q, soPermanente: true }];
export const GABARITO_ORIENTADOS = [
  { partidas: [{ d: "D", conta: "1.1.3.01", valor: 2000, quantidade: 100 }, { d: "C", conta: "1.1.1.01", valor: 2000 }] },
  { partidas: [{ d: "D", conta: "1.1.3.01", valor: 1250, quantidade: 50 }, { d: "C", conta: FORNECEDORES, valor: 1250 }] },
  { partidas: [{ d: "D", conta: "1.1.1.02.01", valor: 3000 }, { d: "C", conta: "4.1.1.01", valor: 3000 }, ...CMV_ORIENTADO(40)] },
  { partidas: [{ d: "D", conta: CLIENTES, valor: 2400 }, { d: "C", conta: "4.1.1.01", valor: 2400 }, ...CMV_ORIENTADO(30)] },
  { partidas: [{ d: "D", conta: FORNECEDORES, valor: 1250 }, { d: "C", conta: "1.1.1.02.02", valor: 1250 }] },
  { partidas: [{ d: "D", conta: "1.1.1.02.01", valor: 2400 }, { d: "C", conta: CLIENTES, valor: 2400 }] },
  { partidas: [{ d: "D", conta: "5.1.14", valor: 800 }, { d: "C", conta: "1.1.1.02.02", valor: 800 }] },
  { partidas: [{ d: "D", conta: "5.1.02", valor: 3500 }, { d: "C", conta: "1.1.1.02.01", valor: 3500 }] },
];
