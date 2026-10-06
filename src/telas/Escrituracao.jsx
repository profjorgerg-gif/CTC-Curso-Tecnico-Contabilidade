// Escrituração da empresa (CB): Saldos iniciais, Lançamentos (8 fatos orientados,
// listas do professor e lançamento livre — compostos, com modelo por operação),
// Razão, Controle de estoque, Balancete e Demonstrações.
import { useEffect, useMemo, useState } from "react";
import { useTurmas } from "../lib/useTurmas";
import { traduzirErro } from "../lib/sessao";
import { disciplinaPorId } from "../dados/disciplinas";
import { garantirEmpresa, lerEmpresa } from "../lib/empresas";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { AREAS, areaConfirmada, fimDePeriodoValido, parametrosEfetivos } from "../lib/parametros";
import { corrigirLancamento, ehQuestoes, FINALIDADES, finalidadeDe, GABARITO_ORIENTADOS, listasDaTurma, valeNota, ajudaDaLista } from "../lib/exercicios";
import { lerBoletim } from "../lib/notas";
import MontarDemonstracao, { montagemConcluida } from "../componentes/MontarDemonstracao";
import { balanco, CONTA_LUCROS, dlpa, dre, jaEncerrado, propostaEncerramento } from "../lib/demonstracoes";
import { apuracaoPeriodica, custoDaSaida, kardex, METODOS, movimentosDeEstoque } from "../lib/estoque";
import { semAcento } from "../lib/arquivos";
import {
  arred, balancete, CONTAS_ABERTURA, CONTAS_ESTOQUE, conferirLancamento, dataBR, dinheiro,
  FATOS_ORIENTADOS, numero, partidasDe, razao, totalDoLancamento, totaisDaConta, usePlano,
} from "../lib/contabil";
import { avisosDaOperacao, configLancamentos, modeloDeLancamento, NIVEIS_AJUDA, TIPOS_OPERACAO } from "../lib/modelos";
import {
  alterarLancamento, desfazerEncerramento, excluirLancamento, gravarEncerramento, incluirLancamento, lerEscrituracao, salvarSaldos,
} from "../lib/escrituracao";

const ABAS = [["saldos", "Saldos iniciais"], ["lancamentos", "Lançamentos"], ["razao", "Razão por conta"], ["estoque", "Controle de estoque"], ["balancete", "Balancete"], ["dre", "DRE"], ["are", "Encerramento (ARE)"], ["dlpa", "DLPA"], ["balanco", "Balanço Patrimonial"]];

export default function Escrituracao({ sessao, papel, ir, rota }) {
  return papel === "aluno"
    ? <EscrituracaoDoAluno sessao={sessao} ir={ir} abaInicial={rota?.[0]} />
    : <EscrituracaoPeloProfessor sessao={sessao} ir={ir} turmaId={rota[0]} matricula={rota[1]} />;
}

// ---------------- aluno ----------------
function EscrituracaoDoAluno({ sessao, ir, abaInicial }) {
  const { turmas, carregando, erro } = useTurmas(sessao);
  const [turmaId, setTurmaId] = useState("");
  const [empresa, setEmpresa] = useState(null);
  const [msg, setMsg] = useState("");
  const turma = turmas.find((t) => t.id === turmaId) || turmas[0];
  const aluno = { nome: sessao.perfil?.nome || sessao.usuario.displayName || "Aluno", matricula: sessao.perfil?.matricula };

  useEffect(() => {
    if (!turma) return;
    setEmpresa(null); setMsg("");
    garantirEmpresa(turma, aluno).then(setEmpresa).catch((e) => setMsg(traduzirErro(e)));
  }, [turma?.id]);

  return (
    <>
      <div>
        <h1>Escrituração</h1>
        <p className="suave" style={{ maxWidth: 760 }}>
          O ciclo contábil da sua empresa: saldos iniciais, lançamentos no Livro Diário, razão de cada conta e balancete.
        </p>
      </div>
      {erro && <div className="aviso erro">{erro}</div>}
      {!carregando && turmas.length === 0 && <div className="aviso atencao">Você ainda não está em nenhuma turma.</div>}
      {turmas.length > 1 && (
        <div className="campo" style={{ maxWidth: 520, flex: "none" }}>
          <label htmlFor="esc-turma">Turma</label>
          <select id="esc-turma" value={turma?.id || ""} onChange={(e) => setTurmaId(e.target.value)}>
            {turmas.map((t) => <option key={t.id} value={t.id}>{t.nome} · {disciplinaPorId(t.disciplina)?.sigla} · {t.semestre}</option>)}
          </select>
        </div>
      )}
      {msg && <div className="aviso erro">{msg}</div>}
      {turma && !empresa && !msg && <p className="suave">Abrindo a sua empresa…</p>}
      {empresa && !empresa.cadastroCompleto && (
        <div className="aviso atencao" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span>Antes de escriturar, complete o cadastro da sua empresa (ramo e capital social).</span>
          <button className="botao pequeno" onClick={() => ir("empresa")}>Completar cadastro</button>
        </div>
      )}
      {empresa?.cadastroCompleto && !areaConfirmada(empresa, "contabil") && (
        <div className="aviso atencao" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span>Antes de escriturar, faça a parametrização contábil da empresa (exercício, inventário, método de estoque…).</span>
          <button className="botao pequeno" onClick={() => ir("parametrizacao")}>Fazer a parametrização</button>
        </div>
      )}
      {empresa?.cadastroCompleto && areaConfirmada(empresa, "contabil") && <Livros key={empresa.id} sessao={sessao} empresa={empresa} turma={turma} donoAluno abaInicial={abaInicial} />}
    </>
  );
}

// ---------------- professor: escrituração de um aluno ----------------
function EscrituracaoPeloProfessor({ sessao, ir, turmaId, matricula }) {
  const [empresa, setEmpresa] = useState(undefined);
  const [turma, setTurma] = useState(null);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if (!turmaId || !matricula) return;
    lerEmpresa(turmaId, matricula).then(setEmpresa).catch((e) => setMsg(traduzirErro(e)));
    getDoc(doc(db, "turmas", turmaId)).then((t) => setTurma(t.exists() ? { id: t.id, ...t.data() } : null)).catch(() => {});
  }, [turmaId, matricula]);
  return (
    <>
      <button className="botao secundario pequeno" style={{ alignSelf: "flex-start" }} onClick={() => ir("turmas", turmaId || "")}>← Voltar à turma</button>
      <div>
        <h1>Escrituração {empresa ? `— ${empresa.alunoNome}` : ""}</h1>
        <p className="suave">Você vê e pode corrigir o trabalho do aluno. Toda correção sua fica registrada na Auditoria.</p>
      </div>
      {(!turmaId || !matricula) && <div className="aviso atencao">Abra a escrituração a partir da turma (quadro "Empresas dos alunos").</div>}
      {msg && <div className="aviso erro">{msg}</div>}
      {empresa === null && <div className="aviso atencao">Este aluno ainda não tem empresa nesta turma.</div>}
      {empresa && !areaConfirmada(empresa, "contabil") && <div className="aviso atencao">O aluno ainda não confirmou a parametrização contábil — os livros abaixo usam os valores padrão.</div>}
      {empresa && <Livros key={empresa.id} sessao={sessao} empresa={empresa} turma={turma} />}
    </>
  );
}

// ---------------- os livros da empresa ----------------
function Livros({ sessao, empresa, turma, donoAluno, abaInicial }) {
  const { plano, erro: erroPlano } = usePlano();
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");
  const [aba, setAba] = useState(ABAS.some(([id]) => id === abaInicial) ? abaInicial : "lancamentos");
  const params = parametrosEfetivos(empresa, turma);
  const pc = params.contabil;
  const metodo = pc.metodoEstoque || "peps";
  const periodico = pc.inventario === "periodico";
  const carregar = () => lerEscrituracao(empresa.id).then(setDados).catch((e) => setErro(traduzirErro(e)));
  useEffect(() => { carregar(); }, [empresa.id]);
  const [listas, setListas] = useState([]);
  useEffect(() => {
    if (!turma?.id) return;
    // o aluno vê as listas enviadas; as de recuperação, só se o professor o incluiu nelas
    Promise.all([listasDaTurma(turma.id, true), donoAluno ? lerBoletim(turma.id, empresa.matricula).catch(() => null) : null])
      .then(([ls, boletim]) => setListas(ls.filter((l) => !ehQuestoes(l)).filter((l) => !donoAluno || finalidadeDe(l) !== "recuperacao" || boletim?.recuperacoes?.includes(l.id))))
      .catch(() => setListas([]));
  }, [turma?.id]);
  useEffect(() => { if (dados && !dados.saldosGravados) setAba("saldos"); }, [!!dados]);

  if (erroPlano || erro) return <div className="aviso erro">{erroPlano || erro}</div>;
  if (!plano || !dados) return <p className="suave">Carregando os livros…</p>;
  const props = { sessao, empresa, turma, plano, dados, recarregar: carregar, donoAluno, metodo, params, periodico, listas };
  const rotulo = (area, campo) => AREAS.find((a) => a.id === area).campos.find((c) => c.id === campo).opcoes?.find((o) => o.valor === params[area][campo])?.rotulo || params[area][campo];
  const totalFatos = FATOS_ORIENTADOS.length;

  return (
    <>
      <section className="cartao" style={{ flexDirection: "row", flexWrap: "wrap", gap: 18, alignItems: "center" }}>
        <div style={{ flex: "1 1 280px" }}>
          <h2>{empresa.razaoSocial}</h2>
          <span className="pequeno suave mono">{empresa.cnpj}</span>
          <span className="pequeno suave"> · {params.fiscal.atividade} · {params.fiscal.regimeTributario}</span>
          <span className="pequeno suave" style={{ display: "block" }}>
            Exercício {dataBR(pc.exercicioInicio)} a {dataBR(pc.exercicioFim)} · inventário {rotulo("contabil", "inventario").toLowerCase()} · {METODOS[metodo]?.nome} · apuração {rotulo("contabil", "apuracao").toLowerCase()} · regime de {rotulo("contabil", "regimeReconhecimento").toLowerCase()}
          </span>
        </div>
        <Indicador rotulo="Lançamentos" valor={dados.lancamentos.length} />
        <Indicador rotulo="Fatos orientados" valor={`${Math.min(new Set(dados.lancamentos.filter((l) => l.fatoOrientado && l.fatoOrientado <= totalFatos).map((l) => l.fatoOrientado)).size, totalFatos)}/${totalFatos}`} />
      </section>
      {pc.regimeReconhecimento === "caixa" && <div className="aviso atencao pequeno">Parâmetro escolhido: regime de caixa. Lembre-se: a escrituração contábil segue a competência; o regime de caixa vale só para a apuração de tributos em casos permitidos.</div>}
      <div className="abas" role="tablist">
        {ABAS.map(([id, rotulo]) => (
          <button key={id} role="tab" aria-selected={aba === id} className={aba === id ? "ativo" : ""} onClick={() => setAba(id)}>{rotulo}</button>
        ))}
      </div>
      {aba === "saldos" && <SaldosIniciais {...props} />}
      {aba === "lancamentos" && <Lancamentos {...props} />}
      {aba === "razao" && <Razao {...props} />}
      {aba === "estoque" && <ControleEstoque {...props} />}
      {aba === "balancete" && <Balancete {...props} />}
      {aba === "dre" && <Dre {...props} />}
      {aba === "are" && <Encerramento {...props} />}
      {aba === "dlpa" && <Dlpa {...props} />}
      {aba === "balanco" && <Balanco {...props} />}
    </>
  );
}

