// Relatório de orientação por aluno (aprovado em 10/10/2026, a partir do kit da CI Unidade II).
// Para cada aluno: o que está pendente, QUEM PRECISA AGIR (aluno ou professor) e o que fazer.
// Só leitura: usa os dados que o Acompanhamento da turma já leu (empresa, livros, respostas,
// boletim) e regras fixas, sem gravar nada. Diferente da CI, o CTC tem gabarito dos fatos
// orientados e das listas, então "✓" aqui quer dizer "lançado e confere com o gabarito".
// Cada achado: { gravidade: "erro"|"atencao", etapa, item, titulo, orientacao, onde, quem, oculto }.
// "oculto" = acerto/erro de lista avaliativa ainda não liberada: só o professor vê; fica fora do texto do aluno.
import { corrigirLancamento, ehQuestoes, finalidadeDe, GABARITO_ORIENTADOS, valeNota } from "./exercicios";
import { notaDasQuestoes } from "./questoes";
import { balancete, dataBR, FATOS_ORIENTADOS } from "./contabil";
import { jaEncerrado } from "./demonstracoes";
import { areaConfirmada, parametrosEfetivos } from "./parametros";
import { configLancamentos } from "./modelos";

export const ETAPAS = {
  abertura: { nome: "Abertura", cor: "#8fb3d9" },
  orientados: { nome: "Fatos orientados", cor: "#7fbf9e" },
  lista: { nome: "Lista", cor: "#c79a56" },
  questoes: { nome: "Questionário", cor: "#b59bd6" },
  lancamentos: { nome: "Lançamentos", cor: "#e8c27a" },
  fechamento: { nome: "Fechamento", cor: "#f0a3a3" },
};

const HISTORICOS_VAGOS = new Set(["lancamento", "lançamento", "venda", "compra", "pagamento", "recebimento", "despesa", "teste", "x", "fato", "operacao", "operação"]);
const vago = (h) => { const t = String(h || "").trim().toLowerCase(); return t.length < 6 || HISTORICOS_VAGOS.has(t); };
const MOTIVOS = { "conta a débito": "a conta a débito", "conta a crédito": "a conta a crédito", valor: "o valor", quantidade: "a quantidade", "conta a débito a mais": "uma conta a débito sobrando", "conta a crédito a mais": "uma conta a crédito sobrando" };
const plural = (n, um, varios) => (n === 1 ? um : varios);
const diasAte = (iso, hoje) => Math.round((new Date(`${iso}T12:00:00`) - new Date(`${hoje}T12:00:00`)) / 86400000);

