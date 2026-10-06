// Exercícios práticos dos módulos (aparecem na página do módulo, abaixo da teoria).
// Chave: "{disciplina}-{nº do módulo}". O aluno pratica sozinho, com correção na hora;
// não vale nota (para nota, o professor usa as listas da turma).

// Plano simplificado de contas para os balanços sucessivos.
// O mesmo nome pode existir em dois grupos (ex.: Financiamentos a Pagar no PC e no PNC):
// o aluno escolhe também o grupo, e isso faz parte do exercício.
export const GRUPOS_BALANCO = [
  { id: "ac", nome: "Ativo Circulante", lado: "ativo" },
  { id: "anc", nome: "Ativo Não Circulante", lado: "ativo" },
  { id: "pc", nome: "Passivo Circulante", lado: "passivo" },
  { id: "pnc", nome: "Passivo Não Circulante", lado: "passivo" },
  { id: "pl", nome: "Patrimônio Líquido", lado: "passivo" },
];

export const CONTAS_BALANCO = [
  { id: "caixa", nome: "Caixa", grupo: "ac" },
  { id: "bancos", nome: "Bancos Conta Movimento", grupo: "ac" },
  { id: "aplicacao", nome: "Aplicações Financeiras", grupo: "ac" },
  { id: "clientes", nome: "Clientes (Duplicatas a Receber)", grupo: "ac" },
  { id: "mercadorias", nome: "Mercadorias para Revenda", grupo: "ac" },
  { id: "terrenos", nome: "Terrenos", grupo: "anc" },
  { id: "edificacoes", nome: "Edificações (Prédios)", grupo: "anc" },
  { id: "veiculos", nome: "Veículos", grupo: "anc" },
  { id: "moveis", nome: "Móveis e Utensílios", grupo: "anc" },
  { id: "maquinas", nome: "Máquinas e Equipamentos", grupo: "anc" },
  { id: "fornecedores", nome: "Fornecedores", grupo: "pc" },
  { id: "salarios", nome: "Salários a Pagar", grupo: "pc" },
  { id: "emprestimos_cp", nome: "Empréstimos a Pagar", grupo: "pc" },
  { id: "fin_cp", nome: "Financiamentos a Pagar", grupo: "pc" },
  { id: "emprestimos_lp", nome: "Empréstimos a Pagar", grupo: "pnc" },
  { id: "fin_lp", nome: "Financiamentos a Pagar", grupo: "pnc" },
  { id: "capital", nome: "Capital Social", grupo: "pl" },
  { id: "capital_integralizar", nome: "(−) Capital a Integralizar", grupo: "pl", redutora: true },
  { id: "reservas", nome: "Reservas de Lucros", grupo: "pl" },
];

