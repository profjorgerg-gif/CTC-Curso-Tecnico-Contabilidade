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
  { id: "clientes", nome: "Duplicatas a Receber (Clientes)", grupo: "ac" },
  { id: "banco_x", nome: "Bancos Conta Movimento — Banco X", grupo: "ac" },
  { id: "banco_y", nome: "Bancos Conta Movimento — Banco Y", grupo: "ac" },
  { id: "aplicacao_li", nome: "Aplicações de Liquidez Imediata", grupo: "ac" },
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
  { id: "encargos", nome: "Encargos Sociais a Recolher", grupo: "pc" },
  { id: "emprestimos_lp", nome: "Empréstimos a Pagar", grupo: "pnc" },
  { id: "fin_lp", nome: "Financiamentos a Pagar", grupo: "pnc" },
  { id: "capital", nome: "Capital Social", grupo: "pl" },
  { id: "capital_integralizar", nome: "(−) Capital a Integralizar", grupo: "pl", redutora: true },
  { id: "reservas", nome: "Reservas de Lucros", grupo: "pl" },
  // resultado do período (no material: "Resultado Transitório"); o prejuízo reduz o PL
  { id: "lucro", nome: "Resultado do Exercício — lucro", grupo: "pl" },
  { id: "prejuizo", nome: "(−) Resultado do Exercício — prejuízo", grupo: "pl", redutora: true },
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
  contas: ["caixa", "bancos", "aplicacao", "clientes", "mercadorias", "terrenos", "edificacoes", "veiculos", "moveis", "maquinas", "fornecedores", "salarios", "emprestimos_cp", "fin_cp", "emprestimos_lp", "fin_lp", "capital", "capital_integralizar", "reservas"],
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
  { codigo: "5.1.02", nome: "Salários Administrativos" },
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
  conclusao: "Duplicatas a Pagar ficou com saldo nulo: a obrigação surgiu e foi paga.",
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

// EF3.11 e EF3.12 do prof. Jorge Cardoso (incluídos em 05/10/2026), com correções:
// Alfa — fato 02 pago pelo Banco X (o enunciado dizia Caixa, que estava zerado);
// Beta — "Beta Comercial" (o enunciado dizia "Serviços", mas a empresa compra e vende mercadorias);
// "Resultado Transitório" virou "Resultado do Exercício — lucro / (−) prejuízo".
const CONTAS_COMERCIAL = ["caixa", "banco_x", "banco_y", "aplicacao_li", "clientes", "mercadorias", "terrenos", "veiculos", "moveis", "maquinas",
  "fornecedores", "salarios", "encargos", "emprestimos_cp", "emprestimos_lp", "capital", "capital_integralizar", "lucro", "prejuizo"];
const INSTRUCAO_RESULTADO = "Monte o Balanço Patrimonial depois de cada fato. Quando houver receita ou despesa, registre o resultado acumulado no PL: \"Resultado do Exercício — lucro\" ou \"(−) Resultado do Exercício — prejuízo\" (informe o valor sem sinal).";

