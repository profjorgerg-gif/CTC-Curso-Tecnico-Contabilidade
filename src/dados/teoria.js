// Teoria dos módulos (aprovada pelo professor: Módulo 01 em 04/10/2026, Módulos 02 a 05 em 05/10/2026, Módulos 06 a 10 em 06/10/2026).
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

const FONTES_CB04 = [
  "BRASIL. Lei nº 10.406, de 10 de janeiro de 2002. Institui o Código Civil. Arts. 1.052 a 1.055.",
  "BRASIL. Lei nº 6.404, de 15 de dezembro de 1976. Dispõe sobre as Sociedades por Ações. Arts. 7º e 182.",
  "MARION, J. C. Contabilidade básica. 12. ed. São Paulo: Atlas, 2014.",
  "RIBEIRO, O. M. Contabilidade básica fácil. 28. ed. São Paulo: Saraiva, 2012.",
];

const FONTES_CB05 = [
  "CARDOSO, J. L. Livro Diário — resumo. Material didático. Blumenau: CEDUP Hermann Hering, 2025.",
  "BRASIL. Lei nº 10.406, de 10 de janeiro de 2002. Institui o Código Civil. Arts. 1.179 a 1.183.",
  "BRASIL. Lei nº 8.218, de 29 de agosto de 1991. Art. 14.",
  "BRASIL. Decreto nº 8.683, de 25 de fevereiro de 2016.",
  "CFC – CONSELHO FEDERAL DE CONTABILIDADE. ITG 2000 (R1) – Escrituração Contábil. Brasília: CFC.",
  "MARION, J. C. Contabilidade básica. 12. ed. São Paulo: Atlas, 2014.",
];

const FONTES_CB06 = [
  "CARDOSO, J. L. Compra e Venda de Mercadorias com Tributos; Resumo para Quadro. Material didático. Blumenau: CEDUP Hermann Hering, 2025.",
  "CPC – COMITÊ DE PRONUNCIAMENTOS CONTÁBEIS. CPC 16 (R1) – Estoques. Brasília: CPC.",
  "MARION, J. C. Contabilidade básica. 12. ed. São Paulo: Atlas, 2014.",
  "RIBEIRO, O. M. Contabilidade básica fácil. 28. ed. São Paulo: Saraiva, 2012.",
];

const FONTES_CB07 = [
  "CARDOSO, J. L. Folha de Pagamento na Prática; Exemplo de Contabilização da Folha (Competência e Pagamento). Material didático. Blumenau: CEDUP Hermann Hering, 2025.",
  "CPC – COMITÊ DE PRONUNCIAMENTOS CONTÁBEIS. CPC 00 (R2) – Estrutura Conceitual para Relatório Financeiro. Brasília, 2019.",
  "MARION, J. C. Contabilidade básica. 12. ed. São Paulo: Atlas, 2014.",
  "RIBEIRO, O. M. Contabilidade básica fácil. 28. ed. São Paulo: Saraiva, 2012.",
];

const FONTES_CB08 = [
  "CARDOSO, J. L. Trabalho Final – Contabilidade Básica (MPD, LD, LR, BV, BP e DRE). Material didático. Blumenau: CEDUP Hermann Hering, 2025.",
  "IUDÍCIBUS, S. de (coord.). Contabilidade introdutória. 10. ed. São Paulo: Atlas, 2009.",
  "MARION, J. C. Contabilidade básica. 12. ed. São Paulo: Atlas, 2014.",
  "RIBEIRO, O. M. Contabilidade básica fácil. 28. ed. São Paulo: Saraiva, 2012.",
];

const FONTES_CB09 = [
  "CARDOSO, J. L. DRE — modelo CEDUP. Material didático. Blumenau: CEDUP Hermann Hering, 2025.",
  "BRASIL. Lei nº 6.404, de 15 de dezembro de 1976. Dispõe sobre as Sociedades por Ações. Art. 187.",
  "CFC – CONSELHO FEDERAL DE CONTABILIDADE. NBC TG 26 (R5) – Apresentação das Demonstrações Contábeis. Brasília: CFC.",
  "MARION, J. C. Contabilidade básica. 12. ed. São Paulo: Atlas, 2014.",
];

