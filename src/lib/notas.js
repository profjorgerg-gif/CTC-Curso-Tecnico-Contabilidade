// Notas da turma (aprovado em 04/10/2026), conforme o PPC do Curso Técnico em
// Contabilidade, seção VIII (p. 34-35): avaliação semestral; aprovação com
// frequência ≥ 75% e média ≥ 6,0; número mínimo de instrumentos pelo número de
// aulas semanais; recuperação paralela para cada instrumento.
//
// Firestore:
//  - turmas/{id}/avaliacoes/{avId}  (só o professor): { titulo, tipo: "lista"|"manual", listaId?, peso,
//      publicada, ordem, notas: { matricula: { nota, rec } } }
//  - turmas/{id}/avaliacoes/frequencia (só o professor): { tipo: "frequencia", valores: { matricula: % } }
//  - turmas/{id}/boletim/{matricula} (o professor grava; o aluno lê o próprio): o que foi publicado
//      + recuperacoes: [ids das listas de recuperação que o aluno deve fazer]
//  - turmas/{id}.avaliacao: { aulasSemanais, semestreEncerrado }
import { arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { auditar } from "./auditoria";
import { lerEmpresa } from "./empresas";
import { lerEscrituracao } from "./escrituracao";
import { parametrosEfetivos } from "./parametros";
import { configLancamentos } from "./modelos";
import { marcarListaFechada, notaDaLista } from "./exercicios";

export const MEDIA_MINIMA = 6;
export const FREQUENCIA_MINIMA = 75;
export const FONTE_PPC = "SANTA CATARINA. Secretaria de Estado da Educação. Diretoria de Ensino. Gerência de Ensino Médio e Profissional. Curso técnico em contabilidade: subsequente e concomitante. [Florianópolis]: SED, [202-]. p. 34-35.";

// PPC: 1 aula → 2 instrumentos; 2 aulas → 3; 3 ou mais → 4
export const minimoDeInstrumentos = (aulas) => {
  const a = Number(aulas) || 0;
  if (!a) return null;
  return a === 1 ? 2 : a === 2 ? 3 : 4;
};

const num = (v) => (v === "" || v == null || Number.isNaN(Number(v)) ? null : Number(v));
// nota que vale no instrumento: a maior entre a original e a da recuperação
export function notaFinal(n) {
  const a = num(n?.nota);
  const b = num(n?.rec);
  if (a == null && b == null) return null;
  return Math.max(a ?? 0, b ?? 0);
}

// média ponderada das avaliações que já têm nota do aluno
export function mediaDoAluno(avaliacoes, matricula) {
  let soma = 0;
  let pesos = 0;
  for (const av of avaliacoes) {
    const f = notaFinal(av.notas?.[matricula]);
    if (f == null) continue;
    const p = Number(av.peso) || 1;
    soma += f * p; pesos += p;
  }
  return pesos ? Math.round((soma / pesos) * 10) / 10 : null;
}

export function situacao(media, frequencia, encerrado) {
  const freq = num(frequencia);
  const faltaFreq = freq != null && freq < FREQUENCIA_MINIMA;
  if (encerrado) {
    if (media != null && media >= MEDIA_MINIMA && !faltaFreq) return { texto: "Aprovado", selo: "verde" };
    return { texto: faltaFreq ? "Reprovado (frequência)" : "Reprovado", selo: "vermelho" };
  }
  if (faltaFreq) return { texto: "Frequência abaixo de 75%", selo: "ocre" };
  if (media == null) return { texto: "Sem notas", selo: "cinza" };
  return media >= MEDIA_MINIMA ? { texto: "Na média", selo: "verde" } : { texto: "Abaixo da média", selo: "ocre" };
}

export const fmtNota = (v) => (v == null ? "—" : Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }));

// ---------- leitura e gravação (professor) ----------
const refAvaliacoes = (turmaId) => collection(db, "turmas", turmaId, "avaliacoes");