const ALFA = {
  id: "cb-bs-alfa",
  tipo: "balanco-sucessivo",
  titulo: "Balanços sucessivos — Alfa Comercial Ltda.",
  instrucao: INSTRUCAO_RESULTADO,
  contas: CONTAS_COMERCIAL,
  fatos: [
    { texto: "Integralização do Capital Social de R$ 150.000,00: R$ 100.000,00 depositados no Banco X, R$ 30.000,00 em móveis e utensílios e R$ 20.000,00 em veículos.",
      saldos: { banco_x: 100000, moveis: 30000, veiculos: 20000, capital: 150000 },
      explicacao: "Ativo: Banco X 100.000 + Móveis 30.000 + Veículos 20.000 = 150.000. PL: Capital Social 150.000." },
    { texto: "Compra de mercadorias para revenda por R$ 60.000,00: R$ 20.000,00 pagos à vista pelo Banco X e R$ 40.000,00 a prazo com fornecedores.",
      saldos: { banco_x: 80000, mercadorias: 60000, moveis: 30000, veiculos: 20000, fornecedores: 40000, capital: 150000 },
      explicacao: "Entram Mercadorias 60.000; Banco X 100.000 − 20.000 = 80.000; Fornecedores 40.000 no Passivo Circulante. Total: R$ 190.000,00." },
    { texto: "Aplicação de liquidez imediata de R$ 25.000,00, com recursos do Banco X.",
      saldos: { banco_x: 55000, aplicacao_li: 25000, mercadorias: 60000, moveis: 30000, veiculos: 20000, fornecedores: 40000, capital: 150000 },
      explicacao: "Permutativo: Banco X 80.000 − 25.000 = 55.000 e Aplicações de Liquidez Imediata 25.000. O total não muda." },
    { texto: "Venda de mercadorias por R$ 40.000,00: R$ 20.000,00 recebidos no Banco Y e R$ 20.000,00 em duplicatas a receber. O custo das mercadorias vendidas foi de R$ 25.000,00.",
      saldos: { banco_x: 55000, banco_y: 20000, aplicacao_li: 25000, clientes: 20000, mercadorias: 35000, moveis: 30000, veiculos: 20000, fornecedores: 40000, capital: 150000, lucro: 15000 },
      explicacao: "Entram Banco Y 20.000 e Duplicatas a Receber 20.000; saem do estoque 25.000 (Mercadorias 35.000). Receita 40.000 − CMV 25.000 = lucro de 15.000, que aumenta o PL. Total: R$ 205.000,00." },
    { texto: "Pagamento de salários de R$ 12.000,00 pelo Banco X e reconhecimento de encargos sociais de R$ 4.000,00, ainda a recolher.",
      saldos: { banco_x: 43000, banco_y: 20000, aplicacao_li: 25000, clientes: 20000, mercadorias: 35000, moveis: 30000, veiculos: 20000, fornecedores: 40000, encargos: 4000, capital: 150000, prejuizo: 1000 },
      explicacao: "Banco X 55.000 − 12.000 = 43.000; surge Encargos Sociais a Recolher 4.000 (Passivo). As despesas somam 16.000: o resultado passa de lucro de 15.000 para prejuízo de 1.000, que reduz o PL. Total: R$ 193.000,00." },
    { texto: "Recebimento de R$ 10.000,00 de clientes no Banco Y, liquidando parte das duplicatas a receber.",
      saldos: { banco_x: 43000, banco_y: 30000, aplicacao_li: 25000, clientes: 10000, mercadorias: 35000, moveis: 30000, veiculos: 20000, fornecedores: 40000, encargos: 4000, capital: 150000, prejuizo: 1000 },
      explicacao: "Permutativo: Banco Y 20.000 + 10.000 = 30.000; Duplicatas a Receber 20.000 − 10.000 = 10.000. Total: R$ 193.000,00." },
  ],
};

const BETA = {
  id: "cb-bs-beta",
  tipo: "balanco-sucessivo",
  titulo: "Balanços sucessivos — Beta Comercial Ltda.",
  instrucao: INSTRUCAO_RESULTADO,
  contas: CONTAS_COMERCIAL,
  fatos: [
    { texto: "Integralização do Capital Social de R$ 200.000,00: R$ 120.000,00 no Banco X, R$ 40.000,00 em dinheiro (caixa) e R$ 40.000,00 em veículos.",
      saldos: { caixa: 40000, banco_x: 120000, veiculos: 40000, capital: 200000 },
      explicacao: "Ativo: Caixa 40.000 + Banco X 120.000 + Veículos 40.000 = 200.000. PL: Capital Social 200.000." },
    { texto: "Compra de mercadorias para revenda por R$ 80.000,00: R$ 30.000,00 pagos à vista pelo Banco X e R$ 50.000,00 a prazo com fornecedores.",
      saldos: { caixa: 40000, banco_x: 90000, mercadorias: 80000, veiculos: 40000, fornecedores: 50000, capital: 200000 },
      explicacao: "Mercadorias 80.000; Banco X 120.000 − 30.000 = 90.000; Fornecedores 50.000. Total: R$ 250.000,00." },
    { texto: "Aplicação de liquidez imediata de R$ 20.000,00, com recursos do Banco X.",
      saldos: { caixa: 40000, banco_x: 70000, aplicacao_li: 20000, mercadorias: 80000, veiculos: 40000, fornecedores: 50000, capital: 200000 },
      explicacao: "Permutativo: Banco X 90.000 − 20.000 = 70.000 e Aplicações de Liquidez Imediata 20.000." },
    { texto: "Venda de mercadorias por R$ 60.000,00: R$ 25.000,00 recebidos no Banco Y e R$ 35.000,00 em duplicatas a receber. O custo das mercadorias vendidas foi de R$ 36.000,00.",
      saldos: { caixa: 40000, banco_x: 70000, banco_y: 25000, aplicacao_li: 20000, clientes: 35000, mercadorias: 44000, veiculos: 40000, fornecedores: 50000, capital: 200000, lucro: 24000 },
      explicacao: "Entram Banco Y 25.000 e Duplicatas a Receber 35.000; Mercadorias 80.000 − 36.000 = 44.000. Receita 60.000 − CMV 36.000 = lucro de 24.000 no PL. Total: R$ 274.000,00." },
    { texto: "Pagamento de salários de R$ 15.000,00 pelo Banco X e reconhecimento de encargos sociais de R$ 5.000,00, ainda a recolher.",
      saldos: { caixa: 40000, banco_x: 55000, banco_y: 25000, aplicacao_li: 20000, clientes: 35000, mercadorias: 44000, veiculos: 40000, fornecedores: 50000, encargos: 5000, capital: 200000, lucro: 4000 },
      explicacao: "Banco X 70.000 − 15.000 = 55.000; Encargos Sociais a Recolher 5.000. Despesas de 20.000: o lucro cai de 24.000 para 4.000. Total: R$ 259.000,00." },
    { texto: "Recebimento de R$ 20.000,00 de clientes no Banco Y, liquidando parte das duplicatas a receber.",
      saldos: { caixa: 40000, banco_x: 55000, banco_y: 45000, aplicacao_li: 20000, clientes: 15000, mercadorias: 44000, veiculos: 40000, fornecedores: 50000, encargos: 5000, capital: 200000, lucro: 4000 },
      explicacao: "Permutativo: Banco Y 25.000 + 20.000 = 45.000; Duplicatas a Receber 35.000 − 20.000 = 15.000. Total: R$ 259.000,00." },
  ],
};

