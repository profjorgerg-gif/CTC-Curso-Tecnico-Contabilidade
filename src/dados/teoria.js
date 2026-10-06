// Teoria dos módulos (aprovada pelo professor: Módulo 01 em 04/10/2026, Módulos 02 e 03 em 05/10/2026).
// Chave: "{disciplina}-{nº do módulo com 2 dígitos}" (ex.: "cb-01").
// Blocos: { t: "p" | "lista" | "tabela" | "destaque" | "exemplo", ... }; **trecho** = negrito.
// Base: material didático do prof. Jorge Lima Cardoso (CEDUP Hermann Hering), revisado.

const FONTES_CB01 = [
  "CARDOSO, J. L. Introdução à Contabilidade; Estrutura e Aplicação da Contabilidade; Regimes Contábeis. Material didático. Blumenau: CEDUP Hermann Hering, 2025.",
  "IUDÍCIBUS, S. de (coord.). Contabilidade introdutória. 10. ed. São Paulo: Atlas, 2009.",
  "MARION, J. C. Contabilidade empresarial. São Paulo: Atlas, 2015.",
  "BRASIL. Lei nº 6.404, de 15 de dezembro de 1976. Dispõe sobre as Sociedades por Ações.",
  "CPC – COMITÊ DE PRONUNCIAMENTOS CONTÁBEIS. CPC 00 (R2) – Estrutura Conceitual para Relatório Financeiro. Brasília, 2019.",
  "CFC – CONSELHO FEDERAL DE CONTABILIDADE. ITG 1000 – Modelo contábil para microempresa e empresa de pequeno porte. Brasília, 2012.",
];

const FONTES_CB02 = [
  "CARDOSO, J. L. Estrutura e Aplicação da Contabilidade; Classificação de Contas. Material didático. Blumenau: CEDUP Hermann Hering, 2025.",
  "BRASIL. Lei nº 6.404, de 15 de dezembro de 1976. Dispõe sobre as Sociedades por Ações. Arts. 177 a 182.",
  "CFC – CONSELHO FEDERAL DE CONTABILIDADE. NBC TG 26 (R5) – Apresentação das Demonstrações Contábeis. Brasília: CFC.",
  "CFC – CONSELHO FEDERAL DE CONTABILIDADE. ITG 2000 (R1) – Escrituração Contábil. Brasília: CFC.",
];

const FONTES_CB03 = [
  "CARDOSO, J. L. Método das Partidas Dobradas; Exemplos de Método das Partidas Dobradas; Esquema Geral de Movimentações Contábeis. Material didático. Blumenau: CEDUP Hermann Hering, 2025.",
  "MARION, J. C. Contabilidade básica. 12. ed. São Paulo: Atlas, 2014.",
  "RIBEIRO, O. M. Contabilidade básica fácil. 28. ed. São Paulo: Saraiva, 2012.",
  "CFC – CONSELHO FEDERAL DE CONTABILIDADE. ITG 2000 (R1) – Escrituração Contábil. Brasília: CFC.",
];

