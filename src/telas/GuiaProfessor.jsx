// Guia do professor (aprovado em 10/10/2026, a partir do kit da CI Unidade II): o mapa do CTC
// para o dia a dia — o que fazer, em que ordem e onde. Só leitura e navegação: não grava nada no
// banco. O "✓ feito" das fases de preparar e fechar fica neste navegador, por turma.
import { useEffect, useState } from "react";
import { useTurmas } from "../lib/useTurmas";
import { disciplinaPorId } from "../dados/disciplinas";

// destino: "sec:{seção}" = seção da página da turma escolhida; senão, rota do menu (partes separadas por "/")
const ROTEIRO_DO_DIA = [
  { destino: "sec:acompanhamento", titulo: "Acompanhamento", texto: "quem avançou, quem está parado há mais de 7 dias" },
  { destino: "sec:acompanhamento", titulo: "Relatório de orientação", texto: "o que cada aluno precisa ajustar e quem age" },
  { destino: "suporte", titulo: "Suporte", texto: "responder os chamados" },
  { destino: "sec:exercicios", titulo: "Exercícios da turma", texto: "prazos, listas a enviar, resultados a liberar" },
];

const FASES = [
  {
    id: "preparar", n: 1, titulo: "Preparar a turma", quando: "uma vez, no início do semestre", marcavel: true,
    itens: [
      { destino: "turmas", nome: "Turmas e matrículas", texto: "Criar a turma e colar a lista \"Nome, matrícula\" dos alunos." },
      { destino: "sec:parametros", nome: "Parâmetros da turma", texto: "Fixar o que vale para todos (ex.: PEPS), o nível de ajuda e os tributos nas operações." },
      { destino: "banco/questoes", nome: "Banco de questões", texto: "Conferir se os bancos dos módulos estão importados (o administrador importa)." },
      { destino: "guia/semestral", nome: "Planos da SED/SC", texto: "Plano Semestral e Sequência Didática, já preenchidos com a ementa." },
      { destino: "teste", nome: "Modo de teste", texto: "Percorrer a trilha como aluno antes da primeira aula." },
    ],
  },
  {
    id: "acompanhar", n: 2, titulo: "Acompanhar o que os alunos fazem", quando: "todo dia de aula",
    itens: [
      { destino: "guia/slides", nome: "Slides do módulo", texto: "Projetar a teoria do dia (com notas do professor)." },
      { destino: "sec:acompanhamento", nome: "Acompanhamento da turma", texto: "Cadastro, parametrização, saldos, fatos orientados, listas, balancete, encerramento e última atividade." },
      { destino: "sec:empresas", nome: "Empresas dos alunos", texto: "Abrir a escrituração de um aluno e ver exatamente o que ele lançou." },
    ],
  },
  {
    id: "corrigir", n: 3, titulo: "Corrigir e orientar", quando: "toda semana",
    itens: [
      { destino: "sec:exercicios", nome: "Exercícios da turma", texto: "Montar e enviar listas de sala, avaliativas e de recuperação; liberar o resultado das avaliativas." },
      { destino: "sec:acompanhamento", nome: "Relatório de orientação", texto: "Por aluno: o que está pendente, quem age e o texto pronto para o Classroom." },
      { destino: "sec:empresas", nome: "Escrituração do aluno", texto: "Corrigir um lançamento ou destravar a parametrização (fica registrado na Auditoria).", aviso: "Mexe nos dados do aluno" },
      { destino: "suporte", nome: "Suporte", texto: "Responder as dúvidas e avisar o administrador sobre problemas." },
    ],
  },
  {
    id: "fechar", n: 4, titulo: "Fechar e dar a nota", quando: "fim do trimestre e do semestre", marcavel: true,
    itens: [
      { destino: "sec:notas", nome: "Notas da turma", texto: "Avaliações, recuperação paralela (vale a maior nota), publicar e encerrar o semestre." },
      { destino: "backup", nome: "Backup da turma", texto: "Baixar o backup e guardar fora do CTC." },
    ],
  },
];