// Módulo 04 — subscrição e integralização do capital (aprovado em 05/10/2026)
const GAMA = {
  id: "cb-bs-gama-abertura",
  tipo: "balanco-sucessivo",
  titulo: "Abertura da empresa — Comercial Gama Ltda.",
  instrucao: "Monte o Balanço Patrimonial depois de cada fato. O capital que os sócios ainda não entregaram aparece no PL como \"(−) Capital a Integralizar\" (informe o valor sem sinal).",
  contas: ["caixa", "bancos", "aplicacao", "clientes", "mercadorias", "terrenos", "edificacoes", "veiculos", "moveis", "maquinas", "fornecedores", "emprestimos_cp", "capital", "capital_integralizar", "reservas"],
  fatos: [
    { texto: "Os sócios assinaram o contrato social com capital de R$ 100.000,00 e, no mesmo ato, entregaram R$ 60.000,00 em dinheiro. O restante será integralizado em até 6 meses.",
      saldos: { caixa: 60000, capital: 100000, capital_integralizar: 40000 },
      explicacao: "Capital Subscrito: 100.000 (o compromisso). Entregue: Caixa 60.000. O que falta (40.000) aparece como (−) Capital a Integralizar, redutora do PL. PL = 100.000 − 40.000 = 60.000 = Ativo." },
    { texto: "Um sócio integralizou R$ 30.000,00 entregando um veículo avaliado nesse valor.",
      saldos: { caixa: 60000, veiculos: 30000, capital: 100000, capital_integralizar: 10000 },
      explicacao: "Entra Veículos 30.000 (integralização em bens). O capital a integralizar cai para 40.000 − 30.000 = 10.000. Total: R$ 90.000,00." },
    { texto: "O outro sócio integralizou os R$ 10.000,00 restantes, depositando o valor na conta bancária da empresa.",
      saldos: { caixa: 60000, bancos: 10000, veiculos: 30000, capital: 100000 },
      explicacao: "Entra Bancos 10.000 e o capital a integralizar zera: todo o capital subscrito foi integralizado. Total: R$ 100.000,00." },
  ],
};

