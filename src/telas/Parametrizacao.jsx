// Parametrização da empresa (aluno) e parâmetros fixados pelo professor (turma)
import { useEffect, useState } from "react";
import { useTurmas } from "../lib/useTurmas";
import { traduzirErro } from "../lib/sessao";
import { disciplinaPorId } from "../dados/disciplinas";
import { garantirEmpresa } from "../lib/empresas";
import { lerEscrituracao } from "../lib/escrituracao";
import {
  AREAS, areaConfirmada, conferirArea, confirmarArea, fixadoNaTurma, parametrosEfetivos, salvarParametrosDaTurma,
} from "../lib/parametros";

export default function Parametrizacao({ sessao, ir }) {
  const { turmas, carregando, erro } = useTurmas(sessao);
  const [turmaId, setTurmaId] = useState("");
  const [empresa, setEmpresa] = useState(null);
  const [lancamentos, setLancamentos] = useState(0);
  const [msg, setMsg] = useState("");
  const turma = turmas.find((t) => t.id === turmaId) || turmas[0];
  const aluno = { nome: sessao.perfil?.nome || sessao.usuario.displayName || "Aluno", matricula: sessao.perfil?.matricula };

  const carregar = async () => {
    if (!turma) return;
    try {
      const e = await garantirEmpresa(turma, aluno);
      const d = await lerEscrituracao(e.id);
      setEmpresa(e); setLancamentos(d.lancamentos.length);
    } catch (err) { setMsg(traduzirErro(err)); }
  };
  useEffect(() => { setEmpresa(null); setMsg(""); carregar(); }, [turma?.id]);

  return (
    <>
      <div>
        <h1>Parametrização</h1>
        <p className="suave" style={{ maxWidth: 780 }}>
          Como nos sistemas contábeis de mercado, antes de escriturar o contador define os parâmetros da empresa em três áreas:
          Contábil, Fiscal/Tributário e Folha. As escolhas mudam o funcionamento da escrituração — leia a explicação de cada uma.
        </p>
      </div>
      {erro && <div className="aviso erro">{erro}</div>}
      {!carregando && turmas.length === 0 && <div className="aviso atencao">Você ainda não está em nenhuma turma.</div>}
      {turmas.length > 1 && (
        <div className="campo" style={{ maxWidth: 520, flex: "none" }}>
          <label htmlFor="par-turma">Turma</label>
          <select id="par-turma" value={turma?.id || ""} onChange={(e) => setTurmaId(e.target.value)}>
            {turmas.map((t) => <option key={t.id} value={t.id}>{t.nome} · {disciplinaPorId(t.disciplina)?.sigla} · {t.semestre}</option>)}
          </select>
        </div>
      )}
      {msg && <div className="aviso erro">{msg}</div>}
      {turma && !empresa && !msg && <p className="suave">Abrindo a sua empresa…</p>}
      {empresa && !empresa.cadastroCompleto && (
        <div className="aviso atencao" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span>Primeiro complete o cadastro da empresa.</span>
          <button className="botao pequeno" onClick={() => ir("empresa")}>Minha empresa</button>
        </div>
      )}
      {empresa?.cadastroCompleto && (
        <Areas key={empresa.id} empresa={empresa} turma={turma} lancamentos={lancamentos} aoSalvar={carregar} ir={ir} />
      )}
    </>
  );
}

