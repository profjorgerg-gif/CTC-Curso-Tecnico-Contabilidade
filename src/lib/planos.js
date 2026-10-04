// Guia Pedagógico — Plano Semestral e Sequência Didática (plano de aula) no MESMO
// formato dos modelos do CEDUP Hermann Hering enviados pelo professor em 04/10/2026
// ("Plano Semestral Pós-Médio 2026" e "Sequência Didática Pós-Médio"): A4 paisagem,
// cabeçalho com a bandeira de SC e o logotipo do CEDUP, coluna de títulos em salmão.
// Firestore: turmas/{turmaId}/planos/semestral e turmas/{turmaId}/planos/m-AAAA-MM (só o professor da turma).
// Nos textos, **trecho** sai em negrito na impressão.
import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { auditar } from "./auditoria";
import { EMENTAS } from "../dados/ementas";
import { disciplinaPorId } from "../dados/disciplinas";
import { dataBR } from "./contabil";

// cabeçalho da escola (como nos modelos)
export const ESCOLA = {
  linhas: ["ESTADO DE SANTA CATARINA", "SECRETARIA DE ESTADO DA EDUCAÇÃO", "CRE – COORDENADORIA REGIONAL DE EDUCAÇÃO", "CEDUP – CENTRO DE EDUCAÇÃO PROFISSIONAL HERMANN HERING"],
  endereco: "Rua Benjamin Constant, 857, Escola Agrícola, CEP 89037-501.",
  email: "ceduphh@sed.sc.gov.br",
  fone: "473378-8610",
  municipio: "Blumenau",
  curso: "TÉCNICO EM CONTABILIDADE",
  area: "EIXO DE GESTÃO & NEGÓCIO",
};

// textos-padrão dos modelos do professor
export const TEXTOS = {
  metodologia: "Sala de Aula Invertida – uso de materiais digitais e prática presencial.\nAprendizagem Baseada em Problemas (PBL) – resolução de exercícios e estudos de caso.\nGrupos Operativos – trabalhos colaborativos com foco em competências socioemocionais.\nAbordagem Inclusiva – estratégias adaptadas às necessidades dos estudantes.",
  recursos: "Slides, materiais impressos, material de produção e publicação do professor; plataforma CTC (ctccontabil.com.br).",
  instrumentos: "**Estudos de caso:** Resolução de problemas reais ou fictício; pode envolver escrita, discussão e proposição de soluções.\n**Resolução de Exercícios:** Atividades individuais que consolidam os conceitos abordados, incentivando a organização de ideias e o raciocínio lógico.\n**Art. 6º Portaria Nº 874 de 01/04/2025**\n**§ 6º.** Para cada avaliação realizada, independente do instrumento utilizado, deverá constar no professor on-line o registro da respectiva recuperação paralela.\n**Art. 7º. Portaria Nº 874 de 01/04/2025**\n**§10-** Os professores devem registrar no sistema Professor On-line o resultado das avaliações e recuperações em até 15 dias úteis após a sua aplicação.",
  datas: "Por se tratar de um Curso Técnico Pós-Médio, cujos instrumentos avaliativos são desenvolvidos e construídos gradativamente ao longo das aulas presenciais, os prazos para realização e entrega das atividades são definidos de acordo com o andamento do conteúdo programático e o desenvolvimento da turma, visando garantir condições adequadas para a aprendizagem e avaliação dos estudantes.",
  recuperacao: "**Art. 6º Portaria Nº 874 de 01/04/2025.** Entende-se por recuperação paralela a oferta de novas oportunidades de aprendizagens sucedidas de avaliação quando verificado que o nível de aprendizagem e desenvolvimento das habilidades forem insuficientes.\n**§ 1º.** A oferta de novas oportunidades de aprendizagem deverá ocorrer por meio da retomada pedagógica de conceitos, objetos de conhecimento, habilidades e competências não apropriados e/ ou desenvolvidos pelo estudante em determinado período letivo, sendo de responsabilidade da escola e dos professores o seu devido registro no diário de classe.\n**§ 2º.** É direito do estudante, fazer a recuperação paralela, mesmo aquele com resultado de avaliação igual ou acima da média, e é dever do professor ofertá-la a todos os estudantes, independente do rendimento obtido.\n**§ 3º.** Para a oferta de novas oportunidades de aprendizagem, o professor deverá aplicar instrumento diversificado de avaliação durante as aulas, antes do fechamento do trimestre/semestre, realizando o devido lançamento dos resultados no diário de classe.\n**§ 4º.** As atividades de recuperação paralela devem possuir o mesmo peso e grau de complexidade da que originou a necessidade de oferta de nova oportunidade de aprendizagem, prevalecendo o resultado maior obtido.\n**§ 6º.** Para cada avaliação realizada, independente do instrumento utilizado, deverá constar no professor on-line o registro da respectiva recuperação paralela.\n**Art. 7º.§10-** Os professores devem registrar no sistema Professor On-line o resultado das avaliações e recuperações em até 15 dias úteis após a sua aplicação.",
  adaptacoes: "As adaptações e adequações curriculares serão realizadas conforme as necessidades educacionais dos estudantes, respeitando os princípios da educação inclusiva, com flexibilização de estratégias metodológicas, instrumentos de avaliação diferenciados, uso de recursos tecnológicos, apoio pedagógico e adequação de prazos, garantindo o acesso, a permanência e a aprendizagem significativa de todos os alunos, sem prejuízo do desenvolvimento das competências previstas para o componente. Tudo em conjunto com o segundo professor e regente de turma quando necessário.",
  competenciaGeral: "Desenvolver conhecimentos e habilidades, destacando-se em Compreender a estrutura e o funcionamento das empresas e organizações, atuando nas rotinas dos vários departamentos, de modo a permitir o alcance dos objetivos organizacionais e empreendedores, de forma que se consiga acompanhar as estratégias mercadológicas e diagnosticar o retorno através do planejamento sistemático. E por fim, elaborar e interpretar relatórios, utilizando tecnologias apropriadas de informação e comunicação, compreendendo a dinâmica dos mercados, contribuindo para o crescimento empresarial sustentável agir com ética, responsabilidade e comprometimento.",
  observacaoMetodologica: "A sequência dos conteúdos foi reorganizada pedagogicamente pelo professor, considerando a ementa do Curso Técnico em Contabilidade do CEDUP Hermann Hering e a progressão lógica dos conhecimentos.",
  rodapeSequencia: "Art. 7º. Portaria Nº 874 de 01/04/2025 §4º- A periodicidade da postagem do plano de aula será de no máximo 30 dias, podendo, neste período, ser incluído mais de um planejamento a ser desenvolvido, de forma seqüencial, desde que um não sobreponha o outro.",
};

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
export function datasDeAvaliacao(listas, de, ate) {
  return (listas || [])
    .filter((l) => ["avaliativa", "recuperacao"].includes(l.finalidade) && l.prazo && (!de || l.prazo >= de) && (!ate || l.prazo <= ate))
    .sort((a, b) => a.prazo.localeCompare(b.prazo))
    .map((l) => `${dataBR(l.prazo)} — ${l.titulo} (${l.finalidade === "recuperacao" ? "recuperação paralela" : "avaliação"})`);
}
const comDatas = (datas) => [...datas, ...(datas.length ? [""] : []), TEXTOS.datas].join("\n");

