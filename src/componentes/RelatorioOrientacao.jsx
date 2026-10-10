// Relatório de orientação (aprovado em 10/10/2026, a partir do kit da CI Unidade II): tela do
// professor, só leitura. Por aluno: situação por item, quem age agora e o que fazer; resumo da
// turma; impressão em A4 paisagem; texto pronto para o aluno (sem o que ainda está oculto).
import { useMemo, useState } from "react";
import { ETAPAS, relatorioEmTexto, SITUACOES } from "../lib/relatorioOrientacao";
import DevolverTarefa from "./DevolverTarefa";

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const carimbo = () => { const d = new Date(); const z = (x) => String(x).padStart(2, "0"); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}_${z(d.getHours())}h${z(d.getMinutes())}`; };

function PilulaEtapa({ etapa }) {
  const e = ETAPAS[etapa] || { nome: etapa, cor: "#93a39f" };
  return <span className="pilula-etapa" style={{ borderColor: e.cor, color: e.cor }}>{e.nome}</span>;
}
function PilulaGravidade({ g }) {
  return g === "erro" ? <span className="pilula-grav cheia">● corrigir</span> : <span className="pilula-grav vazada">○ conferir</span>;
}
function Quem({ lista }) {
  if (!lista?.length) return <span className="suave">—</span>;
  return (
    <span style={{ display: "inline-flex", gap: 4, flexWrap: "wrap" }}>
      {lista.includes("professor") && <span className="pilula-quem vazada">🧑‍🏫 Professor</span>}
      {lista.includes("aluno") && <span className="pilula-quem cheia">👤 Aluno</span>}
    </span>
  );
}

async function copiar(texto) {
  try { await navigator.clipboard.writeText(texto); return true; } catch {
    try { const ta = document.createElement("textarea"); ta.value = texto; document.body.appendChild(ta); ta.select(); const ok = document.execCommand("copy"); ta.remove(); return ok; } catch { return false; }
  }
}

// impressão em A4 paisagem, num quadro invisível (o tema escuro da tela não vai para o papel).
// O nome sugerido para o PDF é o título: aluno + data/hora.
function imprimir(rel, turma) {
  const titulo = `Relatório de orientação - ${rel.aluno?.nome || "aluno"}${rel.contaTeste ? " (CONTA DE TESTE)" : ""} - ${carimbo()}`;
  const linhas = rel.linhas.map((l) => `<tr><td>${esc(l.item)}</td><td>${esc(ETAPAS[l.etapa]?.nome)}</td><td class="c">${esc(l.feito)}</td><td class="c">${esc(l.confere)}</td><td>${esc(SITUACOES[l.situacao][0])}</td><td>${l.quem.map((q) => (q === "aluno" ? "Aluno" : "Professor")).join(" + ") || "—"}</td></tr>`).join("");
  const probs = rel.achados.map((a) => `<tr><td>${esc(ETAPAS[a.etapa]?.nome)}</td><td>${a.gravidade === "erro" ? "● corrigir" : "○ conferir"}</td><td><b>${esc(a.item)}</b> — ${esc(a.titulo)}${a.oculto ? " <i>(só o professor vê)</i>" : ""}</td><td>${esc(a.orientacao)}<br><small>${esc(a.onde || "")}</small></td><td>${a.quem === "aluno" ? "Aluno" : "Professor"}</td></tr>`).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(titulo)}</title><style>
    @page{size:A4 landscape;margin:10mm} body{font:12px/1.4 Arial,sans-serif;color:#000;margin:0}
    h1{font-size:16px;margin:0 0 4px} .tag{border:1px dashed #000;padding:1px 6px;font-size:11px;margin-left:6px}
    table{width:100%;border-collapse:collapse;margin:6px 0 12px} th,td{border-bottom:1px solid #999;padding:4px 6px;text-align:left;vertical-align:top}
    thead{display:table-header-group} tr{break-inside:avoid} .c{text-align:center} h2{font-size:13px;margin:10px 0 2px}
    ${rel.linhas.length > 12 ? ".probs{break-before:page}" : ""}</style></head><body>
    <h1>Relatório de orientação — ${esc(rel.aluno?.nome)}${rel.contaTeste ? '<span class="tag">CONTA DE TESTE</span>' : ""}</h1>
    <div>${esc(turma?.nome || "")} · matrícula ${esc(rel.aluno?.matricula || "")} · gerado em ${new Date().toLocaleString("pt-BR")}</div>
    <div>Itens em dia: <b>${rel.emDia}</b> de <b>${rel.total}</b> · com o aluno: <b>${rel.comAluno}</b> · com o professor: <b>${rel.comProfessor}</b></div>
    <h2>Situação por item</h2>
    <table><thead><tr><th>Item</th><th>Etapa</th><th class="c">Feito</th><th class="c">Confere</th><th>Situação</th><th>Quem age agora</th></tr></thead><tbody>${linhas}</tbody></table>
    <div class="probs"><h2>O que precisa de ajuste (${rel.achados.length})</h2>
    ${rel.achados.length ? `<table><thead><tr><th>Etapa</th><th>Gravidade</th><th>Problema</th><th>O que fazer / onde</th><th>Quem age</th></tr></thead><tbody>${probs}</tbody></table>` : "<p>Nenhuma pendência encontrada.</p>"}
    <p><small>Feito: itens lançados/respondidos. Confere: iguais ao gabarito. ● corrigir = erro · ○ conferir = atenção.</small></p></div>
    </body></html>`;
  const f = document.createElement("iframe");
  f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(f);
  const d = f.contentWindow.document; d.open(); d.write(html); d.close();
  const anterior = document.title; document.title = titulo;
  const limpar = () => { document.title = anterior; setTimeout(() => f.remove(), 500); window.removeEventListener("afterprint", limpar); };
  window.addEventListener("afterprint", limpar);
  setTimeout(() => { try { f.contentWindow.focus(); f.contentWindow.print(); } catch { limpar(); } }, 250);
}

