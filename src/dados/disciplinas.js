// As 7 disciplinas do CTC, na ordem da trilha do curso.
// Módulos revisados em 03/10/2026 a partir da comparação com as ementas oficiais
// (sugestões aprovadas pelo professor). O conteúdo de cada módulo entra nas próximas fases.
export const DISCIPLINAS = [
  {
    id: "cb", etapa: 1, sigla: "CB", nome: "Contabilidade Básica",
    origem: "SECCHH — Sistema de Escrituração Contábil",
    usa: ["Plano de Contas", "Débito/Crédito"],
    modulos: [
      "Introdução à Contabilidade (princípios, classificação, regimes)",
      "Plano de Contas", "Saldos Iniciais", "Lançamentos (10 fatos orientados)",
      "Consulta por Conta", "Controle de Estoque (PEPS, UEPS, Média)", "Balancete",
      "DRE", "DLPA — Demonstração de Lucros ou Prejuízos Acumulados",
      "Encerramento (ARE)", "Balanço Patrimonial",
    ],
  },
  {
    id: "rh", etapa: 2, sigla: "RH", nome: "Recursos Humanos",
    origem: "Nova — base na ementa oficial",
    usa: [],
    modulos: [
      "Recrutamento e Seleção",
      "Folha de pagamento: salário, adicionais (noturno, insalubridade, periculosidade), horas extras, DSR, comissão, faltas e atrasos, INSS, IRRF, adiantamento, vale-transporte e salário-família",
      "Férias: vencidas e proporcionais",
      "13º salário: anual e proporcional na rescisão",
      "Rescisão: sem justa causa, com justa causa e pedido de demissão",
      "Provisões de 13º, férias e encargos (cálculo)",
      "Sistema contábil para RH: a folha da empresa do aluno gera os lançamentos",
    ],
  },
  {
    id: "admf", etapa: 3, sigla: "ADMF", nome: "Administração Financeira",
    origem: "Plataforma Administração Financeira (aguardando os arquivos)",
    usa: [],
    modulos: [],
  },
  {
    id: "ct", etapa: 4, sigla: "CT", nome: "Contabilidade Tributária",
    origem: "Nova — base na ementa oficial e no motor fiscal do Simulador de NF",
    usa: ["CFOP", "NCM", "IBS/CBS"],
    modulos: [
      "Simples Nacional: apuração",
      "Lucro Presumido: apuração de IRPJ, CSLL, PIS e COFINS",
      "Lucro Real: apuração de IRPJ, CSLL, PIS e COFINS",
      "ICMS e DIFAL",
      "IPI",
      "Tributos municipais (ISS)",
      "Reforma Tributária: transição de PIS/COFINS para CBS/IBS",
    ],
  },
  {
    id: "ci", etapa: 5, sigla: "CI", nome: "Contabilidade Intermediária",
    origem: "Projeto CI + Unidade II",
    usa: ["Plano de Contas", "CFOP", "NCM"],
    modulos: [
      "Princípios Contábeis e NBC — aplicação",
      "Regimes de Caixa e Competência — aplicação, incluindo despesas do exercício seguinte",
      "Plano de Contas", "Operações com Mercadorias", "DRE", "Ativo Imobilizado",
      "Créditos Vencidos e Não Liquidados", "PECLD", "DLPA",
      "Operações Financeiras: empréstimos, aplicações e antecipação de recebíveis",
      "Relatórios finais, incluindo fluxo de caixa e notas explicativas",
      "Unidade II: NF-e, análise fiscal e escrituração",
    ],
  },
  {
    id: "ca", etapa: 6, sigla: "CA", nome: "Contabilidade Avançada",
    origem: "Plataforma CA (versão publicada)",
    usa: ["Plano de Contas"],
    modulos: [
      "Contabilização da Provisão da Folha de Pagamento",
      "Apuração do Resultado — LALUR",
      "Destinação do Resultado: participações, reservas e dividendos",
      "Declaração de Ajuste Anual do IRPF",
      "Ganho de Capital da Pessoa Física",
    ],
  },
  {
    id: "agb", etapa: 7, sigla: "AGB", nome: "Análise Gerencial de Balanço",
    origem: "Nova — usa a DRE e o Balanço que o aluno já montou",
    usa: ["Plano de Contas"],
    modulos: [
      "Revisão dos princípios e preparação das demonstrações",
      "Análise vertical e horizontal",
      "Indicadores: estrutura de capitais, liquidez, rentabilidade e lucratividade",
      "Margem de contribuição e ponto de equilíbrio",
      "Demonstrativo de fluxo de caixa",
      "Relatório gerencial de balanço",
    ],
  },
];

export const disciplinaPorId = (id) => DISCIPLINAS.find((d) => d.id === id);
