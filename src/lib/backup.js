// Backup do CTC (plano Spark: não há backup automático agendado, por isso é um
// arquivo .json que o administrador ou o professor baixa pelo navegador).
//
// Níveis:
//  - Administrador: backup completo (todas as coleções) e restauração.
//  - Professor: backup da turma escolhida (só baixa; quem restaura é o admin).
//  - Aluno: "Baixar meus dados" entra na Fase 2, quando houver lançamentos.
//
// Restauração: recoloca os documentos que estão no arquivo, SEM apagar o que
// foi criado depois do backup. O histórico vai no arquivo para arquivo, mas não
// é regravado (ele nunca é apagado — ver firestore.rules). O mesmo vale para a auditoria.
import {
  addDoc, collection, doc, getDoc, getDocs, serverTimestamp, setDoc, Timestamp, writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { auditar } from "./auditoria";

export const VERSAO_BACKUP = 1;
const SISTEMA = "CTC — Curso Técnico em Contabilidade";

// ---------- datas do Firestore <-> JSON ----------
function paraJson(v) {
  if (v instanceof Timestamp) return { __data: v.toDate().toISOString() };
  if (Array.isArray(v)) return v.map(paraJson);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, paraJson(x)]));
  return v;
}
function doJson(v) {
  if (v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 1 && "__data" in v) {
    return Timestamp.fromDate(new Date(v.__data));
  }
  if (Array.isArray(v)) return v.map(doJson);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, doJson(x)]));
  return v;
}