const referencias = (e) => [...(e?.basica || []), ...(e?.complementar || [])].join("\n");
const ano = (turma) => String(turma.semestre || "").slice(0, 4) || String(new Date().getFullYear());

export function planoSemestralPadrao(turma, professor, listas) {
  const d = disciplinaPorId(turma.disciplina);
  const e = EMENTAS[turma.disciplina];
  return {
    tipo: "semestral", status: "Pendente", periodo: ano(turma),
    curso: ESCOLA.curso, disciplina: (d?.nome || "").toUpperCase(), modulo: "", turma: turma.nome, professor: (professor || "").toUpperCase(),
    aulasSemanais: turma.avaliacao?.aulasSemanais ? String(turma.avaliacao.aulasSemanais) : "",
    ementa: e?.objeto || "",
    habilidades: (e?.habilidade || []).map((h) => (/[.!?]$/.test(h.trim()) ? h.trim() : `${h.trim()}.`)).join(" "),
    bases: (d?.modulos || []).join("\n"),
    objetoConhecimento: d ? `Capacitar os alunos a compreenderem e aplicarem os fundamentos de ${d.nome}, integrando teoria e prática na escrituração da empresa simulada de cada aluno, com atitudes éticas e responsáveis.` : "",
    metodologia: TEXTOS.metodologia, recursos: TEXTOS.recursos, instrumentos: TEXTOS.instrumentos,
    datasAvaliacao: comDatas(datasDeAvaliacao(listas)),
    recuperacao: TEXTOS.recuperacao, adaptacoes: TEXTOS.adaptacoes,
    referencias: referencias(e),
    local: ESCOLA.municipio, dataDocumento: new Date().toLocaleDateString("sv-SE"),
  };
}

