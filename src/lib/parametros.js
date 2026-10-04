// Parametrização da empresa do aluno (aprovada em 04/10/2026): como nos sistemas
// de mercado, antes de escriturar o contador define os parâmetros das 3 áreas —
// Contábil, Fiscal/Tributário e Folha. O professor pode fixar parâmetros para a
// turma inteira (turmas/{id}.parametrosFixos = { "contabil.metodoEstoque": "peps" }).
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { auditar } from "./auditoria";
import { ATIVIDADES, REGIMES } from "./empresas";

const opcoes = (...pares) => pares.map(([valor, rotulo]) => ({ valor, rotulo }));

export const AREAS = [
  {
    id: "contabil", nome: "Contábil",
    intro: "Define como o sistema registra e apura os fatos da empresa. É obrigatória antes de começar a escrituração.",
    campos: [
      { id: "exercicioInicio", rotulo: "Início do exercício social", tipo: "data",
        ajuda: "Primeiro dia do período contábil. Os lançamentos só são aceitos dentro do exercício." },
      { id: "exercicioFim", rotulo: "Fim do exercício social", tipo: "data",
        ajuda: "Último dia do período. Normalmente coincide com o ano civil (31/12), como determina a legislação para a maioria das empresas." },
      { id: "regimeReconhecimento", rotulo: "Regime de reconhecimento", tipo: "opcoes",
        opcoes: opcoes(["competencia", "Competência"], ["caixa", "Caixa"]),
        ajuda: "Competência: receitas e despesas entram no período em que acontecem, pagas ou não — é a regra da contabilidade (NBC TG 00 e ITG 1000). Caixa: só quando há pagamento ou recebimento — aceito apenas para fins fiscais em casos específicos (ex.: Simples Nacional).",
        aviso: { caixa: "A escrituração contábil continua seguindo a competência. O regime de caixa vale só para a apuração de tributos em casos permitidos." } },
      { id: "inventario", rotulo: "Sistema de inventário", tipo: "opcoes",
        opcoes: opcoes(["permanente", "Permanente"], ["periodico", "Periódico"]),
        ajuda: "Permanente: o estoque é controlado a cada movimento e o CMV é baixado em cada venda. Periódico: o estoque é contado no fim do período e o CMV é apurado de uma vez: CMV = Estoque Inicial + Compras − Estoque Final." },
      { id: "metodoEstoque", rotulo: "Método de avaliação do estoque", tipo: "opcoes",
        opcoes: opcoes(["peps", "PEPS"], ["media", "Média Ponderada"]),
        ajuda: "PEPS: a saída usa o custo dos lotes mais antigos. Média Ponderada: a saída usa o custo médio do estoque. O UEPS não é aceito pela legislação fiscal nem pelo CPC 16 — aparece só no comparativo do Controle de Estoque." },
      { id: "apuracao", rotulo: "Periodicidade de apuração do resultado", tipo: "opcoes",
        opcoes: opcoes(["mensal", "Mensal"], ["trimestral", "Trimestral"], ["anual", "Anual"]),
        ajuda: "De quanto em quanto tempo o resultado é apurado (encerramento na ARE). A data do encerramento precisa ser o último dia de um mês, trimestre ou do exercício, conforme a escolha." },
      { id: "dividendosPct", rotulo: "Dividendos a distribuir (% do lucro ajustado)", tipo: "numero", min: 0, max: 100,
        ajuda: "Parte do lucro (depois da Reserva Legal de 5%) que vai para os sócios. Nas S.A. o mínimo obrigatório é 25% quando o estatuto é omisso (Lei 6.404/76, art. 202); nas LTDA vale o contrato social." },
      { id: "contadorNome", rotulo: "Contador responsável", tipo: "texto",
        ajuda: "Você, no papel de contador da empresa. O nome aparece nas assinaturas das demonstrações." },
      { id: "contadorCrc", rotulo: "CRC (fictício)", tipo: "texto",
        ajuda: "Registro no Conselho Regional de Contabilidade. Use um número fictício, ex.: SC-012345/O." },
    ],
  },
  {
    id: "fiscal", nome: "Fiscal / Tributário",
    intro: "Define como a empresa é tributada. A atividade e o regime já valem agora; os demais parâmetros são usados na Contabilidade Tributária.",
    campos: [
      { id: "atividade", rotulo: "Atividade", tipo: "opcoes", opcoes: ATIVIDADES.map((a) => ({ valor: a, rotulo: a })),
        ajuda: "Comércio revende mercadorias; serviços prestam serviços (ISS); indústria transforma matéria-prima (IPI e custo de produção)." },
      { id: "regimeTributario", rotulo: "Regime tributário", tipo: "opcoes", opcoes: REGIMES.map((r) => ({ valor: r, rotulo: r })),
        ajuda: "Simples Nacional: guia única (DAS). Lucro Presumido: IRPJ e CSLL sobre uma margem presumida da receita. Lucro Real: IRPJ e CSLL sobre o lucro contábil ajustado (LALUR)." },
      { id: "contribuinteIcms", rotulo: "Contribuinte do ICMS", tipo: "opcoes", opcoes: opcoes(["sim", "Sim"], ["nao", "Não"]),
        ajuda: "Empresas que vendem mercadorias são contribuintes do ICMS e têm inscrição estadual." },
      { id: "aliquotaIcms", rotulo: "Alíquota interna de ICMS (%)", tipo: "numero", min: 0, max: 40,
        ajuda: "Alíquota das vendas dentro do estado. Em SC, a alíquota geral é 17%." },
      { id: "aliquotaIss", rotulo: "Alíquota de ISS (%)", tipo: "numero", min: 0, max: 5,
        ajuda: "Para quem presta serviços: definida pelo município, entre 2% e 5%." },
      { id: "reformaTributaria", rotulo: "Destacar CBS e IBS (Reforma Tributária)", tipo: "opcoes", opcoes: opcoes(["sim", "Sim"], ["nao", "Não"]),
        ajuda: "Segue o cronograma de transição do Banco de Dados (IBS/CBS). Usado na Contabilidade Tributária." },
    ],
  },
  {
    id: "folha", nome: "Folha de pagamento", somenteDisciplina: "rh",
    intro: "Define as regras da folha de pagamento. Liberada na disciplina Recursos Humanos.",
    campos: [
      { id: "diaPagamento", rotulo: "Dia do pagamento dos salários", tipo: "numero", min: 1, max: 31,
        ajuda: "A CLT determina o pagamento até o 5º dia útil do mês seguinte (art. 459)." },
      { id: "adiantamentoPct", rotulo: "Adiantamento quinzenal (% do salário)", tipo: "numero", min: 0, max: 60,
        ajuda: "Muitas empresas pagam um adiantamento (vale) no dia 20, normalmente 40% do salário. Zero = sem adiantamento." },
      { id: "jornadaSemanal", rotulo: "Jornada semanal (horas)", tipo: "numero", min: 1, max: 44,
        ajuda: "O limite constitucional é 44 horas semanais; a base mensal usual é 220 horas." },
      { id: "vtPct", rotulo: "Desconto de vale-transporte (%)", tipo: "numero", min: 0, max: 6,
        ajuda: "A empresa pode descontar até 6% do salário-base do empregado que usa o vale-transporte." },
      { id: "dataBase", rotulo: "Data-base da categoria (mês)", tipo: "texto",
        ajuda: "Mês do reajuste salarial previsto na convenção coletiva do sindicato." },
    ],
  },
];