const SITUACOES = [
  { t: "O aluno não consegue entrar ou entrou com a conta Google errada", v: "Na turma, quadro Alunos → \"Desvincular conta\". Ele entra de novo com a conta certa e confirma a matrícula.", destino: "sec:alunos" },
  { t: "O aluno precisa mudar a parametrização depois de já ter lançado", v: "Empresas dos alunos → \"Destravar parâmetros\". Ele ajusta e confirma de novo.", destino: "sec:empresas", aviso: true },
  { t: "O aluno lançou errado numa lista avaliativa já encerrada", v: "Empresas dos alunos → abrir a escrituração → Corrigir. A correção fica na Auditoria.", destino: "sec:empresas", aviso: true },
  { t: "O aluno ficou abaixo da média numa avaliação", v: "Exercícios da turma → nova lista de Recuperação paralela: ela vai só para quem está abaixo da média e vale a maior nota.", destino: "sec:exercicios" },
  { t: "Enviei uma lista com erro", v: "Lista enviada não muda. Exclua a lista e envie outra corrigida (avise a turma).", destino: "sec:exercicios", aviso: true },
  { t: "O aluno diz que perdeu o que digitou", v: "No mesmo computador, o CTC guarda o que não foi salvo: ao abrir a tela de novo, ele clica em \"Restaurar\". Em outro computador o rascunho não vai junto.", destino: null },
  { t: "Quero ver como o aluno vê", v: "Modo de teste: conta de teste da turma, sem afetar os alunos.", destino: "teste" },
  { t: "Não sei por onde começar hoje", v: "Acompanhamento da turma: primeiro os parados e os atrasados, depois o Suporte.", destino: "sec:acompanhamento" },
  { t: "Algo no CTC não funciona", v: "Abra um chamado no Suporte com um print da tela.", destino: "suporte" },
];

const CUIDADOS = [
  { t: "Backup antes de mexer em dados", v: "Baixe o backup da turma antes de excluir turma, retirar aluno ou corrigir muitos lançamentos.", tom: "erro" },
  { t: "Lista enviada não muda", v: "Revise fatos, prazo e finalidade antes de enviar. Avaliativa e recuperação exigem prazo.", tom: "atencao" },
  { t: "Resultado das avaliativas", v: "Fica oculto aos alunos até você clicar em \"Liberar resultado\".", tom: "atencao" },
  { t: "Modo de teste", v: "Vale só na aba em que foi aberto. Saia dele antes de corrigir alunos reais.", tom: "" },
  { t: "Rascunhos dos alunos", v: "O que não foi salvo fica só no computador em que foi digitado. Em computador da escola, oriente a salvar antes de sair.", tom: "" },
  { t: "Atualizações do CTC", v: "Subir os pacotes na ordem de horário; quando vier firestore.rules, colar no Console antes de testar.", tom: "" },
];

const lerFeitos = (chave) => { try { return JSON.parse(localStorage.getItem(chave) || "{}") || {}; } catch { return {}; } };

