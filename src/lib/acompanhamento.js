// Acompanhamento da turma (aprovado em 04/10/2026): situação de cada aluno em cada
// etapa, lida dos livros da empresa dele. Custa ~3 leituras por aluno (empresa,
// saldos e diário) + 1 do boletim quando há lista de recuperação.
import { lerEmpresa } from "./empresas";
import { lerEscrituracao } from "./escrituracao";
import { parametrosEfetivos, areaConfirmada } from "./parametros";
import { configLancamentos } from "./modelos";
import { corrigirLancamento, ehQuestoes, finalidadeDe, GABARITO_ORIENTADOS } from "./exercicios";
import { lerResposta, notaDasQuestoes } from "./questoes";
import { balancete, FATOS_ORIENTADOS } from "./contabil";
import { jaEncerrado } from "./demonstracoes";
import { lerBoletim } from "./notas";

export const DIAS_SEM_ATIVIDADE = 7;

function ultimaAtividade(esc) {
  const datas = (esc.lancamentos || []).flatMap((l) => [l.alteradoEm, (l.criadoEm || "").split("#")[0]]).filter(Boolean).map((x) => new Date(x).getTime()).filter((x) => !Number.isNaN(x));
  if (esc.atualizadoEm) datas.push(esc.atualizadoEm.getTime());
  return datas.length ? new Date(Math.max(...datas)) : null;
}

// um roteiro (fatos orientados ou lista): quantos fatos lançados e quantos conferem
function situacaoNoRoteiro(fatos, achar, lancamentos, ctx) {
  let lancados = 0;
  let acertos = 0;
  for (const f of fatos) {
    const l = achar(f);
    if (!l) continue;
    lancados++;
    if (corrigirLancamento(l, f, lancamentos, ctx)?.ok) acertos++;
  }
  return { lancados, acertos, total: fatos.length };
}

export async function acompanharAluno(turma, aluno, listas, plano, gabaritos = {}) {
  const empresa = await lerEmpresa(turma.id, aluno.matricula).catch(() => null);
  const base = { aluno, empresa };
  if (!empresa) return { ...base, semEmpresa: true };
  const esc = await lerEscrituracao(empresa.id);
  const pc = parametrosEfetivos(empresa, turma).contabil;
  const ctx = { metodo: pc.metodoEstoque || "peps", periodico: pc.inventario === "periodico", tributos: configLancamentos(turma).tributos };
  const lanc = esc.lancamentos;
  const orientados = situacaoNoRoteiro(
    FATOS_ORIENTADOS.map((f, i) => ({ n: i + 1, ...f, gabarito: GABARITO_ORIENTADOS[i] })),
    (f) => lanc.find((l) => l.fatoOrientado === f.n), lanc, ctx,
  );
  const temRecuperacao = listas.some((l) => finalidadeDe(l) === "recuperacao");
  const boletim = temRecuperacao ? await lerBoletim(turma.id, aluno.matricula).catch(() => null) : null;
  const porLista = {};
  const respostas = {}; // guardadas para o Relatório de orientação (sem ler de novo)
  for (const lista of listas) {
    if (finalidadeDe(lista) === "recuperacao" && !boletim?.recuperacoes?.includes(lista.id)) { porLista[lista.id] = { naoSeAplica: true }; continue; }
    if (ehQuestoes(lista)) {
      const r = await lerResposta(turma.id, lista.id, aluno.matricula).catch(() => null);
      respostas[lista.id] = r;
      porLista[lista.id] = notaDasQuestoes(lista.questoes || [], r?.respostas || {}, gabaritos[lista.id]);
      continue;
    }
    porLista[lista.id] = situacaoNoRoteiro(lista.fatos || [], (f) => lanc.find((l) => l.lista?.id === lista.id && l.lista?.n === f.n), lanc, ctx);
  }
  const temMovimento = esc.saldosGravados || lanc.length > 0;
  return {
    ...base,
    cadastro: !!empresa.cadastroCompleto,
    parametrizacao: areaConfirmada(empresa, "contabil"),
    saldos: esc.saldosGravados,
    lancamentos: lanc.length,
    orientados,
    porLista,
    balancete: temMovimento ? balancete(plano, lanc, esc.saldos).fecha : null,
    encerrado: jaEncerrado(lanc),
    ultima: ultimaAtividade(esc),
    bruto: { empresa, esc, boletim, respostas },
  };
}

// o aluno precisa de atenção: sem atividade há mais de 7 dias, ou com lista vencida incompleta
export function atrasado(x, listas, hoje = new Date()) {
  if (!x.ultima || (hoje - x.ultima) / 86400000 > DIAS_SEM_ATIVIDADE) return true;
  const hojeIso = hoje.toLocaleDateString("sv-SE");
  return listas.some((l) => l.prazo && hojeIso > l.prazo && x.porLista?.[l.id] && !x.porLista[l.id].naoSeAplica && x.porLista[l.id].lancados < x.porLista[l.id].total);
}

// tem lançamentos que não conferem (fatos orientados ou listas)
export function comDiferencas(x) {
  if (x.orientados && x.orientados.acertos < x.orientados.lancados) return true;
  return Object.values(x.porLista || {}).some((r) => !r.naoSeAplica && r.acertos < r.lancados);
}