export const TEORIA = {
  "cb-01": {
    titulo: "Introdução à Contabilidade",
    resumo: "Conceito, usuários, patrimônio, princípios e Estrutura Conceitual, regimes contábeis e fatos contábeis.",
    secoes: [
      {
        titulo: "1. Conceito, objetivo e função",
        blocos: [
          { t: "p", texto: "A **Contabilidade** é a ciência que registra, classifica, analisa e interpreta os eventos financeiros de uma entidade, para fornecer informações úteis à tomada de decisões." },
          { t: "lista", itens: [
            "**Objeto:** o patrimônio da entidade.",
            "**Objetivo:** fornecer informações financeiras precisas e úteis para a tomada de decisões, o controle patrimonial e o cumprimento das obrigações legais.",
            "**Função:** registrar, classificar, analisar e interpretar os fatos contábeis, garantindo transparência e gestão eficiente dos recursos.",
          ] },
          { t: "p", texto: "O papel da contabilidade nas organizações é apoiar a gestão, as decisões estratégicas e o cumprimento das obrigações legais com informações confiáveis e organizadas." },
        ],
      },
      {
        titulo: "2. Quem usa a informação contábil",
        blocos: [
          { t: "tabela", cab: ["Usuários internos", "Usuários externos"], linhas: [
            ["Sócios e administradores", "Bancos e financiadores"],
            ["Gerentes e chefias", "Fornecedores e clientes"],
            ["Funcionários", "Governo (Receita Federal, Estado e Município)"],
            ["", "Investidores e sindicatos"],
          ] },
          { t: "p", texto: "Cada usuário tem um interesse diferente: o banco quer saber se a empresa consegue pagar; o governo, apurar os tributos; o sócio, conhecer o lucro." },
        ],
      },
      {
        titulo: "3. Patrimônio",
        blocos: [
          { t: "p", texto: "**Patrimônio** é o conjunto de bens, direitos e obrigações de uma entidade." },
          { t: "lista", itens: [
            "**Bens:** coisas que a entidade possui — dinheiro, mercadorias, móveis, veículos, imóveis.",
            "**Direitos:** valores a receber — duplicatas a receber de clientes, aplicações financeiras.",
            "**Obrigações:** valores a pagar — fornecedores, salários, tributos, empréstimos.",
          ] },
          { t: "p", texto: "Bens e direitos formam o **Ativo**; as obrigações com terceiros formam o **Passivo**. A diferença é o **Patrimônio Líquido (PL)**: os recursos próprios dos sócios (capital investido, reservas e lucros acumulados)." },
          { t: "destaque", texto: "**Equação patrimonial:** Ativo = Passivo + Patrimônio Líquido  →  PL = Ativo − Passivo" },
          { t: "exemplo", titulo: "Exemplo — Loja Alfa", tabela: { cab: ["Ativo", "R$", "Passivo + PL", "R$"], linhas: [
            ["Caixa", "5.000,00", "Fornecedores", "6.000,00"],
            ["Mercadorias", "3.000,00", "", ""],
            ["Veículos", "20.000,00", "Capital Social (PL)", "22.000,00"],
            ["**Total**", "**28.000,00**", "**Total**", "**28.000,00**"],
          ] } },
          { t: "p", texto: "**Situações patrimoniais**" },
          { t: "tabela", cab: ["Situação", "Relação", "Significado"], linhas: [
            ["PL positivo", "A > P", "Situação favorável"],
            ["PL nulo", "A = P", "Os bens e direitos apenas cobrem as dívidas"],
            ["PL negativo", "A < P", "**Passivo a descoberto**: as dívidas superam o ativo"],
          ] },
        ],
      },
      {
        titulo: "4. Princípios contábeis e a Estrutura Conceitual",
        blocos: [
          { t: "p", texto: "Durante muitos anos, a contabilidade brasileira seguiu seis princípios definidos pela Resolução CFC nº 750/1993:" },
          { t: "lista", numerada: true, itens: [
            "**Entidade:** o patrimônio da entidade não se confunde com o dos sócios; ele tem autonomia, seja de uma pessoa, de um grupo, de uma sociedade ou de uma instituição, com ou sem fins lucrativos.",
            "**Continuidade:** pressupõe que a entidade continuará operando no futuro; a mensuração e a apresentação do patrimônio levam isso em conta.",
            "**Oportunidade:** o patrimônio deve ser mensurado e apresentado de forma íntegra e no momento certo (tempestiva).",
            "**Registro pelo valor original:** os componentes do patrimônio são registrados inicialmente pelo valor das transações, em moeda nacional.",
            "**Competência:** os efeitos das transações são reconhecidos no período a que se referem, independentemente do recebimento ou do pagamento, confrontando receitas e despesas correspondentes.",
            "**Prudência:** diante de alternativas igualmente válidas, adota-se o menor valor para o Ativo e o maior para o Passivo.",
          ] },
          { t: "destaque", texto: "A Resolução CFC nº 750/1993 foi **revogada em 2016**, com efeitos a partir de 2017. Hoje, os fundamentos estão na **Estrutura Conceitual** (CPC 00 / NBC TG Estrutura Conceitual)." },
          { t: "tabela", titulo: "Hoje, na Estrutura Conceitual", cab: ["Antigo princípio", "Onde a ideia está hoje"], linhas: [
            ["Entidade", "Conceito de \"entidade que reporta\""],
            ["Continuidade", "**Pressuposto básico** das demonstrações contábeis"],
            ["Oportunidade", "Característica de melhoria **tempestividade**"],
            ["Registro pelo valor original", "Base de mensuração **custo histórico**"],
            ["Competência", "**Regime de competência**, base das demonstrações"],
            ["Prudência", "Exercício de **cautela**, que apoia a **neutralidade** da informação"],
          ] },
        ],
      },
      {
        titulo: "5. Regimes contábeis: competência e caixa",
        blocos: [
          { t: "p", texto: "O regime contábil define **quando** as receitas e as despesas são reconhecidas." },
          { t: "p", texto: "**Regime de competência:** receitas e despesas são reconhecidas no período em que ocorrem (fato gerador), recebidas/pagas ou não. É o regime da contabilidade societária e a base das demonstrações contábeis formais, como a DRE e o Balanço Patrimonial (Lei nº 6.404/76). A escrituração contábil de **todas** as empresas segue a competência — inclusive as micro e pequenas (ITG 1000)." },
          { t: "p", texto: "**Regime de caixa:** receitas e despesas são reconhecidas somente quando há efetivo recebimento ou pagamento. É útil para o controle do fluxo de caixa e para relatórios gerenciais; para fins fiscais, a legislação permite usá-lo na apuração de tributos em alguns casos (por exemplo, Simples Nacional e Lucro Presumido)." },
          { t: "tabela", cab: ["Critério", "Competência", "Caixa"], linhas: [
            ["Receita", "Quando realizada", "Quando recebida"],
            ["Despesa", "Quando incorrida", "Quando paga"],
            ["Foco", "Econômico (fato gerador)", "Financeiro (entrada e saída de dinheiro)"],
            ["Uso", "Escrituração contábil de todas as empresas", "Controle de caixa; apuração de tributos em casos permitidos"],
          ] },
          { t: "exemplo", titulo: "Exemplo", itens: [
            "Venda em 10/12/2024, recebida em 05/01/2025.",
            "**Competência:** receita de dezembro/2024.",
            "**Caixa:** receita de janeiro/2025.",
          ] },
        ],
      },
      {
        titulo: "6. Fatos contábeis",
        blocos: [
          { t: "p", texto: "**Fato contábil** é todo acontecimento que altera o patrimônio da entidade. Pode ser de três tipos:" },
          { t: "p", texto: "**1. Permutativo (ou qualitativo)** — troca elementos do patrimônio **sem alterar o PL**." },
          { t: "exemplo", itens: [
            "Compra de veículo à vista, R$ 25.000: Veículos + R$ 25.000; Caixa − R$ 25.000.",
            "Compra de mercadorias a prazo, R$ 15.000: Mercadorias + R$ 15.000; Fornecedores + R$ 15.000.",
          ] },
          { t: "p", texto: "**2. Modificativo (ou quantitativo)** — **altera o PL** por meio de uma receita ou de uma despesa." },
          { t: "exemplo", itens: [
            "**Aumentativo** (receita, aumenta o PL) — prestação de serviço recebida à vista, R$ 2.000: Caixa + R$ 2.000; Receita de Serviços + R$ 2.000.",
            "**Diminutivo** (despesa, reduz o PL) — pagamento do aluguel da sede, R$ 5.000: Despesa com Aluguel R$ 5.000; Caixa − R$ 5.000.",
          ] },
          { t: "p", texto: "**3. Misto (ou composto)** — combina uma **permuta** com uma **alteração do PL** no mesmo fato." },
          { t: "exemplo", itens: [
            "**Misto diminutivo** — pagamento de duplicata de R$ 10.000 com juros de R$ 200: Fornecedores − R$ 10.000; Despesa de Juros R$ 200; Caixa − R$ 10.200.",
            "**Misto aumentativo** — recebimento de duplicata de R$ 8.000 com juros de R$ 160: Caixa + R$ 8.160; Clientes − R$ 8.000; Receita de Juros + R$ 160.",
          ] },
          { t: "tabela", cab: ["Tipo", "Impacto no PL", "Afeta o resultado?", "Exemplo"], linhas: [
            ["Permutativo", "Não altera", "Não", "Compra de veículo à vista"],
            ["Modificativo", "Aumenta ou diminui", "Sim", "Pagamento do aluguel"],
            ["Misto", "Aumenta ou diminui", "Sim", "Pagamento de duplicata com juros"],
          ] },
        ],
      },
      {
        titulo: "No CTC",
        blocos: [
          { t: "lista", itens: [
            "**Parametrização:** você escolhe o regime de reconhecimento da sua empresa.",
            "**Saldos iniciais:** você monta o patrimônio inicial (Ativo = Capital).",
            "**Lançamentos:** cada lançamento registra um fato contábil.",
          ] },
        ],
      },
    ],
    fontes: FONTES_CB01,
  },
  "cb-02": {
    titulo: "Plano de Contas",
    resumo: "Conceito e função, estrutura e codificação, grupos do plano do CTC, classificação das contas e contas redutoras.",
    secoes: [
      {
        titulo: "1. O que é o plano de contas",
        blocos: [
          { t: "p", texto: "O **plano de contas** é a lista organizada de todas as contas que a empresa pode usar na escrituração, cada uma com código, nome e função definidos. É o \"mapa\" do patrimônio e do resultado: indica **onde** cada fato deve ser registrado." },
          { t: "lista", itens: [
            "**Padronizar** os registros: o mesmo fato é sempre lançado na mesma conta.",
            "**Organizar** as contas na ordem em que aparecem nas demonstrações (Balanço Patrimonial e DRE).",
            "**Facilitar** a consulta, a conferência e a auditoria.",
            "**Atender** à legislação: a Lei nº 6.404/1976 (art. 178) define os grupos do Balanço, que o plano reproduz.",
          ] },
          { t: "p", texto: "Cada empresa adapta o plano à sua atividade e porte, sempre dentro da estrutura legal." },
        ],
      },
      {
        titulo: "2. Estrutura e codificação",
        blocos: [
          { t: "p", texto: "As contas são organizadas em **níveis**, do mais geral ao mais detalhado. O código mostra a posição de cada conta:" },
          { t: "tabela", cab: ["Nível", "Tipo", "Exemplo", "Recebe lançamento?"], linhas: [
            ["1", "Grupo", "1 ATIVO", "Não"],
            ["2", "Subgrupo", "1.1 ATIVO CIRCULANTE", "Não"],
            ["3", "Conta sintética", "1.1.1 Caixa e Equivalentes de Caixa", "Não"],
            ["4", "Conta analítica", "1.1.1.01 Caixa Geral", "**Sim**"],
            ["5", "Subconta analítica", "1.1.1.02.01 Banco X", "**Sim**"],
          ] },
          { t: "lista", itens: [
            "**Conta sintética:** agrupa outras contas; seu saldo é a soma das contas abaixo dela.",
            "**Conta analítica:** conta de último nível, que recebe os lançamentos.",
          ] },
          { t: "destaque", texto: "Só recebe lançamento a conta do **último nível** do seu ramo. \"1.1.1.02 Bancos Conta Movimento\" se desdobra em Banco X e Banco Y; por isso o lançamento vai em **1.1.1.02.01 Banco X**, nunca em \"Bancos Conta Movimento\"." },
        ],
      },
      {
        titulo: "3. Os grupos do plano de contas do CTC",
        blocos: [
          { t: "tabela", cab: ["Código", "Grupo", "Natureza do saldo", "Onde aparece"], linhas: [
            ["1", "Ativo (Circulante e Não Circulante)", "Devedora", "Balanço Patrimonial"],
            ["2", "Passivo (Circulante e Não Circulante)", "Credora", "Balanço Patrimonial"],
            ["3", "Patrimônio Líquido", "Credora", "Balanço Patrimonial"],
            ["4", "Receitas", "Credora", "DRE"],
            ["5", "Despesas", "Devedora", "DRE"],
            ["6", "Custos (CMV, CPV, CSV)", "Devedora", "DRE"],
            ["7", "Resultado (ARE, tributos sobre o lucro, destinação)", "Variável", "Apuração do resultado"],
            ["8", "Contas de Compensação", "—", "Fora do patrimônio (controle)"],
          ] },
          { t: "lista", itens: [
            "O **Patrimônio Líquido** é o grupo 3, com código próprio — não é um subgrupo do Passivo.",
            "**Duplicatas a Pagar** (2.1.1.01) é obrigação de curto prazo: fica no **Passivo Circulante**.",
            "Os **custos** estão no grupo 6; na venda de mercadorias usa-se o **CMV** (6.2.01).",
          ] },
          { t: "p", texto: "**Ativo Não Circulante** (art. 178 da Lei 6.404/1976): Realizável a Longo Prazo, Investimentos, Imobilizado e Intangível." },
          { t: "p", texto: "**Patrimônio Líquido:** Capital Social, Reservas de Capital, Ajustes de Avaliação Patrimonial, Reservas de Lucros, (−) Ações em Tesouraria e (−) Prejuízos Acumulados." },
        ],
      },
      {
        titulo: "4. Classificação das contas",
        blocos: [
          { t: "p", texto: "**a) Quanto ao tipo**" },
          { t: "lista", itens: [
            "**Patrimoniais** (grupos 1, 2 e 3): bens, direitos, obrigações e PL. O saldo passa de um exercício para o outro.",
            "**De resultado** (grupos 4, 5 e 6): receitas, despesas e custos. No fim do exercício são **encerradas** (zeradas) na ARE (7.1.01), e o lucro ou prejuízo vai para o PL.",
          ] },
          { t: "p", texto: "**b) Quanto à função**" },
          { t: "lista", itens: [
            "**Principais:** registram o valor do elemento (ex.: Veículos, Fornecedores).",
            "**Redutoras (retificadoras):** diminuem o valor de outra conta; trazem o sinal (−) (ex.: (−) Depreciação Acumulada).",
            "**De compensação** (grupo 8): controlam atos que ainda não alteram o patrimônio, mas podem vir a alterar (ex.: garantias prestadas, bens de terceiros).",
          ] },
          { t: "p", texto: "**c) Quanto à natureza do saldo**" },
          { t: "lista", itens: [
            "**Devedora:** aumenta com débito e diminui com crédito — Ativo, Despesas e Custos.",
            "**Credora:** aumenta com crédito e diminui com débito — Passivo, PL e Receitas.",
          ] },
          { t: "p", texto: "**d) Quanto ao prazo (liquidez e exigibilidade)**" },
          { t: "lista", itens: [
            "**Circulante:** direitos realizáveis e obrigações vencíveis até o fim do exercício social seguinte (em geral, 12 meses).",
            "**Não circulante:** prazo maior que esse.",
            "Se o ciclo operacional da empresa for maior que um ano, vale o ciclo operacional (art. 179, parágrafo único).",
            "No Ativo, as contas aparecem em ordem decrescente de **liquidez**; no Passivo, em ordem de **exigibilidade**.",
          ] },
        ],
      },
      {
        titulo: "5. Contas que fogem à regra do grupo",
        blocos: [
          { t: "p", texto: "A conta **redutora** tem natureza **oposta** à do grupo em que está:" },
          { t: "tabela", cab: ["Grupo", "Conta redutora (exemplo do CTC)", "Natureza"], linhas: [
            ["Ativo", "1.1.2.99 (−) Provisão para Créditos de Liquidação Duvidosa", "Credora"],
            ["Ativo", "1.2.3.53 (−) Depreciação Acumulada Veículos", "Credora"],
            ["Passivo", "2.1.10.99 (−) Encargos (duplicatas descontadas)", "Devedora"],
            ["PL", "3.1.02 (−) Capital a Integralizar", "Devedora"],
            ["PL", "3.6 (−) Prejuízos Acumulados", "Devedora"],
            ["Receitas", "4.2 (−) Deduções da Receita (ICMS sobre vendas, devoluções, abatimentos)", "Devedora"],
          ] },
          { t: "destaque", texto: "As **Deduções da Receita** (4.2) ficam no grupo das Receitas, mas têm natureza **devedora**: reduzem a receita bruta para chegar à receita líquida." },
        ],
      },
      {
        titulo: "6. Exemplo: conta redutora no Balanço",
        blocos: [
          { t: "exemplo", titulo: "Veículo de R$ 50.000,00 já depreciado em R$ 10.000,00", tabela: { cab: ["Imobilizado", "R$"], linhas: [
            ["Veículos", "50.000,00"],
            ["(−) Depreciação Acumulada Veículos", "(10.000,00)"],
            ["**Valor contábil líquido**", "**40.000,00**"],
          ] } },
          { t: "p", texto: "O valor original do bem continua em \"Veículos\"; a redutora mostra quanto dele já foi consumido pelo uso." },
        ],
      },
      {
        titulo: "No CTC",
        blocos: [
          { t: "lista", itens: [
            "A empresa de cada aluno usa o **plano de contas padrão do CTC**: 296 contas, das quais 242 aceitam lançamento.",
            "Na escrituração, o sistema **só deixa escolher contas que aceitam lançamento**; uma conta sintética gera o aviso \"escolha a conta\".",
            "O balancete, o Balanço e a DRE são montados automaticamente a partir dos grupos e níveis do plano.",
          ] },
        ],
      },
    ],
    fontes: FONTES_CB02,
  },
  "cb-03": {
    titulo: "Débito e Crédito: partidas dobradas e razonetes",
    resumo: "Conta e razonete, método das partidas dobradas, regras de débito e crédito, fórmulas de lançamento, apuração de saldos e esquema geral de movimentações.",
    secoes: [
      {
        titulo: "1. Conta e razonete",
        blocos: [
          { t: "p", texto: "**Conta** é o nome técnico que identifica cada elemento do patrimônio (bens, direitos, obrigações e PL) e do resultado (receitas, despesas e custos). Exemplos: Caixa Geral, Fornecedores, Capital Social, Aluguéis." },
          { t: "p", texto: "O **razonete** é a forma gráfica simplificada de uma conta, em \"T\": o **lado esquerdo** é o **débito (D)** e o **lado direito** é o **crédito (C)**." },
          { t: "destaque", texto: "Em Contabilidade, \"débito\" e \"crédito\" **não** significam \"dívida\" e \"dinheiro a receber\". São apenas os **dois lados** da conta: debitar é registrar no lado esquerdo; creditar é registrar no lado direito." },
        ],
      },
      {
        titulo: "2. O método das partidas dobradas",
        blocos: [
          { t: "p", texto: "O método das partidas dobradas é o fundamento da escrituração contábil moderna, aplicado em todo o mundo. Foi sistematizado por **Luca Pacioli, em 1494**, na obra Summa de Arithmetica." },
          { t: "lista", numerada: true, itens: [
            "Cada fato contábil é registrado em, **no mínimo, duas contas**.",
            "A soma dos **débitos** é sempre igual à soma dos **créditos**.",
            "Por isso a equação patrimonial nunca se desequilibra: **Ativo = Passivo + Patrimônio Líquido**.",
          ] },
          { t: "p", texto: "**Por que é importante:** garante a exatidão dos registros; permite localizar erros (se débitos ≠ créditos, há erro); é a base das demonstrações contábeis (Balanço Patrimonial, DRE); fortalece o controle patrimonial e financeiro." },
        ],
      },
      {
        titulo: "3. As regras de débito e crédito",
        blocos: [
          { t: "p", texto: "A regra vem da **natureza** de cada grupo (Módulo 02):" },
          { t: "tabela", cab: ["Grupo", "Natureza", "Aumenta com", "Diminui com"], linhas: [
            ["Ativo", "Devedora", "**Débito**", "Crédito"],
            ["Despesas e Custos", "Devedora", "**Débito**", "Crédito"],
            ["Passivo", "Credora", "**Crédito**", "Débito"],
            ["Patrimônio Líquido", "Credora", "**Crédito**", "Débito"],
            ["Receitas", "Credora", "**Crédito**", "Débito"],
          ] },
          { t: "destaque", texto: "Outra forma de lembrar: o **débito** mostra **onde o recurso foi aplicado** (entrou dinheiro no caixa, entrou mercadoria, surgiu uma despesa); o **crédito** mostra **de onde o recurso veio** (saiu do caixa, veio do fornecedor, veio dos sócios, veio de uma receita)." },
        ],
      },
      {
        titulo: "4. O lançamento e suas fórmulas",
        blocos: [
          { t: "p", texto: "**Elementos do lançamento:** data, conta debitada, conta creditada, histórico (a descrição do fato) e valor." },
          { t: "tabela", cab: ["Fórmula", "Contas", "Exemplo"], linhas: [
            ["1ª", "1 débito e 1 crédito", "Compra de móveis à vista"],
            ["2ª", "1 débito e vários créditos", "Compra de veículo com entrada em dinheiro e o restante financiado"],
            ["3ª", "Vários débitos e 1 crédito", "Pagamento de duplicata com juros, pelo banco"],
            ["4ª", "Vários débitos e vários créditos", "Venda com baixa do estoque (receita e CMV juntos)"],
          ] },
          { t: "p", texto: "Em todas as fórmulas, **total dos débitos = total dos créditos**." },
        ],
      },
      {
        titulo: "5. Como lançar: quatro perguntas",
        blocos: [
          { t: "lista", numerada: true, itens: [
            "**Quais contas** o fato movimenta?",
            "**A que grupo** cada conta pertence (Ativo, Passivo, PL, Receita, Despesa)?",
            "Cada conta **aumentou ou diminuiu**?",
            "Pela tabela da seção 3: **débito ou crédito**?",
          ] },
          { t: "exemplo", titulo: "Exemplo resolvido — pagamento de aluguel de R$ 1.000,00 em dinheiro", itens: [
            "Contas: Aluguéis (despesa) e Caixa Geral (ativo).",
            "A despesa **aumentou** → **débito**. O Caixa **diminuiu** → **crédito**.",
            "Lançamento: **D – 5.1.14 Aluguéis** R$ 1.000,00 / **C – 1.1.1.01 Caixa Geral** R$ 1.000,00.",
          ] },
        ],
      },
      {
        titulo: "6. Saldo do razonete",
        blocos: [
          { t: "lista", itens: [
            "**Saldo devedor:** a soma dos débitos é maior que a dos créditos.",
            "**Saldo credor:** a soma dos créditos é maior que a dos débitos.",
            "**Saldo nulo:** as duas somas são iguais.",
          ] },
          { t: "exemplo", titulo: "Razonete do Caixa Geral", tabela: { cab: ["Débito", "Crédito"], linhas: [
            ["10.000,00 (saldo inicial)", "1.000,00 (aluguel)"],
            ["8.000,00 (serviço recebido)", "3.500,00 (compra de mercadorias)"],
            ["**18.000,00**", "**4.500,00**"],
          ] } },
          { t: "p", texto: "Saldo **devedor** de R$ 13.500,00 — normal para uma conta de Ativo. Somando os saldos de todos os razonetes, o total dos saldos devedores é igual ao dos credores: é o **balancete de verificação** (Módulo 08)." },
        ],
      },
      {
        titulo: "7. Exemplos resolvidos",
        blocos: [
          { t: "tabela", cab: ["Fato", "Débito", "Crédito", "Comentário"], linhas: [
            ["Recebeu R$ 8.000,00 em dinheiro por serviços prestados", "1.1.1.01 Caixa Geral", "4.1.1.03 Receita de Prestação de Serviços", "Entra dinheiro (Ativo ↑) e surge uma receita, conta de resultado que aumenta o PL"],
            ["Comprou mercadorias à vista, R$ 3.500,00", "1.1.3.01 Mercadorias para Revenda", "1.1.1.01 Caixa Geral", "Entra mercadoria e sai dinheiro (Ativo ↑ e Ativo ↓)"],
            ["Pagou R$ 1.200,00 de energia por transferência", "5.1.04 Energia Elétrica", "1.1.1.02.01 Banco X", "Despesa ↑ e Banco ↓"],
            ["Cliente pagou duplicata de R$ 2.000,00 em dinheiro", "1.1.1.01 Caixa Geral", "1.1.2.01 Duplicatas a Receber", "Entra dinheiro e baixa o direito"],
            ["Comprou computador a prazo, R$ 4.000,00", "1.2.3.07 Equipamentos de Informática", "2.1.1.01 Duplicatas a Pagar", "Imobilizado ↑ e obrigação ↑"],
          ] },
        ],
      },
      {
        titulo: "8. Esquema geral de movimentações",
        blocos: [
          { t: "tabela", cab: ["Operação", "Débito", "Crédito"], linhas: [
            ["Compra de mercadorias", "1.1.3.01 Mercadorias para Revenda", "Caixa/Banco (à vista) ou 2.1.1.01 Duplicatas a Pagar (a prazo)"],
            ["Venda de mercadorias", "Caixa/Banco ou 1.1.2.01 Duplicatas a Receber", "4.1.1.01 Receita de Vendas de Mercadorias"],
            ["Baixa do custo da venda", "6.2.01 CMV", "1.1.3.01 Mercadorias para Revenda"],
            ["Prestação de serviço", "Caixa/Banco ou Duplicatas a Receber", "4.1.1.03 Receita de Prestação de Serviços"],
            ["Compra de imobilizado", "1.2.3.xx (Móveis, Veículos…)", "Caixa/Banco ou Duplicatas a Pagar"],
            ["Salários do mês (reconhecer)", "5.1.02 Salários Administrativos", "2.1.3.01 Salários a Pagar"],
            ["Pagamento dos salários", "2.1.3.01 Salários a Pagar", "Caixa/Banco"],
            ["Aplicação financeira", "1.1.1.03.xx Aplicação Banco X", "1.1.1.02.xx Banco X"],
            ["Resgate da aplicação", "Banco X", "Aplicação Banco X"],
            ["Rendimento da aplicação", "Banco X", "4.3.02 Rendimentos de Aplicações Financeiras"],
            ["Despesas (energia, aluguel, propaganda)", "5.1.04 / 5.1.14 / 5.2.01", "Caixa/Banco"],
            ["Aluguel recebido", "Caixa/Banco", "4.4.01 Receitas de Aluguéis"],
            ["Dividendos recebidos", "Caixa/Banco", "4.4.03 Dividendos Recebidos"],
            ["Empréstimo obtido", "Caixa/Banco", "2.1.9.01 Empréstimos Bancários"],
            ["Pagamento do empréstimo", "2.1.9.01 Empréstimos Bancários", "Caixa/Banco"],
            ["Juros do empréstimo", "5.3.01 Juros Passivos", "Caixa/Banco"],
          ] },
          { t: "p", texto: "Tributos sobre vendas, depreciação, provisões e perdas com clientes são estudados nos módulos e disciplinas próprios." },
        ],
      },
      {
        titulo: "No CTC",
        blocos: [
          { t: "lista", itens: [
            "O lançamento do CTC já segue as partidas dobradas: só é gravado se **débitos = créditos**, e aceita várias linhas de débito e de crédito (2ª, 3ª e 4ª fórmulas).",
            "Os razonetes de cada conta da sua empresa aparecem no **Razão por conta** (Módulo 05).",
            "Pratique agora com o exercício de razonetes abaixo.",
          ] },
        ],
      },
    ],
    fontes: FONTES_CB03,
  },
};

export const teoriaDo = (disciplina, numero) => TEORIA[`${disciplina}-${String(numero).padStart(2, "0")}`] || null;