// Módulo 05 — do Diário ao Razão (página do Livro Diário do material 8.4, completada; aprovado em 05/10/2026)
const DIARIO_RAZAO = {
  id: "cb-diario-razao",
  tipo: "razonetes",
  formato: "razao",
  titulo: "Do Diário ao Razão — março de 2025",
  instrucao: "Lance cada fato de março no Livro Diário: escolha a conta, o lado (débito ou crédito) e o valor. No fim, monte o Livro Razão de cada conta, com o saldo depois de cada movimento.",
  conclusao: "Esses saldos finais do Razão são o ponto de partida do Módulo 08.",
  fatos: [
    { data: "01/03/2025", texto: "Integralização de capital de R$ 10.000,00 em dinheiro pelo sócio Marcos Almeida.", historico: "Integralização de capital em dinheiro pelo sócio Marcos Almeida.",
      partidas: [{ d: "D", conta: "1.1.1.01", valor: 10000 }, { d: "C", conta: "3.1.01", valor: 10000 }],
      explicacao: "D Caixa Geral (Ativo aumenta) / C Capital Subscrito (PL aumenta)." },
    { data: "02/03/2025", texto: "Depósito de R$ 6.000,00 do caixa na conta do Banco X.", historico: "Depósito em dinheiro na conta do Banco X.",
      partidas: [{ d: "D", conta: "1.1.1.02.01", valor: 6000 }, { d: "C", conta: "1.1.1.01", valor: 6000 }],
      explicacao: "D Banco X / C Caixa Geral: o dinheiro só muda de lugar dentro do Ativo." },
    { data: "05/03/2025", texto: "Compra de mercadorias à vista, em dinheiro, por R$ 3.000,00, conforme NF nº 000123.", historico: "Compra de mercadorias à vista, conforme NF nº 000123.",
      partidas: [{ d: "D", conta: "1.1.3.01", valor: 3000 }, { d: "C", conta: "1.1.1.01", valor: 3000 }],
      explicacao: "D Mercadorias para Revenda / C Caixa Geral." },
    { data: "10/03/2025", texto: "Pagamento da conta de luz, R$ 450,00, pelo Banco X (fatura nº 456789, vencimento em 08/03/2025).", historico: "Pagamento da conta de luz, fatura nº 456789.",
      partidas: [{ d: "D", conta: "5.1.04", valor: 450 }, { d: "C", conta: "1.1.1.02.01", valor: 450 }],
      explicacao: "D Energia Elétrica (despesa) / C Banco X." },
    { data: "12/03/2025", texto: "Venda de mercadorias à vista, em dinheiro, por R$ 5.000,00. O custo das mercadorias vendidas foi de R$ 2.500,00. Registre a venda e a baixa do custo no mesmo lançamento.", historico: "Venda de mercadorias à vista e baixa do custo das mercadorias vendidas.",
      partidas: [{ d: "D", conta: "1.1.1.01", valor: 5000 }, { d: "C", conta: "4.1.1.01", valor: 5000 }, { d: "D", conta: "6.2.01", valor: 2500 }, { d: "C", conta: "1.1.3.01", valor: 2500 }],
      explicacao: "4ª fórmula: D Caixa 5.000 / C Receita de Vendas 5.000 e D CMV 2.500 / C Mercadorias 2.500." },
    { data: "14/03/2025", texto: "Pagamento do salário do funcionário Pedro Silva, R$ 1.800,00, pelo Banco X.", historico: "Pagamento de salário ao funcionário Pedro Silva.",
      partidas: [{ d: "D", conta: "5.1.02", valor: 1800 }, { d: "C", conta: "1.1.1.02.01", valor: 1800 }],
      explicacao: "D Salários Administrativos (despesa) / C Banco X." },
  ],
};

// Módulo 06 — ficha de controle de estoque (fatos orientados 1 a 4; aprovado em 06/10/2026)
const FICHA_ESTOQUE = {
  id: "cb-ficha-estoque",
  tipo: "ficha-estoque",
  titulo: "Ficha de controle de estoque",
  instrucao: "Preencha a ficha pelo PEPS e depois pela Média Ponderada Móvel: o custo de cada saída e o saldo (unidades e reais) depois de cada movimento. São os fatos orientados 1 a 4 que você vai lançar na sua empresa.",
  metodos: ["peps", "media"],
  movimentos: [
    { texto: "Compra de 100 un a R$ 20,00", tipo: "Entrada", quantidade: 100, valorUnit: 20 },
    { texto: "Compra de 50 un a R$ 25,00", tipo: "Entrada", quantidade: 50, valorUnit: 25 },
    { texto: "Venda de 40 un por R$ 3.000,00", tipo: "Saída", quantidade: 40, receita: 3000 },
    { texto: "Venda de 30 un por R$ 2.400,00", tipo: "Saída", quantidade: 30, receita: 2400 },
  ],
};

export const PRATICAS = {
  "cb-01": [CIA_VAMOS, ALFA, BETA], // patrimônio e fatos contábeis (movido do Módulo 02 em 05/10/2026)
  "cb-03": [RAZONETES_SERVICOS],
  "cb-04": [GAMA],
  "cb-05": [DIARIO_RAZAO],
  "cb-06": [FICHA_ESTOQUE],
};

export const praticasDo = (disciplina, numero) => PRATICAS[`${disciplina}-${String(numero).padStart(2, "0")}`] || [];
