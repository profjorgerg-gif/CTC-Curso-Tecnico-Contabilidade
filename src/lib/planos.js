// Guia Pedagógico — Plano Semestral e Plano de Aula Mensal (aprovado em 04/10/2026).
// Os campos seguem o formulário oficial da SED/SC para o Pós-Médio (Portaria nº 874/2025),
// o mesmo usado no SIPP: o Plano Semestral e a Sequência Didática (aqui, mensal).
// Firestore: turmas/{turmaId}/planos/semestral e turmas/{turmaId}/planos/m-AAAA-MM (só o professor da turma).
import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { auditar } from "./auditoria";
import { EMENTAS, FONTE_EMENTAS } from "../dados/ementas";
import { disciplinaPorId } from "../dados/disciplinas";
import { dataBR } from "./contabil";

export const ESCOLA_PADRAO = { nome: "CEDUP Hermann Hering", municipio: "Blumenau", uf: "SC", curso: "Técnico em Contabilidade", modalidade: "Pós-Médio (concomitante e subsequente)" };

export const INSTRUMENTOS = [
  "Exercícios práticos no CTC (escrituração)", "Provas escritas", "Estudos de caso", "Seminários",
  "Produção de textos e relatórios", "Simulações", "Projetos de pesquisa", "Debates", "Mapas mentais ou conceituais",
];

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
export const nomeDoMes = (aaaamm) => {
  const [a, m] = (aaaamm || "").split("-");
  return m ? `${MESES[Number(m) - 1]} de ${a}` : "";
};
const fimDoMes = (aaaamm) => {
  const [a, m] = aaaamm.split("-").map(Number);
  return new Date(a, m, 0).toLocaleDateString("sv-SE");
};

// datas de avaliação que o CTC já conhece: listas avaliativas e de recuperação com prazo
export function datasDeAvaliacao(listas, mes) {
  return (listas || [])
    .filter((l) => ["avaliativa", "recuperacao"].includes(l.finalidade) && l.prazo && (!mes || l.prazo.startsWith(mes)))
    .sort((a, b) => a.prazo.localeCompare(b.prazo))
    .map((l) => `${dataBR(l.prazo)} — ${l.titulo} (${l.finalidade === "recuperacao" ? "recuperação paralela" : "exercício avaliativo"} no CTC)`);
}

const referencias = (e) => [
  ...(e?.basica?.length ? ["Básica:", ...e.basica] : []),
  ...(e?.complementar?.length ? ["Complementar:", ...e.complementar] : []),
].join("\n");

export function planoSemestralPadrao(turma, professor, listas) {
  const d = disciplinaPorId(turma.disciplina);
  const e = EMENTAS[turma.disciplina];
  return {
    tipo: "semestral", status: "Pendente",
    escola: ESCOLA_PADRAO.nome, curso: ESCOLA_PADRAO.curso, modalidade: ESCOLA_PADRAO.modalidade,
    semestre: turma.semestre || "", turma: turma.nome, componente: d?.nome || "", professor,
    aulasSemanais: turma.avaliacao?.aulasSemanais ? String(turma.avaliacao.aulasSemanais) : "",
    objetos: e?.objeto || "",
    habilidades: (e?.habilidade || []).join("\n"),
    objetivo: d ? `Desenvolver no estudante a compreensão e a prática de ${d.nome}, aplicando os conteúdos na escrituração da empresa simulada de cada aluno na plataforma CTC.` : "",
    modulos: (d?.modulos || []).join("\n"),
    metodologia: "Aulas expositivas e dialogadas com apoio de slides.\nPrática de escrituração na plataforma CTC: empresa individual de cada aluno, fatos orientados e listas de exercícios de sala.\nResolução e correção comentada de exercícios.",
    recursos: "Laboratório de informática.\nPlataforma CTC (ctccontabil.com.br).\nProjetor multimídia e quadro.",
    instrumentos: ["Exercícios práticos no CTC (escrituração)", "Provas escritas"], outrosInstrumentos: "",
    datasAvaliacao: datasDeAvaliacao(listas).join("\n"),
    recuperacao: "Recuperação paralela para cada instrumento avaliativo: retomada dos objetos de conhecimento e nova avaliação para os estudantes com aproveitamento insuficiente (abaixo de 6,0). Vale a maior nota entre o instrumento e a sua recuperação.",
    adaptacoes: "",
    referencias: referencias(e),
    fonteEmenta: e ? `${FONTE_EMENTAS.autor} ${FONTE_EMENTAS.titulo}${FONTE_EMENTAS.resto} ${e.paginas}.` : "",
    local: `${ESCOLA_PADRAO.municipio}/${ESCOLA_PADRAO.uf}`, dataDocumento: new Date().toLocaleDateString("sv-SE"),
  };
}