// a sequência didática (plano de aula) herda do Plano Semestral os campos comuns
export function planoMensalPadrao(turma, professor, semestral, listas, mes) {
  const s = { ...planoSemestralPadrao(turma, professor, listas), ...(semestral || {}) };
  const inicio = `${mes}-01`;
  const fim = fimDoMes(mes);
  return {
    tipo: "mensal", status: "Pendente", mes, inicio, fim,
    curso: s.curso, professor: s.professor, area: ESCOLA.area, turma: s.turma, aulasSemanais: s.aulasSemanais, componente: s.disciplina,
    objetos: s.objetoConhecimento, habilidades: s.habilidades,
    competenciaGeral: TEXTOS.competenciaGeral, observacaoMetodologica: TEXTOS.observacaoMetodologica,
    objetivo: s.bases,
    metodologia: s.metodologia, recursos: s.recursos, instrumentos: s.instrumentos,
    datasAvaliacao: comDatas(datasDeAvaliacao(listas, inicio, fim)),
    recuperacao: s.recuperacao, adaptacoes: s.adaptacoes, referencias: s.referencias,
  };
}

// ---------- gravação ----------
export async function lerPlanos(turmaId) {
  const s = await getDocs(collection(db, "turmas", turmaId, "planos"));
  const todos = s.docs.map((d) => ({ id: d.id, ...d.data() }));
  return { semestral: todos.find((p) => p.id === "semestral") || null, mensais: todos.filter((p) => p.tipo === "mensal").sort((a, b) => a.mes.localeCompare(b.mes)) };
}

export async function salvarPlano(turma, id, dados) {
  const { id: _id, ...resto } = dados;
  await setDoc(doc(db, "turmas", turma.id, "planos", id), { ...resto, atualizadoEm: serverTimestamp() });
  auditar("Salvou plano", `${dados.tipo === "semestral" ? "Plano Semestral" : `Sequência didática ${nomeDoMes(dados.mes)}`} — ${turma.nome}`);
}

export async function excluirPlano(turma, id) {
  await deleteDoc(doc(db, "turmas", turma.id, "planos", id));
  auditar("Excluiu plano", `${id} — ${turma.nome}`);
}