export function parametrosPadrao(empresa) {
  const ano = (empresa.inicioExercicio || "").slice(0, 4) || String(new Date().getFullYear());
  return {
    contabil: {
      exercicioInicio: empresa.inicioExercicio || `${ano}-01-01`, exercicioFim: `${ano}-12-31`,
      regimeReconhecimento: "", inventario: "", metodoEstoque: "", apuracao: "",
      dividendosPct: 25, contadorNome: empresa.alunoNome || "", contadorCrc: "",
    },
    fiscal: {
      atividade: empresa.atividade || "Comércio", regimeTributario: empresa.regime || "Simples Nacional",
      contribuinteIcms: "sim", aliquotaIcms: 17, aliquotaIss: 5, reformaTributaria: "sim",
    },
    folha: { diaPagamento: 5, adiantamentoPct: 40, jornadaSemanal: 44, vtPct: 6, dataBase: "" },
  };
}

// valores em vigor: padrão ← escolhas do aluno ← fixados pelo professor na turma
export function parametrosEfetivos(empresa, turma) {
  const p = parametrosPadrao(empresa);
  for (const area of AREAS) Object.assign(p[area.id], empresa.parametros?.[area.id] || {});
  for (const [chave, valor] of Object.entries(turma?.parametrosFixos || {})) {
    const [area, campo] = chave.split(".");
    if (p[area]) p[area][campo] = valor;
  }
  return p;
}