export async function lerNotasDaTurma(turmaId) {
  const s = await getDocs(refAvaliacoes(turmaId));
  const todos = s.docs.map((d) => ({ id: d.id, ...d.data() }));
  const freq = todos.find((d) => d.tipo === "frequencia");
  const avaliacoes = todos.filter((d) => d.tipo !== "frequencia").sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
  return { avaliacoes, frequencias: freq?.valores || {} };
}

export async function salvarNotas(turma, avaliacoes, frequencias) {
  const lote = writeBatch(db);
  avaliacoes.forEach((av) => {
    const { id, ...dados } = av;
    lote.set(doc(db, "turmas", turma.id, "avaliacoes", id), dados);
  });
  lote.set(doc(db, "turmas", turma.id, "avaliacoes", "frequencia"), { tipo: "frequencia", valores: frequencias });
  await lote.commit();
  auditar("Salvou as notas da turma", `${turma.nome}: ${avaliacoes.length} avaliação(ões)`);
}

export const novoIdAvaliacao = () => `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export async function excluirAvaliacao(turma, av) {
  await deleteDoc(doc(db, "turmas", turma.id, "avaliacoes", av.id));
  auditar("Excluiu avaliação", `${av.titulo} — ${turma.nome}`);
}

export async function salvarConfigAvaliacao(turma, config) {
  await setDoc(doc(db, "turmas", turma.id), { avaliacao: config }, { merge: true });
}

// publica para os alunos: cada boletim recebe só as avaliações marcadas como publicadas
export async function publicarBoletins(turma, alunos, avaliacoes, frequencias) {
  const publicadas = avaliacoes.filter((a) => a.publicada);
  const encerrado = !!turma.avaliacao?.semestreEncerrado;
  const lote = writeBatch(db);
  for (const a of alunos) {
    const itens = publicadas.map((av) => {
      const n = av.notas?.[a.matricula] || {};
      return { id: av.id, titulo: av.titulo, peso: Number(av.peso) || 1, nota: num(n.nota), rec: num(n.rec), final: notaFinal(n) };
    });
    const media = mediaDoAluno(publicadas, a.matricula);
    const frequencia = num(frequencias[a.matricula]);
    lote.set(doc(db, "turmas", turma.id, "boletim", a.matricula), {
      itens, media, frequencia, situacao: situacao(media, frequencia, encerrado).texto, encerrado, publicadoEm: serverTimestamp(),
    }, { merge: true });
  }
  await lote.commit();
  auditar("Publicou as notas", `${turma.nome}: ${publicadas.length} avaliação(ões) para ${alunos.length} aluno(s)`);
}

// aluno: o próprio boletim
export async function lerBoletim(turmaId, matricula) {
  const s = await getDoc(doc(db, "turmas", turmaId, "boletim", matricula));
  return s.exists() ? s.data() : null;
}

// ---------- listas avaliativas ----------
// contexto de correção da empresa de cada aluno (método e inventário dele)
function contextoDoAluno(empresa, turma) {
  const p = parametrosEfetivos(empresa, turma).contabil;
  return { metodo: p.metodoEstoque || "peps", periodico: p.inventario === "periodico", tributos: configLancamentos(turma).tributos };
}

// calcula a nota de cada aluno na lista; alunos sem empresa ou sem lançamento ficam com 0
export async function calcularNotasDaLista(turma, lista, alunos) {
  const resultado = {};
  for (const a of alunos) {
    const empresa = await lerEmpresa(turma.id, a.matricula).catch(() => null);
    if (!empresa) { resultado[a.matricula] = { nota: 0, acertos: 0, total: lista.fatos.length, lancados: 0 }; continue; }
    const { lancamentos } = await lerEscrituracao(empresa.id);
    resultado[a.matricula] = notaDaLista(lista, lancamentos, contextoDoAluno(empresa, turma));
  }
  return resultado;
}

// alunos que ficaram abaixo da média numa lista avaliativa (fazem a recuperação)
export async function alunosParaRecuperacao(turma, listaId) {
  const s = await getDoc(doc(db, "turmas", turma.id, "avaliacoes", listaId));
  if (!s.exists()) return [];
  const notas = s.data().notas || {};
  return Object.keys(notas).filter((m) => (notaFinal(notas[m]) ?? 0) < MEDIA_MINIMA);
}

// fecha a lista: grava a nota de cada aluno (fica congelada) e marca a lista como fechada
export async function fecharLista(turma, lista, alunos) {
  if (lista.finalidade === "recuperacao") {
    const ref = doc(db, "turmas", turma.id, "avaliacoes", lista.recuperacaoDe);
    const s = await getDoc(ref);
    if (!s.exists()) throw new Error("A lista avaliativa original ainda não foi fechada.");
    const alvos = await alunosParaRecuperacao(turma, lista.recuperacaoDe);
    const notas = await calcularNotasDaLista(turma, lista, alunos.filter((a) => alvos.includes(a.matricula)));
    const atual = s.data().notas || {};
    for (const [m, r] of Object.entries(notas)) atual[m] = { ...atual[m], rec: r.nota };
    await setDoc(ref, { notas: atual, recuperacaoListaId: lista.id }, { merge: true });
    await marcarListaFechada(turma, lista);
    auditar("Fechou a recuperação e lançou as notas", `${lista.titulo} — ${turma.nome}: ${Object.keys(notas).length} aluno(s)`);
    return notas;
  }
  const notas = await calcularNotasDaLista(turma, lista, alunos);
  const ref = doc(db, "turmas", turma.id, "avaliacoes", lista.id);
  const antes = await getDoc(ref);
  const valores = {};
  for (const [m, r] of Object.entries(notas)) valores[m] = { nota: r.nota, ...(antes.exists() && antes.data().notas?.[m]?.rec != null ? { rec: antes.data().notas[m].rec } : {}) };
  await setDoc(ref, {
    titulo: lista.titulo, tipo: "lista", listaId: lista.id, peso: Number(lista.peso) || 1,
    publicada: antes.exists() ? !!antes.data().publicada : false, ordem: antes.exists() ? antes.data().ordem : Date.now(), notas: valores,
  });
  await marcarListaFechada(turma, lista);
  auditar("Fechou a lista avaliativa e lançou as notas", `${lista.titulo} — ${turma.nome}: ${alunos.length} aluno(s)`);
  return notas;
}

// libera a lista de recuperação só para os alunos abaixo da média
export async function marcarRecuperacao(turma, matriculas, listaId) {
  const lote = writeBatch(db);
  matriculas.forEach((m) => lote.set(doc(db, "turmas", turma.id, "boletim", m), { recuperacoes: arrayUnion(listaId) }, { merge: true }));
  await lote.commit();
}

// exportação da tabela de notas (.csv, separador ";" para o Excel em português)
export function csvDasNotas(turma, alunos, avaliacoes, frequencias) {
  const n = (v) => (v == null ? "" : String(v).replace(".", ","));
  const cab = ["Matrícula", "Nome", ...avaliacoes.flatMap((a) => [`${a.titulo} (peso ${a.peso || 1})`, `${a.titulo} — recuperação`]), "Média", "Frequência (%)", "Situação"];
  const linhas = alunos.map((a) => {
    const media = mediaDoAluno(avaliacoes, a.matricula);
    return [a.matricula, a.nome, ...avaliacoes.flatMap((av) => [n(num(av.notas?.[a.matricula]?.nota)), n(num(av.notas?.[a.matricula]?.rec))]),
      n(media), n(num(frequencias[a.matricula])), situacao(media, frequencias[a.matricula], turma.avaliacao?.semestreEncerrado).texto];
  });
  return [cab, ...linhas].map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\r\n");
}