export default function GuiaProfessor({ sessao, ir }) {
  const { turmas, carregando } = useTurmas(sessao);
  const [turmaId, setTurmaId] = useState("");
  const turma = turmas.find((t) => t.id === turmaId) || turmas[0];
  const [aba, setAba] = useState("fluxo");
  const chave = `ctc-guia-feito-${turma?.id || "sem-turma"}`;
  const [feitos, setFeitos] = useState(() => lerFeitos(chave));
  useEffect(() => { setFeitos(lerFeitos(chave)); }, [chave]);
  const marcar = (id) => { const n = { ...feitos, [id]: !feitos[id] }; setFeitos(n); try { localStorage.setItem(chave, JSON.stringify(n)); } catch { /* sem armazenamento */ } };

  const abrir = (destino) => {
    if (!destino) return;
    if (destino.startsWith("sec:")) return turma ? ir("turmas", turma.id, destino.slice(4)) : ir("turmas");
    ir(...destino.split("/"));
  };
  const BotaoAbrir = ({ destino, rotulo = "Abrir" }) => (destino ? <button type="button" className="botao pequeno" onClick={() => abrir(destino)}>{rotulo}</button> : null);

  return (
    <>
      <p className="suave" style={{ maxWidth: 800, margin: 0 }}>O mapa do CTC para o dia a dia: o que fazer, em que ordem e onde. Clique em "Abrir" para ir direto à tela.</p>
      {!carregando && turmas.length === 0 && <div className="aviso atencao">Você ainda não tem turmas: comece por "Turmas e matrículas".</div>}
      {turmas.length > 1 && (
        <div className="campo" style={{ maxWidth: 520, flex: "none" }}>
          <label htmlFor="gp-turma">Turma (os botões "Abrir" vão para ela)</label>
          <select id="gp-turma" value={turma?.id || ""} onChange={(e) => setTurmaId(e.target.value)}>
            {turmas.map((t) => <option key={t.id} value={t.id}>{t.nome} · {disciplinaPorId(t.disciplina)?.sigla} · {t.semestre}</option>)}
          </select>
        </div>
      )}
      <div className="abas" role="tablist">
        {[["fluxo", "Fluxo da turma"], ["resolver", "Preciso resolver…"], ["cuidados", "Boas práticas e cuidados"]].map(([id, r]) => (
          <button key={id} role="tab" aria-selected={aba === id} className={aba === id ? "ativo" : ""} onClick={() => setAba(id)}>{r}</button>
        ))}
      </div>

      {aba === "fluxo" && (
        <>
          <section className="cartao">
            <h2>Roteiro do dia de aula</h2>
            <div className="guia-linha">
              {ROTEIRO_DO_DIA.map((r, i) => (
                <div key={r.titulo} className="guia-passo">
                  <div className="guia-caixa">
                    <strong>{i + 1}. {r.titulo}</strong>
                    <span className="pequeno suave">{r.texto}</span>
                    <BotaoAbrir destino={r.destino} />
                  </div>
                  {i < ROTEIRO_DO_DIA.length - 1 && <span className="guia-seta" aria-hidden="true">➜</span>}
                </div>
              ))}
            </div>
          </section>
          {FASES.map((f) => (
            <section key={f.id} className="cartao">
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span className="guia-numero">{f.n}</span>
                <h2 style={{ flex: "1 1 auto" }}>{f.titulo}</h2>
                <span className="pequeno suave">{f.quando}</span>
                {f.marcavel && turma && (
                  <label className="pequeno" style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input type="checkbox" checked={!!feitos[f.id]} onChange={() => marcar(f.id)} style={{ minHeight: 0 }} /> {feitos[f.id] ? "✓ feito nesta turma" : "marcar como feito"}
                  </label>
                )}
              </div>
              <div className="guia-linha">
                {f.itens.map((it, i) => (
                  <div key={it.nome} className="guia-passo">
                    <div className="guia-caixa">
                      <strong>{it.nome}</strong>
                      <span className="pequeno">{it.texto}</span>
                      {it.aviso && <span className="pequeno" style={{ color: "var(--ocre)" }}>⚠ {it.aviso}</span>}
                      <BotaoAbrir destino={it.destino} />
                    </div>
                    {i < f.itens.length - 1 && <span className="guia-seta" aria-hidden="true">➜</span>}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </>
      )}

      {aba === "resolver" && (
        <section className="cartao sem-padding">
          <div className="tabela-caixa">
            <table>
              <thead><tr><th>Situação</th><th>O que fazer</th><th></th></tr></thead>
              <tbody>
                {SITUACOES.map((s) => (
                  <tr key={s.t}>
                    <td><strong>{s.t}</strong></td>
                    <td className="pequeno">{s.v}{s.aviso && <span style={{ display: "block", color: "var(--ocre)" }}>⚠ Mexe nos dados do aluno — faça o backup antes.</span>}</td>
                    <td style={{ textAlign: "right" }}><BotaoAbrir destino={s.destino} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {aba === "cuidados" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {CUIDADOS.map((c) => (
            <div key={c.t} className={`aviso ${c.tom}`}><strong>{c.t}.</strong> {c.v}</div>
          ))}
        </div>
      )}
    </>
  );
}
