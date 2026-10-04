// Empresa individual do aluno — uma por turma (base da escrituração da CB e das
// disciplinas seguintes). Documento: empresas/{turmaId}_{matricula}.
// Os lançamentos, saldos e estoque da empresa entram nas próximas etapas, dentro dela.
import { doc, getDoc, serverTimestamp, setDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { auditar } from "./auditoria";

export const ATIVIDADES = ["Comércio", "Prestação de serviços", "Indústria"];
export const REGIMES = ["Simples Nacional", "Lucro Presumido", "Lucro Real"];

export const idEmpresa = (turmaId, matricula) => `${turmaId}_${matricula}`;

// ---------- CNPJ fictício com dígitos verificadores válidos ----------
function dv(digitos, pesos) {
  const resto = digitos.reduce((s, d, i) => s + d * pesos[i], 0) % 11;
  return resto < 2 ? 0 : 11 - resto;
}
export function gerarCnpjFicticio() {
  const base = [...Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)), 0, 0, 0, 1];
  const d1 = dv(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = dv([...base, d1], [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return [...base, d1, d2].join("").replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}
export function cnpjValido(cnpj) {
  const n = (cnpj || "").replace(/\D/g, "").split("").map(Number);
  if (n.length !== 14 || new Set(n).size === 1) return false;
  return dv(n.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === n[12] &&
    dv(n.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === n[13];
}

// cadastro inicial: o aluno completa e pode alterar depois
export function empresaPadrao(turma, aluno) {
  const ano = Number(String(turma.semestre || "").slice(0, 4)) || new Date().getFullYear();
  const sobrenome = aluno.nome.trim().split(/\s+/).slice(-1)[0] || aluno.nome;
  return {
    turmaId: turma.id, matricula: aluno.matricula, alunoNome: aluno.nome,
    disciplina: turma.disciplina, semestre: turma.semestre || "",
    razaoSocial: `${aluno.nome.trim()} LTDA`,
    nomeFantasia: `Comercial ${sobrenome}`,
    cnpj: gerarCnpjFicticio(),
    atividade: "Comércio",
    ramo: "",
    regime: "Simples Nacional",
    municipio: "Blumenau", uf: "SC",
    inicioExercicio: `${ano}-01-01`,
    capitalSocial: 0,
    cadastroCompleto: false,
  };
}

export async function lerEmpresa(turmaId, matricula) {
  const s = await getDoc(doc(db, "empresas", idEmpresa(turmaId, matricula)));
  return s.exists() ? { id: s.id, ...s.data() } : null;
}

// aluno: abre a empresa da turma; se ainda não existe, cria com o cadastro inicial
export async function garantirEmpresa(turma, aluno) {
  const atual = await lerEmpresa(turma.id, aluno.matricula);
  if (atual) return atual;
  const dados = { ...empresaPadrao(turma, aluno), criadaEm: serverTimestamp(), atualizadaEm: serverTimestamp() };
  await setDoc(doc(db, "empresas", idEmpresa(turma.id, aluno.matricula)), dados);
  auditar("Criou empresa", `${dados.razaoSocial} — turma ${turma.nome}`);
  return lerEmpresa(turma.id, aluno.matricula);
}

// professor: cria de uma vez as empresas que faltam na turma
export async function criarEmpresasQueFaltam(turma, alunos, existentes) {
  const faltam = alunos.filter((a) => !existentes[a.matricula]);
  const TAM = 200;
  for (let i = 0; i < faltam.length; i += TAM) {
    const lote = writeBatch(db);
    faltam.slice(i, i + TAM).forEach((a) => lote.set(doc(db, "empresas", idEmpresa(turma.id, a.matricula)),
      { ...empresaPadrao(turma, a), criadaEm: serverTimestamp(), atualizadaEm: serverTimestamp() }));
    await lote.commit();
  }
  if (faltam.length) auditar("Criou empresas da turma", `${faltam.length} empresa(s) — turma ${turma.nome}`);
  return faltam.length;
}

export async function empresasDaTurma(turmaId, alunos) {
  const lista = await Promise.all(alunos.map((a) => lerEmpresa(turmaId, a.matricula).catch(() => null)));
  return Object.fromEntries(alunos.map((a, i) => [a.matricula, lista[i]]));
}

const CAMPOS = ["razaoSocial", "nomeFantasia", "cnpj", "atividade", "ramo", "regime", "municipio", "uf", "inicioExercicio", "capitalSocial"];

export function conferirCadastro(e) {
  const erros = [];
  if (!e.razaoSocial?.trim()) erros.push("Informe a razão social.");
  if (!cnpjValido(e.cnpj)) erros.push("O CNPJ não é válido — use o botão Gerar CNPJ fictício.");
  if (!e.ramo?.trim()) erros.push("Informe o ramo de atividade (ex.: loja de roupas).");
  if (!e.inicioExercicio) erros.push("Informe a data de início do exercício.");
  if (!(Number(e.capitalSocial) > 0)) erros.push("Informe o capital social (maior que zero).");
  return erros;
}

export async function salvarEmpresa(empresa, dados) {
  const limpo = Object.fromEntries(CAMPOS.map((k) => [k, k === "capitalSocial" ? Number(dados[k]) || 0 : String(dados[k] ?? "").trim()]));
  limpo.uf = limpo.uf.toUpperCase().slice(0, 2);
  await setDoc(doc(db, "empresas", empresa.id), {
    ...limpo, cadastroCompleto: conferirCadastro(limpo).length === 0, atualizadaEm: serverTimestamp(),
  }, { merge: true });
  auditar("Alterou cadastro da empresa", `${limpo.razaoSocial} (${empresa.id})`);
}

// método de avaliação do estoque escolhido para a empresa (PEPS, UEPS ou Média Ponderada)
export async function salvarMetodoEstoque(empresa, metodo) {
  await setDoc(doc(db, "empresas", empresa.id), { metodoEstoque: metodo, atualizadaEm: serverTimestamp() }, { merge: true });
}
