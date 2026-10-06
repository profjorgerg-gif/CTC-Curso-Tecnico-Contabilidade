// Slides do Guia Pedagógico (aprovado em 04/10/2026): uma apresentação por módulo.
// Cada slide: { titulo, pontos?: [], tabela?: { cab: [], linhas: [[]] }, destaque?, notas }.
// "notas" são as anotações do professor (aparecem só quando ele liga "Notas do professor").
// Modelo aprovado em 05/10/2026. CB: Introdução à Contabilidade; Plano de Contas; Débito e Crédito; Saldos Iniciais; Livros Diário e Razão.

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
    {
      id: "cb-debito-credito",
      modulo: "Débito e Crédito: partidas dobradas e razonetes",
      titulo: "Débito e Crédito",
      subtitulo: "Partidas dobradas, razonetes e as regras de lançamento",
      slides: [
        {
          titulo: "Conta e razonete",
          pontos: [
            "Conta: nome técnico de cada elemento do patrimônio e do resultado",
            "Razonete: a conta em forma de \"T\"",
            "Lado esquerdo = DÉBITO · lado direito = CRÉDITO",
          ],
          destaque: "Débito e crédito são apenas os dois lados da conta — não significam dívida nem dinheiro a receber.",
          notas: "Desenhe um T no quadro com o nome Caixa em cima. Pergunte o que a turma entende por \"débito\" e desfaça a ideia de \"débito = dívida\".",
        },
        {
          titulo: "O método das partidas dobradas",
          pontos: [
            "Sistematizado por Luca Pacioli em 1494 (Summa de Arithmetica)",
            "Todo fato é registrado em, no mínimo, duas contas",
            "Para todo débito há um crédito de igual valor",
            "Por isso a equação A = P + PL nunca se desequilibra",
          ],
          notas: "Comente que o método tem mais de 500 anos e é usado no mundo inteiro, inclusive nos sistemas contábeis modernos.",
        },
        {
          titulo: "Por que é importante",
          pontos: [
            "Garante a exatidão dos registros",
            "Permite localizar erros: débitos ≠ créditos indica erro",
            "É a base das demonstrações contábeis",
            "Fortalece o controle patrimonial e financeiro",
          ],
          notas: "Ligue com o balancete: se a soma não fecha, há erro em algum lançamento.",
        },
        {
          titulo: "As regras de débito e crédito",
          tabela: {
            cab: ["Grupo", "Natureza", "Aumenta com", "Diminui com"],
            linhas: [
              ["Ativo", "Devedora", "Débito", "Crédito"],
              ["Despesas e Custos", "Devedora", "Débito", "Crédito"],
              ["Passivo", "Credora", "Crédito", "Débito"],
              ["Patrimônio Líquido", "Credora", "Crédito", "Débito"],
              ["Receitas", "Credora", "Crédito", "Débito"],
            ],
          },
          notas: "Esta é a tabela mais importante da disciplina. Peça que copiem e deixem à vista durante os exercícios.",
        },
        {
          titulo: "Aplicação × origem",
          pontos: [
            "Débito: onde o recurso foi aplicado (entrou no caixa, virou mercadoria, virou despesa)",
            "Crédito: de onde o recurso veio (saiu do caixa, veio do fornecedor, dos sócios, de uma receita)",
          ],
          destaque: "Toda aplicação tem uma origem de mesmo valor.",
          notas: "Use o exemplo da compra de mercadorias à vista: o recurso foi aplicado em Mercadorias (débito) e veio do Caixa (crédito).",
        },
        {
          titulo: "As fórmulas de lançamento",
          tabela: {
            cab: ["Fórmula", "Contas", "Exemplo"],
            linhas: [
              ["1ª", "1 D e 1 C", "Compra de móveis à vista"],
              ["2ª", "1 D e vários C", "Veículo com entrada e financiamento"],
              ["3ª", "Vários D e 1 C", "Duplicata paga com juros"],
              ["4ª", "Vários D e vários C", "Venda com baixa do CMV"],
            ],
          },
          notas: "Mostre que no CTC o lançamento aceita várias linhas de débito e de crédito, mas só grava quando os totais são iguais.",
        },
        {
          titulo: "Como lançar: quatro perguntas",
          pontos: [
            "1. Quais contas o fato movimenta?",
            "2. A que grupo cada conta pertence?",
            "3. Cada conta aumentou ou diminuiu?",
            "4. Pela tabela: débito ou crédito?",
          ],
          notas: "Resolva com a turma: pagamento de aluguel de R$ 1.000,00 em dinheiro → D Aluguéis / C Caixa Geral.",
        },
        {
          titulo: "Saldo do razonete",
          tabela: {
            cab: ["Caixa Geral — Débito", "Crédito"],
            linhas: [
              ["10.000,00 (saldo inicial)", "1.000,00 (aluguel)"],
              ["8.000,00 (serviço recebido)", "3.500,00 (mercadorias)"],
              ["18.000,00", "4.500,00"],
            ],
          },
          destaque: "Saldo devedor de R$ 13.500,00 (débitos > créditos).",
          notas: "Saldo devedor: D > C. Saldo credor: C > D. Saldo nulo: D = C. A soma dos saldos devedores de todas as contas é igual à dos credores — é o balancete.",
        },
        {
          titulo: "Exemplos resolvidos",
          tabela: {
            cab: ["Fato", "Débito", "Crédito"],
            linhas: [
              ["Serviço recebido em dinheiro", "Caixa Geral", "Receita de Prestação de Serviços"],
              ["Mercadorias compradas à vista", "Mercadorias para Revenda", "Caixa Geral"],
              ["Energia paga pelo banco", "Energia Elétrica", "Banco X"],
              ["Duplicata recebida em dinheiro", "Caixa Geral", "Duplicatas a Receber"],
              ["Computador comprado a prazo", "Equipamentos de Informática", "Duplicatas a Pagar"],
            ],
          },
          notas: "Para cada linha, faça as quatro perguntas em voz alta com a turma antes de mostrar a resposta.",
        },
        {
          titulo: "No CTC",
          pontos: [
            "Exercício de razonetes no Módulo 03: 9 fatos e a apuração dos saldos",
            "Na Escrituração, o lançamento só grava com débitos = créditos",
            "Os razonetes da empresa do aluno ficam no Razão por conta",
          ],
          notas: "Faça o primeiro fato do exercício de razonetes ao vivo, projetando a tela.",
        },
        {
          titulo: "Para fixar",
          pontos: [
            "1. Pagamento de energia elétrica pelo banco: qual conta é debitada e qual é creditada?",
            "2. Empréstimo bancário creditado na conta: débito e crédito?",
            "3. Uma conta com débitos de 5.000 e créditos de 7.000 tem saldo de quanto e de que natureza?",
          ],
          notas: "Respostas: 1) D Energia Elétrica (despesa aumenta) / C Banco X (ativo diminui). 2) D Banco X / C Empréstimos Bancários. 3) Saldo credor de R$ 2.000,00.",
        },
      ],
    },
    {
      id: "cb-saldos-iniciais",
      modulo: "Saldos Iniciais (abertura da empresa)",
      titulo: "Saldos Iniciais",
      subtitulo: "A abertura da empresa: capital, integralização e balanço de abertura",
      slides: [
        {
          titulo: "Como nasce uma empresa",
          pontos: [
            "Contrato social (Ltda.) ou estatuto (S.A.)",
            "Registro na Junta Comercial e obtenção do CNPJ",
            "O contrato define o capital social",
          ],
          notas: "Pergunte quem já viu um contrato social. Comente que o capital social é o \"investimento inicial\" dos sócios.",
        },
        {
          titulo: "Subscrito × integralizado",
          tabela: {
            cab: ["Termo", "Significado"],
            linhas: [
              ["Capital subscrito", "O que os sócios se comprometeram a entregar"],
              ["Capital integralizado", "O que já foi efetivamente entregue"],
              ["Capital a integralizar", "O que falta entregar (redutora do PL, devedora)"],
            ],
          },
          notas: "Analogia: a promessa (subscrição) e o pagamento da promessa (integralização).",
        },
        {
          titulo: "Os lançamentos",
          pontos: [
            "Subscrição: D (−) Capital a Integralizar / C Capital Subscrito",
            "Integralização: D Caixa, Banco ou bem / C (−) Capital a Integralizar",
            "Tudo no mesmo ato: D Ativo / C Capital Subscrito",
          ],
          notas: "Reforce a natureza: Capital Subscrito é credora (PL); Capital a Integralizar é devedora (redutora do PL).",
        },
        {
          titulo: "Exemplo: integralização parcial",
          tabela: {
            cab: ["Ativo", "R$", "Patrimônio Líquido", "R$"],
            linhas: [
              ["Caixa Geral", "60.000,00", "Capital Subscrito", "100.000,00"],
              ["", "", "(−) Capital a Integralizar", "(40.000,00)"],
              ["Total", "60.000,00", "Total", "60.000,00"],
            ],
          },
          destaque: "O PL mostra só o que os sócios já entregaram.",
          notas: "É o fato 01 do exercício da Comercial Gama, no Módulo 04 do CTC.",
        },
        {
          titulo: "Dinheiro ou bens",
          pontos: [
            "Dinheiro ou bens avaliáveis em dinheiro (Lei 6.404/1976, art. 7º)",
            "Imóveis, veículos, móveis, máquinas",
            "Na Ltda., não vale integralizar com prestação de serviços (Código Civil, art. 1.055, § 2º)",
          ],
          notas: "Pergunte: um sócio pode entrar com o próprio trabalho como capital? Na Ltda., não.",
        },
        {
          titulo: "Exemplo: Cia. Vamos (fato 01)",
          tabela: {
            cab: ["", "Conta", "R$"],
            linhas: [
              ["D", "Edificações", "70.000,00"],
              ["D", "Veículos", "25.000,00"],
              ["D", "Caixa Geral", "205.000,00"],
              ["C", "Capital Subscrito", "300.000,00"],
            ],
          },
          notas: "Lançamento de 3ª fórmula: vários débitos e um crédito. Ligue com o Módulo 03.",
        },
        {
          titulo: "Saldos iniciais",
          pontos: [
            "Empresa nova: vêm da integralização do capital",
            "Empresa que já existia: são os saldos finais do exercício anterior",
            "Só contas patrimoniais têm saldo inicial",
            "Contas de resultado começam zeradas (foram encerradas na ARE)",
          ],
          destaque: "Saldos devedores = saldos credores.",
          notas: "Antecipe o Módulo 10: o encerramento é que zera as contas de resultado.",
        },
        {
          titulo: "Balanço de abertura (empresa que já existia)",
          tabela: {
            cab: ["Conta", "Devedor", "Credor"],
            linhas: [
              ["Caixa Geral", "8.000,00", ""],
              ["Banco X", "22.000,00", ""],
              ["Mercadorias para Revenda", "15.000,00", ""],
              ["Móveis e Utensílios", "10.000,00", ""],
              ["Duplicatas a Pagar", "", "12.000,00"],
              ["Capital Subscrito", "", "40.000,00"],
              ["Reserva Legal", "", "3.000,00"],
              ["Totais", "55.000,00", "55.000,00"],
            ],
          },
          notas: "Peça que a turma confira a soma das duas colunas.",
        },
        {
          titulo: "No CTC",
          pontos: [
            "Minha empresa: informe o capital social",
            "Escrituração → Saldos iniciais: Capital Subscrito já vem a crédito",
            "Distribua o mesmo valor a débito nas contas do Ativo",
            "O CTC só grava com total devedor = total credor",
          ],
          notas: "Faça ao vivo os saldos iniciais de uma empresa de teste e mostre o resultado no Balanço Patrimonial.",
        },
        {
          titulo: "Para fixar",
          pontos: [
            "1. Capital subscrito de 50.000, integralizados 30.000. Quanto é o PL?",
            "2. Qual a natureza da conta Capital a Integralizar?",
            "3. As receitas de 2025 entram nos saldos iniciais de 2026?",
          ],
          notas: "Respostas: 1) R$ 30.000,00 (50.000 − 20.000 a integralizar). 2) Devedora — redutora do PL. 3) Não: foram encerradas na ARE; só as contas patrimoniais têm saldo inicial.",
        },
      ],
    },
    {
      id: "cb-diario-razao",
      modulo: "Livros Diário e Razão",
      titulo: "Livros Diário e Razão",
      subtitulo: "Escrituração em ordem cronológica e por conta",
      slides: [
        {
          titulo: "O Livro Diário",
          pontos: [
            "Registra todos os fatos contábeis em ordem cronológica",
            "Previsto no Código Civil e na Lei das S.A.",
            "Segue o método das partidas dobradas",
            "Exigência legal e fiscal; responsabilidade do contador",
          ],
          notas: "Compare com um diário pessoal: tudo o que acontece, dia após dia, na ordem em que aconteceu.",
        },
        {
          titulo: "Elementos do lançamento",
          pontos: ["Data do fato", "Conta debitada", "Conta creditada", "Histórico (descrição + documento)", "Valor"],
          destaque: "O histórico deve explicar o fato sem precisar de outro documento.",
          notas: "Mostre um histórico ruim (\"pagamento\") e um bom (\"Pagamento da conta de luz, fatura nº 456789\").",
        },
        {
          titulo: "Página do Livro Diário",
          tabela: {
            cab: ["Data", "Histórico", "Débito", "Crédito"],
            linhas: [
              ["01/03", "D – Caixa Geral", "10.000,00", ""],
              ["", "C – Capital Subscrito", "", "10.000,00"],
              ["", "Integralização de capital pelo sócio Marcos Almeida", "", ""],
              ["05/03", "D – Mercadorias para Revenda", "3.000,00", ""],
              ["", "C – Caixa Geral", "", "3.000,00"],
              ["", "Compra à vista, NF nº 000123", "", ""],
            ],
          },
          notas: "Destaque a ordem: data, conta debitada, conta creditada (recuada) e histórico.",
        },
        {
          titulo: "Formalidades da escrituração",
          pontos: [
            "Idioma e moeda nacional",
            "Forma contábil e ordem cronológica",
            "Sem espaços em branco, entrelinhas, borrões, rasuras ou emendas",
            "Base: Código Civil, art. 1.183, e ITG 2000",
          ],
          notas: "Pergunte: e se o contador errar? Ele não pode apagar — veja o próximo slide.",
        },
        {
          titulo: "Como corrigir um erro",
          tabela: {
            cab: ["Forma", "Quando usar"],
            linhas: [
              ["Estorno", "Anular o lançamento errado com o lançamento inverso"],
              ["Transferência", "Levar o valor para a conta certa"],
              ["Complementar", "Acertar o valor para mais ou para menos"],
            ],
          },
          notas: "Exemplo de estorno: lançou D Caixa / C Receita em duplicidade → D Receita / C Caixa.",
        },
        {
          titulo: "Diário eletrônico: ECD / SPED",
          pontos: [
            "ECD — Escrituração Contábil Digital, parte do SPED",
            "Substitui o livro em papel",
            "A transmissão ao SPED vale como autenticação (Decreto nº 8.683/2016)",
          ],
          notas: "Comente que o técnico em contabilidade vai trabalhar com sistemas que geram a ECD.",
        },
        {
          titulo: "O Livro Razão",
          tabela: {
            cab: ["Data", "Histórico", "Débito", "Crédito", "Saldo"],
            linhas: [
              ["01/03", "Integralização de capital", "10.000,00", "", "10.000,00 D"],
              ["05/03", "Compra de mercadorias", "", "3.000,00", "7.000,00 D"],
            ],
          },
          destaque: "O Razão mostra cada conta com o saldo depois de cada movimento.",
          notas: "Ligue com o razonete do Módulo 03: o Razão é o razonete \"em colunas\", com saldo.",
        },
        {
          titulo: "Diário × Razão",
          tabela: {
            cab: ["", "Diário", "Razão"],
            linhas: [
              ["Organização", "Cronológica", "Por conta"],
              ["Obrigatoriedade", "Obrigatório por lei", "Obrigatório no Lucro Real; registro permanente (ITG 2000)"],
              ["Uso", "O que aconteceu numa data", "Saldo e movimento de uma conta"],
            ],
          },
          notas: "Os dois saem da mesma escrituração: o Razão é o Diário reorganizado por conta.",
        },
        {
          titulo: "No CTC",
          pontos: [
            "Escrituração → Lançamentos = Livro Diário",
            "Razão por conta = Livro Razão",
            "Exercício \"Do Diário ao Razão\" no Módulo 05",
          ],
          notas: "Abra os lançamentos de uma empresa de teste e depois o Razão do Caixa Geral.",
        },
        {
          titulo: "Para fixar",
          pontos: [
            "1. Cite os cinco elementos do lançamento.",
            "2. Lançou-se uma receita em duplicidade. Como corrigir?",
            "3. Caixa: saldo 7.000 D; entra 5.000 de venda à vista. Novo saldo?",
          ],
          notas: "Respostas: 1) Data, conta debitada, conta creditada, histórico e valor. 2) Por estorno: lançamento inverso. 3) R$ 12.000,00 D.",
        },
      ],
    },
  ],
};

export const apresentacoesDe = (disciplina) => SLIDES[disciplina] || [];
