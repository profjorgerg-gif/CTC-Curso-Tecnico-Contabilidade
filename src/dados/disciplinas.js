// As 7 disciplinas do CTC, na ordem da trilha do curso.
// Distribuição de temas conforme a decisão 5 (03/10/2026).
// O conteúdo de cada módulo entra nas próximas fases.
export const DISCIPLINAS = [
  {
    id: "cb", etapa: 1, sigla: "CB", nome: "Contabilidade Básica",
    origem: "SECCHH — Sistema de Escrituração Contábil",
    usa: ["Plano de Contas", "Débito/Crédito"],
    modulos: [
      "Introdução à Contabilidade (princípios, classificação, regimes)",
      "Plano de Contas", "Saldos Iniciais", "Lançamentos (10 fatos orientados)",
      "Consulta por Conta", "Controle de Estoque (PEPS, UEPS, Média)", "Balancete",
      "DRE", "Encerramento (ARE)", "Balanço Patrimonial",
    ],
  },
  {
    id: "rh", etapa: 2, sigla: "RH", nome: "Recursos Humanos",
    origem: "Nova — parte da folha de pagamento da CA",
    usa: [],
    modulos: ["Folha de pagamento: salário e encargos", "Férias", "13º salário", "Rescisão"],
  },
  {
    id: "admf", etapa: 3, sigla: "ADMF", nome: "Administração Financeira",
    origem: "Plataforma Administração Financeira",
    usa: [],
    modulos: [],
  },
  {
    id: "ct", etapa: 4, sigla: "CT", nome: "Contabilidade Tributária",
    origem: "Nova — parte do Simulador de NF, da Unidade II e da CA",
    usa: ["CFOP", "NCM", "IBS/CBS"],
    modulos: [
      "Documentos fiscais: CFOP, NCM e CST",
      "Tributos sobre mercadorias: ICMS, IPI, PIS, COFINS",
      "Reforma Tributária: CBS, IBS e Imposto Seletivo",
      "IRPF: Declaração de Ajuste Anual", "Ganho de Capital da Pessoa Física",
    ],
  },
  {
    id: "ci", etapa: 5, sigla: "CI", nome: "Contabilidade Intermediária",
    origem: "Projeto CI + Unidade II",
    usa: ["Plano de Contas", "CFOP", "NCM"],
    modulos: [
      "Princípios Contábeis e NBC — aplicação", "Regimes de Caixa e Competência — aplicação",
      "Plano de Contas", "Operações com Mercadorias", "DRE", "Ativo Imobilizado",
      "Créditos Vencidos e Não Liquidados", "PECLD", "DLPA", "Operações Financeiras",
      "Relatórios finais", "Unidade II: NF-e, análise fiscal e escrituração",
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
    ],
  },
  {
    id: "agb", etapa: 7, sigla: "AGB", nome: "Análise Gerencial de Balanço",
    origem: "Nova — usa a DRE e o Balanço que o aluno já montou",
    usa: ["Plano de Contas"],
    modulos: [],
  },
];

export const disciplinaPorId = (id) => DISCIPLINAS.find((d) => d.id === id);