function Areas({ empresa, turma, lancamentos, aoSalvar, ir }) {
  const [area, setArea] = useState("contabil");
  const efetivos = parametrosEfetivos(empresa, turma);
  // depois do primeiro lançamento, só o professor libera mudanças (princípio da consistência)
  const travado = lancamentos > 0 && !empresa.parametrosDestravados;
  const contabilOk = areaConfirmada(empresa, "contabil");
  return (
    <>
      <div className="abas" role="tablist">
        {AREAS.map((a) => (
          <button key={a.id} role="tab" aria-selected={area === a.id} className={area === a.id ? "ativo" : ""} onClick={() => setArea(a.id)}>
            {a.nome} {areaConfirmada(empresa, a.id) ? "✓" : ""}
          </button>
        ))}
      </div>
      {contabilOk && area === "contabil" && (
        <div className="aviso" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span>Parametrização contábil confirmada. A escrituração está liberada.</span>
          <button className="botao pequeno" onClick={() => ir("escrituracao")}>Ir para a Escrituração</button>
        </div>
      )}
      {travado && (
        <div className="aviso atencao">
          A empresa já tem {lancamentos} lançamento(s): os parâmetros ficam travados para manter a consistência da escrituração.
          Se precisar mudar, peça ao professor para destravar.
        </div>
      )}
      <FormArea key={area} areaId={area} empresa={empresa} turma={turma} valores={efetivos[area]} travado={travado} aoSalvar={aoSalvar} />
    </>
  );
}

function Campo({ c, valor, mudar, bloqueado, id }) {
  if (c.tipo === "opcoes") {
    return (
      <div className="abas" role="radiogroup" aria-labelledby={`${id}-r`} style={{ margin: 0, borderBottom: 0, paddingBottom: 0 }}>
        {c.opcoes.map((o) => (
          <button key={o.valor} type="button" role="radio" aria-checked={valor === o.valor} disabled={bloqueado}
            className={valor === o.valor ? "ativo" : ""} onClick={() => mudar(o.valor)}>{o.rotulo}</button>
        ))}
      </div>
    );
  }
  return (
    <input id={id} disabled={bloqueado} value={valor ?? ""} onChange={(e) => mudar(e.target.value)}
      type={c.tipo === "data" ? "date" : c.tipo === "numero" ? "number" : "text"} min={c.min} max={c.max} step={c.tipo === "numero" ? "0.01" : undefined}
      className={c.tipo === "numero" ? "mono" : undefined} style={{ maxWidth: c.tipo === "texto" ? 420 : 220 }} />
  );
}