// Balanços sucessivos da Cia. Vamos que Vamos Ltda. — material do prof. Jorge Cardoso (4.2),
// corrigido em 05/10/2026: fato 01 com capital de R$ 300.000,00 (o enunciado dizia 35.000,00);
// fato 06 com Veículos 80.000,00 e Móveis 25.000,00 (estavam trocados); fato 06 com o
// financiamento em 24 parcelas mensais iguais (12 no circulante, 12 no não circulante).
const CIA_VAMOS = {
  id: "cb-bs-cia-vamos",
  tipo: "balanco-sucessivo",
  titulo: "Balanços sucessivos — Cia. Vamos que Vamos Ltda.",
  instrucao: "Monte o Balanço Patrimonial depois de cada fato. Adicione as contas, escolhendo o grupo certo, e informe o saldo de cada uma. O balanço de cada fato começa do balanço correto do fato anterior.",
  fatos: [
    {
      texto: "Integralização de Capital no valor de R$ 300.000,00. O montante capitalizado foi dividido em: uma sala comercial que será a sede da empresa, no valor de R$ 70.000,00; um veículo no valor de R$ 25.000,00; e o restante em moeda corrente.",
      saldos: { caixa: 205000, edificacoes: 70000, veiculos: 25000, capital: 300000 },
      explicacao: "Os sócios entregaram R$ 300.000,00 em bens: Edificações R$ 70.000,00, Veículos R$ 25.000,00 e Caixa R$ 205.000,00 (300.000 − 70.000 − 25.000). Em contrapartida, surge o Capital Social de R$ 300.000,00 no PL.",
    },
    {
      texto: "A empresa resolveu abrir uma conta no Banco do Comércio S/A e depositou na conta corrente o valor de R$ 195.000,00.",
      saldos: { caixa: 10000, bancos: 195000, edificacoes: 70000, veiculos: 25000, capital: 300000 },
      explicacao: "Fato permutativo dentro do Ativo: sai dinheiro do Caixa (205.000 − 195.000 = 10.000) e entra em Bancos Conta Movimento (195.000). O total não muda.",
    },
    {
      texto: "Transferiu R$ 95.000,00 para uma aplicação financeira no Banco do Comércio S/A.",
      saldos: { caixa: 10000, bancos: 100000, aplicacao: 95000, edificacoes: 70000, veiculos: 25000, capital: 300000 },
      explicacao: "Permutativo: Bancos diminui (195.000 − 95.000 = 100.000) e Aplicações Financeiras aumenta 95.000. O total continua R$ 300.000,00.",
    },
    {
      texto: "Comprou móveis e utensílios (mesas, cadeiras, prateleiras, entre outros) para a sede, no valor de R$ 25.000,00, emitindo um cheque para pagamento à vista.",
      saldos: { caixa: 10000, bancos: 75000, aplicacao: 95000, edificacoes: 70000, veiculos: 25000, moveis: 25000, capital: 300000 },
      explicacao: "Permutativo: entra Móveis e Utensílios (Ativo Não Circulante) e sai dinheiro de Bancos, pois o pagamento foi em cheque (100.000 − 25.000 = 75.000).",
    },
    {
      texto: "Comprou mercadorias para revenda no valor de R$ 160.000,00, com entrada de R$ 32.000,00 à vista por transferência bancária e o restante para 30 e 60 dias. Houve ainda aumento de Capital em dinheiro, R$ 20.000,00, mantido no cofre da empresa.",
      saldos: { caixa: 30000, bancos: 43000, aplicacao: 95000, mercadorias: 160000, edificacoes: 70000, veiculos: 25000, moveis: 25000, fornecedores: 128000, capital: 320000 },
      explicacao: "Compra: entram Mercadorias R$ 160.000,00; sai de Bancos a entrada (75.000 − 32.000 = 43.000); o restante (128.000) vira Fornecedores no Passivo Circulante, pois vence em 30 e 60 dias. Aumento de capital: Caixa 10.000 + 20.000 = 30.000 e Capital Social 300.000 + 20.000 = 320.000. Total: R$ 448.000,00.",
    },
    {
      texto: "Comprou um veículo por meio de financiamento, no valor de R$ 55.000,00, com entrada de R$ 5.000,00 paga pelo caixa e o saldo em 24 parcelas mensais iguais.",
      saldos: { caixa: 25000, bancos: 43000, aplicacao: 95000, mercadorias: 160000, edificacoes: 70000, veiculos: 80000, moveis: 25000, fornecedores: 128000, fin_cp: 25000, fin_lp: 25000, capital: 320000 },
      explicacao: "Veículos 25.000 + 55.000 = 80.000; Caixa 30.000 − 5.000 = 25.000. O saldo financiado (50.000) é dividido: as 12 parcelas que vencem nos próximos 12 meses (25.000) vão para o Passivo Circulante e as outras 12 (25.000) para o Passivo Não Circulante. Total: R$ 498.000,00.",
    },
  ],
};

// Razonetes (Módulo 03 — Débito e Crédito), aprovado em 05/10/2026.
// Contas com os códigos do plano do CTC; algumas não são usadas nos fatos (o aluno precisa escolher).
export const CONTAS_RAZONETE = [
  { codigo: "1.1.1.01", nome: "Caixa Geral" },
  { codigo: "1.1.1.02.01", nome: "Banco X" },
  { codigo: "1.1.2.01", nome: "Duplicatas a Receber" },
  { codigo: "1.1.3.01", nome: "Mercadorias para Revenda" },
  { codigo: "1.2.3.02", nome: "Móveis e Utensílios" },
  { codigo: "1.2.3.07", nome: "Equipamentos de Informática" },
  { codigo: "2.1.1.01", nome: "Duplicatas a Pagar" },
  { codigo: "2.1.3.01", nome: "Salários a Pagar" },
  { codigo: "2.1.9.01", nome: "Empréstimos Bancários" },
  { codigo: "3.1.01", nome: "Capital Subscrito" },
  { codigo: "4.1.1.01", nome: "Receita de Vendas de Mercadorias" },
  { codigo: "4.1.1.03", nome: "Receita de Prestação de Serviços" },
  { codigo: "4.3.01", nome: "Juros Ativos" },
  { codigo: "5.1.04", nome: "Energia Elétrica" },
  { codigo: "5.1.14", nome: "Aluguéis" },
  { codigo: "5.3.01", nome: "Juros Passivos" },
  { codigo: "6.2.01", nome: "Custo das Mercadorias Vendidas (CMV)" },
];