// o plano mensal herda os campos comuns do semestral
export function planoMensalPadrao(turma, professor, semestral, listas, mes) {
  const s = semestral || planoSemestralPadrao(turma, professor, listas);
  const doMes = (listas || []).filter((l) => (l.prazo || "").startsWith(mes) || (l.configuracao?.inicio || "").startsWith(mes));
  return {
    tipo: "mensal", status: "Pendente", mes, inicio: `${mes}-01`, fim: fimDoMes(mes),
    escola: s.escola, curso: s.curso, modalidade: s.modalidade, semestre: s.semestre, turma: s.turma, componente: s.componente, professor: s.professor, aulasSemanais: s.aulasSemanais,
    objetos: "", habilidades: s.habilidades, expectativas: "",
    atividades: doMes.length ? doMes.map((l) => `${l.titulo} — ${l.fatos?.length || 0} fatos (${l.finalidade === "avaliativa" ? "avaliativo" : l.finalidade === "recuperacao" ? "recuperação" : "exercício de sala"})`).join("\n") : "",
    recursos: s.recursos, instrumentos: s.instrumentos || [], outrosInstrumentos: s.outrosInstrumentos || "",
    datasAvaliacao: datasDeAvaliacao(listas, mes).join("\n"),
    recuperacao: s.recuperacao, adaptacoes: s.adaptacoes || "", observacoes: "", referencias: s.referencias,
    local: s.local, dataDocumento: new Date().toLocaleDateString("sv-SE"),
  };
}

// ---------- gravação ----------
export async function lerPlanos(turmaId) {
  const s = await getDocs(collection(db, "turmas", turmaId, "planos"));
  const todos = s.docs.map((d) => ({ id: d.id, ...d.data() }));
  return { semestral: todos.find((p) => p.id === "semestral") || null, mensais: todos.filter((p) => p.tipo === "mensal").sort((a, b) => a.mes.localeCompare(b.mes)) };
}

export async function salvarPlano(turma, id, dados) {
  await setDoc(doc(db, "turmas", turma.id, "planos", id), { ...dados, atualizadoEm: serverTimestamp() });
  auditar("Salvou plano", `${dados.tipo === "semestral" ? "Plano Semestral" : `Plano mensal ${nomeDoMes(dados.mes)}`} — ${turma.nome}`);
}

export async function excluirPlano(turma, id) {
  await deleteDoc(doc(db, "turmas", turma.id, "planos", id));
  auditar("Excluiu plano", `${id} — ${turma.nome}`);
}

// ---------- impressão (PDF pelo navegador; o texto fica selecionável) ----------
const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const blocoTexto = (t) => esc(t).split("\n").map((l) => l.trim()).filter(Boolean).map((l) => `<p>${l}</p>`).join("") || "<p>&nbsp;</p>";

