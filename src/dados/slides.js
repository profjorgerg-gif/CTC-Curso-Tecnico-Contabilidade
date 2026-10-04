// Slides do Guia Pedagógico (aprovado em 04/10/2026): uma apresentação por módulo.
// Cada slide: { titulo, pontos?: [], tabela?: { cab: [], linhas: [[]] }, destaque?, notas }.
// "notas" são as anotações do professor (aparecem só quando ele liga "Notas do professor").
// Primeira apresentação (modelo para aprovação): CB — Introdução à Contabilidade.

export const SLIDES = {
  cb: [
    {
      id: "cb-introducao",
      modulo: "Introdução à Contabilidade (princípios, classificação, regimes)",
      titulo: "Introdução à Contabilidade",
      subtitulo: "Conceito, patrimônio, fundamentos, classificação das contas e regimes",
      slides: [
        {
          titulo: "O que é Contabilidade",
          pontos: [
            "Ciência que estuda, registra e controla o patrimônio das entidades",
            "Objeto: o patrimônio (bens, direitos e obrigações)",
            "Finalidade: fornecer informações úteis para a tomada de decisão",
            "Técnicas: escrituração, demonstrações, auditoria e análise de balanços",
          ],
          notas: "Pergunte à turma onde a contabilidade aparece no dia a dia (salário, compras a prazo, impostos). Destaque que a escrituração é o foco da CB e será praticada no CTC.",
        },
        {
          titulo: "Quem usa a informação contábil",
          tabela: {
            cab: ["Usuários internos", "Usuários externos"],
            linhas: [
              ["Sócios e administradores", "Bancos e financiadores"],
              ["Gerentes e chefias", "Fornecedores e clientes"],
              ["Funcionários", "Governo (Receita Federal, Estado, Município)"],
              ["", "Investidores e sindicatos"],
            ],
          },
          notas: "Cada usuário tem um interesse diferente: o banco quer saber se a empresa paga; o governo quer apurar tributos; o sócio quer saber o lucro.",
        },
        {
          titulo: "Patrimônio",
          pontos: [
            "Bens: coisas que a empresa possui — dinheiro, mercadorias, móveis, veículos, imóveis",
            "Direitos: valores a receber — clientes (duplicatas a receber), aplicações",
            "Obrigações: valores a pagar — fornecedores, salários, impostos, empréstimos",
          ],
          destaque: "Bens e direitos formam o ATIVO; as obrigações formam o PASSIVO.",
          notas: "Peça exemplos à turma e classifique no quadro em três colunas: bem, direito ou obrigação.",
        },
        {
          titulo: "A equação patrimonial",
          pontos: [
            "Ativo = Passivo + Patrimônio Líquido",
            "Patrimônio Líquido (PL) = Ativo − Passivo",
            "O PL é o que pertence aos sócios: capital investido e lucros acumulados",
          ],
          destaque: "A = P + PL  — o lado esquerdo sempre é igual ao lado direito.",
          notas: "Ligue com as partidas dobradas: todo fato mexe nos dois lados ou dentro de um mesmo lado, e a igualdade nunca se quebra.",
        },
        {
          titulo: "Exemplo: o patrimônio da Loja Alfa",
          tabela: {
            cab: ["Ativo", "R$", "Passivo + PL", "R$"],
            linhas: [
              ["Caixa", "5.000,00", "Fornecedores", "6.000,00"],
              ["Mercadorias", "3.000,00", "", ""],
              ["Veículos", "20.000,00", "Capital Social (PL)", "22.000,00"],
              ["Total", "28.000,00", "Total", "28.000,00"],
            ],
          },
          notas: "Calcule o PL com a turma: 28.000 − 6.000 = 22.000. É exatamente o que o aluno faz nos Saldos Iniciais da empresa no CTC.",
        },
        {
          titulo: "Situações patrimoniais",
          tabela: {
            cab: ["Situação", "Relação", "Significado"],
            linhas: [
              ["PL positivo", "A > P", "Situação favorável (superávit)"],
              ["PL nulo", "A = P", "Os bens e direitos só cobrem as dívidas"],
              ["PL negativo", "A < P", "Passivo a descoberto: dívidas maiores que o ativo"],
            ],
          },
          notas: "Mostre que um prejuízo grande pode levar ao PL negativo — e que isso aparece no Balanço Patrimonial do CTC.",
        },
        {
          titulo: "Fundamentos da Contabilidade",
          pontos: [
            "Os antigos Princípios de Contabilidade (Res. CFC 750/1993) foram revogados; desde 2017 os fundamentos estão na Estrutura Conceitual (CPC 00 / NBC TG Estrutura Conceitual)",
            "Pressuposto básico: continuidade — a entidade continua operando no futuro previsível",
            "Características fundamentais: relevância e representação fidedigna",
            "Características de melhoria: comparabilidade, verificabilidade, tempestividade e compreensibilidade",
          ],
          notas: "Muitos livros ainda citam os princípios (entidade, continuidade, oportunidade, registro pelo valor original, competência, prudência). Explique que as ideias continuam, mas a norma em vigor é a Estrutura Conceitual.",
        },
        {
          titulo: "Classificação das contas",
          tabela: {
            cab: ["Grupo no plano do CTC", "Tipo", "Natureza"],
            linhas: [
              ["1 — Ativo", "Patrimonial", "Devedora"],
              ["2 — Passivo", "Patrimonial", "Credora"],
              ["3 — Patrimônio Líquido", "Patrimonial", "Credora"],
              ["4 — Receitas", "Resultado", "Credora"],
              ["5 — Despesas e 6 — Custos", "Resultado", "Devedora"],
            ],
          },
          destaque: "Contas patrimoniais vão para o Balanço; contas de resultado vão para a DRE.",
          notas: "As deduções da receita (4.2) são devedoras, mesmo estando no grupo 4 — retome isso quando chegar à DRE. O aluno vê o grupo e a natureza de cada conta ao escolher a conta no lançamento.",
        },
        {
          titulo: "Regime de competência × regime de caixa",
          pontos: [
            "Competência: receitas e despesas entram no período em que acontecem, recebidas ou pagas ou não",
            "Caixa: só entram quando há recebimento ou pagamento",
            "A contabilidade segue a competência (Estrutura Conceitual e ITG 1000)",
            "O regime de caixa só é aceito para fins fiscais em casos específicos (ex.: Simples Nacional)",
          ],
          notas: "Na Parametrização do CTC o aluno escolhe o regime de reconhecimento; se escolher caixa, aparece o aviso de que a escrituração segue a competência.",
        },
        {
          titulo: "Exemplo: o aluguel de dezembro",
          tabela: {
            cab: ["Fato", "Competência", "Caixa"],
            linhas: [
              ["Aluguel de dezembro, R$ 800,00", "Despesa em dezembro", "Despesa em janeiro"],
              ["Pago em 5 de janeiro", "Em dezembro: D Aluguéis / C Aluguéis a Pagar", "Nenhum registro em dezembro"],
              ["", "Em janeiro: D Aluguéis a Pagar / C Bancos", "Em janeiro: D Aluguéis / C Bancos"],
            ],
          },
          notas: "Pergunte: em qual mês o lucro de dezembro fica correto? Pela competência, dezembro arca com a despesa que gerou.",
        },
        {
          titulo: "No CTC",
          pontos: [
            "Minha empresa: cada aluno tem a própria empresa na turma",
            "Parametrização: exercício social, inventário, método de estoque e regime",
            "Saldos iniciais: o lançamento de abertura (Capital Social × Ativo)",
            "Escrituração: os 8 fatos orientados e as listas do professor",
          ],
          notas: "Faça a demonstração ao vivo: abra a Parametrização e os Saldos iniciais de uma empresa de teste.",
        },
        {
          titulo: "Para fixar",
          pontos: [
            "1. Uma empresa tem Ativo de R$ 50.000 e Passivo de R$ 35.000. Qual é o PL?",
            "2. Duplicatas a receber é bem, direito ou obrigação? E duplicatas a pagar?",
            "3. A conta de energia de março foi paga em abril. Em que mês é a despesa pela competência?",
          ],
          notas: "Respostas: 1) R$ 15.000 (PL positivo). 2) Direito (Ativo); obrigação (Passivo). 3) Março.",
        },
      ],
    },
  ],
};

export const apresentacoesDe = (disciplina) => SLIDES[disciplina] || [];