export function gerarRelatorio({ aluno, turma, empresa, esc, listas = [], respostas = {}, gabaritos = {}, boletim = null, plano, contaTeste = false, hoje = new Date().toLocaleDateString("sv-SE") }) {
  const achados = [];
  const linhas = [];
  const ach = (a) => achados.push({ gravidade: "erro", quem: "aluno", oculto: false, ...a });

  if (!empresa) {
    linhas.push({ item: "Empresa", etapa: "abertura", feito: "–", confere: "–", situacao: "naoComecou", quem: ["aluno"] });
    ach({ etapa: "abertura", item: "Empresa", titulo: "Ainda não abriu a empresa no CTC", orientacao: "Entre no CTC e abra Minha empresa para criar a empresa da turma.", onde: "Minha empresa" });
    return fechar({ aluno, contaTeste, linhas, achados });
  }
  const pc = parametrosEfetivos(empresa, turma).contabil;
  const ctx = { metodo: pc.metodoEstoque || "peps", periodico: pc.inventario === "periodico", tributos: configLancamentos(turma).tributos };
  const lanc = esc?.lancamentos || [];
  const doItem = (item, etapa, fn) => {
    const antes = achados.length;
    const info = fn() || {};
    const meus = achados.slice(antes);
    const quem = [...new Set(meus.map((a) => a.quem))];
    const situacao = info.situacao || (meus.some((a) => a.gravidade === "erro") ? "problema" : meus.length ? (quem.length === 1 && quem[0] === "professor" ? "aguardando" : "conferir") : "emDia");
    linhas.push({ item, etapa, feito: info.feito ?? "✓", confere: info.confere ?? "–", situacao, quem, oculto: !!info.oculto });
  };

  // ---------- abertura ----------
  doItem("Cadastro da empresa", "abertura", () => {
    if (empresa.cadastroCompleto) return {};
    ach({ etapa: "abertura", item: "Cadastro", titulo: "Cadastro da empresa incompleto", orientacao: "Complete o ramo de atividade e o capital social e clique em Salvar cadastro.", onde: "Minha empresa" });
    return { feito: "✗" };
  });
  doItem("Parametrização contábil", "abertura", () => {
    if (areaConfirmada(empresa, "contabil") && !empresa.parametrosDestravados) return {};
    if (empresa.parametrosDestravados) {
      ach({ etapa: "abertura", item: "Parametrização", gravidade: "atencao", titulo: "Parametrização destravada pelo professor", orientacao: "Revise os parâmetros e confirme de novo a área Contábil.", onde: "Parametrização" });
      return { feito: "✓" };
    }
    ach({ etapa: "abertura", item: "Parametrização", titulo: "Parametrização contábil não confirmada", orientacao: "Escolha os parâmetros da área Contábil e clique em Confirmar.", onde: "Parametrização" });
    return { feito: "✗" };
  });
  doItem("Saldos iniciais", "abertura", () => {
    if (!esc?.saldosGravados) {
      ach({ etapa: "abertura", item: "Saldos iniciais", titulo: "Saldos iniciais não gravados", orientacao: "Credite o Capital Subscrito pelo capital social, debite o Ativo e salve (D = C).", onde: "Escrituração → Saldos iniciais" });
      return { feito: "✗" };
    }
    const credor = Object.values(esc.saldos || {}).reduce((s, v) => s + (Number(v.credor) || 0), 0);
    if (Number(empresa.capitalSocial) > 0 && Math.abs(credor - Number(empresa.capitalSocial)) > 0.005) {
      ach({ etapa: "abertura", item: "Saldos iniciais", gravidade: "atencao", titulo: "Total dos saldos diferente do capital social", orientacao: `O total credor (${credor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}) não bate com o capital do cadastro. Confira os saldos ou o cadastro.`, onde: "Escrituração → Saldos iniciais" });
    }
    return {};
  });

  // ---------- roteiros: fatos orientados e listas de escrituração ----------
  const roteiro = (rotulo, etapa, fatos, achar, { lista } = {}) => doItem(rotulo, etapa, () => {
    const oculto = !!lista && valeNota(lista) && !lista.resultadoLiberado;
    const encerrada = !!lista && valeNota(lista) && (lista.fechada || (lista.prazo && hoje > lista.prazo));
    const faltam = []; const diferentes = []; const duplicados = [];
    let lancados = 0; let acertos = 0;
    for (const f of fatos) {
      const ls = lanc.filter((l) => achar(l, f));
      if (!ls.length) { faltam.push(f.n); continue; }
      lancados++;
      if (ls.length > 1) duplicados.push(f.n);
      const r = corrigirLancamento(ls[0], f, lanc, ctx);
      if (r?.ok) acertos++; else if (r) diferentes.push({ n: f.n, erros: r.erros });
    }
    const nomes = (ns) => (ns.length === 1 ? `Fato ${ns[0]}` : `Fatos ${ns.slice(0, -1).join(", ")} e ${ns[ns.length - 1]}`);
    if (faltam.length) {
      if (encerrada) ach({ etapa, item: rotulo, quem: "professor", titulo: `Lista encerrada sem ${faltam.length} fato(s) lançado(s)`, orientacao: `${nomes(faltam)} ${plural(faltam.length, "não foi lançado", "não foram lançados")} até o prazo. Decida: recuperação paralela ou orientação ao aluno.`, onde: "Turma → Exercícios da turma" });
      else if (lista?.prazo && diasAte(lista.prazo, hoje) <= 3) ach({ etapa, item: rotulo, gravidade: "atencao", titulo: `Faltam ${faltam.length} fato(s) — prazo ${dataBR(lista.prazo)}`, orientacao: `Lance ${nomes(faltam).toLowerCase()} antes do prazo.`, onde: "Escrituração → Lançamentos" });
      else ach({ etapa, item: rotulo, gravidade: "atencao", titulo: lancados ? `Faltam ${faltam.length} fato(s)` : "Ainda não começou", orientacao: `Lance ${nomes(faltam).toLowerCase()}.`, onde: "Escrituração → Lançamentos" });
    }
    if (diferentes.length) {
      const lista_ = [...new Set(diferentes.flatMap((d) => d.erros))].map((e) => MOTIVOS[e] || e);
      const motivos = lista_.length > 1 ? `${lista_.slice(0, -1).join(", ")} e ${lista_[lista_.length - 1]}` : lista_[0] || "as partidas";
      ach({ etapa, item: rotulo, oculto, quem: encerrada ? "professor" : "aluno", titulo: "Lançamento diferente do gabarito", orientacao: encerrada ? `${nomes(diferentes.map((d) => d.n))}: confira ${motivos}. A lista está encerrada — a correção é com o professor.` : `Revise ${nomes(diferentes.map((d) => d.n)).toLowerCase()}: confira ${motivos}. Depois use Corrigir no lançamento.`, onde: encerrada ? "Turma → Empresas dos alunos" : "Escrituração → Lançamentos" });
    }
    if (duplicados.length) ach({ etapa, item: rotulo, quem: encerrada ? "professor" : "aluno", titulo: "Fato lançado mais de uma vez", orientacao: `${nomes(duplicados)} ${plural(duplicados.length, "aparece repetido", "aparecem repetidos")}. ${encerrada ? "O professor exclui o repetido." : "Exclua o lançamento repetido."}`, onde: "Escrituração → Lançamentos" });
    if (!faltam.length && oculto && encerrada) ach({ etapa, item: rotulo, quem: "professor", gravidade: "atencao", titulo: "Resultado ainda não liberado", orientacao: "Libere o resultado para o aluno ver a correção.", onde: "Turma → Exercícios da turma" });
    return {
      feito: `${lancados}/${fatos.length}`, confere: lancados ? `${acertos}/${lancados}` : "–", oculto,
      situacao: !lancados && !encerrada && !(lista?.prazo && diasAte(lista.prazo, hoje) <= 3) ? "naoComecou" : undefined,
    };
  });

  roteiro("Fatos orientados", "orientados",
    FATOS_ORIENTADOS.map((f, i) => ({ n: i + 1, ...f, gabarito: GABARITO_ORIENTADOS[i] })),
    (l, f) => l.fatoOrientado === f.n);

  for (const lista of listas) {
    if (finalidadeDe(lista) === "recuperacao" && !boletim?.recuperacoes?.includes(lista.id)) continue;
    if (ehQuestoes(lista)) {
      doItem(lista.titulo, "questoes", () => {
        const qs = lista.questoes || [];
        const r = respostas[lista.id]?.respostas || {};
        const nota = notaDasQuestoes(qs, r, gabaritos[lista.id]);
        const oculto = valeNota(lista) && !lista.resultadoLiberado;
        const encerrada = valeNota(lista) && (lista.fechada || (lista.prazo && hoje > lista.prazo));
        const falta = qs.length - nota.respondidas;
        if (falta > 0) {
          if (encerrada) ach({ etapa: "questoes", item: lista.titulo, quem: "professor", titulo: `Encerrado com ${falta} questão(ões) sem resposta`, orientacao: "Decida: recuperação paralela ou orientação ao aluno.", onde: "Turma → Exercícios da turma" });
          else ach({ etapa: "questoes", item: lista.titulo, gravidade: "atencao", titulo: nota.respondidas ? `Faltam ${falta} questão(ões)` : "Questionário não respondido", orientacao: `Responda e salve${lista.prazo ? ` até ${dataBR(lista.prazo)}` : ""}.`, onde: "Questionários" });
        }
        if (!falta && oculto && encerrada) ach({ etapa: "questoes", item: lista.titulo, quem: "professor", gravidade: "atencao", titulo: "Resultado ainda não liberado", orientacao: "Libere o resultado para o aluno ver a correção.", onde: "Turma → Exercícios da turma" });
        return { feito: `${nota.respondidas}/${qs.length}`, confere: nota.respondidas && (gabaritos[lista.id] || !valeNota(lista)) ? `${nota.acertos}/${qs.length}` : "–", oculto, situacao: !nota.respondidas && !encerrada ? "naoComecou" : undefined };
      });
    } else {
      roteiro(lista.titulo, "lista", lista.fatos || [], (l, f) => l.lista?.id === lista.id && l.lista?.n === f.n, { lista });
    }
  }

  // ---------- qualidade dos lançamentos ----------
  doItem("Históricos e datas", "lancamentos", () => {
    const comuns = lanc.filter((l) => !l.encerramento);
    const vagos = comuns.filter((l) => vago(l.historico));
    const fora = comuns.filter((l) => l.data && (l.data < pc.exercicioInicio || l.data > pc.exercicioFim));
    if (vagos.length) ach({ etapa: "lancamentos", item: "Históricos", gravidade: "atencao", titulo: `Histórico muito genérico em ${vagos.length} lançamento(s)`, orientacao: `O histórico deve descrever a operação (ex.: "Compra de 50 un. a prazo — NF 123"). Revise: ${vagos.slice(0, 5).map((l) => `"${l.historico || "(vazio)"}" de ${dataBR(l.data)}`).join("; ")}${vagos.length > 5 ? "…" : ""}.`, onde: "Escrituração → Lançamentos → Corrigir" });
    if (fora.length) ach({ etapa: "lancamentos", item: "Datas", titulo: `${fora.length} lançamento(s) fora do exercício`, orientacao: `A data precisa estar entre ${dataBR(pc.exercicioInicio)} e ${dataBR(pc.exercicioFim)}.`, onde: "Escrituração → Lançamentos → Corrigir" });
    return { feito: comuns.length ? String(comuns.length) : "–" };
  });

  // ---------- fechamento ----------
  doItem("Balancete e encerramento", "fechamento", () => {
    const temMov = esc?.saldosGravados || lanc.length > 0;
    if (!temMov) return { feito: "–", situacao: "naoComecou" };
    if (plano && !balancete(plano, lanc, esc.saldos).fecha) ach({ etapa: "fechamento", item: "Balancete", titulo: "Balancete não fecha", orientacao: "Débitos e créditos diferentes: confira os lançamentos e os saldos iniciais.", onde: "Escrituração → Balancete" });
    const encerrado = jaEncerrado(lanc);
    const orientadosFeitos = FATOS_ORIENTADOS.every((_, i) => lanc.some((l) => l.fatoOrientado === i + 1));
    if (encerrado) {
      const dataEnc = lanc.filter((l) => l.encerramento).map((l) => l.data).sort().pop();
      const depois = lanc.filter((l) => !l.encerramento && l.data > dataEnc);
      if (depois.length) ach({ etapa: "fechamento", item: "Encerramento", gravidade: "atencao", titulo: `${depois.length} lançamento(s) depois do encerramento`, orientacao: `Lançamentos com data após ${dataBR(dataEnc)} ficam fora da DRE encerrada. Se forem do mesmo período, peça ao professor para desfazer o encerramento e refazê-lo.`, onde: "Escrituração → Encerramento (ARE)" });
      if (!orientadosFeitos) ach({ etapa: "fechamento", item: "Encerramento", gravidade: "atencao", titulo: "Encerrou antes de lançar todos os fatos orientados", orientacao: "Lance os fatos que faltam; o encerramento precisará ser refeito.", onde: "Escrituração → Lançamentos" });
    } else if (orientadosFeitos) {
      ach({ etapa: "fechamento", item: "Encerramento", gravidade: "atencao", titulo: "Falta encerrar o exercício", orientacao: "Monte a DRE e faça os lançamentos de encerramento (ARE); depois DLPA e Balanço.", onde: "Escrituração → DRE e Encerramento (ARE)" });
    }
    return { feito: encerrado ? "✓" : "–" };
  });

  return fechar({ aluno, contaTeste, linhas, achados });
}

