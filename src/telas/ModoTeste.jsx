// Modo de teste (professor e administrador): entrar no CTC como o aluno de teste de uma turma.
import { useState } from "react";
import { useTurmas } from "../lib/useTurmas";
import { traduzirErro } from "../lib/sessao";
import { disciplinaPorId } from "../dados/disciplinas";
import { entrarModoTeste, matriculaDeTeste, NOME_ALUNO_TESTE, NOME_CONTA_TESTE, zerarDadosTeste } from "../lib/modoTeste";
import { usePlano } from "../lib/contabil";
import { ehQuestoes, listasDaTurma } from "../lib/exercicios";
import { lerGabarito } from "../lib/questoes";
import { acompanharAluno } from "../lib/acompanhamento";
import { gerarRelatorio } from "../lib/relatorioOrientacao";
import { RelatorioDoAluno } from "../componentes/RelatorioOrientacao";

export default function ModoTeste({ sessao, papel, ir }) {
  const { turmas, carregando, erro } = useTurmas(sessao);
  const [msg, setMsg] = useState({ texto: "", tipo: "" });
  const [ocupado, setOcupado] = useState("");
  const uid = sessao.usuario.uid;
  const matricula = matriculaDeTeste(uid);
  const { plano } = usePlano();
  const [rel, setRel] = useState(null); // { turma, rel }

  // Relatório de orientação da conta de teste (só leitura)
  const relatorio = async (t, manter = false) => {
    setOcupado(`rel-${t.id}`); setMsg({ texto: "", tipo: "" }); if (!manter) setRel(null);
    try {
      const listas = (await listasDaTurma(t.id, false)).filter((l) => l.enviada);
      const gabaritos = {};
      for (const l of listas.filter(ehQuestoes)) gabaritos[l.id] = await lerGabarito(t.id, l.id).catch(() => ({}));
      const aluno = { matricula, nome: NOME_ALUNO_TESTE };
      const x = await acompanharAluno(t, aluno, listas, plano, gabaritos);
      setRel({ turma: t, rel: gerarRelatorio({ aluno, turma: t, empresa: x.bruto?.empresa || null, esc: x.bruto?.esc, listas, respostas: x.bruto?.respostas, gabaritos, boletim: x.bruto?.boletim, plano, contaTeste: true }) });
    } catch (e) { setMsg({ texto: traduzirErro(e), tipo: "erro" }); }
    setOcupado("");
  };

  const zerar = async (t) => {
    if (!window.confirm(`Apagar a empresa, a escrituração, as respostas e o progresso de estudo da conta de teste na turma "${t.nome}"?`)) return;
    setOcupado(t.id); setMsg({ texto: "", tipo: "" });
    try { await zerarDadosTeste(uid, t); setMsg({ texto: `Dados de teste da turma "${t.nome}" apagados. Ao entrar de novo, a conta de teste começa do zero.`, tipo: "" }); }
    catch (e) { setMsg({ texto: traduzirErro(e), tipo: "erro" }); }
    setOcupado("");
  };

  return (
    <>
      <div>
        <span className="pequeno suave">modo de teste</span>
        <h1>Testar como aluno</h1>
        <p className="suave" style={{ maxWidth: 760 }}>
          Experimente o CTC exatamente como o aluno vê (trilha, empresa, parametrização, escrituração, questionários e notas) com o seu próprio login,
          sem criar turma nem aluno. A conta de teste é um registro separado, com matrícula fictícia: não entra na lista de alunos, nas notas,
          no acompanhamento nem no backup. O modo vale só nesta aba do navegador; para voltar, use "Sair do modo de teste" na faixa do topo.
        </p>
      </div>
      {erro && <div className="aviso erro">{erro}</div>}
      {msg.texto && <div className={`aviso ${msg.tipo}`} role="status">{msg.texto}</div>}
      {!carregando && turmas.length === 0 && (
        <div className="aviso atencao">
          {papel === "admin" ? "Ainda não há turmas no CTC." : "Você ainda não tem turmas."} O modo de teste usa uma turma sua: crie-a em
          <button className="botao secundario pequeno" style={{ marginLeft: 8 }} onClick={() => ir("turmas")}>Turmas e matrículas</button>
        </div>
      )}
      {turmas.length > 0 && (
        <section className="cartao sem-padding">
          <div className="cartao-topo"><h2>Contas de teste</h2></div>
          <div className="tabela-caixa">
            <table>
              <thead><tr><th>Turma</th><th>Nome</th><th>Identificador</th><th></th></tr></thead>
              <tbody>
                {turmas.map((t) => (
                  <tr key={t.id}>
                    <td>{t.nome}<span className="pequeno suave" style={{ display: "block" }}>{disciplinaPorId(t.disciplina)?.sigla} · {t.semestre}{papel === "admin" && t.professorNome ? ` · ${t.professorNome}` : ""}</span></td>
                    <td>{NOME_CONTA_TESTE}</td>
                    <td className="mono">{matricula}</td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button className="botao pequeno" onClick={() => entrarModoTeste(uid, t)}>Entrar no modo de teste →</button>{" "}
                      <button className="botao secundario pequeno" disabled={!plano || ocupado === `rel-${t.id}`} onClick={() => relatorio(t)}>{ocupado === `rel-${t.id}` ? "Lendo…" : "Relatório"}</button>{" "}
                      <button className="botao secundario pequeno" disabled={ocupado === t.id} onClick={() => zerar(t)}>{ocupado === t.id ? "Apagando…" : "Zerar dados de teste"}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {rel && (
        <section className="cartao">
          <RelatorioDoAluno rel={rel.rel} turma={rel.turma} sessao={sessao} aoDevolver={() => relatorio(rel.turma, true)} />
          <div><button type="button" className="botao secundario pequeno" onClick={() => setRel(null)}>Fechar relatório</button></div>
        </section>
      )}
    </>
  );
}
