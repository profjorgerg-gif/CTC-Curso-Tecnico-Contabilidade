// Escrituração da empresa (CB): Saldos iniciais, Lançamentos (10 fatos orientados
// + lançamento livre), Razão por conta e Balancete de Verificação.
import { useEffect, useMemo, useState } from "react";
import { useTurmas } from "../lib/useTurmas";
import { traduzirErro } from "../lib/sessao";
import { disciplinaPorId } from "../dados/disciplinas";
import { garantirEmpresa, lerEmpresa, salvarMetodoEstoque } from "../lib/empresas";
import { custoDaSaida, kardex, METODO_PADRAO, METODOS, movimentosDeEstoque } from "../lib/estoque";
import { semAcento } from "../lib/arquivos";
import {
  arred, balancete, CONTAS_ABERTURA, CONTAS_ESTOQUE, conferirLancamento, dataBR, dinheiro,
  FATOS_ORIENTADOS, numero, razao, usePlano,
} from "../lib/contabil";
import {
  alterarLancamento, excluirLancamento, incluirLancamento, lerEscrituracao, salvarSaldos,
} from "../lib/escrituracao";

const ABAS = [["saldos", "Saldos iniciais"], ["lancamentos", "Lançamentos"], ["razao", "Razão por conta"], ["estoque", "Controle de estoque"], ["balancete", "Balancete"]];

export default function Escrituracao({ sessao, papel, ir, rota }) {
  return papel === "aluno"
    ? <EscrituracaoDoAluno sessao={sessao} ir={ir} />
    : <EscrituracaoPeloProfessor sessao={sessao} ir={ir} turmaId={rota[0]} matricula={rota[1]} />;
}

// ---------------- aluno ----------------
function EscrituracaoDoAluno({ sessao, ir }) {
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
      {empresa?.cadastroCompleto && <Livros key={empresa.id} sessao={sessao} empresa={empresa} donoAluno />}
    </>
  );
}

// ---------------- professor: escrituração de um aluno ----------------
function EscrituracaoPeloProfessor({ sessao, ir, turmaId, matricula }) {
  const [empresa, setEmpresa] = useState(undefined);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if (!turmaId || !matricula) return;
    lerEmpresa(turmaId, matricula).then(setEmpresa).catch((e) => setMsg(traduzirErro(e)));
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
      {empresa && <Livros key={empresa.id} sessao={sessao} empresa={empresa} />}
    </>
  );
}

