// Acompanhamento da turma (página da turma, professor): o que cada aluno já fez, em cores.
import { useEffect, useState } from "react";
import { traduzirErro } from "../lib/sessao";
import { usePlano } from "../lib/contabil";
import { ehQuestoes, finalidadeDe, FINALIDADES, listasDaTurma, valeNota } from "../lib/exercicios";
import { lerGabarito } from "../lib/questoes";
import { acompanharAluno, atrasado, comDiferencas, DIAS_SEM_ATIVIDADE } from "../lib/acompanhamento";

const COR = { ok: "verde", meio: "ocre", nada: "cinza", ruim: "vermelho" };

function quando(d) {
  if (!d) return { texto: "nunca", tom: "ruim" };
  const dias = Math.floor((Date.now() - d.getTime()) / 86400000);
  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (dias <= 0 && new Date().toDateString() === d.toDateString()) return { texto: `hoje ${hora}`, tom: "ok" };
  if (dias <= 1) return { texto: `ontem ${hora}`, tom: "ok" };
  return { texto: `há ${dias} dias`, tom: dias > DIAS_SEM_ATIVIDADE ? "ruim" : "meio" };
}

function Celula({ tom, children, titulo }) {
  return <td title={titulo}><span className={`selo ${COR[tom]}`} style={{ whiteSpace: "nowrap" }}>{children}</span></td>;
}

// fatos lançados e acertos; numa lista avaliativa ainda oculta ao aluno, o professor vê o acerto entre parênteses
function CelulaRoteiro({ r }) {
  if (!r) return <td />;
  if (r.naoSeAplica) return <td className="pequeno suave">não se aplica</td>;
  if (!r.lancados) return <Celula tom="nada">0/{r.total}</Celula>;
  const tom = r.lancados < r.total ? "meio" : r.acertos === r.lancados ? "ok" : "meio";
  return <Celula tom={tom} titulo={`${r.lancados} de ${r.total} lançados; ${r.acertos} conferem`}>{r.lancados}/{r.total} · {r.acertos} ✓</Celula>;
}