function Indicador({ rotulo, valor }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      <span className="mono" style={{ fontSize: 22, fontWeight: 600, color: "var(--destaque)" }}>{valor}</span>
      <span className="pequeno suave">{rotulo}</span>
    </div>
  );
}

// a qual fato de um roteiro o lançamento pertence
function numeroNoRoteiro(l, roteiroId) {
  if (roteiroId === "orientados") return l.fatoOrientado || null;
  return l.lista?.id === roteiroId ? l.lista.n : null;
}

// ---------------- escolha de conta (busca por código ou nome) ----------------
function CampoConta({ id, rotulo, valor, aoMudar, plano }) {
  const descricao = (c) => `${c.codigo} — ${c.nome}`;
  const [texto, setTexto] = useState(valor && plano.porCodigo[valor] ? descricao(plano.porCodigo[valor]) : "");
  useEffect(() => { setTexto(valor && plano.porCodigo[valor] ? descricao(plano.porCodigo[valor]) : ""); }, [valor]);
  const mudar = (t) => {
    setTexto(t);
    const codigo = t.split(" ")[0].trim();
    const conta = plano.porCodigo[codigo];
    aoMudar(conta?.aceitaLancamento ? codigo : "");
  };
  const escolhida = plano.porCodigo[valor];
  return (
    <div className="campo">
      <label htmlFor={id}>{rotulo}</label>
      <input id={id} list={`${id}-lista`} value={texto} onChange={(e) => mudar(e.target.value)} placeholder="Digite o código ou o nome da conta" autoComplete="off" />
      <datalist id={`${id}-lista`}>
        {plano.lancaveis.map((c) => <option key={c.codigo} value={descricao(c)} />)}
      </datalist>
      {escolhida && <span className="pequeno suave">{escolhida.grupo} · natureza {escolhida.natureza.toLowerCase()}</span>}
      {texto && !escolhida && <span className="pequeno" style={{ color: "var(--ocre)" }}>Escolha uma conta da lista.</span>}
    </div>
  );
}