export function RelatorioDoAluno({ rel, turma, aoVoltar, sessao, aoDevolver }) {
  const [filtro, setFiltro] = useState("todos");
  const [devolvendo, setDevolvendo] = useState(false);
  const [msg, setMsg] = useState("");
  const contagem = useMemo(() => {
    const c = {};
    rel.achados.forEach((a) => { c[a.etapa] = (c[a.etapa] || 0) + 1; });
    return c;
  }, [rel]);
  const vis = rel.achados.filter((a) => filtro === "todos" || a.etapa === filtro);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        {aoVoltar && <button type="button" className="botao secundario pequeno" onClick={aoVoltar}>← Resumo da turma</button>}
        <h3 style={{ margin: 0, flex: "1 1 auto" }}>
          Relatório de orientação — {rel.aluno?.nome}
          {rel.contaTeste && <span className="selo ocre" style={{ marginLeft: 8, border: "1px dashed var(--ocre)" }}>CONTA DE TESTE</span>}
        </h3>
        {sessao && rel.total > 0 && <button type="button" className="botao secundario pequeno" onClick={() => setDevolvendo(!devolvendo)}>↩ Devolver tarefa</button>}
        <button type="button" className="botao secundario pequeno" onClick={() => imprimir(rel, turma)}>🖨 Imprimir / salvar PDF</button>
        <button type="button" className="botao pequeno" onClick={async () => setMsg((await copiar(relatorioEmTexto(rel, turma))) ? "Texto copiado: cole no Classroom ou no WhatsApp do aluno." : "Não foi possível copiar.")}>📋 Copiar texto para o aluno</button>
      </div>
      {msg && <div className="aviso pequeno" role="status">{msg}</div>}
      {devolvendo && <DevolverTarefa sessao={sessao} turmaId={turma.id} aluno={rel.aluno} aoCancelar={() => setDevolvendo(false)} aoConcluir={aoDevolver} />}
      <p style={{ margin: 0 }}>Em dia: <strong>{rel.emDia}</strong> de <strong>{rel.total}</strong> · com o aluno: <strong>{rel.comAluno}</strong> · com o professor: <strong>{rel.comProfessor}</strong></p>

      <h4 style={{ margin: "4px 0 0" }}>Situação por item</h4>
      <div className="tabela-caixa" style={{ border: "1px solid var(--linha)", borderRadius: 10 }}>
        <table>
          <thead><tr><th>Item</th><th>Etapa</th><th style={{ textAlign: "center" }}>Feito</th><th style={{ textAlign: "center" }}>Confere</th><th>Situação</th><th>Quem age agora</th></tr></thead>
          <tbody>
            {rel.linhas.map((l, i) => {
              const [rot, cor] = SITUACOES[l.situacao];
              return (
                <tr key={i}>
                  <td>{l.item}{l.oculto && <span className="pequeno suave" style={{ display: "block" }}>resultado oculto ao aluno</span>}</td>
                  <td><PilulaEtapa etapa={l.etapa} /></td>
                  <td className="mono" style={{ textAlign: "center" }}>{l.feito}</td>
                  <td className="mono" style={{ textAlign: "center" }}>{l.confere}</td>
                  <td><span className={`selo ${cor}`}>{rot}</span></td>
                  <td><Quem lista={l.quem} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="pequeno suave" style={{ margin: 0 }}>Feito: fatos lançados ou questões respondidas. Confere: iguais ao gabarito (nas avaliativas ainda ocultas, só você vê). Ordem: com problema primeiro, em dia por último.</p>

      <h4 style={{ margin: "4px 0 0" }}>O que precisa de ajuste ({rel.achados.length})</h4>
      {rel.achados.length === 0 && <div className="aviso">Nenhuma pendência encontrada.</div>}
      {rel.achados.length > 0 && (
        <>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button type="button" className={`chip ${filtro === "todos" ? "ativo" : ""}`} onClick={() => setFiltro("todos")}>Todos {rel.achados.length}</button>
            {Object.entries(contagem).map(([e, n]) => (
              <button key={e} type="button" className={`chip ${filtro === e ? "ativo" : ""}`} style={{ borderColor: ETAPAS[e]?.cor, color: filtro === e ? undefined : ETAPAS[e]?.cor }} onClick={() => setFiltro(e)}>{ETAPAS[e]?.nome} {n}</button>
            ))}
          </div>
          <div className="tabela-caixa" style={{ border: "1px solid var(--linha)", borderRadius: 10 }}>
            <table>
              <thead><tr><th>Etapa</th><th></th><th>Problema</th><th>O que fazer</th><th>Quem age</th></tr></thead>
              <tbody>
                {vis.map((a, i) => (
                  <tr key={i}>
                    <td><PilulaEtapa etapa={a.etapa} /></td>
                    <td><PilulaGravidade g={a.gravidade} /></td>
                    <td><strong>{a.titulo}</strong><span className="pequeno suave" style={{ display: "block" }}>{a.item}{a.oculto ? " · só você vê (resultado oculto)" : ""}</span></td>
                    <td className="pequeno">{a.orientacao}{a.onde && <span className="suave" style={{ display: "block" }}>Onde: {a.onde}</span>}</td>
                    <td><Quem lista={[a.quem]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export function ResumoDaTurma({ relatorios, turma, abrir }) {
  const tot = relatorios.reduce((t, r) => ({ aluno: t.aluno + r.comAluno, prof: t.prof + r.comProfessor }), { aluno: 0, prof: 0 });
  const ordenados = [...relatorios].sort((a, b) => (b.comAluno + b.comProfessor) - (a.comAluno + a.comProfessor));
  return (
    <div className="tabela-caixa" style={{ border: "1px solid var(--linha)", borderRadius: 10 }}>
      <table>
        <thead><tr><th>Aluno</th><th style={{ textAlign: "center" }}>Itens em dia</th><th style={{ textAlign: "center" }}>Com o aluno</th><th style={{ textAlign: "center" }}>Com o professor</th><th></th></tr></thead>
        <tbody>
          {ordenados.map((r) => (
            <tr key={r.aluno.matricula}>
              <td>{r.aluno.nome}<span className="pequeno suave mono" style={{ display: "block" }}>{r.aluno.matricula}</span></td>
              <td className="mono" style={{ textAlign: "center" }}>{r.emDia}/{r.total}</td>
              <td className="mono" style={{ textAlign: "center" }}>{r.comAluno}</td>
              <td className="mono" style={{ textAlign: "center", color: r.comProfessor ? "var(--ocre)" : undefined }}>{r.comProfessor}</td>
              <td style={{ textAlign: "right" }}>
                {r.comAluno + r.comProfessor === 0 ? <span className="selo verde">em dia</span> : <button type="button" className="botao secundario pequeno" onClick={() => abrir(r)}>Ver relatório</button>}
              </td>
            </tr>
          ))}
          <tr style={{ background: "var(--superficie-2)" }}>
            <td><strong>Total da turma{turma ? ` — ${turma.nome}` : ""}</strong></td><td />
            <td className="mono" style={{ textAlign: "center" }}><strong>{tot.aluno}</strong></td>
            <td className="mono" style={{ textAlign: "center" }}><strong>{tot.prof}</strong></td><td />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