// ---------- utilitários ----------
// Atualizacao-CTC-… usa o mesmo carimbo: AAAA-MM-DD_HHhMMmSSs (hora do computador)
export function carimbo(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}h${p(d.getMinutes())}m${p(d.getSeconds())}s`;
}
function semAcentoNome(t) {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w-]+/g, "_").replace(/_+/g, "_");
}
function baixarJson(nome, dados) {
  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = nome;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
async function lerColecao(...caminho) {
  const snap = await getDocs(collection(db, ...caminho));
  return snap.docs.map((d) => ({ id: d.id, dados: paraJson(d.data()) }));
}
function quem(sessao) {
  return { nome: sessao.perfil?.nome || sessao.usuario.displayName || "", email: sessao.usuario.email || "" };
}
async function registrar(sessao, item, depois) {
  await addDoc(collection(db, "historico"), {
    tabela: "Backup", item, antes: null, depois,
    porUid: sessao.usuario.uid,
    porNome: quem(sessao).nome,
    em: serverTimestamp(),
  });
}

// ---------- administrador: backup completo ----------
export async function backupCompleto(sessao) {
  const [autorizados, usuarios, matriculas, turmasBase, config, historico, chamados, auditoria] = await Promise.all([
    lerColecao("autorizados"), lerColecao("usuarios"), lerColecao("matriculas"),
    lerColecao("turmas"), lerColecao("config"), lerColecao("historico"),
    lerColecao("chamados"), lerColecao("auditoria"),
  ]);
  const empresasBase = await lerColecao("empresas");
  // cada empresa leva junto os livros (saldos iniciais e Livro Diário)
  const empresas = await Promise.all(empresasBase.map(async (e) => ({ ...e, livros: await lerColecao("empresas", e.id, "livros") })));
  const turmas = await Promise.all(turmasBase.map(async (t) => ({
    ...t, alunos: await lerColecao("turmas", t.id, "alunos"), listas: await lerColecao("turmas", t.id, "listas"),
    avaliacoes: await lerColecao("turmas", t.id, "avaliacoes"), boletim: await lerColecao("turmas", t.id, "boletim"),
  })));
  const contagem = {
    autorizados: autorizados.length,
    usuarios: usuarios.length,
    matriculas: matriculas.length,
    turmas: turmas.length,
    alunosNasTurmas: turmas.reduce((s, t) => s + t.alunos.length, 0),
    config: config.length,
    historico: historico.length,
    empresas: empresas.length,
    chamados: chamados.length,
    auditoria: auditoria.length,
  };
  const agora = new Date();
  const arquivo = `Backup-CTC-${carimbo(agora)}.json`;
  baixarJson(arquivo, {
    sistema: SISTEMA, tipo: "backup-completo", versao: VERSAO_BACKUP,
    geradoEm: agora.toISOString(), geradoPor: quem(sessao), contagem,
    colecoes: { autorizados, usuarios, matriculas, turmas, empresas, config, historico, chamados, auditoria },
  });
  // guarda a data do último backup completo (aviso no Início do administrador)
  await setDoc(doc(db, "config", "backup"), {
    ultimoCompleto: serverTimestamp(), arquivo, porNome: quem(sessao).nome, contagem,
  });
  await registrar(sessao, "backup completo", `${arquivo} — ${resumo(contagem)}`);
  auditar("Backup completo", arquivo);
  return { arquivo, contagem };
}

export async function lerUltimoBackup() {
  const s = await getDoc(doc(db, "config", "backup"));
  return s.exists() ? s.data() : null;
}

// ---------- professor: backup da turma ----------
export async function backupDaTurma(sessao, turma) {
  const alunos = await lerColecao("turmas", turma.id, "alunos");
  // situação do vínculo de cada matrícula com a conta Google
  await Promise.all(alunos.map(async (a) => {
    const m = await getDoc(doc(db, "matriculas", a.id));
    a.matricula = m.exists() ? paraJson(m.data()) : null;
    // empresa do aluno nesta turma (os lançamentos entram junto quando existirem)
    const e = await getDoc(doc(db, "empresas", `${turma.id}_${a.id}`)).catch(() => null);
    a.empresa = e?.exists() ? paraJson(e.data()) : null;
    if (a.empresa) a.livros = await lerColecao("empresas", `${turma.id}_${a.id}`, "livros").catch(() => []);
  }));
  const [listas, avaliacoes, boletim] = await Promise.all(["listas", "avaliacoes", "boletim"].map((c) => lerColecao("turmas", turma.id, c).catch(() => [])));
  const { id, alunos: _ignorar, ...dadosTurma } = turma;
  const agora = new Date();
  const arquivo = `Backup-CTC-Turma-${semAcentoNome(turma.nome)}-${carimbo(agora)}.json`;
  baixarJson(arquivo, {
    sistema: SISTEMA, tipo: "backup-turma", versao: VERSAO_BACKUP,
    geradoEm: agora.toISOString(), geradoPor: quem(sessao),
    contagem: { alunos: alunos.length },
    turma: { id, dados: paraJson(dadosTurma) },
    alunos, listas, avaliacoes, boletim,
  });
  await registrar(sessao, `turma ${turma.nome}`, `${arquivo} — ${alunos.length} aluno(s)`);
  auditar("Backup da turma", arquivo);
  return { arquivo, alunos: alunos.length };
}

// ---------- administrador: restauração ----------
export function resumo(c) {
  return `${c.turmas} turma(s), ${c.alunosNasTurmas} aluno(s) nas turmas, ${c.matriculas} matrícula(s), ` +
    `${c.usuarios} perfil(is), ${c.autorizados} professor(es)/admin(s), ${c.config} tabela(s) de configuração` +
    (c.empresas != null ? `, ${c.empresas} empresa(s)` : "") +
    (c.chamados != null ? `, ${c.chamados} chamado(s)` : "");
}

// confere o arquivo antes de qualquer gravação
export function conferirArquivo(texto) {
  let d;
  try { d = JSON.parse(texto); } catch { throw new Error("Não foi possível ler o arquivo. Ele precisa ser um backup .json gerado pelo CTC."); }
  if (d?.tipo === "backup-turma") throw new Error("Este é um backup de turma. Para restaurar, use um backup completo gerado pelo administrador.");
  if (d?.tipo !== "backup-completo" || !d.colecoes) throw new Error("Este arquivo não é um backup completo do CTC.");
  if (d.versao > VERSAO_BACKUP) throw new Error("Este backup foi gerado por uma versão mais nova do CTC.");
  const c = d.colecoes;
  for (const k of ["autorizados", "usuarios", "matriculas", "turmas", "config"]) {
    if (!Array.isArray(c[k])) throw new Error(`O arquivo está incompleto (falta "${k}").`);
  }
  return d;
}

export async function restaurarBackup(sessao, d, aoAvancar = () => {}) {
  const c = d.colecoes;
  const gravacoes = [];
  const por = (caminho, lista) => lista.forEach((x) => gravacoes.push([[...caminho, x.id], doJson(x.dados)]));
  // a configuração "backup" (data do último backup) não volta ao passado
  por(["config"], c.config.filter((x) => x.id !== "backup"));
  por(["autorizados"], c.autorizados);
  por(["matriculas"], c.matriculas);
  c.turmas.forEach((t) => {
    gravacoes.push([["turmas", t.id], doJson(t.dados)]);
    por(["turmas", t.id, "alunos"], t.alunos || []);
    por(["turmas", t.id, "listas"], t.listas || []);
    por(["turmas", t.id, "avaliacoes"], t.avaliacoes || []); // backups anteriores às notas não têm esta parte
    por(["turmas", t.id, "boletim"], t.boletim || []);
  });
  por(["usuarios"], c.usuarios);
  (c.empresas || []).forEach((e) => { // backups anteriores às empresas não têm esta parte
    gravacoes.push([["empresas", e.id], doJson(e.dados)]);
    por(["empresas", e.id, "livros"], e.livros || []);
  });
  por(["chamados"], c.chamados || []); // backups anteriores ao Suporte não têm chamados

  // grava em lotes (o Firestore aceita até 500 por lote)
  const TAM = 200;
  for (let i = 0; i < gravacoes.length; i += TAM) {
    const lote = writeBatch(db);
    gravacoes.slice(i, i + TAM).forEach(([caminho, dados]) => lote.set(doc(db, ...caminho), dados));
    await lote.commit();
    aoAvancar(Math.min(i + TAM, gravacoes.length), gravacoes.length);
  }
  auditar("Restaurou backup", `gerado em ${d.geradoEm} — ${gravacoes.length} registro(s)`);
  await registrar(sessao, "restauração", `Backup de ${new Date(d.geradoEm).toLocaleString("pt-BR")} — ${resumo(d.contagem)}`);
  return gravacoes.length;
}
