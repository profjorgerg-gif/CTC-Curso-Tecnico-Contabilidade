// Trilha do aluno (aprovada em 05/10/2026): o que fazer depois de estudar cada módulo
// e a situação do aluno em cada um (estudado · questionário · prática no CTC).
import { lerEmpresa } from "./empresas";
import { lerEscrituracao } from "./escrituracao";
import { balancete } from "./contabil";
import { jaEncerrado } from "./demonstracoes";
import { ehQuestoes, finalidadeDe, listasDaTurma } from "./exercicios";
import { lerResposta } from "./questoes";
import { lerBoletim } from "./notas";
import { praticasDo } from "../dados/praticas";

// Próximo passo de cada módulo. destino = rota do CTC (ex.: ["escrituracao", "saldos"]).
// pratica(x) diz se a prática no CTC está feita (null = módulo sem prática de escrituração).
const fatos = (x, ns) => ns.every((n) => x.esc?.lancamentos.some((l) => l.fatoOrientado === n));
export const TRILHA = {
  cb: {
    1: { texto: "Faça o exercício de balanços sucessivos da Cia. Vamos, logo acima. Para praticar mais, faça também os da Alfa Comercial e da Beta Comercial.", pratica: (x) => x.bsConcluido },
    2: { texto: "Abra Consultas → Plano de Contas e localize as contas citadas na teoria (Caixa Geral, Duplicatas a Pagar, CMV, (−) Depreciação Acumulada).", destino: ["banco"], botao: "Abrir Consultas", pratica: null },
    3: { texto: "Faça o exercício de razonetes logo acima: lance os 9 fatos e apure o saldo de cada razonete.", pratica: (x) => x.bsConcluido },
    4: { texto: "Faça o exercício de abertura da Comercial Gama logo acima. Depois, na Escrituração, faça os Saldos Iniciais: o lançamento de abertura da sua empresa.", destino: ["escrituracao", "saldos"], botao: "Fazer os saldos iniciais", pratica: (x) => !!x.esc?.saldosGravados },
    5: { texto: "Faça o exercício \"Do Diário ao Razão\" logo acima. Depois, abra o Razão por conta da sua empresa e confira como a abertura aparece.", destino: ["escrituracao", "razao"], botao: "Abrir o Razão", pratica: (x) => x.bsConcluido },
    6: { texto: "Preencha a ficha de controle de estoque logo acima. Depois, lance os fatos orientados 1 a 4 (compras e vendas) na sua empresa e confira a ficha no Controle de estoque.", destino: ["escrituracao", "lancamentos"], botao: "Lançar compras e vendas", pratica: (x) => fatos(x, [1, 2, 3, 4]) },
    7: { texto: "Lance os 8 fatos orientados e as listas que o professor enviar.", destino: ["escrituracao", "lancamentos"], botao: "Lançar os fatos", pratica: (x) => fatos(x, [1, 2, 3, 4, 5, 6, 7, 8]) },
    8: { texto: "Abra o Balancete e confira se o total dos débitos é igual ao dos créditos.", destino: ["escrituracao", "balancete"], botao: "Abrir o Balancete", pratica: (x) => fatos(x, [1, 2, 3, 4, 5, 6, 7, 8]) && x.balanceteFecha },
    9: { texto: "Abra a DRE da sua empresa e acompanhe como o resultado é apurado.", destino: ["escrituracao", "dre"], botao: "Abrir a DRE", pratica: null },
    10: { texto: "Faça o Encerramento do exercício (ARE) da sua empresa.", destino: ["escrituracao", "are"], botao: "Fazer o encerramento", pratica: (x) => x.encerrado },
    11: { texto: "Abra a DLPA e veja o destino do resultado do exercício.", destino: ["escrituracao", "dlpa"], botao: "Abrir a DLPA", pratica: null },
    12: { texto: "Abra o Balanço Patrimonial e confira: Ativo = Passivo + PL.", destino: ["escrituracao", "balanco"], botao: "Abrir o Balanço", pratica: null },
  },
};
export const passoDo = (disciplina, numero) => TRILHA[disciplina]?.[numero] || null;

// "estudado" fica neste navegador (marcação do próprio aluno)
const chaveEstudo = (disc, n) => `ctc-estudado-${disc}-${String(n).padStart(2, "0")}`;
export function estudado(disc, n) { try { return localStorage.getItem(chaveEstudo(disc, n)) === "1"; } catch { return false; } }
export function marcarEstudado(disc, n, sim) { try { if (sim) localStorage.setItem(chaveEstudo(disc, n), "1"); else localStorage.removeItem(chaveEstudo(disc, n)); } catch { /* sem armazenamento */ } }

function bsConcluido(disc, n) {
  // conta o primeiro exercício do módulo (os demais são prática extra)
  return praticasDo(disc, n).slice(0, 1).every((ex) => {
    try { const p = JSON.parse(localStorage.getItem(`ctc-pratica-${ex.id}`) || "null"); return !!p && (ex.tipo === "balanco-sucessivo" ? p.fato >= ex.fatos.length : !!p.concluido); } catch { return false; }
  });
}

// módulo das questões de uma lista (ids "cb02-me01" → 2)
const moduloDasQuestoes = (lista) => {
  const m = (lista.questoes || [])[0]?.id?.match(/^[a-z]+(\d{2})-/);
  return m ? Number(m[1]) : null;
};

// situação do aluno em todos os módulos da disciplina, na primeira turma dela
export async function situacaoDoAluno(turma, matricula, plano, disciplina, totalModulos) {
  const empresa = await lerEmpresa(turma.id, matricula).catch(() => null);
  const esc = empresa ? await lerEscrituracao(empresa.id).catch(() => null) : null;
  const x = {
    esc,
    balanceteFecha: !!(esc && plano && (esc.saldosGravados || esc.lancamentos.length) && balancete(plano, esc.lancamentos, esc.saldos).fecha),
    encerrado: !!(esc && jaEncerrado(esc.lancamentos)),
  };
  const [listas, boletim] = await Promise.all([listasDaTurma(turma.id, true).catch(() => []), lerBoletim(turma.id, matricula).catch(() => null)]);
  const questionarios = listas.filter((l) => ehQuestoes(l) && (finalidadeDe(l) !== "recuperacao" || boletim?.recuperacoes?.includes(l.id)));
  const respostas = {};
  for (const l of questionarios) respostas[l.id] = await lerResposta(turma.id, l.id, matricula).catch(() => null);

  const r = {};
  for (let n = 1; n <= totalModulos; n++) {
    const passo = passoDo(disciplina, n);
    const doModulo = questionarios.filter((l) => moduloDasQuestoes(l) === n);
    const feitos = doModulo.filter((l) => Object.keys(respostas[l.id]?.respostas || {}).length >= (l.questoes || []).length);
    r[n] = {
      estudado: estudado(disciplina, n),
      questionario: doModulo.length === 0 ? null : feitos.length === doModulo.length ? "feito" : "pendente",
      pratica: !passo?.pratica ? null : passo.pratica({ ...x, bsConcluido: bsConcluido(disciplina, n) }) ? "feito" : "pendente",
    };
  }
  return r;
}
