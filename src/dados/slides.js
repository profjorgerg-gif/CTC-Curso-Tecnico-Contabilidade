// Slides do Guia Pedagógico (aprovado em 04/10/2026): uma apresentação por módulo.
// Cada slide: { titulo, pontos?: [], tabela?: { cab: [], linhas: [[]] }, destaque?, notas }.
// "notas" são as anotações do professor (aparecem só quando ele liga "Notas do professor").
// Modelo aprovado em 05/10/2026. CB: Introdução à Contabilidade; Plano de Contas.

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
    {
      id: "cb-plano-de-contas",
      modulo: "Plano de Contas",
      titulo: "Plano de Contas",
      subtitulo: "Estrutura, codificação, grupos e classificação das contas",
      slides: [
        {
          titulo: "O que é o plano de contas",
          pontos: [
            "Lista organizada de todas as contas que a empresa pode usar",
            "Cada conta tem código, nome e função definidos",
            "É o \"mapa\" da escrituração: indica onde cada fato é registrado",
            "Segue os grupos do Balanço definidos na Lei 6.404/1976 (art. 178)",
          ],
          notas: "Compare com o índice de um livro ou com o mapa de um shopping: sem ele, cada pessoa lançaria o mesmo fato em um lugar diferente.",
        },
        {
          titulo: "Para que serve",
          pontos: [
            "Padronizar: o mesmo fato vai sempre para a mesma conta",
            "Organizar: as contas seguem a ordem do Balanço e da DRE",
            "Facilitar a consulta, a conferência e a auditoria",
            "Atender à legislação e às normas contábeis",
          ],
          notas: "Pergunte: o que aconteceria se dois funcionários lançassem a conta de luz um em \"Energia\" e outro em \"Despesas Gerais\"? O relatório deixaria de ser comparável.",
        },
        {
          titulo: "Níveis e codificação",
          tabela: {
            cab: ["Nível", "Tipo", "Exemplo", "Lança?"],
            linhas: [
              ["1", "Grupo", "1 ATIVO", "Não"],
              ["2", "Subgrupo", "1.1 ATIVO CIRCULANTE", "Não"],
              ["3", "Conta sintética", "1.1.1 Caixa e Equivalentes", "Não"],
              ["4", "Conta analítica", "1.1.1.01 Caixa Geral", "Sim"],
              ["5", "Subconta analítica", "1.1.1.02.01 Banco X", "Sim"],
            ],
          },
          notas: "Mostre que cada ponto do código desce um nível. A conta sintética é a soma das que estão abaixo dela.",
        },
        {
          titulo: "Só o último nível recebe lançamento",
          pontos: [
            "1.1.1.02 Bancos Conta Movimento se desdobra em Banco X e Banco Y",
            "O lançamento vai em 1.1.1.02.01 Banco X — nunca em \"Bancos Conta Movimento\"",
            "A conta sintética só soma os saldos das contas abaixo",
          ],
          destaque: "Lança-se sempre na conta do último nível do ramo.",
          notas: "No CTC, ao escolher uma conta sintética, aparece o aviso \"escolha a conta\". Mostre isso ao vivo.",
        },
        {
          titulo: "Os grupos do plano do CTC",
          tabela: {
            cab: ["Código", "Grupo", "Natureza", "Onde aparece"],
            linhas: [
              ["1", "Ativo", "Devedora", "Balanço"],
              ["2", "Passivo", "Credora", "Balanço"],
              ["3", "Patrimônio Líquido", "Credora", "Balanço"],
              ["4", "Receitas", "Credora", "DRE"],
              ["5", "Despesas", "Devedora", "DRE"],
              ["6", "Custos (CMV, CPV, CSV)", "Devedora", "DRE"],
              ["7", "Resultado (ARE e destinação)", "Variável", "Apuração"],
              ["8", "Compensação", "—", "Controle"],
            ],
          },
          notas: "Reforce: o PL é o grupo 3 (não é parte do Passivo) e os custos ficam no grupo 6 — na venda de mercadorias, a conta é o CMV.",
        },
        {
          titulo: "Subgrupos do Balanço",
          tabela: {
            cab: ["Ativo Não Circulante", "Patrimônio Líquido"],
            linhas: [
              ["Realizável a Longo Prazo", "Capital Social"],
              ["Investimentos", "Reservas de Capital"],
              ["Imobilizado", "Ajustes de Avaliação Patrimonial"],
              ["Intangível", "Reservas de Lucros"],
              ["", "(−) Ações em Tesouraria"],
              ["", "(−) Prejuízos Acumulados"],
            ],
          },
          notas: "É a estrutura do art. 178 da Lei 6.404/1976. Peça exemplos de bens para cada subgrupo do Ativo Não Circulante.",
        },
        {
          titulo: "Patrimoniais × de resultado",
          pontos: [
            "Patrimoniais (grupos 1, 2 e 3): o saldo passa de um exercício para o outro",
            "De resultado (grupos 4, 5 e 6): receitas, despesas e custos",
            "No fim do exercício, as contas de resultado são zeradas na ARE (7.1.01)",
            "O lucro ou o prejuízo apurado vai para o Patrimônio Líquido",
          ],
          notas: "Use a imagem do \"placar do ano\": as contas de resultado zeram a cada exercício, as patrimoniais continuam.",
        },
        {
          titulo: "Natureza do saldo",
          tabela: {
            cab: ["Natureza", "Aumenta com", "Diminui com", "Grupos"],
            linhas: [
              ["Devedora", "Débito", "Crédito", "Ativo, Despesas, Custos"],
              ["Credora", "Crédito", "Débito", "Passivo, PL, Receitas"],
            ],
          },
          notas: "Esta tabela é a base de todo lançamento. Peça que copiem no caderno.",
        },
        {
          titulo: "Circulante × não circulante",
          pontos: [
            "Circulante: realiza ou vence até o fim do exercício social seguinte",
            "Não circulante: prazo maior que esse",
            "Ciclo operacional maior que um ano: vale o ciclo (art. 179)",
            "Ativo em ordem de liquidez; Passivo em ordem de exigibilidade",
          ],
          notas: "Exemplo: empréstimo de 24 parcelas — as 12 primeiras no Passivo Circulante, o restante no Não Circulante.",
        },
        {
          titulo: "Contas redutoras",
          tabela: {
            cab: ["Grupo", "Conta redutora", "Natureza"],
            linhas: [
              ["Ativo", "(−) Depreciação Acumulada", "Credora"],
              ["Ativo", "(−) Provisão p/ Créditos de Liquidação Duvidosa", "Credora"],
              ["PL", "(−) Capital a Integralizar", "Devedora"],
              ["PL", "(−) Prejuízos Acumulados", "Devedora"],
              ["Receitas", "(−) Deduções da Receita (4.2)", "Devedora"],
            ],
          },
          destaque: "A redutora tem natureza oposta à do grupo onde está.",
          notas: "Destaque as Deduções da Receita: estão no grupo das Receitas, mas são devedoras.",
        },
        {
          titulo: "Exemplo: redutora no Balanço",
          tabela: {
            cab: ["Imobilizado", "R$"],
            linhas: [
              ["Veículos", "50.000,00"],
              ["(−) Depreciação Acumulada Veículos", "(10.000,00)"],
              ["Valor contábil líquido", "40.000,00"],
            ],
          },
          notas: "O valor original do bem não muda; a redutora mostra quanto já foi consumido pelo uso.",
        },
        {
          titulo: "No CTC",
          pontos: [
            "Plano padrão: 296 contas, 242 aceitam lançamento",
            "Na escrituração, só as contas de último nível podem ser escolhidas",
            "Balancete, Balanço e DRE são montados pelos grupos do plano",
          ],
          notas: "Abra o plano de contas no CTC e localize com a turma: Caixa Geral, Duplicatas a Pagar, CMV e (−) Depreciação Acumulada.",
        },
        {
          titulo: "Para fixar",
          pontos: [
            "1. Em qual grupo fica Duplicatas a Pagar? E o CMV?",
            "2. Pode-se lançar em 1.1.1.02 Bancos Conta Movimento? Por quê?",
            "3. Qual é a natureza de (−) Depreciação Acumulada? E de ICMS sobre Vendas?",
          ],
          notas: "Respostas: 1) Passivo Circulante (2.1.1.01); Custos, grupo 6 (6.2.01). 2) Não: é desdobrada em subcontas (Banco X, Banco Y). 3) Credora (redutora do Ativo); devedora (dedução da receita).",
        },
      ],
    },
  ],
};

export const apresentacoesDe = (disciplina) => SLIDES[disciplina] || [];