// fatos: partidas [{ d: "D" | "C", conta, valor }]; base: material 6 e 6.1 do prof. Jorge Cardoso
const RAZONETES_SERVICOS = {
  id: "cb-raz-servicos",
  tipo: "razonetes",
  titulo: "Razonetes — Prestadora de Serviços Exemplo Ltda.",
  instrucao: "Faça o lançamento de cada fato: escolha a conta, o lado (débito ou crédito) e o valor. Depois de conferido, o lançamento vai para os razonetes. No fim, apure o saldo de cada razonete.",
  fatos: [
    { texto: "Os sócios integralizaram o capital de R$ 20.000,00 em dinheiro.",
      partidas: [{ d: "D", conta: "1.1.1.01", valor: 20000 }, { d: "C", conta: "3.1.01", valor: 20000 }],
      explicacao: "Entra dinheiro: Caixa (Ativo) aumenta → débito. O capital dos sócios (PL) aumenta → crédito." },
    { texto: "Depositou R$ 12.000,00 do caixa na conta do Banco X.",
      partidas: [{ d: "D", conta: "1.1.1.02.01", valor: 12000 }, { d: "C", conta: "1.1.1.01", valor: 12000 }],
      explicacao: "Banco X (Ativo) aumenta → débito; Caixa (Ativo) diminui → crédito. Fato permutativo." },
    { texto: "Comprou mercadorias para revenda à vista, em dinheiro, por R$ 3.500,00.",
      partidas: [{ d: "D", conta: "1.1.3.01", valor: 3500 }, { d: "C", conta: "1.1.1.01", valor: 3500 }],
      explicacao: "Entra mercadoria: Mercadorias para Revenda (Ativo) aumenta → débito; sai dinheiro: Caixa diminui → crédito." },
    { texto: "Recebeu R$ 8.000,00 em dinheiro pela prestação de serviços.",
      partidas: [{ d: "D", conta: "1.1.1.01", valor: 8000 }, { d: "C", conta: "4.1.1.03", valor: 8000 }],
      explicacao: "Caixa (Ativo) aumenta → débito. A receita aumenta → crédito (receita tem natureza credora)." },
    { texto: "Pagou R$ 1.200,00 de energia elétrica por transferência do Banco X.",
      partidas: [{ d: "D", conta: "5.1.04", valor: 1200 }, { d: "C", conta: "1.1.1.02.01", valor: 1200 }],
      explicacao: "A despesa aumenta → débito (natureza devedora); o Banco X diminui → crédito." },
    { texto: "Comprou um computador a prazo por R$ 4.000,00, com emissão de duplicata.",
      partidas: [{ d: "D", conta: "1.2.3.07", valor: 4000 }, { d: "C", conta: "2.1.1.01", valor: 4000 }],
      explicacao: "Equipamentos de Informática (Ativo Imobilizado) aumenta → débito; surge a obrigação Duplicatas a Pagar (Passivo) → crédito." },
    { texto: "Pagou R$ 1.000,00 de aluguel do mês, em dinheiro.",
      partidas: [{ d: "D", conta: "5.1.14", valor: 1000 }, { d: "C", conta: "1.1.1.01", valor: 1000 }],
      explicacao: "Despesa de aluguel aumenta → débito; Caixa diminui → crédito." },
    { texto: "Pagou pelo Banco X a duplicata do computador (R$ 4.000,00) com juros de R$ 80,00 pelo atraso.",
      partidas: [{ d: "D", conta: "2.1.1.01", valor: 4000 }, { d: "D", conta: "5.3.01", valor: 80 }, { d: "C", conta: "1.1.1.02.01", valor: 4080 }],
      explicacao: "3ª fórmula (dois débitos e um crédito): a obrigação diminui → débito de 4.000; os juros são despesa → débito de 80; sai do banco o total, 4.080 → crédito." },
    { texto: "Obteve um empréstimo bancário de R$ 5.000,00, creditado na conta do Banco X.",
      partidas: [{ d: "D", conta: "1.1.1.02.01", valor: 5000 }, { d: "C", conta: "2.1.9.01", valor: 5000 }],
      explicacao: "Banco X aumenta → débito; surge a obrigação Empréstimos Bancários (Passivo) → crédito." },
  ],
};

export const PRATICAS = {
  "cb-01": [CIA_VAMOS], // patrimônio e fatos contábeis (movido do Módulo 02 em 05/10/2026)
  "cb-03": [RAZONETES_SERVICOS],
};

export const praticasDo = (disciplina, numero) => PRATICAS[`${disciplina}-${String(numero).padStart(2, "0")}`] || [];
