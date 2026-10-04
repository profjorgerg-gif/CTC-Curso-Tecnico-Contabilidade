// Empresa individual do aluno (uma por turma)
import { useEffect, useState } from "react";
import { useTurmas } from "../lib/useTurmas";
import { destravarParametros } from "../lib/parametros";
import { traduzirErro } from "../lib/sessao";
import { disciplinaPorId } from "../dados/disciplinas";
import {
  conferirCadastro, criarEmpresasQueFaltam, empresasDaTurma,
  garantirEmpresa, gerarCnpjFicticio, lerEmpresa, salvarEmpresa,
} from "../lib/empresas";

const dinheiro = (v) => (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ---------------- aluno: Minha empresa ----------------
export default function MinhaEmpresa({ sessao }) {
  const { turmas, carregando, erro } = useTurmas(sessao);
  const [turmaId, setTurmaId] = useState("");
  const [empresa, setEmpresa] = useState(null);
  const [outras, setOutras] = useState([]);
  const [msg, setMsg] = useState({});
  const aluno = { nome: sessao.perfil?.nome || sessao.usuario.displayName || "Aluno", matricula: sessao.perfil?.matricula };
  const turma = turmas.find((t) => t.id === turmaId) || turmas[0];

  useEffect(() => {
    if (!turma) return;
    setEmpresa(null); setMsg({});
    garantirEmpresa(turma, aluno).then(setEmpresa).catch((e) => setMsg({ tipo: "erro", texto: traduzirErro(e) }));
    // empresas das outras turmas (para copiar o cadastro, se o aluno quiser manter a mesma empresa)
    Promise.all(turmas.filter((t) => t.id !== turma.id).map((t) => lerEmpresa(t.id, aluno.matricula).catch(() => null)))
      .then((l) => setOutras(l.filter((e) => e?.cadastroCompleto)));
  }, [turma?.id]);

  return (
    <>
      <div>
        <h1>Minha empresa</h1>
        <p className="suave" style={{ maxWidth: 760 }}>
          Em cada turma você tem a sua própria empresa. É nela que você vai registrar os saldos iniciais, os lançamentos,
          o estoque e montar as demonstrações. Complete o cadastro e depois faça a Parametrização.
        </p>
      </div>
      {erro && <div className="aviso erro">{erro}</div>}
      {!carregando && turmas.length === 0 && <div className="aviso atencao">Você ainda não está em nenhuma turma.</div>}
      {turmas.length > 1 && (
        <div className="campo" style={{ maxWidth: 520, flex: "none" }}>
          <label htmlFor="emp-turma">Turma</label>
          <select id="emp-turma" value={turma?.id || ""} onChange={(e) => setTurmaId(e.target.value)}>
            {turmas.map((t) => <option key={t.id} value={t.id}>{t.nome} · {disciplinaPorId(t.disciplina)?.sigla} · {t.semestre}</option>)}
          </select>
        </div>
      )}
      {msg.texto && <div className={`aviso ${msg.tipo || ""}`}>{msg.texto}</div>}
      {turma && !empresa && !msg.texto && <p className="suave">Abrindo a sua empresa…</p>}
      {empresa && (
        <FormEmpresa key={empresa.id} empresa={empresa} outras={outras}
          aoSalvar={async () => setEmpresa(await lerEmpresa(turma.id, aluno.matricula))} />
      )}
    </>
  );
}

// ---------------- formulário (aluno e professor) ----------------
export function FormEmpresa({ empresa, outras = [], aoSalvar, compacto }) {
  const [f, setF] = useState(empresa);
  const [msg, setMsg] = useState({});
  const [salvando, setSalvando] = useState(false);
  const erros = conferirCadastro(f);
  const muda = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const salvar = async (e) => {
    e.preventDefault();
    setSalvando(true); setMsg({});
    try {
      await salvarEmpresa(empresa, f);
      setMsg({ texto: erros.length ? "Cadastro salvo. Ainda falta completar alguns dados." : "Cadastro completo e salvo." });
      await aoSalvar?.();
    } catch (err) { setMsg({ tipo: "erro", texto: traduzirErro(err) }); }
    setSalvando(false);
  };

  const copiar = (id) => {
    const o = outras.find((x) => x.id === id);
    if (o) setF({ ...f, razaoSocial: o.razaoSocial, nomeFantasia: o.nomeFantasia, cnpj: o.cnpj, atividade: o.atividade, ramo: o.ramo, regime: o.regime, municipio: o.municipio, uf: o.uf, capitalSocial: o.capitalSocial });
  };

  return (
    <form className="cartao" onSubmit={salvar}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <h2>{f.razaoSocial || "Empresa"}</h2>
          <span className="pequeno suave">Responsável: {empresa.alunoNome} · matrícula <span className="mono">{empresa.matricula}</span></span>
        </div>
        <span className={`selo ${empresa.cadastroCompleto ? "verde" : "ocre"}`}>{empresa.cadastroCompleto ? "Cadastro completo" : "Cadastro incompleto"}</span>
      </div>

      {outras.length > 0 && !compacto && (
        <div className="aviso" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span>Quer continuar com a mesma empresa de outra turma?</span>
          <select aria-label="Copiar cadastro de outra empresa" defaultValue="" onChange={(e) => copiar(e.target.value)} style={{ minHeight: 36 }}>
            <option value="" disabled>Copiar o cadastro de…</option>
            {outras.map((o) => <option key={o.id} value={o.id}>{o.razaoSocial} ({o.semestre})</option>)}
          </select>
        </div>
      )}

      <div className="linha-form">
        <div className="campo" style={{ flex: "2 1 320px" }}>
          <label htmlFor={`rs-${empresa.id}`}>Razão social</label>
          <input id={`rs-${empresa.id}`} value={f.razaoSocial} onChange={muda("razaoSocial")} maxLength={120} />
        </div>
        <div className="campo">
          <label htmlFor={`nf-${empresa.id}`}>Nome fantasia</label>
          <input id={`nf-${empresa.id}`} value={f.nomeFantasia} onChange={muda("nomeFantasia")} maxLength={80} />
        </div>
      </div>
      <div className="linha-form">
        <div className="campo" style={{ flex: "1 1 260px" }}>
          <label htmlFor={`cnpj-${empresa.id}`}>CNPJ (fictício)</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input id={`cnpj-${empresa.id}`} className="mono" value={f.cnpj} onChange={muda("cnpj")} style={{ flex: 1, minWidth: 0 }} />
            <button type="button" className="botao secundario pequeno" style={{ minHeight: 44 }} onClick={() => setF({ ...f, cnpj: gerarCnpjFicticio() })}>Gerar</button>
          </div>
        </div>
        <div className="campo" style={{ flex: "2 1 240px" }}>
          <label htmlFor={`ramo-${empresa.id}`}>Ramo (o que a empresa vende ou faz)</label>
          <input id={`ramo-${empresa.id}`} value={f.ramo} onChange={muda("ramo")} placeholder="Ex.: loja de roupas" maxLength={80} />
        </div>
      </div>
      <div className="linha-form">
        <div className="campo" style={{ flex: "2 1 200px" }}>
          <label htmlFor={`mun-${empresa.id}`}>Município</label>
          <input id={`mun-${empresa.id}`} value={f.municipio} onChange={muda("municipio")} maxLength={60} />
        </div>
        <div className="campo" style={{ flex: "0 0 76px" }}>
          <label htmlFor={`uf-${empresa.id}`}>UF</label>
          <input id={`uf-${empresa.id}`} value={f.uf} onChange={muda("uf")} maxLength={2} style={{ textTransform: "uppercase", width: "100%" }} />
        </div>
        <div className="campo" style={{ flex: "0 1 220px" }}>
          <label htmlFor={`cap-${empresa.id}`}>Capital social (R$)</label>
          <input id={`cap-${empresa.id}`} type="number" min="0" step="0.01" className="mono" value={f.capitalSocial} onChange={muda("capitalSocial")} />
        </div>
      </div>
      {Number(f.capitalSocial) > 0 && <p className="pequeno suave">Capital social: {dinheiro(f.capitalSocial)} — ele será a base dos saldos iniciais.</p>}
      <p className="pequeno suave">Atividade, regime tributário, exercício social e os demais parâmetros ficam no menu Parametrização.</p>
      {erros.length > 0 && <div className="aviso atencao pequeno">{erros.map((e) => <div key={e}>{e}</div>)}</div>}
      <div><button className="botao" disabled={salvando}>{salvando ? "Salvando…" : "Salvar cadastro"}</button></div>
      {msg.texto && <div className={`aviso ${msg.tipo || ""}`} role="status">{msg.texto}</div>}
    </form>
  );
}

// ---------------- professor: empresas da turma ----------------
export function EmpresasDaTurma({ turma, alunos, ir }) {
  const [empresas, setEmpresas] = useState(null);
  const [aberta, setAberta] = useState("");
  const [msg, setMsg] = useState({});
  const [ocupado, setOcupado] = useState(false);

  const carregar = () => empresasDaTurma(turma.id, alunos).then(setEmpresas).catch((e) => setMsg({ tipo: "erro", texto: traduzirErro(e) }));
  useEffect(() => { if (alunos) carregar(); }, [turma.id, alunos]);

  const faltam = alunos && empresas ? alunos.filter((a) => !empresas[a.matricula]).length : 0;
  const completas = empresas ? Object.values(empresas).filter((e) => e?.cadastroCompleto).length : 0;

  const criar = async () => {
    setOcupado(true); setMsg({});
    try {
      const n = await criarEmpresasQueFaltam(turma, alunos, empresas);
      setMsg({ texto: `${n} empresa(s) criada(s) com o cadastro inicial. Os alunos completam os dados.` });
      await carregar();
    } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
    setOcupado(false);
  };

  return (
    <section className="cartao sem-padding">
      <div className="cartao-topo">
        <h2>Empresas dos alunos</h2>
        <span className="pequeno suave">{empresas ? `${completas} com cadastro completo · ${faltam} ainda sem empresa` : "…"}</span>
      </div>
      <p className="pequeno suave" style={{ padding: "10px 18px 0" }}>
        Cada aluno tem a própria empresa nesta turma. Ela é criada sozinha quando o aluno abre "Minha empresa"; se preferir,
        crie agora as que faltam.
      </p>
      {faltam > 0 && <div style={{ padding: "10px 18px 0" }}><button className="botao secundario pequeno" onClick={criar} disabled={ocupado}>{ocupado ? "Criando…" : `Criar as ${faltam} empresa(s) que faltam`}</button></div>}
      {msg.texto && <div className={`aviso ${msg.tipo || ""}`} style={{ margin: "10px 18px 0" }}>{msg.texto}</div>}
      <div className="tabela-caixa" style={{ marginTop: 10 }}>
        <table>
          <thead><tr><th>Aluno</th><th>Empresa</th><th>CNPJ</th><th>Regime</th><th>Cadastro</th><th>Parametrização</th><th></th></tr></thead>
          <tbody>
            {(!alunos || !empresas) && <tr><td colSpan={7} className="suave">Carregando…</td></tr>}
            {alunos && empresas && alunos.map((a) => {
              const e = empresas[a.matricula];
              return (
                <tr key={a.matricula}>
                  <td>{a.nome}<span className="pequeno suave mono" style={{ display: "block" }}>{a.matricula}</span></td>
                  <td>{e ? e.razaoSocial : <span className="suave">—</span>}{e?.ramo && <span className="pequeno suave" style={{ display: "block" }}>{e.ramo}</span>}</td>
                  <td className="mono pequeno">{e?.cnpj || "—"}</td>
                  <td className="pequeno">{e?.regime || "—"}</td>
                  <td>{!e ? <span className="selo cinza">Não criada</span> : e.cadastroCompleto ? <span className="selo verde">Completo</span> : <span className="selo ocre">Incompleto</span>}</td>
                  <td>{e && (e.parametrosConfirmados?.contabil ? <span className="selo verde">Contábil ✓</span> : <span className="selo ocre">Pendente</span>)}
                    {e?.parametrosDestravados && <span className="selo cinza" style={{ marginLeft: 4 }}>destravada</span>}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {e && <button className="botao secundario pequeno" onClick={() => setAberta(aberta === a.matricula ? "" : a.matricula)}>{aberta === a.matricula ? "Fechar" : "Cadastro"}</button>}{" "}
                    {e && ir && <button className="botao pequeno" onClick={() => ir("escrituracao", turma.id, a.matricula)}>Escrituração</button>}{" "}
                    {e?.parametrosConfirmados?.contabil && !e.parametrosDestravados && (
                      <button className="botao secundario pequeno" title="Permite ao aluno alterar a parametrização mesmo com lançamentos"
                        onClick={async () => { try { await destravarParametros(e); setMsg({ texto: `Parametrização de ${a.nome} destravada.` }); await carregar(); } catch (err) { setMsg({ tipo: "erro", texto: traduzirErro(err) }); } }}>
                        Destravar parâmetros
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {aberta && empresas?.[aberta] && (
        <div style={{ padding: 18 }}>
          <FormEmpresa key={aberta} empresa={empresas[aberta]} compacto aoSalvar={carregar} />
        </div>
      )}
    </section>
  );
}