const FONTES_CB10 = [
  "IUDÍCIBUS, S. de (coord.). Contabilidade introdutória. 10. ed. São Paulo: Atlas, 2009.",
  "MARION, J. C. Contabilidade básica. 12. ed. São Paulo: Atlas, 2014.",
  "RIBEIRO, O. M. Contabilidade básica fácil. 28. ed. São Paulo: Saraiva, 2012.",
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
            "A empresa de cada aluno usa o **plano de contas padrão do CTC**: 298 contas, das quais 244 aceitam lançamento.",
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
  "cb-04": {
    titulo: "Saldos Iniciais (abertura da empresa)",
    resumo: "Constituição da empresa, capital subscrito, integralizado e a integralizar, integralização em dinheiro e em bens, saldos iniciais e balanço de abertura.",
    secoes: [
      {
        titulo: "1. A constituição da empresa",
        blocos: [
          { t: "p", texto: "A empresa nasce quando os sócios assinam o **contrato social** (sociedade limitada) ou o **estatuto** (sociedade anônima), que é registrado na **Junta Comercial**; em seguida ela obtém o **CNPJ**." },
          { t: "p", texto: "O contrato define o **capital social**: o valor dos recursos que os sócios se comprometem a entregar à empresa para que ela comece a funcionar." },
        ],
      },
      {
        titulo: "2. Capital subscrito, integralizado e a integralizar",
        blocos: [
          { t: "tabela", cab: ["Termo", "Significado"], linhas: [
            ["**Capital subscrito**", "Valor que os sócios **se comprometeram** a entregar (o que está no contrato)"],
            ["**Capital integralizado**", "Parte **efetivamente entregue** à empresa"],
            ["**Capital a integralizar**", "Parte **ainda não entregue** — conta **redutora do PL**, de natureza **devedora** (3.1.02)"],
          ] },
          { t: "lista", itens: [
            "**Na subscrição** (assinatura do contrato): D – 3.1.02 (−) Capital a Integralizar / C – 3.1.01 Capital Subscrito.",
            "**Na integralização** (entrega dos recursos): D – Caixa, Banco ou o bem entregue / C – 3.1.02 (−) Capital a Integralizar.",
            "Quando os sócios entregam tudo **no mesmo ato** da assinatura, o lançamento é direto: D – Ativo / C – 3.1.01 Capital Subscrito.",
          ] },
          { t: "exemplo", titulo: "Capital subscrito de R$ 100.000,00; integralizados R$ 60.000,00 em dinheiro, o restante em 6 meses", tabela: { cab: ["Ativo", "R$", "Patrimônio Líquido", "R$"], linhas: [
            ["Caixa Geral", "60.000,00", "Capital Subscrito", "100.000,00"],
            ["", "", "(−) Capital a Integralizar", "(40.000,00)"],
            ["**Total**", "**60.000,00**", "**Total**", "**60.000,00**"],
          ] } },
          { t: "destaque", texto: "O PL mostra só o que os sócios **já entregaram**; o compromisso que falta aparece como redutora." },
        ],
      },
      {
        titulo: "3. Integralização em dinheiro e em bens",
        blocos: [
          { t: "p", texto: "O capital pode ser integralizado em **dinheiro** ou em **bens suscetíveis de avaliação em dinheiro** — imóveis, veículos, móveis, máquinas (Lei 6.404/1976, art. 7º). Na sociedade limitada, **não se admite integralização em prestação de serviços** (Código Civil, art. 1.055, § 2º)." },
          { t: "exemplo", titulo: "Cia. Vamos (fato 01) — capital de R$ 300.000,00 em sala comercial, veículo e dinheiro", tabela: { cab: ["", "Conta", "R$"], linhas: [
            ["D", "1.2.3.01 Edificações", "70.000,00"],
            ["D", "1.2.3.03 Veículos", "25.000,00"],
            ["D", "1.1.1.01 Caixa Geral", "205.000,00"],
            ["C", "3.1.01 Capital Subscrito", "300.000,00"],
          ] } },
          { t: "p", texto: "É um lançamento de **3ª fórmula** (vários débitos e um crédito), como no Módulo 03." },
        ],
      },
      {
        titulo: "4. Saldos iniciais e balanço de abertura",
        blocos: [
          { t: "p", texto: "**Saldos iniciais** são os saldos das contas no **primeiro dia** da escrituração:" },
          { t: "lista", itens: [
            "**Empresa nova:** os saldos iniciais vêm da integralização do capital (o lançamento de abertura).",
            "**Empresa que já existia** (novo exercício ou mudança de sistema): os saldos iniciais são os **saldos finais do exercício anterior**, tirados do último Balanço Patrimonial.",
          ] },
          { t: "p", texto: "**Só as contas patrimoniais** (Ativo, Passivo e PL) têm saldo inicial. As contas de resultado começam o exercício **zeradas**, porque foram encerradas na ARE do exercício anterior (Módulo 10)." },
          { t: "destaque", texto: "No balanço de abertura, **total dos saldos devedores = total dos saldos credores**." },
        ],
      },
      {
        titulo: "5. Exemplo: empresa que já existia",
        blocos: [
          { t: "exemplo", titulo: "Saldos finais de 31/12 que viram os saldos iniciais de 01/01", tabela: { cab: ["Conta", "Saldo devedor", "Saldo credor"], linhas: [
            ["1.1.1.01 Caixa Geral", "8.000,00", ""],
            ["1.1.1.02.01 Banco X", "22.000,00", ""],
            ["1.1.3.01 Mercadorias para Revenda", "15.000,00", ""],
            ["1.2.3.02 Móveis e Utensílios", "10.000,00", ""],
            ["2.1.1.01 Duplicatas a Pagar", "", "12.000,00"],
            ["3.1.01 Capital Subscrito", "", "40.000,00"],
            ["3.4.01 Reserva Legal", "", "3.000,00"],
            ["**Totais**", "**55.000,00**", "**55.000,00**"],
          ] } },
        ],
      },
      {
        titulo: "No CTC",
        blocos: [
          { t: "lista", itens: [
            "Em **Minha empresa**, você informa o **capital social**.",
            "Em **Escrituração → Saldos iniciais**, o CTC já coloca o **Capital Subscrito** a crédito pelo valor do capital social; você distribui o mesmo valor **a débito** nas contas do Ativo que os sócios entregaram (Caixa, Bancos, Imobilizado).",
            "O CTC só aceita quando o **total devedor é igual ao total credor**. Depois de gravados, os saldos iniciais aparecem no Razão, no Balancete e no Balanço — são o ponto de partida de todos os lançamentos.",
            "Antes, pratique com o exercício de abertura da Comercial Gama, abaixo.",
          ] },
        ],
      },
    ],
    fontes: FONTES_CB04,
  },
  "cb-05": {
    titulo: "Livros Diário e Razão",
    resumo: "O Livro Diário e a estrutura do lançamento, formalidades da escrituração, correção de erros, ECD/SPED, o Livro Razão e a diferença entre os dois.",
    secoes: [
      {
        titulo: "1. O Livro Diário",
        blocos: [
          { t: "p", texto: "O **Livro Diário** é um dos principais livros obrigatórios da contabilidade de qualquer entidade — empresa, instituição pública ou organização sem fins lucrativos —, previsto no **Código Civil** (Lei nº 10.406/2002) e na **Lei das S.A.** (Lei nº 6.404/1976)." },
          { t: "p", texto: "Sua função é **registrar, em ordem cronológica e de forma detalhada, todos os fatos contábeis** que afetam o patrimônio — compras, vendas, pagamentos, recebimentos, provisões —, seguindo o **método das partidas dobradas** (Módulo 03)." },
          { t: "p", texto: "Além de instrumento de controle interno, o Diário é **exigência legal e fiscal**. Mantê-lo em ordem é responsabilidade do contador e base para as decisões, para as demonstrações contábeis e para a comprovação da regularidade fiscal." },
        ],
      },
      {
        titulo: "2. Estrutura do lançamento no Diário",
        blocos: [
          { t: "p", texto: "Cada lançamento contém obrigatoriamente: **data** do fato; **conta debitada**; **conta creditada**; **histórico** (descrição do fato, com o documento de origem); **valor**." },
          { t: "exemplo", titulo: "Modelo de página do Livro Diário", tabela: { cab: ["Data", "Histórico", "Débito (R$)", "Crédito (R$)"], linhas: [
            ["01/03/2025", "D – 1.1.1.01 Caixa Geral", "10.000,00", ""],
            ["", "C – 3.1.01 Capital Subscrito", "", "10.000,00"],
            ["", "Integralização de capital em dinheiro pelo sócio Marcos Almeida.", "", ""],
            ["05/03/2025", "D – 1.1.3.01 Mercadorias para Revenda", "3.000,00", ""],
            ["", "C – 1.1.1.01 Caixa Geral", "", "3.000,00"],
            ["", "Compra de mercadorias à vista, conforme NF nº 000123.", "", ""],
          ] } },
          { t: "destaque", texto: "O histórico deve permitir entender o fato **sem consultar outro documento**: o que aconteceu, com quem e o número da nota fiscal, duplicata ou fatura." },
        ],
      },
      {
        titulo: "3. Formalidades da escrituração",
        blocos: [
          { t: "p", texto: "A escrituração é feita em **idioma e moeda nacional**, em **forma contábil** (partidas dobradas), em **ordem cronológica** de dia, mês e ano, **sem** intervalos em branco, entrelinhas, borrões, rasuras, emendas ou transportes para as margens (Código Civil, art. 1.183; ITG 2000)." },
          { t: "p", texto: "**Como corrigir um erro:** nunca se apaga nem se rasura. Usa-se o **lançamento de estorno** (o lançamento inverso, que anula o errado), o **lançamento de transferência** (leva o valor para a conta certa) ou o **lançamento complementar** (acerta, para mais ou para menos, o valor registrado)." },
        ],
      },
      {
        titulo: "4. Livro Diário eletrônico (SPED Contábil)",
        blocos: [
          { t: "p", texto: "Hoje o Diário é digital: é a **ECD – Escrituração Contábil Digital**, parte do **SPED** (Sistema Público de Escrituração Digital), que substitui o antigo livro em papel e dá mais segurança e agilidade à fiscalização." },
          { t: "p", texto: "O livro em papel precisava ser autenticado na Junta Comercial; na ECD, a **autenticação acontece com a própria transmissão ao SPED** (Decreto nº 8.683/2016)." },
        ],
      },
      {
        titulo: "5. O Livro Razão",
        blocos: [
          { t: "p", texto: "O **Livro Razão** reúne os lançamentos do Diário **conta por conta**, com o **saldo** depois de cada movimento. O razonete do Módulo 03 é a forma simplificada do Razão." },
          { t: "exemplo", titulo: "Razão da conta 1.1.1.01 Caixa Geral", tabela: { cab: ["Data", "Histórico", "Débito", "Crédito", "Saldo", "D/C"], linhas: [
            ["01/03", "Integralização de capital", "10.000,00", "", "10.000,00", "D"],
            ["05/03", "Compra de mercadorias, NF 000123", "", "3.000,00", "7.000,00", "D"],
          ] } },
        ],
      },
      {
        titulo: "6. Diário × Razão",
        blocos: [
          { t: "tabela", cab: ["Característica", "Livro Diário", "Livro Razão"], linhas: [
            ["Objetivo", "Registrar todos os fatos em **ordem cronológica**", "Detalhar os lançamentos **por conta**"],
            ["Obrigatoriedade", "Obrigatório por lei", "**Obrigatório** para as empresas do Lucro Real (Lei nº 8.218/1991, art. 14) e registro permanente da entidade (ITG 2000)"],
            ["Forma", "Método das partidas dobradas", "Os mesmos lançamentos do Diário, agrupados por conta"],
            ["Uso", "Ver tudo o que aconteceu numa data", "Acompanhar o saldo e o movimento de uma conta"],
          ] },
        ],
      },
      {
        titulo: "7. Exercício resolvido",
        blocos: [
          { t: "exemplo", titulo: "12/03 — venda à vista de R$ 5.000,00, custo de R$ 2.500,00", tabela: { cab: ["Data", "Histórico", "Débito", "Crédito"], linhas: [
            ["12/03", "D – 1.1.1.01 Caixa Geral", "5.000,00", ""],
            ["", "C – 4.1.1.01 Receita de Vendas de Mercadorias", "", "5.000,00"],
            ["", "D – 6.2.01 CMV", "2.500,00", ""],
            ["", "C – 1.1.3.01 Mercadorias para Revenda", "", "2.500,00"],
            ["", "Venda de mercadorias à vista e baixa do custo das mercadorias vendidas.", "", ""],
          ] } },
          { t: "exemplo", titulo: "14/03 — pagamento do salário de Pedro Silva, R$ 1.800,00, pelo banco", tabela: { cab: ["Data", "Histórico", "Débito", "Crédito"], linhas: [
            ["14/03", "D – 5.1.02 Salários Administrativos", "1.800,00", ""],
            ["", "C – 1.1.1.02.01 Banco X", "", "1.800,00"],
            ["", "Pagamento de salário ao funcionário Pedro Silva.", "", ""],
          ] } },
          { t: "p", texto: "Se o salário já tivesse sido reconhecido no fim do mês anterior (Salários a Pagar), o débito iria para **2.1.3.01 Salários a Pagar** — é o regime de competência, que volta no Módulo 07." },
        ],
      },
      {
        titulo: "No CTC",
        blocos: [
          { t: "lista", itens: [
            "**Escrituração → Lançamentos** é o **Livro Diário** da sua empresa: data, contas, valores e histórico, em ordem cronológica.",
            "**Razão por conta** é o **Livro Razão**: escolha a conta e veja cada movimento com o saldo.",
            "Para corrigir um lançamento, use **corrigir** no próprio lançamento; o CTC registra quem alterou e quando.",
            "Pratique antes com o exercício \"Do Diário ao Razão\", abaixo.",
          ] },
        ],
      },
    ],
    fontes: FONTES_CB05,
  },
  "cb-06": {
    titulo: "Operações com Mercadorias e Controle de Estoque",
    resumo: "Compra e venda de mercadorias, custo de aquisição, inventário permanente e periódico, ficha de controle de estoque, PEPS e Média Ponderada (UEPS só no comparativo) e lucro bruto.",
    secoes: [
      {
        titulo: "1. Operações com mercadorias",
        blocos: [
          { t: "p", texto: "A empresa comercial **compra mercadorias para revender**. Cada operação tem seu registro:" },
          { t: "tabela", cab: ["Operação", "Débito", "Crédito"], linhas: [
            ["Compra à vista", "1.1.3.01 Mercadorias para Revenda", "Caixa/Banco"],
            ["Compra a prazo", "1.1.3.01 Mercadorias para Revenda", "2.1.1.01 Duplicatas a Pagar"],
            ["Venda à vista (receita)", "Caixa/Banco", "4.1.1.01 Receita de Vendas de Mercadorias"],
            ["Venda a prazo (receita)", "1.1.2.01 Duplicatas a Receber", "4.1.1.01 Receita de Vendas de Mercadorias"],
            ["Baixa do custo da venda", "6.2.01 CMV", "1.1.3.01 Mercadorias para Revenda"],
          ] },
          { t: "destaque", texto: "Toda venda tem **dois lados**: a **receita** (pelo preço de venda) e o **custo** (pelo custo da mercadoria que saiu do estoque — o CMV). O **lucro bruto** é a diferença." },
        ],
      },
      {
        titulo: "2. O custo de aquisição",
        blocos: [
          { t: "p", texto: "O estoque é registrado pelo **custo de aquisição** (CPC 16): preço de compra **mais** fretes, seguros e outros gastos para trazer a mercadoria até a empresa, **menos** descontos incondicionais e tributos recuperáveis. Os tributos recuperáveis (ICMS, PIS e COFINS a recuperar) são estudados na Contabilidade Intermediária e na Tributária." },
        ],
      },
      {
        titulo: "3. Inventário permanente × periódico",
        blocos: [
          { t: "tabela", cab: ["", "Permanente", "Periódico"], linhas: [
            ["Controle", "A cada entrada e saída, na **ficha de estoque**", "Só no fim do período, por **contagem física**"],
            ["CMV", "Apurado a cada venda", "**CMV = Estoque Inicial + Compras − Estoque Final**"],
            ["No CTC", "Venda e CMV no mesmo lançamento", "Apuração do CMV no encerramento"],
          ] },
        ],
      },
      {
        titulo: "4. A ficha de controle de estoque",
        blocos: [
          { t: "p", texto: "A **ficha de controle de estoque** (kardex) registra cada movimento da mercadoria em três blocos: **entradas**, **saídas** e **saldo** — cada um com quantidade, custo unitário e total. O custo de cada saída depende do **método de avaliação**." },
          { t: "p", texto: "**Movimentos do exemplo** (são os fatos orientados 1 a 4 do CTC): compra de 100 un a R$ 20,00; compra de 50 un a R$ 25,00; venda de 40 un por R$ 3.000,00; venda de 30 un por R$ 2.400,00." },
        ],
      },
      {
        titulo: "5. Os métodos de avaliação",
        blocos: [
          { t: "p", texto: "**a) PEPS — Primeiro que Entra, Primeiro que Sai:** a saída usa o custo dos lotes **mais antigos**." },
          { t: "tabela", cab: ["Movimento", "Custo da saída", "Saldo"], linhas: [
            ["Compra 100 × 20,00", "—", "100 un · 2.000,00"],
            ["Compra 50 × 25,00", "—", "150 un · 3.250,00"],
            ["Venda 40 un", "40 × 20,00 = **800,00**", "110 un · 2.450,00"],
            ["Venda 30 un", "30 × 20,00 = **600,00**", "80 un · 1.850,00"],
          ] },
          { t: "p", texto: "CMV = **R$ 1.400,00**; estoque final = R$ 1.850,00 (30 un a R$ 20,00 + 50 un a R$ 25,00)." },
          { t: "p", texto: "**b) Média Ponderada Móvel:** a cada compra recalcula-se o custo médio; a saída usa esse custo. Depois das duas compras: 3.250,00 ÷ 150 = **R$ 21,67** por unidade." },
          { t: "tabela", cab: ["Movimento", "Custo da saída", "Saldo"], linhas: [
            ["Compra 100 × 20,00", "—", "100 un · 2.000,00"],
            ["Compra 50 × 25,00", "—", "150 un · 3.250,00 (média 21,67)"],
            ["Venda 40 un", "40 × 21,67 = **866,67**", "110 un · 2.383,33"],
            ["Venda 30 un", "30 × 21,67 = **650,00**", "80 un · 1.733,33"],
          ] },
          { t: "p", texto: "CMV = **R$ 1.516,67**; estoque final = R$ 1.733,33." },
          { t: "p", texto: "**c) UEPS — Último que Entra, Primeiro que Sai (só para comparação):** a saída usa o custo dos lotes **mais recentes**. Daria CMV de R$ 1.650,00 e estoque final de R$ 1.600,00." },
          { t: "destaque", texto: "O **UEPS não é permitido** pelo CPC 16 nem pela legislação do Imposto de Renda: com preços subindo, aumenta o CMV e reduz o lucro tributável. No CTC, aparece **só no comparativo** do Controle de Estoque." },
        ],
      },
      {
        titulo: "6. Comparativo e lucro bruto",
        blocos: [
          { t: "p", texto: "Receita das duas vendas: 3.000,00 + 2.400,00 = **R$ 5.400,00**." },
          { t: "tabela", cab: ["Método", "CMV", "Lucro bruto (Receita − CMV)", "Estoque final"], linhas: [
            ["PEPS", "1.400,00", "**4.000,00**", "1.850,00"],
            ["Média Ponderada", "1.516,67", "**3.883,33**", "1.733,33"],
            ["UEPS (não permitido)", "1.650,00", "3.750,00", "1.600,00"],
          ] },
          { t: "p", texto: "Com preços em alta, o **PEPS** dá o maior lucro e o maior estoque final; o **UEPS**, o menor; a **Média** fica no meio." },
        ],
      },
      {
        titulo: "7. Apuração do resultado da venda",
        blocos: [
          { t: "tabela", cab: ["", "R$"], linhas: [
            ["Receita Bruta", "5.400,00"],
            ["(−) Deduções (tributos sobre vendas — CI/CT)", "—"],
            ["= Receita Líquida", "5.400,00"],
            ["(−) CMV (PEPS)", "1.400,00"],
            ["**= Lucro Bruto**", "**4.000,00**"],
          ] },
        ],
      },
      {
        titulo: "No CTC",
        blocos: [
          { t: "lista", itens: [
            "Na **Parametrização**, você escolhe o **inventário** (permanente ou periódico) e o **método** (PEPS ou Média Ponderada).",
            "Na venda, o lançamento já tem a **receita** e a **baixa do CMV**; a ajuda do CMV calcula o custo pelo método da sua empresa.",
            "O **Controle de estoque** mostra a ficha de cada movimento e o comparativo dos métodos.",
            "Pratique antes com a ficha de controle de estoque, abaixo.",
          ] },
        ],
      },
    ],
    fontes: FONTES_CB06,
  },
  "cb-07": {
    titulo: "Lançamentos: 8 fatos orientados e regime de competência",
    resumo: "Os 8 fatos orientados, o regime de competência na escrituração (despesas a pagar, receitas a receber, despesas antecipadas) e a folha de pagamento: competência e pagamento.",
    secoes: [
      {
        titulo: "1. Do estudo à prática",
        blocos: [
          { t: "p", texto: "Você já estudou as contas, o débito e o crédito, a abertura, o Diário e o Razão e as operações com mercadorias. Agora é hora de **escriturar a empresa**. Os **8 fatos orientados** do CTC cobrem as operações básicas de uma empresa comercial:" },
          { t: "tabela", cab: ["Fatos", "Operação", "O que praticar"], linhas: [
            ["1 e 2", "Compra de mercadorias, à vista e a prazo", "Estoque × Caixa ou Duplicatas a Pagar"],
            ["3 e 4", "Venda de mercadorias, à vista e a prazo", "Receita + baixa do CMV (Módulo 06)"],
            ["5", "Pagamento a fornecedor", "Baixa da obrigação"],
            ["6", "Recebimento de cliente", "Baixa do direito"],
            ["7 e 8", "Aluguel e salários", "Despesas"],
          ] },
          { t: "destaque", texto: "Para cada fato, use as **quatro perguntas** do Módulo 03: quais contas, que grupo, aumentou ou diminuiu, débito ou crédito." },
        ],
      },
      {
        titulo: "2. O regime de competência na prática",
        blocos: [
          { t: "p", texto: "Pelo **regime de competência** (Módulo 01), receita e despesa pertencem ao **período em que acontecem**, não ao período em que o dinheiro entra ou sai. Na escrituração, isso gera três situações:" },
          { t: "tabela", cab: ["Situação", "No mês em que acontece", "No mês do dinheiro"], linhas: [
            ["**Despesa a pagar** (aluguel ou salários do mês, pagos no mês seguinte)", "D Despesa / C Obrigação a pagar (ex.: 2.1.2.03 Aluguéis a Pagar)", "D Obrigação / C Banco"],
            ["**Receita a receber** (aluguel do mês, recebido no mês seguinte)", "D Direito a receber (ex.: 1.1.2.10 Aluguéis a Receber) / C Receita", "D Banco / C Direito"],
            ["**Despesa antecipada** (seguro anual pago adiantado)", "D 1.1.4.01 Seguros a Apropriar / C Banco", "Cada mês: D 5.1.07 Seguros / C 1.1.4.01"],
          ] },
          { t: "exemplo", titulo: "Seguro anual de R$ 2.400,00 pago em 01/12", itens: [
            "Em 01/12: D – 1.1.4.01 Seguros a Apropriar / C – Banco X: R$ 2.400,00 (é um direito, ainda não é despesa).",
            "No fim de cada mês: D – 5.1.07 Seguros / C – 1.1.4.01 Seguros a Apropriar: R$ 200,00 (2.400 ÷ 12).",
          ] },
        ],
      },
      {
        titulo: "3. A folha de pagamento: competência e pagamento",
        blocos: [
          { t: "tabela", cab: ["Folha de outubro/2025 — CEDUP Contábil Ltda.", "R$"], linhas: [
            ["Salários brutos", "36.000,00"],
            ["(−) INSS do empregado (9%)", "3.240,00"],
            ["(−) IRRF (2,5%)", "900,00"],
            ["= Salário líquido", "31.860,00"],
            ["INSS patronal (20%)", "7.200,00"],
            ["FGTS (8%)", "2.880,00"],
            ["**Custo total da folha** (36.000 + 7.200 + 2.880)", "**46.080,00**"],
          ] },
          { t: "p", texto: "As alíquotas fixas (9% e 2,5%) são uma **simplificação didática**; o INSS e o IRRF reais seguem tabelas progressivas, estudadas em RH." },
          { t: "p", texto: "**Em outubro (competência):**" },
          { t: "tabela", cab: ["", "Débito", "Crédito", "R$"], linhas: [
            ["a) Salários do mês", "5.1.02 Salários Administrativos", "2.1.3.01 Salários a Pagar", "36.000,00"],
            ["b) Encargos patronais", "5.1.03 Encargos Sociais Administrativos", "2.1.4.01 INSS Folha (7.200,00) e 2.1.4.03 FGTS a Recolher (2.880,00)", "10.080,00"],
            ["c) Descontos dos empregados", "2.1.3.01 Salários a Pagar", "2.1.8.11 INSS Retido Empregados (3.240,00) e 2.1.8.10 IRRF a Recolher (900,00)", "4.140,00"],
          ] },
          { t: "p", texto: "**Em novembro (pagamento):**" },
          { t: "tabela", cab: ["", "Débito", "Crédito", "R$"], linhas: [
            ["d) Salário líquido", "2.1.3.01 Salários a Pagar", "Banco X", "31.860,00"],
            ["e) Recolhimentos", "2.1.4.01 INSS Folha 7.200 + 2.1.8.11 INSS Retido 3.240 + 2.1.4.03 FGTS 2.880 + 2.1.8.10 IRRF 900", "Banco X", "14.220,00"],
          ] },
          { t: "destaque", texto: "A despesa de **outubro** é **R$ 46.080,00**, mesmo sem nenhum pagamento em outubro; o desembolso de **novembro** também é R$ 46.080,00 (31.860 + 14.220). A competência põe a despesa no mês certo; o caixa mostra quando o dinheiro saiu." },
        ],
      },
      {
        titulo: "4. Caixa × competência",
        blocos: [
          { t: "tabela", cab: ["Mês", "Regime de competência", "Regime de caixa"], linhas: [
            ["Outubro", "Despesa de R$ 46.080,00", "Nenhuma despesa"],
            ["Novembro", "Nenhuma despesa (só pagamentos)", "Despesa de R$ 46.080,00"],
          ] },
          { t: "p", texto: "A contabilidade usa a **competência**: o lucro de outubro só fica correto se a folha de outubro estiver nele." },
        ],
      },
      {
        titulo: "No CTC",
        blocos: [
          { t: "lista", itens: [
            "Em **Escrituração → Lançamentos**, você lança os **8 fatos orientados**; o CTC confere cada um.",
            "O professor pode enviar a **lista-modelo \"Regime de competência\"**: folha do mês, encargos, descontos, seguro antecipado, aluguel a pagar e a receber, e os pagamentos e recebimentos do mês seguinte.",
            "Pratique antes com o exercício da folha de pagamento, abaixo.",
          ] },
        ],
      },
    ],
    fontes: FONTES_CB07,
  },
  "cb-08": {
    titulo: "Balancete de Verificação",
    resumo: "O que é o balancete, modelos de 2, 4 e 6 colunas, como montar a partir do Razão, o que ele detecta e o que não detecta.",
    secoes: [
      {
        titulo: "1. O que é o balancete",
        blocos: [
          { t: "p", texto: "O **balancete de verificação** é a relação de **todas as contas** com movimento ou saldo numa data, com seus **débitos, créditos e saldos**, tirados do Livro Razão." },
          { t: "lista", itens: [
            "**Conferir** se o método das partidas dobradas foi respeitado: total dos débitos = total dos créditos, e total dos saldos devedores = total dos saldos credores.",
            "Dar uma **visão geral** da situação das contas antes do fechamento.",
            "Ser a **base** para a DRE e o Balanço Patrimonial.",
          ] },
          { t: "p", texto: "Na prática, as empresas fazem o balancete **todo mês**." },
        ],
      },
      {
        titulo: "2. Modelos de balancete",
        blocos: [
          { t: "tabela", cab: ["Modelo", "Colunas"], linhas: [
            ["2 colunas", "Saldo devedor e saldo credor"],
            ["**4 colunas**", "**Débito, Crédito** (movimento) e **Saldo Débito, Saldo Crédito**"],
            ["6 colunas", "Saldo anterior, movimento do período (D e C) e saldo atual"],
          ] },
        ],
      },
      {
        titulo: "3. Como montar (a partir do Razão)",
        blocos: [
          { t: "lista", numerada: true, itens: [
            "Liste as contas na **ordem do plano**: Ativo, Passivo, PL, Receitas, Despesas e Custos.",
            "Em cada conta, some os **débitos** e os **créditos** do Razão.",
            "Calcule o **saldo**: débitos maiores → saldo **devedor**; créditos maiores → saldo **credor**.",
            "Some as quatro colunas e confira: **total de débitos = total de créditos** e **saldos devedores = saldos credores**.",
          ] },
        ],
      },
      {
        titulo: "4. Exemplo: o mês de março do Módulo 05",
        blocos: [
          { t: "tabela", cab: ["Conta", "Débito", "Crédito", "Saldo Débito", "Saldo Crédito"], linhas: [
            ["1.1.1.01 Caixa Geral", "15.000,00", "9.000,00", "6.000,00", ""],
            ["1.1.1.02.01 Banco X", "6.000,00", "2.250,00", "3.750,00", ""],
            ["1.1.3.01 Mercadorias para Revenda", "3.000,00", "2.500,00", "500,00", ""],
            ["3.1.01 Capital Subscrito", "", "10.000,00", "", "10.000,00"],
            ["4.1.1.01 Receita de Vendas de Mercadorias", "", "5.000,00", "", "5.000,00"],
            ["5.1.02 Salários Administrativos", "1.800,00", "", "1.800,00", ""],
            ["5.1.04 Energia Elétrica", "450,00", "", "450,00", ""],
            ["6.2.01 CMV", "2.500,00", "", "2.500,00", ""],
            ["**Totais**", "**28.750,00**", "**28.750,00**", "**15.000,00**", "**15.000,00**"],
          ] },
          { t: "destaque", texto: "O balancete tem **contas patrimoniais e de resultado** juntas. O Balanço Patrimonial só tem as patrimoniais, porque as de resultado são encerradas na ARE (Módulo 10)." },
        ],
      },
      {
        titulo: "5. O que o balancete detecta — e o que não detecta",
        blocos: [
          { t: "tabela", cab: ["O balancete **mostra** (não fecha)", "O balancete **não mostra** (fecha mesmo com erro)"], linhas: [
            ["Lançamento com débito diferente do crédito", "**Omissão** de um lançamento inteiro"],
            ["Erro de soma ou de transcrição de um saldo", "Lançamento em **duplicidade**"],
            ["Saldo colocado na coluna errada", "**Conta errada** (ex.: Aluguéis no lugar de Energia)"],
            ["", "**Inversão**: debitou a conta que devia creditar, e vice-versa"],
            ["", "**Valor errado igual** nos dois lados"],
          ] },
          { t: "destaque", texto: "Balancete fechado **não garante** que a escrituração está certa — só que débitos e créditos estão iguais. Por isso o Razão também é conferido conta a conta." },
        ],
      },
      {
        titulo: "6. Saldo \"estranho\" é sinal de alerta",
        blocos: [
          { t: "p", texto: "Se uma conta tem saldo de natureza **contrária** à normal — Caixa com saldo credor (saiu mais dinheiro do que entrou), Fornecedores com saldo devedor (pagou mais do que devia) —, verifique os lançamentos." },
        ],
      },
      {
        titulo: "No CTC",
        blocos: [
          { t: "lista", itens: [
            "A aba **Balancete** da Escrituração monta o balancete da sua empresa a partir dos lançamentos, com o selo **\"Fechado: débitos = créditos\"** ou **\"Não fecha — confira os lançamentos\"**.",
            "No Acompanhamento da turma, o professor vê quem está com o balancete fechando.",
            "Pratique antes com o exercício \"Monte o balancete\", abaixo.",
          ] },
        ],
      },
    ],
    fontes: FONTES_CB08,
  },
  "cb-09": {
    titulo: "DRE — Demonstração do Resultado do Exercício",
    resumo: "O que é a DRE, de onde vêm os valores, a estrutura (Lei 6.404/1976, art. 187, e NBC TG 26), exemplo completo e leitura das margens.",
    secoes: [
      {
        titulo: "1. O que é a DRE",
        blocos: [
          { t: "p", texto: "A **DRE** mostra **como a empresa chegou ao lucro ou ao prejuízo** de um período, confrontando as **receitas** com os **custos** e as **despesas**, pelo regime de competência. É obrigatória pela Lei 6.404/1976 (art. 187) e pela NBC TG 26." },
          { t: "destaque", texto: "O Balanço mostra a **posição** da empresa numa data (uma foto); a DRE mostra o **desempenho** num período (um filme)." },
        ],
      },
      {
        titulo: "2. De onde vêm os valores",
        blocos: [
          { t: "p", texto: "Das **contas de resultado do balancete** (Módulo 08), **antes do encerramento**: grupo 4 – Receitas (e as deduções 4.2), grupo 5 – Despesas e grupo 6 – Custos." },
        ],
      },
      {
        titulo: "3. A estrutura (a mesma do CTC)",
        blocos: [
          { t: "tabela", cab: ["Linha", "Contas do plano"], linhas: [
            ["**Receita Bruta** de Vendas e Serviços", "4.1"],
            ["(−) Deduções da Receita (devoluções, abatimentos, tributos sobre vendas)", "4.2"],
            ["**(=) Receita Líquida**", ""],
            ["(−) Custo das Mercadorias, Produtos e Serviços Vendidos", "6"],
            ["**(=) Resultado Bruto**", ""],
            ["(−) Despesas Administrativas", "5.1"],
            ["(−) Despesas Comerciais (com vendas)", "5.2"],
            ["(+) Outras Receitas Operacionais", "4.4"],
            ["**(=) Resultado antes do Resultado Financeiro**", ""],
            ["(+) Receitas Financeiras", "4.3"],
            ["(−) Despesas Financeiras", "5.3"],
            ["**(=) Resultado Operacional**", ""],
            ["(+) Ganhos de Capital e Resultado de Investimentos", "4.5 e 4.6"],
            ["(−) Outras Despesas", "5.4"],
            ["**(=) Resultado antes do IRPJ e da CSLL**", ""],
            ["(−) Provisão para IRPJ e CSLL", "7.2 (Contabilidade Avançada)"],
            ["**(=) Resultado Líquido do Exercício**", ""],
          ] },
          { t: "p", texto: "Na CB, a provisão para IRPJ e CSLL fica em zero; ela é calculada na Contabilidade Avançada." },
        ],
      },
      {
        titulo: "4. Exemplo: Comercial Delta Ltda.",
        blocos: [
          { t: "tabela", cab: ["Conta (balancete)", "Saldo"], linhas: [
            ["4.1.1.01 Receita de Vendas de Mercadorias", "120.000,00 C"],
            ["4.2.06 (−) Devoluções de Vendas", "2.000,00 D"],
            ["6.2.01 CMV", "60.000,00 D"],
            ["5.1.02 Salários Administrativos", "15.000,00 D"],
            ["5.1.03 Encargos Sociais Administrativos", "4.200,00 D"],
            ["5.1.14 Aluguéis", "3.000,00 D"],
            ["5.1.04 Energia Elétrica", "1.800,00 D"],
            ["5.2.01 Propaganda e Publicidade", "2.500,00 D"],
            ["5.2.02 Comissões sobre Vendas", "1.500,00 D"],
            ["4.4.01 Receitas de Aluguéis", "1.200,00 C"],
            ["4.3.02 Rendimentos de Aplicações Financeiras", "800,00 C"],
            ["5.3.01 Juros Passivos", "1.000,00 D"],
            ["5.4.01 Perdas Diversas", "500,00 D"],
          ] },
          { t: "exemplo", titulo: "DRE da Comercial Delta", tabela: { cab: ["", "R$"], linhas: [
            ["Receita Bruta", "120.000,00"],
            ["(−) Deduções", "(2.000,00)"],
            ["**(=) Receita Líquida**", "**118.000,00**"],
            ["(−) CMV", "(60.000,00)"],
            ["**(=) Resultado Bruto**", "**58.000,00**"],
            ["(−) Despesas Administrativas (15.000 + 4.200 + 3.000 + 1.800)", "(24.000,00)"],
            ["(−) Despesas Comerciais (2.500 + 1.500)", "(4.000,00)"],
            ["(+) Outras Receitas Operacionais", "1.200,00"],
            ["**(=) Resultado antes do Resultado Financeiro**", "**31.200,00**"],
            ["(+) Receitas Financeiras", "800,00"],
            ["(−) Despesas Financeiras", "(1.000,00)"],
            ["**(=) Resultado Operacional**", "**31.000,00**"],
            ["(−) Outras Despesas", "(500,00)"],
            ["**(=) Resultado antes do IRPJ e da CSLL**", "**30.500,00**"],
            ["**(=) Resultado Líquido do Exercício**", "**30.500,00**"],
          ] } },
        ],
      },
      {
        titulo: "5. Leitura da DRE",
        blocos: [
          { t: "lista", itens: [
            "**Margem bruta** = Resultado Bruto ÷ Receita Líquida = 58.000 ÷ 118.000 ≈ **49,2%**.",
            "**Margem líquida** = Resultado Líquido ÷ Receita Líquida = 30.500 ÷ 118.000 ≈ **25,8%**.",
            "Resultado líquido **positivo** = **lucro**; **negativo** = **prejuízo**. Ele vai para o PL pelo encerramento (Módulo 10) e é distribuído na DLPA (Módulo 11).",
          ] },
        ],
      },
      {
        titulo: "No CTC",
        blocos: [
          { t: "lista", itens: [
            "Na aba **DRE** da Escrituração, você **monta a DRE da sua empresa** linha a linha; o CTC confere e só depois mostra a DRE pronta, com o detalhe por conta. Se você lançar algo novo, a montagem recomeça.",
            "Pratique antes com o exercício \"Monte a DRE\", abaixo.",
          ] },
        ],
      },
    ],
    fontes: FONTES_CB09,
  },
  "cb-10": {
    titulo: "Encerramento do Exercício (ARE)",
    resumo: "Por que encerrar, a conta ARE, os passos do encerramento, exemplos com lucro e com prejuízo, quando encerrar e o que acontece depois.",
    secoes: [
      {
        titulo: "1. Por que encerrar",
        blocos: [
          { t: "p", texto: "As contas de **resultado** (receitas, despesas e custos) são **temporárias**: medem o desempenho de **um período**. No fim dele, são **zeradas** e o resultado (lucro ou prejuízo) vai para o **Patrimônio Líquido** — assim o novo período começa com essas contas zeradas (Módulo 04)." },
          { t: "p", texto: "As contas **patrimoniais** (Ativo, Passivo e PL) **não são encerradas**: seus saldos passam para o período seguinte." },
        ],
      },
      {
        titulo: "2. A conta ARE",
        blocos: [
          { t: "p", texto: "A **7.1.01 ARE – Apuração do Resultado do Exercício** é uma conta **transitória**: recebe os saldos das contas de resultado, mostra o lucro ou o prejuízo e fica zerada no fim do encerramento." },
        ],
      },
      {
        titulo: "3. Os passos do encerramento",
        blocos: [
          { t: "tabela", cab: ["Passo", "Lançamento"], linhas: [
            ["1. Conferir os saldos no balancete", "—"],
            ["2. Encerrar as **receitas** (saldo credor)", "D – Receita / C – 7.1.01 ARE"],
            ["3. Encerrar **despesas, custos e deduções** (saldo devedor)", "D – 7.1.01 ARE / C – Despesa, Custo ou Dedução"],
            ["4. Ver o saldo da ARE", "Credor = **lucro** · Devedor = **prejuízo**"],
            ["5a. Transferir o **lucro**", "D – 7.1.01 ARE / C – 3.9 Resultado do Exercício"],
            ["5b. Transferir o **prejuízo**", "D – 3.6 (−) Prejuízos Acumulados / C – 7.1.01 ARE"],
          ] },
          { t: "destaque", texto: "Para zerar uma conta, lança-se o **valor do saldo no lado contrário**: receita (saldo credor) se encerra a débito; despesa (saldo devedor), a crédito." },
        ],
      },
      {
        titulo: "4. Exemplo com lucro — Prestadora de Serviços (Módulos 03 e 08)",
        blocos: [
          { t: "p", texto: "Contas de resultado do balancete: Receita de Prestação de Serviços 8.000,00 C; Energia Elétrica 1.200,00 D; Aluguéis 1.000,00 D; Juros Passivos 80,00 D." },
          { t: "tabela", cab: ["", "Débito", "Crédito", "R$"], linhas: [
            ["Encerramento da receita", "4.1.1.03 Receita de Prestação de Serviços", "7.1.01 ARE", "8.000,00"],
            ["Encerramento das despesas", "7.1.01 ARE", "5.1.04 Energia (1.200) · 5.1.14 Aluguéis (1.000) · 5.3.01 Juros (80)", "2.280,00"],
            ["Transferência do lucro", "7.1.01 ARE", "3.9 Resultado do Exercício", "5.720,00"],
          ] },
          { t: "p", texto: "Razonete da ARE: crédito de 8.000,00 e débitos de 2.280,00 + 5.720,00 → saldo **zero**. O PL passa de R$ 20.000,00 (capital) para **R$ 25.720,00**, e o Ativo (30.720) = Passivo (5.000) + PL (25.720)." },
        ],
      },
      {
        titulo: "5. Exemplo com prejuízo",
        blocos: [
          { t: "p", texto: "Receitas de R$ 3.000,00 e despesas de R$ 4.200,00: a ARE fica com saldo **devedor** de R$ 1.200,00 (prejuízo). Lançamento: **D – 3.6 (−) Prejuízos Acumulados / C – 7.1.01 ARE: R$ 1.200,00**. O prejuízo **reduz** o PL." },
        ],
      },
      {
        titulo: "6. Quando encerrar",
        blocos: [
          { t: "lista", itens: [
            "No **fim do exercício social** (em geral, 31/12).",
            "Se a empresa apura o resultado **mensal ou trimestralmente**, também no fim de cada período — no CTC, escolhido na Parametrização (\"apuração\").",
            "No **inventário periódico**, o CMV precisa ser apurado **antes** do encerramento (Módulo 06).",
          ] },
        ],
      },
      {
        titulo: "7. Depois do encerramento",
        blocos: [
          { t: "lista", itens: [
            "As contas de resultado ficam **zeradas**; o balancete pós-encerramento só tem contas patrimoniais — e dele sai o **Balanço Patrimonial** (Módulo 12).",
            "O lucro no PL ainda precisa ser **destinado** (reservas, dividendos): é a **DLPA**, Módulo 11.",
            "A **DRE** continua mostrando o resultado do período: ela é montada com os saldos **antes** do encerramento.",
          ] },
        ],
      },
      {
        titulo: "No CTC",
        blocos: [
          { t: "lista", itens: [
            "Na aba **Encerramento (ARE)**, você **faz os lançamentos de encerramento** da sua empresa: para cada conta de resultado, escolhe o lado e o valor; depois, a transferência do lucro ou do prejuízo.",
            "O CTC confere; só então você vê os lançamentos e grava o encerramento. Ele pode ser desfeito para corrigir lançamentos e encerrar de novo.",
            "Pratique antes com o exercício de encerramento, abaixo.",
          ] },
        ],
      },
    ],
    fontes: FONTES_CB10,
  },
};

export const teoriaDo = (disciplina, numero) => TEORIA[`${disciplina}-${String(numero).padStart(2, "0")}`] || null;