export function imprimirPlano(p) {
  const semestral = p.tipo === "semestral";
  const titulo = semestral ? "PLANEJAMENTO SEMESTRAL" : "SEQUÊNCIA DIDÁTICA — PLANO DE AULA MENSAL";
  const sec = (rotulo, conteudo) => `<section><h3>${rotulo}</h3><div class="caixa">${conteudo}</div></section>`;
  const instrumentos = [...(p.instrumentos || []), ...(p.outrosInstrumentos ? [p.outrosInstrumentos] : [])];
  const ident = [
    ["Unidade escolar", p.escola], ["Curso", p.curso], ["Modalidade", p.modalidade],
    ["Componente curricular", p.componente], ["Turma", p.turma], ["Semestre", p.semestre],
    ["Aulas semanais", p.aulasSemanais], ["Professor(a)", p.professor],
    ...(semestral ? [] : [["Período", `${dataBR(p.inicio)} a ${dataBR(p.fim)} (${nomeDoMes(p.mes)})`]]),
  ];
  const corpo = semestral
    ? [
      sec("Objetos de conhecimento", blocoTexto(p.objetos)),
      sec("Habilidades", blocoTexto(p.habilidades)),
      sec("Objetivo de aprendizagem", blocoTexto(p.objetivo)),
      sec("Organização dos conteúdos (módulos)", blocoTexto(p.modulos)),
      sec("Metodologia", blocoTexto(p.metodologia)),
      sec("Recursos didáticos", blocoTexto(p.recursos)),
      sec("Instrumentos de avaliação", blocoTexto(instrumentos.join("\n"))),
      sec("Datas das avaliações", blocoTexto(p.datasAvaliacao)),
      sec("Recuperação paralela", blocoTexto(p.recuperacao)),
      sec("Adaptações curriculares", blocoTexto(p.adaptacoes)),
      sec("Referências", blocoTexto(p.referencias)),
    ]
    : [
      sec("Objetos de conhecimento do mês", blocoTexto(p.objetos)),
      sec("Habilidades", blocoTexto(p.habilidades)),
      sec("Expectativas de aprendizagem", blocoTexto(p.expectativas)),
      sec("Experiências de aprendizagem (atividades)", blocoTexto(p.atividades)),
      sec("Recursos didáticos", blocoTexto(p.recursos)),
      sec("Instrumentos de avaliação", blocoTexto(instrumentos.join("\n"))),
      sec("Datas das avaliações", blocoTexto(p.datasAvaliacao)),
      sec("Recuperação paralela", blocoTexto(p.recuperacao)),
      sec("Adaptações curriculares", blocoTexto(p.adaptacoes)),
      sec("Observações gerais", blocoTexto(p.observacoes)),
      sec("Referências", blocoTexto(p.referencias)),
    ];
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(titulo)} — ${esc(p.componente)} — ${esc(p.turma)}</title>
<style>
  @page { size: A4; margin: 16mm 14mm; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10.5pt; color: #111; margin: 0; }
  header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 6px; margin-bottom: 10px; }
  header p { margin: 1px 0; } header .orgao { font-weight: bold; letter-spacing: .3px; }
  h1 { font-size: 13pt; text-align: center; margin: 10px 0; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  td { border: 1px solid #555; padding: 4px 6px; vertical-align: top; } td.r { width: 26%; font-weight: bold; background: #eee; }
  section { break-inside: avoid; margin-bottom: 8px; }
  h3 { font-size: 10.5pt; margin: 0; padding: 4px 6px; background: #ddd; border: 1px solid #555; border-bottom: 0; }
  .caixa { border: 1px solid #555; padding: 4px 8px; min-height: 18px; } .caixa p { margin: 2px 0; }
  .fonte { font-size: 8.5pt; color: #444; margin-top: 6px; }
  .assin { margin-top: 28px; display: flex; justify-content: space-between; gap: 30px; }
  .assin div { flex: 1; text-align: center; border-top: 1px solid #111; padding-top: 4px; }
  .local { text-align: right; margin-top: 14px; }
</style></head><body>
<header><p class="orgao">ESTADO DE SANTA CATARINA</p><p class="orgao">SECRETARIA DE ESTADO DA EDUCAÇÃO</p><p>${esc(p.escola)} — ${esc(ESCOLA_PADRAO.municipio)}/${esc(ESCOLA_PADRAO.uf)}</p></header>
<h1>${esc(titulo)}</h1>
<table>${ident.map(([r, v]) => `<tr><td class="r">${esc(r)}</td><td>${esc(v)}</td></tr>`).join("")}</table>
${corpo.join("\n")}
${semestral && p.fonteEmenta ? `<p class="fonte">Objetos de conhecimento e habilidades conforme a ementa oficial: ${esc(p.fonteEmenta)}</p>` : ""}
<p class="local">${esc(p.local)}, ${esc(dataBR(p.dataDocumento))}.</p>
<div class="assin"><div>${esc(p.professor)}<br>Professor(a)</div><div>Coordenação pedagógica</div></div>
<script>window.onload = () => setTimeout(() => window.print(), 300);</script>
</body></html>`;
  const w = window.open("", "_blank");
  if (!w) throw new Error("O navegador bloqueou a janela de impressão. Permita pop-ups para o CTC e tente de novo.");
  w.document.open(); w.document.write(html); w.document.close();
}
