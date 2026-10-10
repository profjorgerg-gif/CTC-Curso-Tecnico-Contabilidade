import { useEffect, useMemo, useState } from "react";
import { DISCIPLINAS, disciplinaPorId } from "../dados/disciplinas";
import { useTurmas } from "../lib/useTurmas";
import {
  alunosDaTurma, criarTurma, desvincularMatricula, excluirTurma,
  incluirAlunos, lerListaDeAlunos, removerAluno,
} from "../lib/turmas";
import { traduzirErro } from "../lib/sessao";
import { EmpresasDaTurma } from "./Empresa";
import { ConfigLancamentosDaTurma, ParametrosDaTurma } from "./Parametrizacao";
import { NotasDaTurma } from "./Notas";
import { AcompanhamentoDaTurma } from "./Acompanhamento";
import { ExerciciosDaTurma } from "./Exercicios";
import { LixeiraDaTurma } from "../componentes/Lixeira";

const semestrePadrao = () => {
  const d = new Date();
  return `${d.getFullYear()}/${d.getMonth() < 6 ? 1 : 2}`;
};

export default function Turmas(props) {
  const { papel, rota } = props;
  if (papel === "aluno") return <TurmasDoAluno {...props} />;
  if (rota[0]) return <DetalheTurma {...props} turmaId={rota[0]} secao={rota[1]} />;
  return <TurmasDoProfessor {...props} />;
}

