// "↩ Devolver tarefa ao aluno" (professor): escolhe o que reabrir, escreve a orientação e avisa o
// aluno por um chamado. Usado no Relatório de orientação e no Suporte.
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { traduzirErro } from "../lib/sessao";
import { ehQuestoes, finalidadeDe, FINALIDADES, listasDaTurma, valeNota } from "../lib/exercicios";
import { lerEscrituracao } from "../lib/escrituracao";
import { idEmpresa } from "../lib/empresas";
import { jaEncerrado } from "../lib/demonstracoes";
import { dataBR } from "../lib/contabil";
import { devolverTarefa, MODELO_ORIENTACAO } from "../lib/devolucao";

const daquiA = (dias) => new Date(Date.now() + dias * 86400000).toLocaleDateString("sv-SE");
const hoje = () => new Date().toLocaleDateString("sv-SE");

export default function DevolverTarefa({ sessao, turmaId, aluno, aoConcluir, aoCancelar }) {
  const [turma, setTurma] = useState(null);
  const [listas, setListas] = useState(null);
  const [encerrado, setEncerrado] = useState(false);
  const [marcados, setMarcados] = useState({}); // id → true; "enc"; "orient"; "apagar-{id}"
  const [ate, setAte] = useState(daquiA(7));
  const [orientacao, setOrientacao] = useState(MODELO_ORIENTACAO);
  const [msg, setMsg] = useState({});
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const t = await getDoc(doc(db, "turmas", turmaId));
        setTurma(t.exists() ? { id: t.id, ...t.data() } : null);
        setListas((await listasDaTurma(turmaId, false)).filter((l) => l.enviada));
        const esc = await lerEscrituracao(idEmpresa(turmaId, aluno.matricula)).catch(() => null);
        setEncerrado(!!esc && jaEncerrado(esc.lancamentos));
      } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
    })();
  }, [turmaId, aluno.matricula]);

  const marca = (k) => setMarcados({ ...marcados, [k]: !marcados[k] });
  const escolhidos = () => [
    ...(listas || []).filter((l) => marcados[l.id]).map((l) => ({ tipo: "lista", lista: l, apagarRespostas: ehQuestoes(l) && !!marcados[`apagar-${l.id}`] })),
    ...(marcados.enc ? [{ tipo: "encerramento" }] : []),
    ...(marcados.orient ? [{ tipo: "orientacao", rotulo: "os fatos orientados" }] : []),
  ];
  const mexeEmDados = marcados.enc || Object.keys(marcados).some((k) => k.startsWith("apagar-") && marcados[k]);

  const devolver = async () => {
    const itens = escolhidos();
    if (!itens.length) return setMsg({ tipo: "erro", texto: "Escolha pelo menos uma tarefa." });
    if (!orientacao.trim()) return setMsg({ tipo: "erro", texto: "Escreva a orientação para o aluno." });
    if (itens.some((i) => i.tipo === "lista") && ate < hoje()) return setMsg({ tipo: "erro", texto: "A data para refazer precisa ser hoje ou depois." });
    if (!window.confirm(`Devolver ${itens.length} tarefa(s) para ${aluno.nome}?${mexeEmDados ? "\n\nAtenção: isto apaga dados do aluno (com cópia na lixeira). Se ainda não baixou o backup da turma, cancele e baixe antes." : ""}`)) return;
    setOcupado(true); setMsg({});
    try {
      const r = await devolverTarefa(sessao, { turma, aluno, itens, orientacao, ate });
      setMsg({ texto: `Tarefa devolvida: ${r.feitos.join("; ")}. ${r.avisado ? "O aluno foi avisado por um chamado no Suporte" : "O aluno ainda não entrou no CTC: o aviso aparece na tela da tarefa"}${r.chamado.numero ? ` (Nº ${String(r.chamado.numero).padStart(4, "0")})` : ""}.` });
      await aoConcluir?.(r);
    } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
    setOcupado(false);
  };

  return (
    <section className="cartao" style={{ borderColor: "var(--destaque)" }}>
      <h3 style={{ margin: 0 }}>↩ Devolver tarefa a {aluno.nome}</h3>
      <p className="pequeno suave" style={{ margin: 0 }}>Escolha o que reabrir só para este aluno. O que for apagado vai para a lixeira (dá para restaurar). O aluno recebe a orientação por um chamado no Suporte.</p>
      {!listas && !msg.texto && <p className="pequeno suave">Carregando…</p>}
      {listas && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {listas.map((l) => {
            const encerrada = valeNota(l) && (l.fechada || (l.prazo && hoje() > l.prazo));
            return (
              <div key={l.id}>
                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="checkbox" checked={!!marcados[l.id]} onChange={() => marca(l.id)} style={{ minHeight: 0 }} />
                  <span>Reabrir <strong>{l.titulo}</strong> <span className="pequeno suave">({ehQuestoes(l) ? "questionário" : "escrituração"} · {FINALIDADES[finalidadeDe(l)].curto.toLowerCase()}{l.prazo ? ` · prazo ${dataBR(l.prazo)}` : ""}{encerrada ? " · encerrada" : ""})</span></span>
                </label>
                {marcados[l.id] && ehQuestoes(l) && (
                  <label className="pequeno" style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: 26 }}>
                    <input type="checkbox" checked={!!marcados[`apagar-${l.id}`]} onChange={() => marca(`apagar-${l.id}`)} style={{ minHeight: 0 }} />
                    Apagar as respostas atuais (o aluno responde do zero; cópia na lixeira da turma)
                  </label>
                )}
              </div>
            );
          })}
          {encerrado && (
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" checked={!!marcados.enc} onChange={() => marca("enc")} style={{ minHeight: 0 }} />
              <span>Desfazer o <strong>encerramento do exercício</strong> para o aluno refazer <span className="pequeno" style={{ color: "var(--ocre)" }}>⚠ mexe nos dados (cópia na lixeira)</span></span>
            </label>
          )}
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={!!marcados.orient} onChange={() => marca("orient")} style={{ minHeight: 0 }} />
            <span>Só orientar sobre os <strong>fatos orientados</strong> (o aluno já pode corrigir)</span>
          </label>
        </div>
      )}
      {Object.keys(marcados).some((k) => marcados[k] && listas?.some((l) => l.id === k)) && (
        <div className="campo" style={{ maxWidth: 240, flex: "none" }}>
          <label htmlFor="dev-ate">Refazer até</label>
          <input id="dev-ate" type="date" value={ate} min={hoje()} onChange={(e) => setAte(e.target.value)} />
        </div>
      )}
      <div className="campo">
        <label htmlFor="dev-ori">Orientação para o aluno</label>
        <textarea id="dev-ori" maxLength={2000} value={orientacao} onChange={(e) => setOrientacao(e.target.value)} style={{ fontFamily: "inherit", minHeight: 90 }} />
      </div>
      {msg.texto && <div className={`aviso ${msg.tipo || ""}`} role="status">{msg.texto}</div>}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button type="button" className="botao" disabled={ocupado || !turma} onClick={devolver}>{ocupado ? "Devolvendo…" : "↩ Devolver ao aluno"}</button>
        <button type="button" className="botao secundario" onClick={aoCancelar}>Fechar</button>
      </div>
    </section>
  );
}