// ---------- impressão no formato do CEDUP (PDF pelo navegador) ----------
const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const negrito = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
const texto = (t) => String(t ?? "").split("\n").map((l) => l.trim()).filter(Boolean).map((l) => `<p>${negrito(l)}</p>`).join("") || "<p>&nbsp;</p>";
const dataCurta = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(2, 4)}` : "");

export function imprimirPlano(p) {
  const semestral = p.tipo === "semestral";
  const raiz = window.location.origin;
  const linha = (rotulo, conteudo) => `<tr><th>${rotulo}</th><td colspan="3">${conteudo}</td></tr>`;
  const avaliacao = `<tr><th>INSTRUMENTOS DIVERSIFICADOS DE AVALIAÇÃO</th><td colspan="2" class="instr">${texto(p.instrumentos)}</td><td class="datas"><p><b>DATAS PREVISTAS DE AVALIAÇÕES e RECUPERAÇÕES:</b></p>${texto(p.datasAvaliacao)}</td></tr>`;
  const titulo = semestral
    ? `PLANO SEMESTRAL PÓS MÉDIO PERÍODO ${esc(p.periodo)}`
    : `SEQUÊNCIA DIDÁTICA PÓS-MÉDIO PERÍODO DE: ${dataCurta(p.inicio)} A ${dataBR(p.fim)}. CURSO: ${esc(p.curso)}`;
  const corpo = semestral
    ? `<tr><th>Curso:</th><td>${esc(p.curso)}</td><th class="r2">Disciplina:</th><td>${esc(p.disciplina)}</td></tr>
       <tr><th>Módulo:</th><td>${esc(p.modulo)}</td><th class="r2">Turma:</th><td>${esc(p.turma)}</td></tr>
       <tr><th>Professor:</th><td>${esc(p.professor)}</td><th class="r2">Nº aulas:</th><td>${esc(p.aulasSemanais)}</td></tr>
       ${linha("EMENTA:", texto(p.ementa))}
       ${linha("HABILIDADES", texto(p.habilidades))}
       ${linha("BASES TECNOLÓGICA/Conteúdos por unidade.", texto(p.bases))}
       ${linha("OBJETO DO CONHECIMENTO", texto(p.objetoConhecimento))}
       ${linha("METODOLOGIA DE ENSINO APRENDIZAGEM", texto(p.metodologia))}
       ${linha("RECURSOS UTILIZADOS", texto(p.recursos))}
       ${avaliacao}
       ${linha("RECUPERAÇÃO PARALELA DE APRENDIZAGEM", texto(p.recuperacao))}
       ${linha("ADAPTAÇÕES E OBSERVAÇÕES", texto(p.adaptacoes))}
       ${linha("REFERÊNCIAS BIBLIOGRÁFICAS", texto(p.referencias))}`
    : `${linha("Professor (a):", esc(p.professor))}
       ${linha("Área(s) do Conhecimento:", esc(p.area))}
       ${linha("Turma(s):", esc(p.turma))}
       ${linha("Nº aulas semanais:", esc(p.aulasSemanais))}
       ${linha("COMPONENTE CURRICULAR", esc(p.componente))}
       ${linha("OBJETOS DE CONHECIMENTO", texto(p.objetos))}
       ${linha("HABILIDADES", texto(p.habilidades))}
       ${linha("COMPETÊNCIA GERAL DA UNIDADE CURRICULAR", texto(p.competenciaGeral))}
       ${linha("OBSERVAÇÃO METODOLÓGICA", texto(p.observacaoMetodologica))}
       ${linha("OBJETIVO DE APRENDIZAGEM", texto(p.objetivo))}
       ${linha("METODOLOGIA DE ENSINO APRENDIZAGEM", texto(p.metodologia))}
       ${linha("RECURSOS UTILIZADOS", texto(p.recursos))}
       ${avaliacao}
       ${linha("RECUPERAÇÃO PARALELA DE APRENDIZAGEM", texto(p.recuperacao))}
       ${linha("ADAPTAÇÕES E OBSERVAÇÕES", texto(p.adaptacoes))}
       ${linha("REFERÊNCIAS BIBLIOGRÁFICAS", texto(p.referencias))}`;
  const nomeArquivo = semestral
    ? `Plano Semestral ${p.periodo} - ${p.disciplina} - ${p.turma}`
    : `SD - ${p.componente} - ${dataBR(p.inicio)} a ${dataBR(p.fim)}`;
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(nomeArquivo.replace(/\//g, "."))}</title>
<style>
  @page { size: A4 landscape; margin: 12mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: "Times New Roman", Times, serif; font-size: 11pt; color: #000; margin: 0; }
  .cab { display: grid; grid-template-columns: 34mm 1fr 34mm; align-items: center; text-align: center; font-weight: bold; font-size: 11pt; line-height: 1.25; }
  .cab .esq { display: flex; flex-direction: column; align-items: center; gap: 1mm; }
  .cab .esq img.gov { width: 22mm; } .cab .esq img.band { width: 25mm; } .cab img.cedup { width: 32mm; }
  .cab p { margin: 0; } .cab .menor { font-size: 10pt; } .cab a { color: #00e; }
  h1 { font-size: 11pt; text-align: center; margin: 4mm 0 0; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  th, td { border: 1px solid #000; padding: 1.6mm 2mm; vertical-align: top; text-align: left; }
  th { background: #FBD4B4; font-weight: bold; overflow-wrap: break-word; }
  td p { margin: 0 0 1.4mm; text-align: justify; line-height: 1.5; } td p:last-child { margin-bottom: 0; }
  td.datas p { text-align: left; }
  .local { font-family: Arial, sans-serif; font-size: 8pt; font-weight: bold; margin-top: 1mm; }
  .rodape { font-family: "Times New Roman", serif; font-size: 9pt; margin-top: 2mm; }
</style></head><body>
<div class="cab">
  <div class="esq">${semestral ? "" : `<img class="gov" src="${raiz}/img/governo-sc.jpg" alt="">`}<img class="band" src="${raiz}/img/bandeira-sc.jpg" alt=""></div>
  <div>${ESCOLA.linhas.map((l) => `<p>${esc(l)}</p>`).join("")}<p class="menor">${esc(ESCOLA.endereco)}</p><p class="menor">Email: <a>${esc(ESCOLA.email)}</a>&nbsp; Fone: ${esc(ESCOLA.fone)}</p></div>
  <div><img class="cedup" src="${raiz}/img/cedup-hermann-hering.jpg" alt=""></div>
</div>
<h1>${titulo}</h1>
<table><colgroup><col style="width:20%"><col style="width:46%"><col style="width:12%"><col style="width:22%"></colgroup>${corpo}</table>
${semestral ? `<p class="local">${esc(p.local)}, ${esc(dataBR(p.dataDocumento))}.</p>` : `<p class="rodape">${negrito(TEXTOS.rodapeSequencia)}</p>`}
<script>window.onload = () => setTimeout(() => window.print(), 400);</script>
</body></html>`;
  const w = window.open("", "_blank");
  if (!w) throw new Error("O navegador bloqueou a janela de impressão. Permita pop-ups para o CTC e tente de novo.");
  w.document.open(); w.document.write(html); w.document.close();
}