// ---------------- os livros da empresa ----------------
function Livros({ sessao, empresa, donoAluno }) {
  const { plano, erro: erroPlano } = usePlano();
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");
  const [aba, setAba] = useState("lancamentos");
  const [metodo, setMetodo] = useState(empresa.metodoEstoque || METODO_PADRAO);
  const mudarMetodo = async (m) => { setMetodo(m); await salvarMetodoEstoque(empresa, m).catch((e) => setErro(traduzirErro(e))); };
  const carregar = () => lerEscrituracao(empresa.id).then(setDados).catch((e) => setErro(traduzirErro(e)));
  useEffect(() => { carregar(); }, [empresa.id]);
  useEffect(() => { if (dados && !dados.saldosGravados) setAba("saldos"); }, [!!dados]);

  if (erroPlano || erro) return <div className="aviso erro">{erroPlano || erro}</div>;
  if (!plano || !dados) return <p className="suave">Carregando os livros…</p>;
  const props = { sessao, empresa, plano, dados, recarregar: carregar, donoAluno, metodo, mudarMetodo };

  return (
    <>
      <section className="cartao" style={{ flexDirection: "row", flexWrap: "wrap", gap: 18, alignItems: "center" }}>
        <div style={{ flex: "1 1 280px" }}>
          <h2>{empresa.razaoSocial}</h2>
          <span className="pequeno suave mono">{empresa.cnpj}</span>
          <span className="pequeno suave"> · {empresa.atividade} · {empresa.regime} · exercício a partir de {dataBR(empresa.inicioExercicio)}</span>
        </div>
        <Indicador rotulo="Lançamentos" valor={dados.lancamentos.length} />
        <Indicador rotulo="Fatos orientados" valor={`${Math.min(dados.lancamentos.filter((l) => l.fatoOrientado).length, FATOS_ORIENTADOS.length)}/${FATOS_ORIENTADOS.length}`} />
      </section>
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
const formVazio = (empresa) => ({
  data: empresa.inicioExercicio || new Date().toISOString().slice(0, 10),
  historico: "", documento: "", contaDebito: "", contaCredito: "", valor: "", quantidade: "", valorUnitario: "",
});

function Lancamentos({ sessao, empresa, plano, dados, recarregar, donoAluno, metodo }) {
  const lista = dados.lancamentos;
  const [form, setForm] = useState(() => formVazio(empresa));
  const [editando, setEditando] = useState(null);
  const [erros, setErros] = useState([]);
  const [msg, setMsg] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [busca, setBusca] = useState("");
  const [vendoFato, setVendoFato] = useState(null);

  const feitos = new Set(lista.filter((l) => l.fatoOrientado).map((l) => l.fatoOrientado));
  const proximoFato = FATOS_ORIENTADOS.findIndex((_, i) => !feitos.has(i + 1)) + 1; // 0 = todos feitos
  const etapaGuiada = donoAluno && proximoFato > 0 && !editando;
  const fatoNaTela = vendoFato || proximoFato;

  const compraEstoque = CONTAS_ESTOQUE.includes(form.contaDebito);
  const baixaEstoque = CONTAS_ESTOQUE.includes(form.contaCredito);
  // na compra, o valor é quantidade × valor unitário
  useEffect(() => {
    if (compraEstoque && Number(form.quantidade) > 0 && Number(form.valorUnitario) > 0) {
      setForm((f) => ({ ...f, valor: String(arred(Number(f.quantidade) * Number(f.valorUnitario))) }));
    }
  }, [compraEstoque, form.quantidade, form.valorUnitario]);

  const muda = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const cancelar = () => { setEditando(null); setForm(formVazio(empresa)); setErros([]); };

  const salvar = async (e) => {
    e.preventDefault();
    const problemas = conferirLancamento(form, plano);
    setErros(problemas); setMsg({});
    if (problemas.length) return;
    setSalvando(true);
    try {
      if (editando) await alterarLancamento(sessao, empresa.id, editando, form);
      else await incluirLancamento(sessao, empresa.id, form, etapaGuiada ? proximoFato : null);
      setMsg({ texto: editando ? "Lançamento corrigido." : etapaGuiada ? `Fato ${proximoFato} lançado.` : "Lançamento incluído." });
      setVendoFato(null);
      cancelar();
      setForm((f) => ({ ...f, data: form.data })); // mantém a data para o próximo
      await recarregar();
    } catch (err) { setMsg({ tipo: "erro", texto: traduzirErro(err) }); }
    setSalvando(false);
  };

  const editar = (l) => {
    setEditando(l.id); setErros([]); setMsg({});
    setForm({ data: l.data, historico: l.historico, documento: l.documento || "", contaDebito: l.contaDebito, contaCredito: l.contaCredito, valor: String(l.valor), quantidade: l.quantidade ? String(l.quantidade) : "", valorUnitario: l.valorUnitario ? String(l.valorUnitario) : "" });
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
      .filter((l) => !b || semAcento(`${l.historico} ${l.contaDebito} ${l.contaCredito} ${l.documento || ""}`).includes(b));
  }, [lista, busca]);
  const nome = (c) => plano.porCodigo[c]?.nome || c;

  return (
    <>
      {etapaGuiada && (
        <section className="cartao" style={{ borderColor: "var(--destaque)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span className="mono pequeno" style={{ color: "var(--destaque)", fontWeight: 600 }}>
              FATO CONTÁBIL {String(fatoNaTela).padStart(2, "0")} DE {FATOS_ORIENTADOS.length}
            </span>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {feitos.has(fatoNaTela) ? <span className="selo verde">Já lançado</span> : <span className="selo ocre">Pendente — lance no formulário abaixo</span>}
              <button className="botao secundario pequeno" aria-label="Fato anterior" disabled={fatoNaTela <= 1} onClick={() => setVendoFato(fatoNaTela - 1)}>◀</button>
              <button className="botao secundario pequeno" aria-label="Próximo fato" disabled={fatoNaTela >= proximoFato} onClick={() => setVendoFato(fatoNaTela + 1 >= proximoFato ? null : fatoNaTela + 1)}>▶</button>
            </div>
          </div>
          <p style={{ fontSize: 16 }}>{FATOS_ORIENTADOS[fatoNaTela - 1]}</p>
          {fatoNaTela !== proximoFato && <p className="pequeno suave">Você está relendo um fato. O formulário continua registrando o fato {proximoFato}.</p>}
        </section>
      )}
      {donoAluno && proximoFato === 0 && !editando && (
        <div className="aviso">Você concluiu os {FATOS_ORIENTADOS.length} fatos orientados. Agora registre as operações que o professor indicar em sala.</div>
      )}

      <form className="cartao" onSubmit={salvar}>
        <h2>{editando ? "Corrigir lançamento" : etapaGuiada ? `Lançar o fato ${proximoFato}` : "Novo lançamento"}</h2>
        <p className="pequeno suave">Partidas dobradas: uma conta a débito e uma a crédito, sempre no mesmo valor.</p>
        <div className="linha-form">
          <div className="campo" style={{ flex: "0 1 180px" }}>
            <label htmlFor="l-data">Data</label>
            <input id="l-data" type="date" value={form.data} onChange={muda("data")} />
          </div>
          <div className="campo" style={{ flex: "3 1 320px" }}>
            <label htmlFor="l-hist">Histórico</label>
            <input id="l-hist" value={form.historico} onChange={muda("historico")} maxLength={200} placeholder="Ex.: Compra de mercadorias à vista, NF 123" />
          </div>
          <div className="campo" style={{ flex: "0 1 160px" }}>
            <label htmlFor="l-doc">Documento (opcional)</label>
            <input id="l-doc" value={form.documento} onChange={muda("documento")} maxLength={40} />
          </div>
        </div>
        <div className="linha-form" style={{ alignItems: "flex-start" }}>
          <CampoConta id="l-deb" rotulo="Conta a DÉBITO" valor={form.contaDebito} aoMudar={(c) => setForm((f) => ({ ...f, contaDebito: c }))} plano={plano} />
          <CampoConta id="l-cred" rotulo="Conta a CRÉDITO" valor={form.contaCredito} aoMudar={(c) => setForm((f) => ({ ...f, contaCredito: c }))} plano={plano} />
        </div>
        <div className="linha-form">
          {(compraEstoque || baixaEstoque) && (
            <div className="campo" style={{ flex: "0 1 160px" }}>
              <label htmlFor="l-qtd">Quantidade (unidades)</label>
              <input id="l-qtd" type="number" min="0" step="1" className="mono" value={form.quantidade} onChange={muda("quantidade")} />
            </div>
          )}
          {compraEstoque && (
            <div className="campo" style={{ flex: "0 1 180px" }}>
              <label htmlFor="l-unit">Valor unitário (R$)</label>
              <input id="l-unit" type="number" min="0" step="0.01" className="mono" value={form.valorUnitario} onChange={muda("valorUnitario")} />
            </div>
          )}
          <div className="campo" style={{ flex: "0 1 200px" }}>
            <label htmlFor="l-valor">Valor (R$)</label>
            <input id="l-valor" type="number" min="0" step="0.01" className="mono" value={form.valor} onChange={muda("valor")} readOnly={compraEstoque && Number(form.valorUnitario) > 0} />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginLeft: "auto" }}>
            {editando && <button type="button" className="botao secundario" onClick={cancelar}>Cancelar</button>}
            <button className="botao" disabled={salvando}>{salvando ? "Salvando…" : editando ? "Salvar correção" : "Lançar"}</button>
          </div>
        </div>
        {baixaEstoque && Number(form.quantidade) > 0 && (() => {
          const c = custoDaSaida(lista, metodo, form.quantidade, form.data, editando);
          return (
            <div className={`aviso ${c.insuficiente ? "erro" : ""}`} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              {c.insuficiente
                ? <span>Estoque insuficiente: até esta data há {c.disponivel} unidade(s) disponível(is).</span>
                : <span>Custo de {form.quantidade} un. pelo método da empresa ({METODOS[metodo].nome}): <strong className="mono">{dinheiro(c.custo)}</strong>
                    {Number(form.valor) > 0 && Math.abs(Number(form.valor) - c.custo) > 0.005 && <> — o valor digitado ({dinheiro(form.valor)}) está diferente.</>}
                  </span>}
              {!c.insuficiente && Math.abs(Number(form.valor) - c.custo) > 0.005 && (
                <button type="button" className="botao secundario pequeno" onClick={() => setForm((f) => ({ ...f, valor: String(c.custo) }))}>Usar este custo</button>
              )}
            </div>
          );
        })()}
        {erros.length > 0 && <div className="aviso atencao pequeno">{erros.map((e) => <div key={e}>{e}</div>)}</div>}
        {msg.texto && <div className={`aviso ${msg.tipo || ""}`} role="status">{msg.texto}</div>}
      </form>

      <section className="cartao sem-padding">
        <div className="cartao-topo">
          <h2>Livro Diário <span className="suave pequeno">· {lista.length} lançamento(s) · {dinheiro(lista.reduce((s, l) => s + Number(l.valor), 0))}</span></h2>
          <input aria-label="Buscar lançamento" placeholder="Buscar histórico ou conta" value={busca} onChange={(e) => setBusca(e.target.value)} style={{ flex: "0 1 240px" }} />
        </div>
        <div className="tabela-caixa" style={{ maxHeight: 560, overflowY: "auto" }}>
          <table>
            <thead><tr><th>Data</th><th>Histórico</th><th>Débito</th><th>Crédito</th><th style={{ textAlign: "right" }}>Valor</th><th></th></tr></thead>
            <tbody>
              {ordenados.length === 0 && <tr><td colSpan={6} className="suave">Nenhum lançamento ainda.</td></tr>}
              {ordenados.map((l) => (
                <tr key={l.id}>
                  <td className="mono pequeno" style={{ whiteSpace: "nowrap" }}>{dataBR(l.data)}</td>
                  <td>
                    {l.fatoOrientado && <span className="selo cheio" style={{ marginRight: 6 }}>Fato {l.fatoOrientado}</span>}
                    {l.historico}
                    {(l.quantidade || l.documento || l.alteradoPor) && (
                      <span className="pequeno suave" style={{ display: "block" }}>
                        {l.quantidade ? `${l.quantidade} un.${l.valorUnitario ? ` × ${dinheiro(l.valorUnitario)}` : ""}` : ""}
                        {l.documento ? ` · doc. ${l.documento}` : ""}
                        {l.alteradoPor && l.alteradoPor.papel !== "aluno" ? ` · corrigido por ${l.alteradoPor.nome}` : ""}
                      </span>
                    )}
                  </td>
                  <td className="pequeno"><span className="mono">{l.contaDebito}</span> {nome(l.contaDebito)}</td>
                  <td className="pequeno"><span className="mono">{l.contaCredito}</span> {nome(l.contaCredito)}</td>
                  <td className="mono" style={{ textAlign: "right", whiteSpace: "nowrap" }}>{numero(l.valor)}</td>
                  <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                    <button className="botao secundario pequeno" onClick={() => editar(l)}>Corrigir</button>{" "}
                    <button className="botao perigo pequeno" onClick={() => excluir(l)}>Excluir</button>
                  </td>
                </tr>
              ))}
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
    const usadas = new Set([...Object.keys(dados.saldos), ...dados.lancamentos.flatMap((l) => [l.contaDebito, l.contaCredito])]);
    return plano.lancaveis.filter((c) => usadas.has(c.codigo));
  }, [plano, dados]);
  const [codigo, setCodigo] = useState(movimentadas[0]?.codigo || "");
  const conta = plano.porCodigo[codigo];
  const r = conta ? razao(conta, dados.lancamentos, dados.saldos) : null;
  const debitos = r ? r.linhas.filter((x) => x.debito) : [];
  const creditos = r ? r.linhas.filter((x) => !x.debito) : [];
  const ini = dados.saldos[codigo] || {};
  const somaD = arred(debitos.reduce((s, x) => s + Number(x.l.valor), Number(ini.devedor || 0)));
  const somaC = arred(creditos.reduce((s, x) => s + Number(x.l.valor), Number(ini.credor || 0)));

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
                {debitos.map((x) => <LinhaT key={x.l.id} rotulo={x.l.fatoOrientado ? `Fato ${x.l.fatoOrientado}` : dataBR(x.l.data)} valor={x.l.valor} />)}
                <LinhaT rotulo="Total" valor={somaD} forte />
              </div>
              <div style={{ padding: "8px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
                <span className="pequeno suave mono">CRÉDITO</span>
                {Number(ini.credor) > 0 && <LinhaT rotulo="Saldo inicial" valor={ini.credor} />}
                {creditos.map((x) => <LinhaT key={x.l.id} rotulo={x.l.fatoOrientado ? `Fato ${x.l.fatoOrientado}` : dataBR(x.l.data)} valor={x.l.valor} />)}
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
                    <tr key={x.l.id}>
                      <td className="mono pequeno">{dataBR(x.l.data)}</td>
                      <td>{x.l.historico}</td>
                      <td className="pequeno"><span className="mono">{x.contrapartida}</span> {plano.porCodigo[x.contrapartida]?.nome}</td>
                      <td className="mono" style={{ textAlign: "right" }}>{x.debito ? numero(x.l.valor) : ""}</td>
                      <td className="mono" style={{ textAlign: "right" }}>{!x.debito ? numero(x.l.valor) : ""}</td>
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
function ControleEstoque({ dados, plano, metodo, mudarMetodo }) {
  const movs = movimentosDeEstoque(dados.lancamentos);
  const fichas = Object.fromEntries(Object.keys(METODOS).map((m) => [m, kardex(movs, m)]));
  const [ver, setVer] = useState(metodo);
  const conta = plano.porCodigo["1.1.3.01"];
  const saldoConta = (() => {
    const ini = dados.saldos["1.1.3.01"] || {};
    let v = Number(ini.devedor || 0) - Number(ini.credor || 0);
    for (const l of dados.lancamentos) { if (l.contaDebito === "1.1.3.01") v += Number(l.valor); if (l.contaCredito === "1.1.3.01") v -= Number(l.valor); }
    return arred(v);
  })();
  const daEmpresa = fichas[metodo];
  const saidas = daEmpresa.linhas.filter((x) => x.tipo === "Saída");
  const divergentes = saidas.filter((x) => Math.abs(x.valorLancado - x.custoSaida) > 0.005);

  return (
    <>
      <section className="cartao">
        <h2>Método de avaliação do estoque da empresa</h2>
        <div className="abas" role="radiogroup" aria-label="Método de avaliação" style={{ margin: 0 }}>
          {Object.entries(METODOS).map(([id, m]) => (
            <button key={id} role="radio" aria-checked={metodo === id} className={metodo === id ? "ativo" : ""} onClick={() => mudarMetodo(id)}>{m.nome}</button>
          ))}
        </div>
        <div className="grade" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          <div className="pequeno"><strong>PEPS</strong> — as saídas são baixadas pelo custo dos lotes mais antigos.</div>
          <div className="pequeno"><strong>UEPS</strong> — as saídas são baixadas pelo custo dos lotes mais recentes. <span style={{ color: "var(--ocre)" }}>Não é aceito pela legislação fiscal brasileira nem pelo CPC 16 — aqui só para comparação.</span></div>
          <div className="pequeno"><strong>Média Ponderada Móvel</strong> — a cada entrada, recalcula o custo médio; as saídas usam esse custo médio.</div>
        </div>
        <p className="pequeno suave">O método escolhido é usado para conferir o CMV nos lançamentos de baixa de estoque. A ficha é montada sozinha a partir dos lançamentos na conta {conta ? `${conta.codigo} ${conta.nome}` : "de estoque"}.</p>
      </section>

      {movs.length === 0 ? (
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

function Num({ v, int }) {
  return <td className="mono" style={{ textAlign: "right", whiteSpace: "nowrap" }}>{int ? Number(v).toLocaleString("pt-BR") : numero(v)}</td>;
}
