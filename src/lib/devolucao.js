// Devolução de tarefa ao aluno (aprovada em 10/10/2026, a partir do kit da CI Unidade II).
// O professor escolhe o que devolver e escreve a orientação; o CTC reabre só para aquele aluno,
// guarda cópia na lixeira do que for apagado e avisa o aluno por um chamado no Suporte.
//  - Lista de escrituração ou questionário: reaberta até a data escolhida, mesmo encerrada
//    (turmas/{t}/devolucoes/{lista}_{matrícula}); no questionário, as respostas atuais podem ir
//    para a lixeira, para o aluno responder do zero.
//  - Encerramento do exercício: desfeito (cópia na lixeira) para o aluno refazer.
//  - Fatos orientados e demais itens: só a orientação (o aluno já pode corrigir).
import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, Timestamp, where } from "firebase/firestore";
import { db } from "../firebase";
import { auditar } from "./auditoria";
import { guardarNaLixeiraDaTurma } from "./lixeira";
import { desfazerEncerramento } from "./escrituracao";
import { idEmpresa } from "./empresas";
import { abrirChamadoParaAluno, uidDoAluno } from "./suporte";
import { ehMatriculaTeste } from "./modoTeste";

export const MODELO_ORIENTACAO = "Revise a tarefa indicada e refaça o que for preciso, na ordem. Use o Relatório que o professor comentou em aula e o quadro \"Como funciona esta etapa\" no topo da tela. Ao terminar, responda este chamado.";

const idDev = (listaId, matricula) => `${listaId}_${matricula}`;
const fimDoDia = (iso) => Timestamp.fromDate(new Date(`${iso}T23:59:59`));

// devoluções ainda valendo para um aluno (o aluno lê só as dele)
export async function devolucoesDoAluno(turmaId, matricula) {
  const s = await getDocs(query(collection(db, "turmas", turmaId, "devolucoes"), where("matricula", "==", matricula))).catch(() => null);
  const agora = Date.now();
  return Object.fromEntries((s?.docs || []).map((d) => d.data()).filter((d) => (d.ate?.toMillis?.() || 0) >= agora).map((d) => [d.listaId, d]));
}

// itens: [{ tipo: "lista", lista, apagarRespostas? } | { tipo: "encerramento" } | { tipo: "orientacao", rotulo }]
export async function devolverTarefa(sessao, { turma, aluno, itens, orientacao, ate }) {
  const feitos = [];
  for (const it of itens) {
    if (it.tipo === "lista") {
      await setDoc(doc(db, "turmas", turma.id, "devolucoes", idDev(it.lista.id, aluno.matricula)), {
        listaId: it.lista.id, listaTitulo: it.lista.titulo, matricula: aluno.matricula, orientacao, ate: fimDoDia(ate),
        em: serverTimestamp(), porNome: sessao.perfil?.nome || sessao.usuario.displayName || "",
      });
      feitos.push(`"${it.lista.titulo}" reaberta até ${ate.split("-").reverse().join("/")}`);
      if (it.apagarRespostas) {
        const ref = doc(db, "turmas", turma.id, "respostas", idDev(it.lista.id, aluno.matricula));
        const r = await getDoc(ref);
        if (r.exists()) {
          await guardarNaLixeiraDaTurma(turma.id, { tipo: "resposta", dados: { id: r.id, ...r.data() }, resumo: `${aluno.nome} — ${it.lista.titulo}`, motivo: "devolução ao aluno" });
          await deleteDoc(ref);
          feitos.push(`respostas de "${it.lista.titulo}" apagadas (cópia na lixeira da turma)`);
        }
      }
    } else if (it.tipo === "encerramento") {
      await desfazerEncerramento(sessao, idEmpresa(turma.id, aluno.matricula), "devolução ao aluno");
      feitos.push("encerramento do exercício desfeito (cópia na lixeira da empresa)");
    } else if (it.tipo === "orientacao") {
      feitos.push(`orientação sobre ${it.rotulo}`);
    }
  }
  const paraUid = ehMatriculaTeste(aluno.matricula) ? sessao.usuario.uid : await uidDoAluno(aluno.matricula);
  const resumo = feitos.join("; ");
  const ch = await abrirChamadoParaAluno(sessao, {
    turma, aluno, paraUid,
    assunto: "Tarefa devolvida para refazer",
    mensagem: `${orientacao}\n\nO que o professor fez: ${resumo}.`,
    devolucao: { resumo, ate: ate || "" },
  });
  auditar("Devolveu tarefa ao aluno", `${aluno.nome} (${aluno.matricula}) — ${resumo}`);
  return { feitos, chamado: ch, avisado: !!paraUid };
}