export function AcompanhamentoDaTurma({ turma, alunos, ir }) {
  const { plano } = usePlano();
  const [listas, setListas] = useState([]);
  const [linhas, setLinhas] = useState(null);
  const [progresso, setProgresso] = useState(0);
  const [filtro, setFiltro] = useState("todos");
  const [erro, setErro] = useState("");

  const carregar = async () => {
    if (!plano) return;
    setErro(""); setLinhas(null); setProgresso(0);
    try {
      const ls = (await listasDaTurma(turma.id, false)).filter((l) => l.enviada);
      setListas(ls);
      const gabaritos = {};
      for (const l of ls.filter(ehQuestoes)) gabaritos[l.id] = await lerGabarito(turma.id, l.id).catch(() => ({}));
      const r = [];
      for (const a of alunos) { r.push(await acompanharAluno(turma, a, ls, plano, gabaritos)); setProgresso(r.length); }
      setLinhas(r);
    } catch (e) { setErro(traduzirErro(e)); }
  };
  useEffect(() => { carregar(); }, [turma.id, alunos.length, !!plano]);

  const ativos = (linhas || []).filter((x) => !x.semEmpresa);
  const resumo = linhas && {
    fatos: ativos.filter((x) => x.orientados.lancados === x.orientados.total).length,
    parados: linhas.filter((x) => x.semEmpresa || !x.ultima || (Date.now() - x.ultima) / 86400000 > DIAS_SEM_ATIVIDADE).length,
    balancete: ativos.filter((x) => x.balancete === true).length,
    diferencas: ativos.filter(comDiferencas).length,
  };
  const visiveis = (linhas || []).filter((x) => filtro === "todos"
    || (filtro === "atrasados" && (x.semEmpresa || atrasado(x, listas)))
    || (filtro === "diferencas" && !x.semEmpresa && comDiferencas(x)));

  const csv = () => {
    const cab = ["Matrícula", "Nome", "Cadastro", "Parametrização", "Saldos iniciais", "Fatos orientados lançados", "Fatos orientados conferem",
      ...listas.flatMap((l) => [`${l.titulo} — lançados`, `${l.titulo} — conferem`]), "Balancete fecha", "Encerramento", "Última atividade"];
    const sn = (v) => (v ? "sim" : "não");
    const ls = (linhas || []).map((x) => [x.aluno.matricula, x.aluno.nome, ...(x.semEmpresa ? ["sem empresa"] : [
      sn(x.cadastro), sn(x.parametrizacao), sn(x.saldos), x.orientados.lancados, x.orientados.acertos,
      ...listas.flatMap((l) => (x.porLista[l.id]?.naoSeAplica ? ["-", "-"] : [x.porLista[l.id]?.lancados ?? 0, x.porLista[l.id]?.acertos ?? 0])),
      x.balancete == null ? "-" : sn(x.balancete), sn(x.encerrado), x.ultima ? x.ultima.toLocaleString("pt-BR") : "nunca",
    ])]);
    const texto = [cab, ...ls].map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + texto], { type: "text/csv;charset=utf-8" }));
    a.download = `Acompanhamento-${turma.nome.replace(/[^\w-]+/g, "_")}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
  };

  return (
    <section className="cartao">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <h2>Acompanhamento da turma</h2>
          <span className="pequeno suave">O que cada aluno já fez. Verde: feito/confere · ocre: em andamento ou com diferença · cinza: não começou. Clique no nome para abrir a escrituração.</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="botao secundario pequeno" onClick={carregar} disabled={!linhas}>Atualizar</button>
          <button className="botao secundario pequeno" onClick={csv} disabled={!linhas?.length}>Exportar .csv</button>
        </div>
      </div>
      {erro && <div className="aviso erro">{erro}</div>}
      {!linhas && !erro && <p className="pequeno suave">Lendo os livros dos alunos… {progresso} de {alunos.length}</p>}
      {resumo && alunos.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10 }}>
          <Resumo valor={`${resumo.fatos} de ${alunos.length}`} rotulo="concluíram os 8 fatos orientados" />
          <Resumo valor={`${resumo.balancete} de ${alunos.length}`} rotulo="com o balancete fechando" />
          <Resumo valor={resumo.diferencas} rotulo="com lançamentos diferentes do gabarito" alerta={resumo.diferencas > 0} />
          <Resumo valor={resumo.parados} rotulo={`sem atividade há mais de ${DIAS_SEM_ATIVIDADE} dias`} alerta={resumo.parados > 0} />
        </div>
      )}
      {linhas && linhas.length > 0 && (
        <>
          <div className="abas" role="tablist" aria-label="Filtro" style={{ margin: 0 }}>
            {[["todos", "Todos"], ["atrasados", "Só quem está atrasado"], ["diferencas", "Só quem tem diferenças"]].map(([id, r]) => (
              <button key={id} role="tab" aria-selected={filtro === id} className={filtro === id ? "ativo" : ""} onClick={() => setFiltro(id)}>{r}</button>
            ))}
          </div>
          <div className="tabela-caixa">
            <table>
              <thead>
                <tr>
                  <th>Aluno</th><th>Cadastro</th><th>Parametriz.</th><th>Saldos iniciais</th><th>Fatos orientados</th>
                  {listas.map((l) => <th key={l.id}>{l.titulo}<span className="pequeno suave" style={{ display: "block", fontWeight: 400 }}>{ehQuestoes(l) ? "questões · " : ""}{FINALIDADES[finalidadeDe(l)].curto.toLowerCase()}{valeNota(l) && !l.resultadoLiberado ? " · oculta ao aluno" : ""}</span></th>)}
                  <th>Balancete</th><th>Encerramento</th><th>Última atividade</th>
                </tr>
              </thead>
              <tbody>
                {visiveis.length === 0 && <tr><td colSpan={8 + listas.length} className="suave">Nenhum aluno neste filtro.</td></tr>}
                {visiveis.map((x) => {
                  const nome = (
                    <td>
                      {x.semEmpresa ? x.aluno.nome : <button className="botao secundario pequeno" style={{ textAlign: "left" }} onClick={() => ir?.("escrituracao", turma.id, x.aluno.matricula)}>{x.aluno.nome}</button>}
                      <span className="pequeno suave mono" style={{ display: "block" }}>{x.aluno.matricula}</span>
                    </td>
                  );
                  if (x.semEmpresa) return <tr key={x.aluno.matricula}>{nome}<td colSpan={7 + listas.length}><span className="selo cinza">Ainda não abriu a empresa</span></td></tr>;
                  const u = quando(x.ultima);
                  return (
                    <tr key={x.aluno.matricula}>
                      {nome}
                      <Celula tom={x.cadastro ? "ok" : "nada"}>{x.cadastro ? "✓" : "—"}</Celula>
                      <Celula tom={x.parametrizacao ? "ok" : "nada"}>{x.parametrizacao ? "✓" : "—"}</Celula>
                      <Celula tom={x.saldos ? "ok" : "nada"}>{x.saldos ? "✓" : "—"}</Celula>
                      <CelulaRoteiro r={x.orientados} />
                      {listas.map((l) => <CelulaRoteiro key={l.id} r={x.porLista[l.id]} />)}
                      {x.balancete == null ? <Celula tom="nada">—</Celula> : <Celula tom={x.balancete ? "ok" : "ruim"}>{x.balancete ? "fecha" : "não fecha"}</Celula>}
                      <Celula tom={x.encerrado ? "ok" : "nada"}>{x.encerrado ? "✓" : "—"}</Celula>
                      <Celula tom={u.tom} titulo={x.ultima ? x.ultima.toLocaleString("pt-BR") : ""}>{u.texto}</Celula>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="pequeno suave" style={{ margin: 0 }}>
            Nas listas, "3/5 · 2 ✓" quer dizer 3 de 5 fatos lançados, 2 conferem. Nas avaliativas ainda ocultas, só você vê o acerto.
            "Atrasado": sem atividade há mais de {DIAS_SEM_ATIVIDADE} dias ou com lista de prazo vencido incompleta.
          </p>
        </>
      )}
      {linhas && linhas.length === 0 && <p className="pequeno suave">Nenhum aluno na turma.</p>}
    </section>
  );
}

function Resumo({ valor, rotulo, alerta }) {
  return (
    <div style={{ border: "1px solid var(--linha)", borderRadius: 10, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 2 }}>
      <span className="mono" style={{ fontSize: 22, fontWeight: 600, color: alerta ? "var(--ocre)" : "var(--destaque)" }}>{valor}</span>
      <span className="pequeno suave">{rotulo}</span>
    </div>
  );
}