export const fixadoNaTurma = (turma, area, campo) => Object.prototype.hasOwnProperty.call(turma?.parametrosFixos || {}, `${area}.${campo}`);

export function conferirArea(areaId, valores) {
  const area = AREAS.find((a) => a.id === areaId);
  const erros = [];
  for (const c of area.campos) {
    const v = valores[c.id];
    if (v === "" || v == null) erros.push(`Escolha: ${c.rotulo}.`);
    else if (c.tipo === "numero" && (Number.isNaN(Number(v)) || Number(v) < c.min || Number(v) > c.max)) erros.push(`${c.rotulo}: entre ${c.min} e ${c.max}.`);
  }
  if (areaId === "contabil" && valores.exercicioInicio && valores.exercicioFim && valores.exercicioFim <= valores.exercicioInicio) {
    erros.push("O fim do exercício precisa ser depois do início.");
  }
  if (areaId === "contabil" && valores.exercicioInicio && valores.exercicioFim) {
    const dias = (new Date(valores.exercicioFim) - new Date(valores.exercicioInicio)) / 86400000;
    if (dias > 366) erros.push("O exercício social não pode passar de 12 meses.");
  }
  return erros;
}

export const areaConfirmada = (empresa, areaId) => !!empresa.parametrosConfirmados?.[areaId];

// grava e confirma uma área; mantém os campos antigos da empresa em dia (usados em outras telas)
export async function confirmarArea(empresa, areaId, valores) {
  const limpo = {};
  const area = AREAS.find((a) => a.id === areaId);
  for (const c of area.campos) limpo[c.id] = c.tipo === "numero" ? Number(valores[c.id]) : String(valores[c.id] ?? "").trim();
  const extra = {};
  if (areaId === "contabil") Object.assign(extra, { inicioExercicio: limpo.exercicioInicio, metodoEstoque: limpo.metodoEstoque });
  if (areaId === "fiscal") Object.assign(extra, { atividade: limpo.atividade, regime: limpo.regimeTributario });
  await setDoc(doc(db, "empresas", empresa.id), {
    parametros: { ...(empresa.parametros || {}), [areaId]: limpo },
    parametrosConfirmados: { ...(empresa.parametrosConfirmados || {}), [areaId]: new Date().toISOString() },
    parametrosDestravados: false,
    ...extra, atualizadaEm: serverTimestamp(),
  }, { merge: true });
  auditar("Confirmou a parametrização", `${area.nome} — ${empresa.razaoSocial}`);
}

// professor: libera o aluno para alterar a parametrização depois de já ter lançamentos
export async function destravarParametros(empresa) {
  await setDoc(doc(db, "empresas", empresa.id), { parametrosDestravados: true, atualizadaEm: serverTimestamp() }, { merge: true });
  auditar("Destravou a parametrização", `${empresa.razaoSocial} (${empresa.id})`);
}

// professor: fixa (ou libera) parâmetros para a turma inteira
export async function salvarParametrosDaTurma(turma, fixos) {
  await setDoc(doc(db, "turmas", turma.id), { parametrosFixos: fixos }, { merge: true });
  auditar("Fixou parâmetros da turma", `${turma.nome}: ${Object.keys(fixos).length} parâmetro(s)`);
}

// professor: nível de ajuda nos lançamentos e tributos nas operações (turmas/{id}.configLancamentos)
export async function salvarConfigLancamentos(turma, config) {
  await setDoc(doc(db, "turmas", turma.id), { configLancamentos: config }, { merge: true });
  auditar("Configurou os lançamentos da turma", `${turma.nome}: ajuda ${config.ajuda}, tributos ${config.tributos}`);
}

// datas de fim de período aceitas para o encerramento (ARE)
export function fimDePeriodoValido(data, apuracao, exercicioFim) {
  if (!data) return false;
  if (data === exercicioFim) return true;
  const d = new Date(`${data}T12:00:00`);
  const amanha = new Date(d); amanha.setDate(d.getDate() + 1);
  const ultimoDoMes = amanha.getDate() === 1;
  if (apuracao === "mensal") return ultimoDoMes;
  if (apuracao === "trimestral") return ultimoDoMes && [2, 5, 8, 11].includes(d.getMonth());
  return false; // anual: só no fim do exercício
}
