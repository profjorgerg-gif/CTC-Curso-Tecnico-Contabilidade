// Teoria dos módulos (aprovada pelo professor em 04/10/2026).
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
};

export const teoriaDo = (disciplina, numero) => TEORIA[`${disciplina}-${String(numero).padStart(2, "0")}`] || null;