// ---------------- aluno ----------------
function TurmasDoAluno({ sessao }) {
  const { turmas, carregando, erro } = useTurmas(sessao);
  return (
    <>
      <div>
        <h1>Minhas turmas</h1>
        <p className="suave">Matrícula <span className="mono">{sessao.perfil?.matricula}</span>. Se faltar alguma turma, fale com o professor da disciplina.</p>
      </div>
      {erro && <div className="aviso erro">{erro}</div>}
      <section className="cartao sem-padding">
        <div className="tabela-caixa">
          <table>
            <thead><tr><th>Turma</th><th>Disciplina</th><th>Semestre</th><th>Professor</th></tr></thead>
            <tbody>
              {carregando && <tr><td colSpan={4} className="suave">Carregando…</td></tr>}
              {!carregando && turmas.length === 0 && <tr><td colSpan={4} className="suave">Nenhuma turma.</td></tr>}
              {turmas.map((t) => (
                <tr key={t.id}>
                  <td>{t.nome}</td>
                  <td>{disciplinaPorId(t.disciplina)?.nome}</td>
                  <td className="mono">{t.semestre}</td>
                  <td>{t.professorNome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

// ---------------- professor / admin: lista e criação ----------------
function TurmasDoProfessor({ sessao, papel, ir }) {
  const { turmas, carregando, erro, recarregar } = useTurmas(sessao);
  const [form, setForm] = useState({ nome: "", disciplina: "cb", semestre: semestrePadrao(), lista: "" });
  const [msg, setMsg] = useState({});
  const [aguarde, setAguarde] = useState(false);
  const leitura = useMemo(() => lerListaDeAlunos(form.lista), [form.lista]);

  const criar = async (e) => {
    e.preventDefault();
    setMsg({});
    if (!form.nome.trim()) return setMsg({ tipo: "erro", texto: "Dê um nome à turma." });
    if (leitura.erros.length) return setMsg({ tipo: "erro", texto: "Corrija as linhas da lista indicadas abaixo." });
    if (leitura.alunos.length > 200) return setMsg({ tipo: "erro", texto: "Envie no máximo 200 alunos por vez." });
    setAguarde(true);
    try {
      await criarTurma({
        nome: form.nome.trim(), disciplina: form.disciplina, semestre: form.semestre.trim(),
        alunos: leitura.alunos,
        professor: { uid: sessao.usuario.uid, nome: sessao.perfil?.nome || sessao.usuario.displayName, email: sessao.perfil?.email },
      });
      setForm({ ...form, nome: "", lista: "" });
      setMsg({ tipo: "", texto: `Turma criada com ${leitura.alunos.length} aluno(s). Eles já podem entrar com a matrícula.` });
      recarregar();
    } catch (err) { setMsg({ tipo: "erro", texto: traduzirErro(err) }); }
    setAguarde(false);
  };

  return (
    <>
      <div>
        <h1>Turmas e matrículas</h1>
        <p className="suave">Só entra quem está na lista da turma. Não há aprovação manual: o aluno informa a matrícula no primeiro acesso.</p>
      </div>

      <form className="cartao" onSubmit={criar}>
        <h2>Nova turma</h2>
        <div className="linha-form">
          <div className="campo" style={{ flex: "2 1 260px" }}>
            <label htmlFor="t-nome">Nome da turma</label>
            <input id="t-nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex.: 3º Técnico em Contabilidade — Noturno" />
          </div>
          <div className="campo">
            <label htmlFor="t-disc">Disciplina</label>
            <select id="t-disc" value={form.disciplina} onChange={(e) => setForm({ ...form, disciplina: e.target.value })}>
              {DISCIPLINAS.map((d) => <option key={d.id} value={d.id}>{d.sigla} — {d.nome}</option>)}
            </select>
          </div>
          <div className="campo" style={{ flex: "0 1 140px" }}>
            <label htmlFor="t-sem">Semestre</label>
            <input id="t-sem" className="mono" value={form.semestre} onChange={(e) => setForm({ ...form, semestre: e.target.value })} />
          </div>
        </div>
        <div className="campo">
          <label htmlFor="t-lista">Lista de alunos — uma linha por aluno: Nome completo, matrícula (pode colar do Excel)</label>
          <textarea id="t-lista" value={form.lista} onChange={(e) => setForm({ ...form, lista: e.target.value })}
            placeholder={"Maria da Silva, 2027001\nJoão Pereira, 2027002"} />
          <span className="pequeno suave">{leitura.alunos.length} aluno(s) reconhecido(s)</span>
          {leitura.erros.length > 0 && <div className="aviso atencao pequeno">{leitura.erros.slice(0, 5).map((e) => <div key={e}>{e}</div>)}</div>}
        </div>
        <button className="botao" style={{ alignSelf: "flex-start" }} disabled={aguarde}>{aguarde ? "Criando…" : "Criar turma"}</button>
        {msg.texto && <div className={`aviso ${msg.tipo || ""}`} role="status">{msg.texto}</div>}
      </form>

      <section className="cartao sem-padding">
        <div className="cartao-topo"><h2>{papel === "admin" ? "Todas as turmas" : "Suas turmas"}</h2></div>
        {erro && <div className="aviso erro" style={{ margin: 16 }}>{erro}</div>}
        <div className="tabela-caixa">
          <table>
            <thead><tr><th>Turma</th><th>Disciplina</th><th>Semestre</th>{papel === "admin" && <th>Professor</th>}<th></th></tr></thead>
            <tbody>
              {carregando && <tr><td colSpan={5} className="suave">Carregando…</td></tr>}
              {!carregando && turmas.length === 0 && <tr><td colSpan={5} className="suave">Nenhuma turma criada ainda.</td></tr>}
              {turmas.map((t) => (
                <tr key={t.id}>
                  <td>{t.nome}</td>
                  <td><span className="mono">{disciplinaPorId(t.disciplina)?.sigla}</span></td>
                  <td className="mono">{t.semestre}</td>
                  {papel === "admin" && <td>{t.professorNome}</td>}
                  <td style={{ textAlign: "right" }}><button className="botao secundario pequeno" onClick={() => ir("turmas", t.id)}>Abrir</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

// ---------------- detalhe da turma ----------------
function DetalheTurma({ sessao, turmaId, ir, secao }) {
  const { turmas, recarregar: recarregarTurmas } = useTurmas(sessao);
  const turma = turmas.find((t) => t.id === turmaId);
  const [alunos, setAlunos] = useState(null);
  const [lista, setLista] = useState("");
  const [msg, setMsg] = useState({});
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [versaoNotas, setVersaoNotas] = useState(0);
  const [palavra, setPalavra] = useState(""); // confirmação da exclusão da turma
  const leitura = useMemo(() => lerListaDeAlunos(lista), [lista]);

  const carregar = async () => {
    try { setAlunos(await alunosDaTurma(turmaId)); } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
  };
  useEffect(() => { carregar(); }, [turmaId]);
  // atalhos do Guia do professor: #turmas/{id}/{seção} rola até a seção
  useEffect(() => {
    if (!secao || !alunos || !turma) return undefined;
    const t = setTimeout(() => document.getElementById(`sec-${secao}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 400);
    return () => clearTimeout(t);
  }, [secao, !!alunos, !!turma]);

  const acao = async (fn, ok) => {
    setMsg({});
    try { await fn(); setMsg({ texto: ok }); carregar(); } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
  };

  return (
    <>
      <button className="botao secundario pequeno" style={{ alignSelf: "flex-start" }} onClick={() => ir("turmas")}>← Todas as turmas</button>
      <div>
        <span className="mono pequeno suave">{disciplinaPorId(turma?.disciplina)?.sigla} · {turma?.semestre}</span>
        <h1>{turma?.nome || "Turma"}</h1>
      </div>
      {msg.texto && <div className={`aviso ${msg.tipo || ""}`} role="status">{msg.texto}</div>}

      <section id="sec-alunos" className="cartao sem-padding">
        <div className="cartao-topo">
          <h2>Alunos ({alunos?.length ?? "…"})</h2>
          <span className="pequeno suave">{alunos ? alunos.filter((a) => a.vinculado).length : "…"} já entraram</span>
        </div>
        <div className="tabela-caixa">
          <table>
            <thead><tr><th>Nome</th><th>Matrícula</th><th>Situação</th><th></th></tr></thead>
            <tbody>
              {!alunos && <tr><td colSpan={4} className="suave">Carregando…</td></tr>}
              {alunos?.map((a) => (
                <tr key={a.matricula}>
                  <td>{a.nome}</td>
                  <td className="mono">{a.matricula}</td>
                  <td>{a.vinculado ? <span className="selo verde">Entrou</span> : <span className="selo cinza">Ainda não entrou</span>}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {a.vinculado && (
                      <button className="botao secundario pequeno" title="Libera a matrícula para outra conta Google"
                        onClick={() => acao(() => desvincularMatricula(a.matricula), `Matrícula ${a.matricula} liberada para um novo vínculo.`)}>
                        Desvincular conta
                      </button>
                    )}{" "}
                    <button className="botao perigo pequeno"
                      onClick={() => acao(() => removerAluno(turmaId, a.matricula), `${a.nome} retirado(a) da turma.`)}>
                      Retirar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div id="sec-acompanhamento" className="ancora">{turma && alunos && <AcompanhamentoDaTurma key={`ac-${turma.id}-${versaoNotas}`} turma={turma} alunos={alunos} ir={ir} sessao={sessao} />}</div>
      <div id="sec-parametros" className="ancora">
        {turma && <ParametrosDaTurma key={turma.id} turma={turma} aoSalvar={recarregarTurmas} />}
        {turma && <ConfigLancamentosDaTurma key={`cfg-${turma.id}`} turma={turma} aoSalvar={recarregarTurmas} />}
      </div>
      <div id="sec-exercicios" className="ancora">{turma && <ExerciciosDaTurma key={`ex-${turma.id}-${versaoNotas}`} turma={turma} alunos={alunos || []} aoMudarNotas={() => setVersaoNotas((v) => v + 1)} />}</div>
      <div id="sec-notas" className="ancora">{turma && alunos && <NotasDaTurma key={`nt-${turma.id}-${versaoNotas}`} turma={turma} alunos={alunos} aoSalvarTurma={recarregarTurmas} />}</div>
      <div id="sec-empresas" className="ancora">{turma && alunos && <EmpresasDaTurma turma={turma} alunos={alunos} ir={ir} />}</div>

      <section className="cartao">
        <h2>Incluir mais alunos</h2>
        <textarea aria-label="Novos alunos: Nome completo, matrícula" value={lista} onChange={(e) => setLista(e.target.value)} placeholder={"Nome completo, matrícula"} />
        {leitura.erros.length > 0 && <div className="aviso atencao pequeno">{leitura.erros.slice(0, 5).map((e) => <div key={e}>{e}</div>)}</div>}
        <button className="botao" style={{ alignSelf: "flex-start" }} disabled={!leitura.alunos.length || leitura.erros.length > 0}
          onClick={() => acao(async () => { await incluirAlunos(turmaId, leitura.alunos); setLista(""); }, `${leitura.alunos.length} aluno(s) incluído(s).`)}>
          Incluir {leitura.alunos.length || ""} aluno(s)
        </button>
      </section>

      <div id="sec-lixeira" className="ancora">{turma && <LixeiraDaTurma turma={turma} aoRestaurar={async () => { await carregar(); setVersaoNotas((v) => v + 1); }} />}</div>

      <section className="cartao">
        <h2>Excluir turma</h2>
        <p className="suave pequeno">Retira todos os alunos desta turma e apaga as empresas, listas, notas e respostas da turma. <strong>Isto não vai para a lixeira:</strong> baixe antes o backup da turma (menu Backup). As matrículas continuam valendo nas outras turmas.</p>
        {!confirmarExclusao
          ? <button className="botao perigo" style={{ alignSelf: "flex-start" }} onClick={() => setConfirmarExclusao(true)}>Excluir turma</button>
          : (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div className="campo" style={{ flex: "0 1 260px" }}>
                <label htmlFor="excl-palavra">Para confirmar, digite EXCLUIR</label>
                <input id="excl-palavra" value={palavra} onChange={(e) => setPalavra(e.target.value)} autoComplete="off" />
              </div>
              <button className="botao perigo" style={{ alignSelf: "flex-end" }} disabled={palavra.trim().toUpperCase() !== "EXCLUIR"} onClick={() => acao(async () => { await excluirTurma(turmaId); ir("turmas"); }, "Turma excluída.")}>Confirmar exclusão</button>
              <button className="botao secundario" style={{ alignSelf: "flex-end" }} onClick={() => { setConfirmarExclusao(false); setPalavra(""); }}>Cancelar</button>
            </div>
          )}
      </section>
    </>
  );
}