function FormArea({ areaId, empresa, turma, valores, travado, aoSalvar }) {
  const area = AREAS.find((a) => a.id === areaId);
  const [v, setV] = useState(valores);
  const [msg, setMsg] = useState({});
  const [salvando, setSalvando] = useState(false);
  const indisponivel = area.somenteDisciplina && turma?.disciplina !== area.somenteDisciplina;
  const confirmada = areaConfirmada(empresa, areaId);
  const erros = conferirArea(areaId, v);

  const salvar = async () => {
    setSalvando(true); setMsg({});
    try { await confirmarArea(empresa, areaId, v); await aoSalvar(); setMsg({ texto: `Parametrização ${area.nome} confirmada.` }); }
    catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
    setSalvando(false);
  };

  if (indisponivel) {
    return <div className="aviso atencao">{area.intro} Esta turma é de {disciplinaPorId(turma?.disciplina)?.nome || "outra disciplina"}.</div>;
  }

  return (
    <section className="cartao">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <h2>Área {area.nome}</h2>
        <span className={`selo ${confirmada ? "verde" : "ocre"}`}>{confirmada ? "Confirmada" : "Ainda não confirmada"}</span>
      </div>
      <p className="pequeno suave" style={{ maxWidth: 820 }}>{area.intro}</p>
      {area.campos.map((c) => {
        const fixo = fixadoNaTurma(turma, areaId, c.id);
        const id = `p-${areaId}-${c.id}`;
        return (
          <div key={c.id} style={{ display: "flex", flexDirection: "column", gap: 6, borderTop: "1px solid var(--linha-suave)", paddingTop: 12 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <label id={`${id}-r`} htmlFor={id} style={{ fontWeight: 600 }}>{c.rotulo}</label>
              {fixo && <span className="selo cinza">Definido pelo professor</span>}
            </div>
            <Campo c={c} id={id} valor={v[c.id]} bloqueado={fixo || travado} mudar={(x) => setV({ ...v, [c.id]: x })} />
            <p className="pequeno suave" style={{ maxWidth: 860 }}>{c.ajuda}</p>
            {c.aviso?.[v[c.id]] && <div className="aviso atencao pequeno">{c.aviso[v[c.id]]}</div>}
          </div>
        );
      })}
      {erros.length > 0 && !travado && <div className="aviso atencao pequeno">{erros.map((e) => <div key={e}>{e}</div>)}</div>}
      {!travado && (
        <div><button className="botao" disabled={salvando || erros.length > 0} onClick={salvar}>{salvando ? "Salvando…" : confirmada ? "Salvar alterações" : `Confirmar parametrização ${area.nome}`}</button></div>
      )}
      {msg.texto && <div className={`aviso ${msg.tipo || ""}`} role="status">{msg.texto}</div>}
    </section>
  );
}

// ---------------- professor: parâmetros fixados para a turma ----------------
export function ParametrosDaTurma({ turma, aoSalvar }) {
  const [fixos, setFixos] = useState(turma.parametrosFixos || {});
  const [aberto, setAberto] = useState(false);
  const [msg, setMsg] = useState({});
  const padrao = parametrosEfetivos({ inicioExercicio: `${String(turma.semestre || "").slice(0, 4) || new Date().getFullYear()}-01-01` }, null);
  const areas = AREAS.filter((a) => !a.somenteDisciplina || a.somenteDisciplina === turma.disciplina);
  const qtd = Object.keys(fixos).length;

  const alternar = (chave, valorPadrao) => {
    const novo = { ...fixos };
    if (chave in novo) delete novo[chave]; else novo[chave] = valorPadrao;
    setFixos(novo);
  };
  const salvar = async () => {
    try { await salvarParametrosDaTurma(turma, fixos); setMsg({ texto: "Parâmetros da turma salvos." }); await aoSalvar?.(); }
    catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
  };

  return (
    <section className="cartao">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <h2>Parametrização da turma</h2>
          <span className="pequeno suave">{qtd ? `${qtd} parâmetro(s) fixado(s) para todos os alunos` : "Todos os parâmetros livres: cada aluno escolhe"}</span>
        </div>
        <button className="botao secundario pequeno" onClick={() => setAberto(!aberto)}>{aberto ? "Fechar" : "Definir parâmetros"}</button>
      </div>
      {aberto && (
        <>
          <p className="pequeno suave">Marque "Fixar" para definir o parâmetro para a turma inteira (facilita a correção). Desmarcado, cada aluno escolhe.</p>
          {areas.map((a) => (
            <div key={a.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <h3 style={{ margin: "8px 0 0", color: "var(--destaque)", fontSize: 15 }}>{a.nome}</h3>
              {a.campos.map((c) => {
                const chave = `${a.id}.${c.id}`;
                const fixo = chave in fixos;
                const valorPadrao = padrao[a.id][c.id] || c.opcoes?.[0]?.valor || "";
                return (
                  <div key={chave} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", borderTop: "1px solid var(--linha-suave)", paddingTop: 8 }}>
                    <label className="pequeno" style={{ display: "flex", gap: 8, alignItems: "center", minWidth: 300 }}>
                      <input type="checkbox" checked={fixo} onChange={() => alternar(chave, valorPadrao)} style={{ minHeight: 0 }} />
                      Fixar: {c.rotulo}
                    </label>
                    {fixo && <Campo c={c} id={`f-${chave}`} valor={fixos[chave]} mudar={(x) => setFixos({ ...fixos, [chave]: x })} />}
                  </div>
                );
              })}
            </div>
          ))}
          <div><button className="botao" onClick={salvar}>Salvar parâmetros da turma</button></div>
          {msg.texto && <div className={`aviso ${msg.tipo || ""}`} role="status">{msg.texto}</div>}
        </>
      )}
    </section>
  );
}