// ---------------- saldos iniciais (lançamento de abertura) ----------------
function SaldosIniciais({ sessao, empresa, plano, dados, recarregar }) {
  const inicial = () => (dados.saldosGravados ? dados.saldos : { "3.1.01": { devedor: 0, credor: Number(empresa.capitalSocial) || 0 } });
  const [rascunho, setRascunho] = useState(inicial);
  const [todas, setTodas] = useState(false);
  const [busca, setBusca] = useState("");
  const [msg, setMsg] = useState({});
  const [salvando, setSalvando] = useState(false);

  const visiveis = useMemo(() => {
    const comValor = new Set(Object.keys(rascunho));
    const b = semAcento(busca);
    const ordem = (c) => (CONTAS_ABERTURA.includes(c.codigo) ? CONTAS_ABERTURA.indexOf(c.codigo) : 100);
    return plano.lancaveis.filter((c) => (todas || CONTAS_ABERTURA.includes(c.codigo) || comValor.has(c.codigo)) &&
      (!b || c.codigo.startsWith(busca) || semAcento(c.nome).includes(b)))
      .map((c, i) => [c, i]).sort((a, z) => ordem(a[0]) - ordem(z[0]) || a[1] - z[1]).map(([c]) => c);
  }, [todas, busca, rascunho, plano]);

  const totDev = arred(Object.values(rascunho).reduce((s, v) => s + (Number(v.devedor) || 0), 0));
  const totCre = arred(Object.values(rascunho).reduce((s, v) => s + (Number(v.credor) || 0), 0));
  const fecha = totDev > 0 && Math.abs(totDev - totCre) < 0.005;

  const mudar = (codigo, lado, valor) => setRascunho((r) => ({ ...r, [codigo]: { devedor: 0, credor: 0, ...r[codigo], [lado]: valor } }));

  const salvar = async () => {
    setSalvando(true); setMsg({});
    try {
      await salvarSaldos(sessao, empresa.id, rascunho);
      setMsg({ texto: "Saldos iniciais salvos." });
      await recarregar();
    } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
    setSalvando(false);
  };

  return (
    <section className="cartao sem-padding">
      <div className="cartao-topo">
        <h2>Saldos iniciais — lançamento de abertura</h2>
        <input aria-label="Buscar conta" placeholder="Buscar conta" value={busca} onChange={(e) => setBusca(e.target.value)} style={{ flex: "0 1 240px" }} />
      </div>
      <div style={{ padding: "12px 18px 0", display: "flex", flexDirection: "column", gap: 8 }}>
        <p className="pequeno suave">
          Credite o <strong>Capital Subscrito</strong> pelo capital social da empresa ({dinheiro(empresa.capitalSocial)}) e distribua o mesmo
          valor a débito em contas do Ativo (Caixa, Bancos, Imobilizado). O total devedor precisa ser igual ao total credor.
        </p>
        <label className="pequeno suave" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={todas} onChange={(e) => setTodas(e.target.checked)} style={{ minHeight: 0 }} /> Mostrar todas as contas do plano
        </label>
      </div>
      <div className="tabela-caixa" style={{ maxHeight: 520, overflowY: "auto", marginTop: 8 }}>
        <table>
          <thead><tr><th>Código</th><th>Conta</th><th>Natureza</th><th style={{ textAlign: "right" }}>Saldo devedor</th><th style={{ textAlign: "right" }}>Saldo credor</th></tr></thead>
          <tbody>
            {visiveis.map((c) => {
              const v = rascunho[c.codigo] || {};
              return (
                <tr key={c.codigo}>
                  <td className="mono">{c.codigo}</td>
                  <td>{c.nome}</td>
                  <td className="pequeno">{c.natureza}</td>
                  {["devedor", "credor"].map((lado) => (
                    <td key={lado} style={{ textAlign: "right" }}>
                      <input aria-label={`${c.nome} — saldo ${lado}`} type="number" min="0" step="0.01" className="mono"
                        value={v[lado] || ""} onChange={(e) => mudar(c.codigo, lado, e.target.value)}
                        style={{ width: 140, textAlign: "right", minHeight: 36, padding: "4px 8px" }} />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}><strong>Totais</strong></td>
              <td className="mono" style={{ textAlign: "right" }}><strong>{numero(totDev)}</strong></td>
              <td className="mono" style={{ textAlign: "right" }}><strong>{numero(totCre)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div style={{ padding: "12px 18px 16px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <span className={`selo ${fecha ? "verde" : "ocre"}`}>{fecha ? "Débito = Crédito" : `Diferença de ${dinheiro(Math.abs(totDev - totCre))}`}</span>
        {fecha && Math.abs(totCre - Number(empresa.capitalSocial)) > 0.005 && (
          <span className="pequeno" style={{ color: "var(--ocre)" }}>Atenção: o total não bate com o capital social do cadastro ({dinheiro(empresa.capitalSocial)}).</span>
        )}
        <button className="botao" onClick={salvar} disabled={!fecha || salvando} style={{ marginLeft: "auto" }}>{salvando ? "Salvando…" : "Salvar saldos iniciais"}</button>
      </div>
      {msg.texto && <div className={`aviso ${msg.tipo || ""}`} style={{ margin: "0 18px 16px" }} role="status">{msg.texto}</div>}
    </section>
  );
}

// ---------------- lançamentos (Livro Diário) ----------------
// Lançamento composto (aprovado em 04/10/2026): várias linhas de débito e de crédito,
// com modelo por tipo de operação conforme o nível de ajuda definido na turma.
const linhaVazia = (d, efeito = "") => ({ d, efeito, conta: "", valor: "", quantidade: "", valorUnitario: "" });
const formVazio = (empresa) => ({
  data: empresa.inicioExercicio || new Date().toISOString().slice(0, 10),
  historico: "", documento: "", tipo: "livre", partidas: [linhaVazia("D"), linhaVazia("C")],
});
const formEmBranco = (f) => !f.historico.trim() && f.partidas.every((p) => !p.conta && !p.valor);
const somaLado = (partidas, lado) => arred(partidas.filter((p) => p.d === lado).reduce((s, p) => s + (Number(p.valor) || 0), 0));
// quantidade que sai do estoque no lançamento (créditos na conta de estoque)
const qtdSaida = (partidas) => partidas.filter((p) => p.d === "C" && CONTAS_ESTOQUE.includes(p.conta)).reduce((s, p) => s + (Number(p.quantidade) || 0), 0);

function Lancamentos({ sessao, empresa, turma, plano, dados, recarregar, donoAluno, metodo, params, periodico, listas = [] }) {
  const lista = dados.lancamentos;
  const cfg = configLancamentos(turma);
  const contexto = { periodico, tributos: cfg.tributos, regime: params.fiscal.regimeTributario, contribuinteIcms: params.fiscal.contribuinteIcms };
  const [form, setForm] = useState(() => formVazio(empresa));
  const [editando, setEditando] = useState(null);
  const [erros, setErros] = useState([]);
  const [msg, setMsg] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [busca, setBusca] = useState("");
  const [vendoFato, setVendoFato] = useState(null);

  // resultado da correção (para a baixa do CMV, o custo vem do estoque e do método do próprio aluno)
  const resultado = (l, fato) => corrigirLancamento(l, fato, lista, { metodo, periodico, tributos: cfg.tributos });
  // lista avaliativa: a correção fica oculta ao aluno até o professor liberar;
  // depois do prazo (ou de fechada) a lista não aceita mais lançamentos do aluno
  const hoje = new Date().toLocaleDateString("sv-SE");
  const oculta = (r) => donoAluno && valeNota(r) && !r.resultadoLiberado;
  const encerrado = (r) => valeNota(r) && (r.fechada || (r.prazo && hoje > r.prazo));
  // roteiros guiados: os 8 fatos orientados + as listas enviadas pelo professor
  const roteiros = useMemo(() => [
    { id: "orientados", titulo: "Fatos orientados", fatos: FATOS_ORIENTADOS.map((f, i) => ({ n: i + 1, texto: f.texto, tipo: f.tipo, gabarito: GABARITO_ORIENTADOS[i] })) },
    ...listas.map((l) => ({ id: l.id, titulo: l.titulo, prazo: l.prazo, fatos: l.fatos, finalidade: finalidadeDe(l), resultadoLiberado: !!l.resultadoLiberado, fechada: !!l.fechada, ajuda: ajudaDaLista(l, turma) })),
  ], [listas]);
  const estadoDo = (r) => {
    const lanc = {};
    lista.forEach((l) => { const n = numeroNoRoteiro(l, r.id); if (n) lanc[n] = l; });
    const proximo = r.fatos.find((f) => !lanc[f.n])?.n || 0;
    const corrigidos = r.fatos.filter((f) => lanc[f.n]).map((f) => resultado(lanc[f.n], f));
    return { lanc, proximo, acertos: corrigidos.filter((c) => c?.ok).length, lancados: corrigidos.length, aplicaveis: r.fatos.length, oculta: oculta(r), encerrado: encerrado(r) };
  };
  const [roteiroId, setRoteiroId] = useState(null);
  const roteiro = roteiros.find((r) => r.id === roteiroId) || roteiros.find((r) => { const e = estadoDo(r); return e.proximo && !e.encerrado; }) || roteiros[0];
  const est = estadoDo(roteiro);
  // nível de ajuda: o da lista em andamento; nos fatos orientados, o da turma
  const ajuda = roteiro.ajuda || cfg.ajuda;
  function fatoDoLancamentoBase(l) {
    for (const r of roteiros) { const n = numeroNoRoteiro(l, r.id); if (n) return { r, fato: r.fatos.find((f) => f.n === n) }; }
    return null;
  }
  const proximoFato = est.proximo; // 0 = roteiro concluído
  const etapaGuiada = donoAluno && proximoFato > 0 && !editando && !est.encerrado;
  // o aluno não altera lançamentos de lista avaliativa encerrada
  const travado = (l) => donoAluno && (() => { const ref = fatoDoLancamentoBase(l); return ref ? encerrado(ref.r) : false; })();
  const fatoNaTela = vendoFato || proximoFato;
  const fatoDaTela = roteiro.fatos.find((f) => f.n === fatoNaTela);
  const fatoDoProximo = roteiro.fatos.find((f) => f.n === proximoFato);
  // no fato guiado, o formulário já vem com o modelo da operação (e, nas listas, com a data)
  useEffect(() => {
    if (!etapaGuiada || !fatoDoProximo) return;
    setForm((f) => {
      if (!formEmBranco(f)) return f;
      const tipo = fatoDoProximo.tipo || "livre";
      return { ...f, tipo, data: fatoDoProximo.data || f.data, partidas: modeloDeLancamento(tipo, ajuda, contexto) };
    });
  }, [roteiro.id, proximoFato, etapaGuiada]);
  const fatoDoLancamento = fatoDoLancamentoBase;

  const muda = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const mudarTipo = (tipo) => {
    if (!form.partidas.every((p) => !p.conta && !p.valor) && !window.confirm("Trocar o tipo de operação recomeça as linhas do lançamento. Continuar?")) return;
    setForm((f) => ({ ...f, tipo, partidas: modeloDeLancamento(tipo, ajuda, contexto) }));
  };
  const mudarLinha = (i, campo, valor) => setForm((f) => {
    const partidas = f.partidas.map((p, k) => {
      if (k !== i) return p;
      const n = { ...p, [campo]: valor };
      // na entrada no estoque, o valor é quantidade × valor unitário
      if (n.d === "D" && CONTAS_ESTOQUE.includes(n.conta) && Number(n.quantidade) > 0 && Number(n.valorUnitario) > 0) {
        n.valor = String(arred(Number(n.quantidade) * Number(n.valorUnitario)));
      }
      return n;
    });
    return { ...f, partidas };
  });
  const incluirLinha = (d) => setForm((f) => {
    const partidas = [...f.partidas];
    const ultimaDoLado = partidas.map((p) => p.d).lastIndexOf(d);
    partidas.splice(ultimaDoLado >= 0 ? ultimaDoLado + 1 : partidas.length, 0, linhaVazia(d));
    return { ...f, partidas };
  });
  const tirarLinha = (i) => setForm((f) => ({ ...f, partidas: f.partidas.filter((_, k) => k !== i) }));
  const cancelar = () => { setEditando(null); setForm(formVazio(empresa)); setErros([]); };

  const totD = somaLado(form.partidas, "D");
  const totC = somaLado(form.partidas, "C");
  const baixaEstoque = form.partidas.some((p) => p.d === "C" && CONTAS_ESTOQUE.includes(p.conta));
  const linhaCMV = form.partidas.findIndex((p) => p.d === "D" && p.conta === "6.2.01");
  const linhaBaixa = form.partidas.findIndex((p) => p.d === "C" && CONTAS_ESTOQUE.includes(p.conta));
  const avisos = avisosDaOperacao(form.tipo, form.partidas, plano);

  const salvar = async (e) => {
    e.preventDefault();
    const problemas = conferirLancamento(form, plano);
    const pc = params.contabil;
    if (form.data && (form.data < pc.exercicioInicio || form.data > pc.exercicioFim)) problemas.push(`A data precisa estar dentro do exercício (${dataBR(pc.exercicioInicio)} a ${dataBR(pc.exercicioFim)}).`);
    if (periodico && baixaEstoque) problemas.push("No inventário periódico não se baixa o estoque a cada venda: o CMV é apurado no fim do período, na aba Controle de estoque.");
    setErros(problemas); setMsg({});
    if (problemas.length) return;
    setSalvando(true);
    try {
      if (editando) await alterarLancamento(sessao, empresa.id, editando, form);
      else if (etapaGuiada && roteiro.id === "orientados") await incluirLancamento(sessao, empresa.id, form, proximoFato);
      else if (etapaGuiada) await incluirLancamento(sessao, empresa.id, form, null, { lista: { id: roteiro.id, n: proximoFato } });
      else await incluirLancamento(sessao, empresa.id, form, null);
      setMsg({ texto: editando ? "Lançamento corrigido." : etapaGuiada ? `Fato ${proximoFato} lançado.` : "Lançamento incluído." });
      setVendoFato(null);
      setEditando(null); setErros([]);
      setForm({ ...formVazio(empresa), data: form.data }); // mantém a data para o próximo
      await recarregar();
    } catch (err) { setMsg({ tipo: "erro", texto: traduzirErro(err) }); }
    setSalvando(false);
  };

  const editar = (l) => {
    setEditando(l.id); setErros([]); setMsg({});
    setForm({
      data: l.data, historico: l.historico, documento: l.documento || "", tipo: l.tipoOperacao || "livre",
      partidas: partidasDe(l).map((p) => ({
        d: p.d, efeito: p.efeito || "", conta: p.conta, valor: String(p.valor),
        quantidade: p.quantidade ? String(p.quantidade) : "", valorUnitario: p.valorUnitario ? String(p.valorUnitario) : "",
      })),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const excluir = async (l) => {
    if (!window.confirm(`Excluir o lançamento "${l.historico}"?`)) return;
    try { await excluirLancamento(sessao, empresa.id, l); await recarregar(); } catch (err) { setMsg({ tipo: "erro", texto: traduzirErro(err) }); }
  };

  const ordenados = useMemo(() => {
    const b = semAcento(busca);
    return [...lista]
      .sort((a, c) => (a.data || "").localeCompare(c.data || "") || (a.criadoEm || "").localeCompare(c.criadoEm || ""))
      .filter((l) => !b || semAcento(`${l.historico} ${partidasDe(l).map((p) => p.conta).join(" ")} ${l.documento || ""}`).includes(b));
  }, [lista, busca]);
  const nome = (c) => plano.porCodigo[c]?.nome || c;
  const nivel = NIVEIS_AJUDA.find((n) => n.valor === ajuda);

  return (
    <>
      {donoAluno && roteiros.length > 1 && !editando && (
        <div className="abas" role="tablist" aria-label="Roteiro de fatos">
          {roteiros.map((r) => {
            const e = estadoDo(r);
            return (
              <button key={r.id} role="tab" aria-selected={roteiro.id === r.id} className={roteiro.id === r.id ? "ativo" : ""} onClick={() => { setRoteiroId(r.id); setVendoFato(null); }}>
                {r.titulo}{r.finalidade && r.finalidade !== "sala" ? ` (${FINALIDADES[r.finalidade].curto.toLowerCase()})` : ""} · {e.lancados}/{e.aplicaveis}{e.proximo === 0 ? " ✓" : e.encerrado ? " · encerrada" : ""}
              </button>
            );
          })}
        </div>
      )}
      {etapaGuiada && fatoDaTela && (
        <section className="cartao" style={{ borderColor: "var(--destaque)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span className="mono pequeno" style={{ color: "var(--destaque)", fontWeight: 600 }}>
              {roteiro.id === "orientados" ? "FATO CONTÁBIL" : roteiro.titulo.toUpperCase()} · {String(fatoNaTela).padStart(2, "0")} DE {roteiro.fatos.length}
              {roteiro.prazo ? ` · prazo ${dataBR(roteiro.prazo)}` : ""}
            </span>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              {(() => {
                const l = est.lanc[fatoNaTela];
                if (!l) return <span className="selo ocre">Pendente — lance no formulário abaixo</span>;
                if (est.oculta) return <span className="selo cinza">Lançado · correção após o resultado</span>;
                const c = resultado(l, fatoDaTela);
                return c?.ok ? <span className="selo verde">Lançado · confere</span> : <span className="selo ocre">Lançado · diferente: {c?.erros.join(", ")}</span>;
              })()}
              <button className="botao secundario pequeno" aria-label="Fato anterior" disabled={fatoNaTela <= 1} onClick={() => setVendoFato(fatoNaTela - 1)}>◀</button>
              <button className="botao secundario pequeno" aria-label="Próximo fato" disabled={fatoNaTela >= proximoFato} onClick={() => setVendoFato(fatoNaTela + 1 >= proximoFato ? null : fatoNaTela + 1)}>▶</button>
            </div>
          </div>
          <p style={{ fontSize: 16 }}>{fatoDaTela.texto}</p>
          {periodico && fatoDaTela.tipo === "venda" && <p className="pequeno suave">Inventário periódico: registre só a venda. A baixa do CMV não é feita a cada venda — ele é apurado no fim do período (aba Controle de estoque).</p>}
          {fatoNaTela !== proximoFato && <p className="pequeno suave">Você está relendo um fato. O formulário continua registrando o fato {proximoFato}.</p>}
          {est.oculta
            ? <span className="pequeno suave">{FINALIDADES[roteiro.finalidade].nome}: a correção aparece quando o professor liberar o resultado.{roteiro.prazo ? ` Lance até ${dataBR(roteiro.prazo)}.` : ""}</span>
            : <span className="pequeno suave">Acertos até agora: {est.acertos} de {est.lancados} lançado(s).</span>}
        </section>
      )}
      {donoAluno && proximoFato > 0 && est.encerrado && !editando && (
        <div className="aviso atencao">
          "{roteiro.titulo}" está encerrada{roteiro.prazo ? ` (prazo ${dataBR(roteiro.prazo)})` : ""}: não aceita mais lançamentos. {est.lancados} de {est.aplicaveis} fato(s) foram lançados.
        </div>
      )}
      {donoAluno && proximoFato === 0 && !editando && est.oculta && (
        <div className="aviso">Você lançou todos os fatos de "{roteiro.titulo}". A correção e a nota aparecem quando o professor liberar o resultado.</div>
      )}
      {donoAluno && proximoFato === 0 && !editando && !est.oculta && (
        <div className="aviso">
          Você concluiu "{roteiro.titulo}": {est.acertos} de {est.lancados} lançamento(s) conferem.
          {est.acertos < est.lancados ? " Use \"Corrigir\" no Livro Diário para acertar os que estão diferentes." : ""}
          {roteiros.some((r) => estadoDo(r).proximo) ? " Há outro roteiro com fatos pendentes nas abas acima." : " Agora registre as operações que o professor indicar em sala."}
        </div>
      )}

      <form className="cartao" onSubmit={salvar}>
        <h2>{editando ? "Corrigir lançamento" : etapaGuiada ? `Lançar o fato ${proximoFato}` : "Novo lançamento"}</h2>
        <p className="pequeno suave">
          Partidas dobradas: um lançamento pode ter várias contas a débito e várias a crédito; a soma dos débitos é sempre igual à soma dos créditos.
          {nivel && ajuda !== "livre" ? ` Ajuda${roteiro.id === "orientados" ? " da turma" : " desta lista"}: ${nivel.rotulo.toLowerCase()} — ${nivel.ajuda.charAt(0).toLowerCase()}${nivel.ajuda.slice(1)}` : ""}
        </p>
        <div className="linha-form">
          <div className="campo" style={{ flex: "0 1 180px" }}>
            <label htmlFor="l-data">Data</label>
            <input id="l-data" type="date" value={form.data} onChange={muda("data")} />
          </div>
          <div className="campo" style={{ flex: "0 1 260px" }}>
            <label htmlFor="l-tipo">Tipo de operação</label>
            <select id="l-tipo" value={form.tipo} onChange={(e) => mudarTipo(e.target.value)}>
              {TIPOS_OPERACAO.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>
          <div className="campo" style={{ flex: "3 1 320px" }}>
            <label htmlFor="l-hist">Histórico</label>
            <input id="l-hist" value={form.historico} onChange={muda("historico")} maxLength={200} placeholder="Ex.: Compra de mercadorias, NF 123, parte à vista e parte a prazo" />
          </div>
          <div className="campo" style={{ flex: "0 1 160px" }}>
            <label htmlFor="l-doc">Documento (opcional)</label>
            <input id="l-doc" value={form.documento} onChange={muda("documento")} maxLength={40} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {form.partidas.map((p, i) => {
            const estoque = CONTAS_ESTOQUE.includes(p.conta);
            const entrada = estoque && p.d === "D";
            return (
              <div key={i} className="linha-form" style={{ alignItems: "flex-start", borderLeft: `3px solid ${p.d === "D" ? "var(--destaque)" : "var(--ocre)"}`, paddingLeft: 10 }}>
                <div className="campo" style={{ flex: "0 0 92px" }}>
                  <label htmlFor={`l-dc-${i}`}>Lado</label>
                  <select id={`l-dc-${i}`} value={p.d} onChange={(e) => mudarLinha(i, "d", e.target.value)}>
                    <option value="D">Débito</option>
                    <option value="C">Crédito</option>
                  </select>
                </div>
                <div style={{ flex: "3 1 300px", display: "flex" }}>
                  <CampoConta id={`l-conta-${i}`} rotulo={`${p.d === "D" ? "Conta a DÉBITO" : "Conta a CRÉDITO"}${p.efeito ? ` — ${p.efeito}` : ""}`} valor={p.conta} aoMudar={(c) => mudarLinha(i, "conta", c)} plano={plano} />
                </div>
                {estoque && (
                  <div className="campo" style={{ flex: "0 1 120px" }}>
                    <label htmlFor={`l-qtd-${i}`}>Quantidade</label>
                    <input id={`l-qtd-${i}`} type="number" min="0" step="1" className="mono" value={p.quantidade} onChange={(e) => mudarLinha(i, "quantidade", e.target.value)} />
                  </div>
                )}
                {entrada && (
                  <div className="campo" style={{ flex: "0 1 140px" }}>
                    <label htmlFor={`l-unit-${i}`}>Valor unitário</label>
                    <input id={`l-unit-${i}`} type="number" min="0" step="0.01" className="mono" value={p.valorUnitario} onChange={(e) => mudarLinha(i, "valorUnitario", e.target.value)} />
                  </div>
                )}
                <div className="campo" style={{ flex: "0 1 160px" }}>
                  <label htmlFor={`l-valor-${i}`}>Valor (R$)</label>
                  <input id={`l-valor-${i}`} type="number" min="0" step="0.01" className="mono" value={p.valor} onChange={(e) => mudarLinha(i, "valor", e.target.value)} readOnly={entrada && Number(p.valorUnitario) > 0} />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", alignSelf: "stretch" }}>
                  <button type="button" className="botao secundario pequeno" aria-label={`Remover a linha ${i + 1}`} title="Remover linha" disabled={form.partidas.length <= 2} onClick={() => tirarLinha(i)}>✕</button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="linha-form" style={{ alignItems: "center" }}>
          <button type="button" className="botao secundario pequeno" onClick={() => incluirLinha("D")}>+ Débito</button>
          <button type="button" className="botao secundario pequeno" onClick={() => incluirLinha("C")}>+ Crédito</button>
          <span className="pequeno mono">Débitos {numero(totD)} · Créditos {numero(totC)}</span>
          <span className={`selo ${totD > 0 && Math.abs(totD - totC) < 0.005 ? "verde" : "ocre"}`}>
            {totD === 0 && totC === 0 ? "Preencha os valores" : Math.abs(totD - totC) < 0.005 ? "Débito = Crédito" : `Diferença de ${dinheiro(Math.abs(totD - totC))}`}
          </span>
          <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
            {editando && <button type="button" className="botao secundario" onClick={cancelar}>Cancelar</button>}
            <button className="botao" disabled={salvando}>{salvando ? "Salvando…" : editando ? "Salvar correção" : "Lançar"}</button>
          </div>
        </div>

        {baixaEstoque && periodico && <div className="aviso atencao pequeno">Inventário periódico: a baixa do estoque (CMV) é feita só no fim do período (aba Controle de estoque → Apuração do CMV).</div>}
        {/* ajuda do CMV: só quando o lançamento tem débito no CMV (6.2.01) */}
        {!periodico && linhaCMV >= 0 && (() => {
          const q = qtdSaida(form.partidas);
          if (linhaBaixa < 0 || !(q > 0)) return <div className="aviso pequeno">Baixa do CMV: inclua a linha de crédito em Mercadorias (1.1.3.01) com a quantidade vendida — o CTC mostra o custo pelo método da empresa ({METODOS[metodo].nome}).</div>;
          const c = custoDaSaida(lista, metodo, q, form.data, editando);
          const vCMV = Number(form.partidas[linhaCMV].valor);
          const vBaixa = Number(form.partidas[linhaBaixa].valor);
          const confere = Math.abs(vCMV - c.custo) < 0.005 && Math.abs(vBaixa - c.custo) < 0.005;
          return (
            <div className={`aviso ${c.insuficiente ? "erro" : ""}`} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              {c.insuficiente
                ? <span>Estoque insuficiente: até esta data há {c.disponivel} unidade(s) disponível(is).</span>
                : <span>Custo de {q} un. pelo método da empresa ({METODOS[metodo].nome}): <strong className="mono">{dinheiro(c.custo)}</strong>
                    {(vCMV > 0 || vBaixa > 0) && !confere && <> — o valor do CMV e da baixa do estoque precisa ser este.</>}
                  </span>}
              {!c.insuficiente && !confere && (
                <button type="button" className="botao secundario pequeno" onClick={() => setForm((f) => ({ ...f, partidas: f.partidas.map((p, k) => (k === linhaCMV || k === linhaBaixa ? { ...p, valor: String(c.custo) } : p)) }))}>Usar este custo</button>
              )}
            </div>
          );
        })()}
        {avisos.length > 0 && <div className="aviso atencao pequeno">{avisos.map((a) => <div key={a}>{a}</div>)}</div>}
        {erros.length > 0 && <div className="aviso atencao pequeno">{erros.map((e) => <div key={e}>{e}</div>)}</div>}
        {msg.texto && <div className={`aviso ${msg.tipo || ""}`} role="status">{msg.texto}</div>}
      </form>

      <section className="cartao sem-padding">
        <div className="cartao-topo">
          <h2>Livro Diário <span className="suave pequeno">· {lista.length} lançamento(s) · {dinheiro(lista.reduce((s, l) => s + totalDoLancamento(l), 0))}</span></h2>
          <input aria-label="Buscar lançamento" placeholder="Buscar histórico ou conta" value={busca} onChange={(e) => setBusca(e.target.value)} style={{ flex: "0 1 240px" }} />
        </div>
        <div className="tabela-caixa" style={{ maxHeight: 560, overflowY: "auto" }}>
          <table>
            <thead><tr><th>Data</th><th>Histórico</th><th>Débito</th><th>Crédito</th><th style={{ textAlign: "right" }}>Valor</th><th></th></tr></thead>
            <tbody>
              {ordenados.length === 0 && <tr><td colSpan={6} className="suave">Nenhum lançamento ainda.</td></tr>}
              {ordenados.map((l) => {
                const ps = partidasDe(l);
                const composto = ps.length > 2;
                const qtds = ps.filter((p) => p.quantidade);
                const lado = (d) => ps.filter((p) => p.d === d).map((p, k) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span><span className="mono">{p.conta}</span> {nome(p.conta)}</span>
                    {composto && <span className="mono suave">{numero(p.valor)}</span>}
                  </div>
                ));
                return (
                  <tr key={l.id}>
                    <td className="mono pequeno" style={{ whiteSpace: "nowrap" }}>{dataBR(l.data)}</td>
                    <td>
                      {(() => {
                        const ref = fatoDoLancamento(l);
                        if (!ref) return null;
                        const c = oculta(ref.r) ? null : resultado(l, ref.fato);
                        return (
                          <>
                            <span className="selo cheio" style={{ marginRight: 6 }}>{ref.r.id === "orientados" ? "Fato" : `${ref.r.titulo} ·`} {ref.fato?.n}</span>
                            {c && <span className={`selo ${c.ok ? "verde" : "ocre"}`} style={{ marginRight: 6 }} title={c.ok ? "" : `Confira: ${c.erros.join(", ")}`}>{c.ok ? "Confere" : `Diferente: ${c.erros.join(", ")}`}</span>}
                          </>
                        );
                      })()}
                      {l.encerramento && <span className="selo cinza" style={{ marginRight: 6 }}>Encerramento</span>}
                      {l.historico}
                      {(qtds.length > 0 || l.documento || l.alteradoPor) && (
                        <span className="pequeno suave" style={{ display: "block" }}>
                          {qtds.map((p) => `${p.d === "D" ? "entrada" : "saída"} ${p.quantidade} un.${p.valorUnitario ? ` × ${dinheiro(p.valorUnitario)}` : ""}`).join(" · ")}
                          {l.documento ? ` · doc. ${l.documento}` : ""}
                          {l.alteradoPor && l.alteradoPor.papel !== "aluno" ? ` · corrigido por ${l.alteradoPor.nome}` : ""}
                        </span>
                      )}
                    </td>
                    <td className="pequeno">{lado("D")}</td>
                    <td className="pequeno">{lado("C")}</td>
                    <td className="mono" style={{ textAlign: "right", whiteSpace: "nowrap" }}>{numero(totalDoLancamento(l))}</td>
                    <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                      {travado(l)
                        ? <span className="pequeno suave" title="Lista avaliativa encerrada">Encerrada</span>
                        : <>
                            <button className="botao secundario pequeno" onClick={() => editar(l)}>Corrigir</button>{" "}
                            <button className="botao perigo pequeno" onClick={() => excluir(l)}>Excluir</button>
                          </>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

// ---------------- razão por conta ----------------
function Razao({ plano, dados }) {
  const movimentadas = useMemo(() => {
    const usadas = new Set([...Object.keys(dados.saldos), ...dados.lancamentos.flatMap((l) => partidasDe(l).map((p) => p.conta))]);
    return plano.lancaveis.filter((c) => usadas.has(c.codigo));
  }, [plano, dados]);
  const [codigo, setCodigo] = useState(movimentadas[0]?.codigo || "");
  const conta = plano.porCodigo[codigo];
  const r = conta ? razao(conta, dados.lancamentos, dados.saldos) : null;
  const debitos = r ? r.linhas.filter((x) => x.debito) : [];
  const creditos = r ? r.linhas.filter((x) => !x.debito) : [];
  const ini = dados.saldos[codigo] || {};
  const somaD = arred(debitos.reduce((s, x) => s + x.valor, Number(ini.devedor || 0)));
  const somaC = arred(creditos.reduce((s, x) => s + x.valor, Number(ini.credor || 0)));

  if (movimentadas.length === 0) return <div className="aviso atencao">Nenhuma conta movimentada ainda. Lance os saldos iniciais e os fatos.</div>;

  return (
    <>
      <div className="campo" style={{ maxWidth: 560, flex: "none" }}>
        <label htmlFor="razao-conta">Conta (só as movimentadas)</label>
        <select id="razao-conta" value={codigo} onChange={(e) => setCodigo(e.target.value)}>
          {movimentadas.map((c) => <option key={c.codigo} value={c.codigo}>{c.codigo} — {c.nome}</option>)}
        </select>
      </div>
      {conta && (
        <>
          {/* razonete (conta T) */}
          <section className="cartao">
            <h2 style={{ textAlign: "center" }}>{conta.codigo} — {conta.nome}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "2px solid var(--destaque)", maxWidth: 720, width: "100%", margin: "0 auto" }}>
              <div style={{ borderRight: "2px solid var(--destaque)", padding: "8px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
                <span className="pequeno suave mono">DÉBITO</span>
                {Number(ini.devedor) > 0 && <LinhaT rotulo="Saldo inicial" valor={ini.devedor} />}
                {debitos.map((x) => <LinhaT key={x.chave} rotulo={x.l.fatoOrientado ? `Fato ${x.l.fatoOrientado}` : dataBR(x.l.data)} valor={x.valor} />)}
                <LinhaT rotulo="Total" valor={somaD} forte />
              </div>
              <div style={{ padding: "8px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
                <span className="pequeno suave mono">CRÉDITO</span>
                {Number(ini.credor) > 0 && <LinhaT rotulo="Saldo inicial" valor={ini.credor} />}
                {creditos.map((x) => <LinhaT key={x.chave} rotulo={x.l.fatoOrientado ? `Fato ${x.l.fatoOrientado}` : dataBR(x.l.data)} valor={x.valor} />)}
                <LinhaT rotulo="Total" valor={somaC} forte />
              </div>
            </div>
            <p style={{ textAlign: "center" }}>
              Saldo {somaD >= somaC ? "devedor" : "credor"}: <strong className="mono">{dinheiro(Math.abs(somaD - somaC))}</strong>
              {((somaD > somaC && conta.natureza === "Credora") || (somaC > somaD && conta.natureza === "Devedora")) && (
                <span className="pequeno" style={{ color: "var(--ocre)", display: "block" }}>Atenção: o saldo está do lado contrário à natureza da conta ({conta.natureza.toLowerCase()}). Confira os lançamentos.</span>
              )}
            </p>
          </section>
          {/* extrato */}
          <section className="cartao sem-padding">
            <div className="cartao-topo"><h2>Extrato da conta</h2><span className="pequeno suave">saldo acumulado no sentido da natureza ({conta.natureza.toLowerCase()})</span></div>
            <div className="tabela-caixa">
              <table>
                <thead><tr><th>Data</th><th>Histórico</th><th>Contrapartida</th><th style={{ textAlign: "right" }}>Débito</th><th style={{ textAlign: "right" }}>Crédito</th><th style={{ textAlign: "right" }}>Saldo</th></tr></thead>
                <tbody>
                  <tr><td colSpan={5} className="suave">Saldo inicial</td><td className="mono" style={{ textAlign: "right" }}>{numero(r.inicial)}</td></tr>
                  {r.linhas.map((x) => (
                    <tr key={x.chave}>
                      <td className="mono pequeno">{dataBR(x.l.data)}</td>
                      <td>{x.l.historico}</td>
                      <td className="pequeno">{x.contrapartida
                        ? <><span className="mono">{x.contrapartida}</span> {plano.porCodigo[x.contrapartida]?.nome}</>
                        : <span title={x.contrapartidas.map((c) => `${c} ${plano.porCodigo[c]?.nome || ""}`).join("\n")}>Diversas ({x.contrapartidas.length} contas)</span>}</td>
                      <td className="mono" style={{ textAlign: "right" }}>{x.debito ? numero(x.valor) : ""}</td>
                      <td className="mono" style={{ textAlign: "right" }}>{!x.debito ? numero(x.valor) : ""}</td>
                      <td className="mono" style={{ textAlign: "right", color: x.acumulado < 0 ? "var(--vermelho)" : undefined }}>{numero(x.acumulado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  );
}

function LinhaT({ rotulo, valor, forte }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, borderTop: forte ? "1px solid var(--linha)" : 0, paddingTop: forte ? 4 : 0, fontWeight: forte ? 600 : 400 }}>
      <span className="pequeno suave">{rotulo}</span><span className="mono">{numero(valor)}</span>
    </div>
  );
}

// ---------------- balancete de verificação ----------------
function Balancete({ empresa, plano, dados }) {
  const b = balancete(plano, dados.lancamentos, dados.saldos);
  return (
    <section className="cartao sem-padding">
      <div className="cartao-topo">
        <h2>Balancete de Verificação <span className="suave pequeno">· {empresa.razaoSocial}</span></h2>
        <span className={`selo ${b.fecha ? "verde" : "ocre"}`}>{b.fecha ? "Fechado: débitos = créditos" : "Não fecha — confira os lançamentos"}</span>
      </div>
      <div className="tabela-caixa">
        <table>
          <thead>
            <tr><th>Código</th><th>Conta</th><th style={{ textAlign: "right" }}>Débitos</th><th style={{ textAlign: "right" }}>Créditos</th><th style={{ textAlign: "right" }}>Saldo devedor</th><th style={{ textAlign: "right" }}>Saldo credor</th></tr>
          </thead>
          <tbody>
            {b.linhas.length === 0 && <tr><td colSpan={6} className="suave">Nenhuma conta movimentada ainda.</td></tr>}
            {b.linhas.map((x) => (
              <tr key={x.conta.codigo}>
                <td className="mono">{x.conta.codigo}</td>
                <td>{x.conta.nome}<span className="pequeno suave" style={{ display: "block" }}>{x.conta.grupo}</span></td>
                <td className="mono" style={{ textAlign: "right" }}>{numero(x.deb)}</td>
                <td className="mono" style={{ textAlign: "right" }}>{numero(x.cred)}</td>
                <td className="mono" style={{ textAlign: "right" }}>{x.dev ? numero(x.dev) : ""}</td>
                <td className="mono" style={{ textAlign: "right" }}>{x.cre ? numero(x.cre) : ""}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}><strong>Totais</strong></td>
              {["deb", "cred", "dev", "cre"].map((k) => <td key={k} className="mono" style={{ textAlign: "right" }}><strong>{numero(b.tot[k])}</strong></td>)}
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="pequeno suave" style={{ padding: "8px 18px 14px" }}>
        O balancete soma os saldos iniciais com todos os lançamentos. Os totais de débitos e créditos, e os de saldos devedores e credores,
        precisam ser iguais (partidas dobradas). Confira também se cada conta ficou com o saldo do lado da sua natureza.
      </p>
    </section>
  );
}

// ---------------- controle de estoque (kardex) ----------------
function ControleEstoque({ sessao, empresa, dados, plano, metodo, periodico, params, recarregar }) {
  const movs = movimentosDeEstoque(dados.lancamentos.filter((l) => !l.apuracaoCMV));
  const fichas = Object.fromEntries(Object.keys(METODOS).map((m) => [m, kardex(movs, m)]));
  const [ver, setVer] = useState(metodo);
  const conta = plano.porCodigo["1.1.3.01"];
  const saldoConta = (() => {
    const { deb, cred } = totaisDaConta(dados.lancamentos, dados.saldos, "1.1.3.01");
    return arred(deb - cred);
  })();
  const daEmpresa = fichas[metodo];
  const saidas = daEmpresa.linhas.filter((x) => x.tipo === "Saída");
  const divergentes = saidas.filter((x) => Math.abs(x.valorLancado - x.custoSaida) > 0.005);

  return (
    <>
      <section className="cartao">
        <h2>Controle de estoque</h2>
        <p>
          Parametrização da empresa: inventário <strong>{periodico ? "periódico" : "permanente"}</strong>, avaliado pelo <strong>{METODOS[metodo]?.longo}</strong>.
        </p>
        <p className="pequeno suave">
          {periodico
            ? "No inventário periódico, as compras entram no estoque e o CMV é apurado de uma vez no fim do período: CMV = Estoque Inicial + Compras − Estoque Final (contagem física)."
            : `No inventário permanente, cada venda tem a baixa do CMV pelo custo do método da empresa. A ficha é montada sozinha a partir dos lançamentos na conta ${conta ? `${conta.codigo} ${conta.nome}` : "de estoque"}.`}
          {" "}Para mudar estes parâmetros, use o menu Parametrização.
        </p>
      </section>

      {periodico && <ApuracaoPeriodica sessao={sessao} empresa={empresa} dados={dados} metodo={metodo} params={params} recarregar={recarregar} />}

      {periodico ? null : movs.length === 0 ? (
        <div className="aviso atencao">Nenhuma movimentação de estoque ainda. Lance compras (débito em Mercadorias para Revenda) e baixas de CMV (crédito em Mercadorias) com a quantidade.</div>
      ) : (
        <>
          <div className="grade" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
            {Object.entries(METODOS).map(([id, m]) => (
              <div key={id} className="cartao" style={{ gap: 4, borderColor: id === metodo ? "var(--destaque)" : undefined }}>
                <span className="pequeno suave">{m.nome}{id === metodo ? " · método da empresa" : ""}</span>
                <span>CMV <strong className="mono">{dinheiro(fichas[id].cmv)}</strong></span>
                <span>Estoque final <strong className="mono">{fichas[id].finalQtd} un. · {dinheiro(fichas[id].finalValor)}</strong></span>
              </div>
            ))}
          </div>

          <section className="cartao">
            <h2>Conferência com a escrituração ({METODOS[metodo].nome})</h2>
            <div className="aviso" style={{ background: Math.abs(saldoConta - daEmpresa.finalValor) < 0.005 ? undefined : "var(--ocre-claro)", color: Math.abs(saldoConta - daEmpresa.finalValor) < 0.005 ? undefined : "var(--ocre)" }}>
              Saldo da conta Mercadorias no razão: <strong className="mono">{dinheiro(saldoConta)}</strong> · pela ficha: <strong className="mono">{dinheiro(daEmpresa.finalValor)}</strong>
              {Math.abs(saldoConta - daEmpresa.finalValor) < 0.005 ? " — conferem." : " — não conferem: confira o custo lançado nas baixas abaixo."}
            </div>
            {saidas.length > 0 && (
              <div className="tabela-caixa">
                <table>
                  <thead><tr><th>Data</th><th>Baixa</th><th style={{ textAlign: "right" }}>Qtd</th><th style={{ textAlign: "right" }}>Custo lançado</th><th style={{ textAlign: "right" }}>Custo pelo método</th><th></th></tr></thead>
                  <tbody>
                    {saidas.map((x) => {
                      const ok = Math.abs(x.valorLancado - x.custoSaida) < 0.005;
                      return (
                        <tr key={x.id}>
                          <td className="mono pequeno">{dataBR(x.data)}</td>
                          <td>{x.fato ? `Fato ${x.fato} — ` : ""}{x.historico}</td>
                          <td className="mono" style={{ textAlign: "right" }}>{x.quantidade}</td>
                          <td className="mono" style={{ textAlign: "right" }}>{numero(x.valorLancado)}</td>
                          <td className="mono" style={{ textAlign: "right" }}>{numero(x.custoSaida)}</td>
                          <td>{x.insuficiente ? <span className="selo ocre">Estoque insuficiente</span> : ok ? <span className="selo verde">Confere</span> : <span className="selo ocre">Diferente</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {divergentes.length > 0 && <p className="pequeno suave">Para acertar, abra a aba Lançamentos e use "Corrigir" na baixa indicada.</p>}
          </section>

          <section className="cartao sem-padding">
            <div className="cartao-topo">
              <h2>Ficha de controle de estoque (kardex)</h2>
              <div className="abas" role="tablist" style={{ margin: 0 }}>
                {Object.entries(METODOS).map(([id, m]) => (
                  <button key={id} role="tab" aria-selected={ver === id} className={ver === id ? "ativo" : ""} onClick={() => setVer(id)}>{m.nome}</button>
                ))}
              </div>
            </div>
            <div className="tabela-caixa">
              <table>
                <thead>
                  <tr>
                    <th rowSpan={2}>Data</th><th rowSpan={2}>Histórico</th>
                    <th colSpan={3} style={{ textAlign: "center" }}>Entradas</th>
                    <th colSpan={3} style={{ textAlign: "center" }}>Saídas</th>
                    <th colSpan={2} style={{ textAlign: "center" }}>Saldo</th>
                  </tr>
                  <tr>
                    <th style={{ textAlign: "right" }}>Qtd</th><th style={{ textAlign: "right" }}>Unit.</th><th style={{ textAlign: "right" }}>Total</th>
                    <th style={{ textAlign: "right" }}>Qtd</th><th style={{ textAlign: "right" }}>Unit.</th><th style={{ textAlign: "right" }}>Total</th>
                    <th style={{ textAlign: "right" }}>Qtd</th><th style={{ textAlign: "right" }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {fichas[ver].linhas.map((x) => (
                    <tr key={x.id}>
                      <td className="mono pequeno">{dataBR(x.data)}</td>
                      <td className="pequeno">{x.fato ? `Fato ${x.fato} — ` : ""}{x.historico}{x.insuficiente && <span className="selo ocre" style={{ marginLeft: 6 }}>insuficiente</span>}
                        {x.lotes && x.lotes.length > 0 && <span className="suave" style={{ display: "block" }}>lotes: {x.lotes.map((l) => `${l.qtd} × ${numero(l.unit)}`).join(" · ")}</span>}
                        {ver === "media" && x.saldoQtd > 0 && <span className="suave" style={{ display: "block" }}>custo médio: {numero(x.medio)}</span>}
                      </td>
                      {x.tipo === "Entrada"
                        ? <><Num v={x.quantidade} int /><Num v={x.valorUnit} /><Num v={x.quantidade * x.valorUnit} /><td /><td /><td /></>
                        : <><td /><td /><td /><Num v={x.quantidade} int /><Num v={x.quantidade ? x.custoSaida / x.quantidade : 0} /><Num v={x.custoSaida} /></>}
                      <Num v={x.saldoQtd} int /><Num v={x.saldoValor} />
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr><td colSpan={2}><strong>CMV pelo {METODOS[ver].nome}</strong></td><td colSpan={3} /><td colSpan={2} /><td className="mono" style={{ textAlign: "right" }}><strong>{numero(fichas[ver].cmv)}</strong></td><td colSpan={2} /></tr>
                </tfoot>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  );
}

// ---------------- apuração do CMV no inventário periódico ----------------
function ApuracaoPeriodica({ sessao, empresa, dados, metodo, params, recarregar }) {
  const [qEI, setQEI] = useState(0);
  const [qEF, setQEF] = useState("");
  const [data, setData] = useState(params.contabil.exercicioFim);
  const [msg, setMsg] = useState({});
  const [ocupado, setOcupado] = useState(false);
  const r = apuracaoPeriodica(dados.lancamentos, dados.saldos, metodo, qEI, qEF);
  const pronto = qEF !== "" && !r.excede && r.cmv > 0 && !r.jaApurado;

  const lancar = async () => {
    setOcupado(true); setMsg({});
    try {
      await incluirLancamento(sessao, empresa.id, {
        data, historico: `Apuração do CMV — inventário periódico (${METODOS[metodo].nome}): EI ${numero(r.ei)} + Compras ${numero(r.vC)} − EF ${numero(r.ef)}`,
        documento: "", tipo: "livre", partidas: [
          { d: "D", conta: "6.2.01", valor: r.cmv, efeito: "CMV apurado" },
          { d: "C", conta: "1.1.3.01", valor: r.cmv, quantidade: r.qVendida, efeito: "Baixa do estoque" },
        ],
      }, null, { apuracaoCMV: true });
      await recarregar();
      setMsg({ texto: "Apuração do CMV lançada no Livro Diário." });
    } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
    setOcupado(false);
  };

  return (
    <section className="cartao">
      <h2>Apuração do CMV — inventário periódico</h2>
      <div className="linha-form">
        <div className="campo" style={{ flex: "0 1 220px" }}>
          <label htmlFor="ap-ei">Estoque inicial (unidades)</label>
          <input id="ap-ei" type="number" min="0" className="mono" value={qEI} onChange={(e) => setQEI(e.target.value)} />
        </div>
        <div className="campo" style={{ flex: "0 1 260px" }}>
          <label htmlFor="ap-ef">Estoque final contado (unidades)</label>
          <input id="ap-ef" type="number" min="0" className="mono" value={qEF} onChange={(e) => setQEF(e.target.value)} placeholder="contagem física" />
        </div>
        <div className="campo" style={{ flex: "0 1 200px" }}>
          <label htmlFor="ap-data">Data da apuração</label>
          <input id="ap-data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </div>
      </div>
      <div className="tabela-caixa">
        <table>
          <tbody>
            <tr><td>Estoque Inicial (EI)</td><td className="mono" style={{ textAlign: "right" }}>{r.qEI} un.</td><td className="mono" style={{ textAlign: "right" }}>{numero(r.ei)}</td></tr>
            <tr><td>(+) Compras do período ({r.compras.length} lançamento(s))</td><td className="mono" style={{ textAlign: "right" }}>{r.qC} un.</td><td className="mono" style={{ textAlign: "right" }}>{numero(r.vC)}</td></tr>
            <tr><td>(=) Mercadorias disponíveis para venda</td><td className="mono" style={{ textAlign: "right" }}>{r.qEI + r.qC} un.</td><td className="mono" style={{ textAlign: "right" }}>{numero(r.ei + r.vC)}</td></tr>
            <tr><td>(−) Estoque Final (EF) pelo {METODOS[metodo].nome}</td><td className="mono" style={{ textAlign: "right" }}>{r.qEF} un.</td><td className="mono" style={{ textAlign: "right" }}>{numero(r.ef)}</td></tr>
            <tr><td><strong>(=) Custo das Mercadorias Vendidas (CMV)</strong></td><td className="mono" style={{ textAlign: "right" }}>{r.qVendida} un.</td><td className="mono" style={{ textAlign: "right" }}><strong>{numero(r.cmv)}</strong></td></tr>
          </tbody>
        </table>
      </div>
      {r.excede && <div className="aviso erro">O estoque final contado é maior que as unidades disponíveis.</div>}
      {r.jaApurado
        ? <div className="aviso">O CMV deste período já foi apurado e lançado. Para refazer, exclua o lançamento "Apuração do CMV" na aba Lançamentos.</div>
        : <div><button className="botao" disabled={!pronto || ocupado} onClick={lancar}>{ocupado ? "Lançando…" : `Lançar a apuração do CMV (D 6.2.01 / C 1.1.3.01 ${dinheiro(r.cmv)})`}</button></div>}
      {msg.texto && <div className={`aviso ${msg.tipo || ""}`} role="status">{msg.texto}</div>}
    </section>
  );
}

// assinaturas das demonstrações (responsável técnico da parametrização)
function Assinaturas({ empresa, params }) {
  const pc = params.contabil;
  const local = `${empresa.municipio || ""}${empresa.uf ? `/${empresa.uf}` : ""}`;
  return (
    <div style={{ display: "flex", gap: 40, flexWrap: "wrap", marginTop: 18, paddingTop: 12, borderTop: "1px dashed var(--linha)" }}>
      <span className="pequeno suave" style={{ flexBasis: "100%" }}>{local}{local ? ", " : ""}{dataBR(pc.exercicioFim)}.</span>
      <div className="pequeno" style={{ minWidth: 220 }}>
        <div style={{ borderTop: "1px solid var(--tinta-suave)", paddingTop: 4 }}>{empresa.alunoNome}</div>
        <div className="suave">Sócio administrador</div>
      </div>
      <div className="pequeno" style={{ minWidth: 220 }}>
        <div style={{ borderTop: "1px solid var(--tinta-suave)", paddingTop: 4 }}>{pc.contadorNome || "—"}</div>
        <div className="suave">Contador · CRC {pc.contadorCrc || "—"}</div>
      </div>
    </div>
  );
}

function Num({ v, int }) {
  return <td className="mono" style={{ textAlign: "right", whiteSpace: "nowrap" }}>{int ? Number(v).toLocaleString("pt-BR") : numero(v)}</td>;
}

// ---------------- DRE ----------------
function LinhaValor({ rotulo, valor, tipo, recuo }) {
  const forte = tipo === "subtotal" || tipo === "final";
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0", paddingLeft: recuo ? 22 : 0,
      borderTop: forte ? "1px solid var(--linha)" : 0, fontWeight: forte ? 600 : 400,
      color: tipo === "final" ? "var(--destaque)" : recuo ? "var(--tinta-suave)" : undefined, fontSize: recuo ? 13 : tipo === "final" ? 17 : 15,
    }}>
      <span>{rotulo}</span>
      <span className="mono" style={{ color: valor < 0 && !recuo ? "var(--vermelho)" : undefined }}>{valor < 0 ? `(${numero(-valor)})` : numero(valor)}</span>
    </div>
  );
}

function Dre({ empresa, plano, dados, params, donoAluno }) {
  const d = dre(plano, dados.lancamentos, dados.saldos);
  const [detalhe, setDetalhe] = useState(true);
  // aluno: "montar e conferir" antes de ver a DRE pronta (aprovado em 06/10/2026)
  const assinatura = d.linhas.map((x) => x.valor.toFixed(2)).join("|");
  const chave = `ctc-montar-dre-${empresa.id}`;
  const [montada, setMontada] = useState(() => montagemConcluida(chave, assinatura));
  useEffect(() => { setMontada(montagemConcluida(chave, assinatura)); }, [assinatura]);
  const temMovimento = d.linhas.some((x) => Math.abs(x.valor) >= 0.005);
  if (donoAluno && temMovimento && !montada) {
    return (
      <MontarDemonstracao
        titulo="Monte a DRE da sua empresa"
        subtitulo={`${empresa.razaoSocial} · confira no Balancete os saldos das contas de resultado (grupos 4, 5 e 6)`}
        linhas={d.linhas}
        chave={chave}
        assinatura={assinatura}
        dica="Antes de ver a DRE pronta, monte-a você: preencha cada linha e os subtotais, na ordem. Linhas sem valor não aparecem. Se você lançar algo novo, a montagem recomeça."
        aoConcluir={() => setMontada(true)}
      />
    );
  }
  return (
    <section className="cartao">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <h2>Demonstração do Resultado do Exercício</h2>
          <span className="pequeno suave">{empresa.razaoSocial} · Lei 6.404/76 e NBC TG 26 · valores entre parênteses reduzem o resultado</span>
        </div>
        <label className="pequeno suave" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={detalhe} onChange={(e) => setDetalhe(e.target.checked)} style={{ minHeight: 0 }} /> Mostrar as contas
        </label>
      </div>
      <div style={{ maxWidth: 760 }}>
        {d.linhas.map((x) => (
          <div key={x.rotulo}>
            <LinhaValor {...x} />
            {detalhe && x.contas.map((c) => <LinhaValor key={c.conta.codigo} rotulo={`${c.conta.codigo} ${c.conta.nome}`} valor={c.valor} recuo />)}
          </div>
        ))}
      </div>
      <span className={`selo ${d.resultado >= 0 ? "verde" : "ocre"}`} style={{ alignSelf: "flex-start" }}>{d.resultado >= 0 ? "Lucro" : "Prejuízo"} de {dinheiro(Math.abs(d.resultado))}</span>
      {jaEncerrado(dados.lancamentos) && <p className="pequeno suave">O exercício já foi encerrado: a DRE ignora os lançamentos de encerramento e continua mostrando o resultado do período.</p>}
      <Assinaturas empresa={empresa} params={params} />
    </section>
  );
}

// ---------------- Encerramento (ARE) ----------------
function Encerramento({ sessao, empresa, plano, dados, recarregar, params, periodico }) {
  const encerrado = jaEncerrado(dados.lancamentos);
  const p = propostaEncerramento(plano, dados.lancamentos, dados.saldos);
  const ultimaData = dados.lancamentos.reduce((m, l) => (l.data > m ? l.data : m), empresa.inicioExercicio || "");
  const pc = params.contabil;
  // fim do período que contém o último lançamento (mês, trimestre ou exercício)
  const sugestao = (() => {
    if (pc.apuracao === "anual" || !ultimaData) return pc.exercicioFim;
    const d = new Date(`${ultimaData}T12:00:00`);
    const mesFim = pc.apuracao === "trimestral" ? Math.floor(d.getMonth() / 3) * 3 + 2 : d.getMonth();
    const fim = new Date(d.getFullYear(), mesFim + 1, 0, 12);
    const iso = fim.toISOString().slice(0, 10);
    return iso > pc.exercicioFim ? pc.exercicioFim : iso;
  })();
  const [data, setData] = useState(sugestao);
  const dataOk = fimDePeriodoValido(data, pc.apuracao, pc.exercicioFim) && data >= ultimaData;
  const faltaApurarCMV = periodico && dados.lancamentos.some((l) => !l.apuracaoCMV && partidasDe(l).some((p) => p.d === "D" && p.conta === "1.1.3.01")) && !dados.lancamentos.some((l) => l.apuracaoCMV);
  const [msg, setMsg] = useState({});
  const [ocupado, setOcupado] = useState(false);
  const nome = (c) => `${c} ${plano.porCodigo[c]?.nome || ""}`;
  const fazer = async (f, ok) => {
    setOcupado(true); setMsg({});
    try { await f(); await recarregar(); setMsg({ texto: ok }); } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
    setOcupado(false);
  };
  const doEncerramento = dados.lancamentos.filter((l) => l.encerramento);

  return (
    <>
      <section className="cartao">
        <h2>Encerramento do exercício — Apuração do Resultado (ARE)</h2>
        <p className="pequeno suave" style={{ maxWidth: 820 }}>
          No fim do exercício, as contas de resultado (receitas, despesas e custos) são zeradas contra a conta {nome("7.1.01")}.
          O saldo que sobra na ARE é o lucro ou o prejuízo, transferido para o Patrimônio Líquido
          ({nome(CONTA_LUCROS)} se for lucro; {nome("3.6")} se for prejuízo).
        </p>
        <div className="grade" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          <Indicador rotulo="Receitas a encerrar" valor={dinheiro(p.receitas)} />
          <Indicador rotulo="Despesas e custos a encerrar" valor={dinheiro(p.despesasCustos)} />
          <Indicador rotulo={p.resultado >= 0 ? "Lucro apurado" : "Prejuízo apurado"} valor={dinheiro(Math.abs(p.resultado))} />
        </div>
      </section>

      {!encerrado && (
        <section className="cartao sem-padding">
          <div className="cartao-topo"><h2>Lançamentos de encerramento propostos</h2><span className="pequeno suave">{p.propostos.length} lançamento(s)</span></div>
          <div className="tabela-caixa">
            <table>
              <thead><tr><th>Débito</th><th>Crédito</th><th style={{ textAlign: "right" }}>Valor</th><th>Histórico</th></tr></thead>
              <tbody>
                {p.propostos.length === 0 && <tr><td colSpan={4} className="suave">Não há saldo em contas de resultado para encerrar.</td></tr>}
                {p.propostos.map((x, i) => (
                  <tr key={i}>
                    <td className="pequeno">{nome(x.contaDebito)}</td>
                    <td className="pequeno">{nome(x.contaCredito)}</td>
                    <td className="mono" style={{ textAlign: "right" }}>{numero(x.valor)}</td>
                    <td className="pequeno suave">{x.historico}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "12px 18px 16px", display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div className="campo" style={{ flex: "0 1 200px" }}>
              <label htmlFor="are-data">Data do encerramento</label>
              <input id="are-data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
            <button className="botao" disabled={ocupado || !p.propostos.length || !dataOk || faltaApurarCMV}
              onClick={() => fazer(() => gravarEncerramento(sessao, empresa.id, p.propostos, data), "Exercício encerrado. Confira a DLPA e o Balanço Patrimonial.")}>
              {ocupado ? "Gravando…" : "Gravar os lançamentos de encerramento"}
            </button>
          </div>
          {!dataOk && data && <div className="aviso atencao" style={{ margin: "0 18px 16px" }}>
            Apuração {pc.apuracao}: a data do encerramento precisa ser {pc.apuracao === "anual" ? `o fim do exercício (${dataBR(pc.exercicioFim)})` : pc.apuracao === "mensal" ? "o último dia de um mês" : "o último dia de um trimestre (31/03, 30/06, 30/09 ou 31/12)"}, e não pode ser anterior ao último lançamento ({dataBR(ultimaData)}).
          </div>}
          {faltaApurarCMV && <div className="aviso atencao" style={{ margin: "0 18px 16px" }}>Inventário periódico: apure o CMV na aba Controle de estoque antes de encerrar.</div>}
        </section>
      )}

      {encerrado && (
        <section className="cartao sem-padding">
          <div className="cartao-topo">
            <h2>Exercício encerrado</h2>
            <button className="botao secundario pequeno" disabled={ocupado}
              onClick={() => window.confirm("Apagar os lançamentos de encerramento? Você poderá encerrar de novo depois.") && fazer(() => desfazerEncerramento(sessao, empresa.id), "Encerramento desfeito.")}>
              Desfazer encerramento
            </button>
          </div>
          <div className="tabela-caixa">
            <table>
              <thead><tr><th>Data</th><th>Débito</th><th>Crédito</th><th style={{ textAlign: "right" }}>Valor</th></tr></thead>
              <tbody>
                {doEncerramento.map((l) => (
                  <tr key={l.id}>
                    <td className="mono pequeno">{dataBR(l.data)}</td>
                    <td className="pequeno">{partidasDe(l).filter((p) => p.d === "D").map((p) => nome(p.conta)).join(", ")}</td>
                    <td className="pequeno">{partidasDe(l).filter((p) => p.d === "C").map((p) => nome(p.conta)).join(", ")}</td>
                    <td className="mono" style={{ textAlign: "right" }}>{numero(totalDoLancamento(l))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {p.propostos.length > 0 && <div className="aviso atencao" style={{ margin: 16 }}>Há lançamentos de resultado feitos depois do encerramento. Desfaça e encerre de novo para incluí-los.</div>}
        </section>
      )}
      {msg.texto && <div className={`aviso ${msg.tipo || ""}`} role="status">{msg.texto}</div>}
    </>
  );
}

// ---------------- DLPA ----------------
function Dlpa({ empresa, plano, dados, params }) {
  const d = dlpa(plano, dados.lancamentos, dados.saldos);
  const capital = Number(empresa.capitalSocial) || 0;
  const reservaLegalAtual = (() => {
    const { deb, cred } = totaisDaConta(dados.lancamentos, dados.saldos, "3.4.01");
    return arred(cred - deb);
  })();
  const sugestaoRL = d.resultado > 0 ? arred(Math.min(d.resultado * 0.05, Math.max(capital * 0.2 - reservaLegalAtual + d.destinacoes.filter((x) => x.conta?.codigo === "3.4.01").reduce((s, x) => s + x.valor, 0), 0))) : 0;
  const encerrado = jaEncerrado(dados.lancamentos);
  return (
    <>
      <section className="cartao">
        <h2>Demonstração de Lucros ou Prejuízos Acumulados (DLPA)</h2>
        <span className="pequeno suave">{empresa.razaoSocial} · mostra de onde veio e para onde foi o resultado</span>
        <div style={{ maxWidth: 760 }}>
          <LinhaValor rotulo="Saldo inicial de lucros ou prejuízos acumulados" valor={d.saldoInicial} />
          {d.outras.map((x) => <LinhaValor key={x.chave} rotulo={`(±) ${x.l.historico}`} valor={x.valor} recuo />)}
          <LinhaValor rotulo={d.resultado >= 0 ? "(+) Lucro líquido do exercício" : "(-) Prejuízo líquido do exercício"} valor={d.resultado} />
          <LinhaValor rotulo="(=) Resultado à disposição" valor={arred(d.saldoInicial + d.totalOutras + d.resultado)} tipo="subtotal" />
          {d.destinacoes.length === 0 && <LinhaValor rotulo="(-) Destinações (reservas e dividendos)" valor={0} />}
          {d.destinacoes.map((x) => <LinhaValor key={x.chave} rotulo={`(-) ${x.conta?.nome || "Destinação"}`} valor={-x.valor} />)}
          <LinhaValor rotulo="(=) Saldo final de lucros ou prejuízos acumulados" valor={d.saldoFinal} tipo="final" />
        </div>
        <Assinaturas empresa={empresa} params={params} />
      </section>
      <section className="cartao">
        <h2>Como destinar o lucro</h2>
        <p className="pequeno" style={{ maxWidth: 820 }}>
          Depois do encerramento, o lucro fica em <span className="mono">{CONTA_LUCROS}</span> {plano.porCodigo[CONTA_LUCROS]?.nome}. As destinações
          são lançadas normalmente na aba Lançamentos, a <strong>débito de {CONTA_LUCROS}</strong> e a crédito de:
        </p>
        <ul className="pequeno" style={{ margin: 0, paddingLeft: 20 }}>
          <li><span className="mono">3.4.01</span> Reserva Legal — 5% do lucro líquido, até atingir 20% do capital social (Lei 6.404/76, art. 193).
            {sugestaoRL > 0 && <strong> Sugestão para esta empresa: {dinheiro(sugestaoRL)}.</strong>}</li>
          <li><span className="mono">3.4.02 a 3.4.05</span> outras reservas de lucros (estatutária, para expansão etc.).</li>
          <li><span className="mono">2.1.7.01</span> Dividendos a Pagar — a parte distribuída aos sócios. Parametrização: {Number(params.contabil.dividendosPct)}% do lucro depois da Reserva Legal.
            {d.resultado > 0 && <strong> Sugestão: {dinheiro(arred((d.resultado - sugestaoRL) * Number(params.contabil.dividendosPct) / 100))}.</strong>}</li>
        </ul>
        {!encerrado && <div className="aviso atencao">O exercício ainda não foi encerrado. Faça primeiro o Encerramento (ARE).</div>}
      </section>
    </>
  );
}

// ---------------- Balanço Patrimonial ----------------
function NoBalanco({ no, nivel = 0 }) {
  if (!no) return null;
  return (
    <>
      {nivel > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "4px 0", paddingLeft: (nivel - 1) * 14, fontWeight: nivel <= 2 ? 600 : 400, fontSize: nivel <= 2 ? 14 : 13, color: nivel > 3 ? "var(--tinta-media)" : undefined }}>
          <span>{no.conta.nome}</span>
          <span className="mono">{no.valor < 0 ? `(${numero(-no.valor)})` : numero(no.valor)}</span>
        </div>
      )}
      {no.filhos.map((f) => <NoBalanco key={f.conta.codigo} no={f} nivel={nivel + 1} />)}
    </>
  );
}

function Balanco({ empresa, plano, dados, params }) {
  const b = balanco(plano, dados.lancamentos, dados.saldos);
  const lado = { flex: "1 1 360px", display: "flex", flexDirection: "column", gap: 2 };
  const total = (rotulo, valor) => (
    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid var(--destaque)", paddingTop: 8, marginTop: 8, fontWeight: 700 }}>
      <span>{rotulo}</span><span className="mono">{numero(valor)}</span>
    </div>
  );
  return (
    <section className="cartao">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <h2>Balanço Patrimonial</h2>
          <span className="pequeno suave">{empresa.razaoSocial} · {empresa.cnpj}</span>
        </div>
        <span className={`selo ${b.fecha ? "verde" : "ocre"}`}>{b.fecha ? "Ativo = Passivo + Patrimônio Líquido" : "Não fecha — confira os lançamentos"}</span>
      </div>
      <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={lado}>
          <h3 style={{ margin: "6px 0", color: "var(--destaque)" }}>ATIVO</h3>
          <NoBalanco no={b.ativo} />
          {total("TOTAL DO ATIVO", b.totAtivo)}
        </div>
        <div style={lado}>
          <h3 style={{ margin: "6px 0", color: "var(--destaque)" }}>PASSIVO</h3>
          <NoBalanco no={b.passivo} />
          {total("Total do Passivo", b.totPassivo)}
          <h3 style={{ margin: "14px 0 6px", color: "var(--destaque)" }}>PATRIMÔNIO LÍQUIDO</h3>
          <NoBalanco no={b.pl} />
          {Math.abs(b.pendente) >= 0.005 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontStyle: "italic" }}>
              <span>Resultado do período ainda não encerrado</span><span className="mono">{numero(b.pendente)}</span>
            </div>
          )}
          {total("Total do Patrimônio Líquido", b.totPL)}
          {total("TOTAL DO PASSIVO + PL", arred(b.totPassivo + b.totPL))}
        </div>
      </div>
      <Assinaturas empresa={empresa} params={params} />
      {Math.abs(b.pendente) >= 0.005 && <p className="pequeno suave">O exercício ainda não foi encerrado: o resultado aparece separado no PL. Depois do Encerramento (ARE), ele passa para a conta {CONTA_LUCROS} {plano.porCodigo[CONTA_LUCROS]?.nome}.</p>}
    </section>
  );
}