function fechar({ aluno, contaTeste, linhas, achados }) {
  const ordem = { problema: 0, conferir: 1, aguardando: 2, naoComecou: 3, emDia: 4 };
  linhas.sort((a, b) => ordem[a.situacao] - ordem[b.situacao]);
  achados.sort((a, b) => (a.gravidade === b.gravidade ? 0 : a.gravidade === "erro" ? -1 : 1));
  return {
    aluno, contaTeste, linhas, achados,
    total: linhas.length,
    emDia: linhas.filter((l) => l.situacao === "emDia").length,
    comAluno: achados.filter((a) => a.quem === "aluno").length,
    comProfessor: achados.filter((a) => a.quem === "professor").length,
  };
}

export const SITUACOES = {
  problema: ["com problema", "vermelho"],
  conferir: ["conferir", "ocre"],
  aguardando: ["aguardando o professor", "cinza"],
  naoComecou: ["não começou", "cinza"],
  emDia: ["em dia", "verde"],
};

// texto para colar no Classroom/WhatsApp (para o ALUNO): sem o que ainda está oculto
export function relatorioEmTexto(rel, turma) {
  const vis = rel.achados.filter((a) => !a.oculto);
  const L = [`Orientação — ${rel.aluno?.nome || "Aluno"}${turma ? ` (${turma.nome})` : ""}`,
    `Itens em dia: ${rel.emDia} de ${rel.total}. Com você: ${vis.filter((a) => a.quem === "aluno").length}. Com o professor: ${vis.filter((a) => a.quem === "professor").length}.`];
  if (!vis.length) { L.push("", "Nenhuma pendência encontrada. Parabéns, continue assim!"); return L.join("\n"); }
  L.push("", "O que precisa de ajuste:");
  vis.forEach((a, i) => {
    const onde = ETAPAS[a.etapa]?.nome === a.item ? a.item : `${ETAPAS[a.etapa]?.nome || a.etapa} · ${a.item}`;
    L.push(`${i + 1}. [${onde}] ${a.titulo} (quem age: ${a.quem === "professor" ? "professor" : "você"})`);
    L.push(`   O que fazer: ${a.orientacao}`);
    if (a.onde) L.push(`   Onde: ${a.onde}`);
  });
  L.push("", "Qualquer dúvida, abra um chamado no Suporte ou fale com o professor em aula.");
  return L.join("\n");
}
