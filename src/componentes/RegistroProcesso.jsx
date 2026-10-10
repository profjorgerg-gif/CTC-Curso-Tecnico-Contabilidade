// Registro do processo (aprovado em 10/10/2026, a partir do kit da CI Unidade II): a linha do
// tempo do aluno — o que ele fez e quando, as correções do professor, os chamados, as tarefas
// devolvidas e o que foi para a lixeira. Base para a nota de processo. Só leitura; imprime com o
// nome do aluno e a data no nome do arquivo.
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { listarChamados, fmtNumero } from "../lib/suporte";
import { lerLixeiraDaEmpresa, TIPOS_LIXEIRA } from "../lib/lixeira";
import { FATOS_ORIENTADOS, dataBR } from "../lib/contabil";
import { AREAS } from "../lib/parametros";

const comoData = (v) => {
  if (!v) return null;
  if (v.toDate) return v.toDate();
  const d = new Date(String(v).split("#")[0]);
  return Number.isNaN(d.getTime()) ? null : d;
};
const fmt = (d) => d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function montarEventos({ bruto, listas, chamados, devolucoes, lixeira, aluno }) {
  const ev = [];
  const add = (quando, quem, oque, detalhe = "") => { const d = comoData(quando); if (d) ev.push({ d, quem, oque, detalhe }); };
  const e = bruto?.empresa;
  if (e) {
    for (const [area, quando] of Object.entries(e.parametrosConfirmados || {})) add(quando, "aluno", `Confirmou a parametrização ${AREAS.find((a) => a.id === area)?.nome || area}`);
    for (const [k, quando] of Object.entries(e.progresso || {})) {
      if (k.startsWith("estudado-")) add(quando, "aluno", `Marcou o módulo ${k.split("-").pop()} como estudado`);
      else if (k === "montou-dre") add(quando, "aluno", "Montou e conferiu a DRE");
      else if (k === "montou-dlpa") add(quando, "aluno", "Montou e conferiu a DLPA");
      else if (k === "montou-bp") add(quando, "aluno", "Montou e conferiu o Balanço Patrimonial");
    }
  }
  const titulo = (id) => listas.find((l) => l.id === id)?.titulo || "lista";
  for (const l of bruto?.esc?.lancamentos || []) {
    const ref = l.encerramento ? "encerramento" : l.fatoOrientado ? `fato orientado ${l.fatoOrientado} de ${FATOS_ORIENTADOS.length}` : l.lista ? `${titulo(l.lista.id)}, fato ${l.lista.n}` : "lançamento livre";
    const quemCriou = l.criadoPor?.papel && l.criadoPor.papel !== "aluno" ? "professor" : "aluno";
    if (!l.encerramento || l.criadoEm?.endsWith?.("#000")) add(l.criadoEm, quemCriou, l.encerramento ? "Gravou o encerramento do exercício" : `Lançou (${ref})`, l.encerramento ? `data ${dataBR(l.data)}` : `${dataBR(l.data)} — ${l.historico}`);
    if (l.alteradoEm) add(l.alteradoEm, l.alteradoPor?.papel && l.alteradoPor.papel !== "aluno" ? "professor" : "aluno", `Corrigiu um lançamento (${ref})`, `${dataBR(l.data)} — ${l.historico}`);
  }
  for (const [listaId, r] of Object.entries(bruto?.respostas || {})) if (r) add(r.enviadaEm, "aluno", `Salvou respostas de "${titulo(listaId)}"`, `${Object.keys(r.respostas || {}).length} questão(ões) respondida(s)`);
  for (const c of chamados) {
    add(c.criadoEm, c.autorPapel === "aluno" ? "aluno" : "professor", `Abriu o chamado Nº ${fmtNumero(c.numero)}`, c.assunto);
    for (const r of c.respostas || []) add(r.em, r.porPapel === "aluno" ? "aluno" : "professor", `Respondeu o chamado Nº ${fmtNumero(c.numero)}`, (r.texto || "").slice(0, 120));
  }
  for (const d of devolucoes) add(d.em, "professor", `Devolveu "${d.listaTitulo}" para refazer`, `até ${d.ate?.toDate?.().toLocaleDateString("pt-BR") || ""} — ${(d.orientacao || "").slice(0, 120)}`);
  for (const i of lixeira) add(i.em, i.porPapel === "aluno" ? "aluno" : "professor", `Lixeira: ${TIPOS_LIXEIRA[i.tipo] || i.tipo}`, i.resumo);
  return ev.sort((a, b) => a.d - b.d);
}

function imprimir(aluno, turma, eventos) {
  const z = (x) => String(x).padStart(2, "0"); const n = new Date();
  const titulo = `Registro do processo - ${aluno.nome} - ${n.getFullYear()}-${z(n.getMonth() + 1)}-${z(n.getDate())}_${z(n.getHours())}h${z(n.getMinutes())}`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(titulo)}</title><style>@page{size:A4;margin:12mm}body{font:12px/1.4 Arial,sans-serif;color:#000}h1{font-size:16px;margin:0}table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border-bottom:1px solid #999;padding:4px 6px;text-align:left;vertical-align:top}thead{display:table-header-group}tr{break-inside:avoid}</style></head><body>
    <h1>Registro do processo — ${esc(aluno.nome)}</h1><div>${esc(turma?.nome || "")} · matrícula ${esc(aluno.matricula)} · gerado em ${n.toLocaleString("pt-BR")} · ${eventos.length} registro(s)</div>
    <table><thead><tr><th>Quando</th><th>Quem</th><th>O que</th><th>Detalhe</th></tr></thead><tbody>${eventos.map((e) => `<tr><td>${fmt(e.d)}</td><td>${e.quem === "aluno" ? "Aluno" : "Professor"}</td><td>${esc(e.oque)}</td><td>${esc(e.detalhe)}</td></tr>`).join("")}</tbody></table></body></html>`;
  const f = document.createElement("iframe"); f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0"; document.body.appendChild(f);
  const d = f.contentWindow.document; d.open(); d.write(html); d.close();
  const anterior = document.title; document.title = titulo;
  const limpar = () => { document.title = anterior; setTimeout(() => f.remove(), 500); window.removeEventListener("afterprint", limpar); };
  window.addEventListener("afterprint", limpar);
  setTimeout(() => { try { f.contentWindow.focus(); f.contentWindow.print(); } catch { limpar(); } }, 250);
}

export default function RegistroProcesso({ sessao, turma, aluno, bruto, listas = [] }) {
  const [eventos, setEventos] = useState(null);
  const [filtro, setFiltro] = useState("todos");
  useEffect(() => {
    (async () => {
      const m = aluno.matricula;
      const [chs, devs, lx] = await Promise.all([
        listarChamados(sessao).then((cs) => cs.filter((c) => c.turmaId === turma.id && (c.autorMatricula === m || c.paraMatricula === m))).catch(() => []),
        getDocs(query(collection(db, "turmas", turma.id, "devolucoes"), where("matricula", "==", m))).then((s) => s.docs.map((d) => d.data())).catch(() => []),
        bruto?.empresa ? lerLixeiraDaEmpresa(bruto.empresa.id).catch(() => []) : [],
      ]);
      setEventos(montarEventos({ bruto, listas, chamados: chs, devolucoes: devs, lixeira: lx, aluno }));
    })();
  }, [turma.id, aluno.matricula]);
  const vis = (eventos || []).filter((e) => filtro === "todos" || e.quem === filtro);
  return (
    <section className="cartao" style={{ borderColor: "var(--linha)" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <h3 style={{ margin: 0, flex: "1 1 auto" }}>🕒 Registro do processo — {aluno.nome}</h3>
        <button type="button" className="botao secundario pequeno" disabled={!eventos?.length} onClick={() => imprimir(aluno, turma, eventos)}>🖨 Imprimir / salvar PDF</button>
      </div>
      <p className="pequeno suave" style={{ margin: 0 }}>Tudo o que foi gravado, em ordem: lançamentos e correções, respostas, parametrização, módulos estudados, demonstrações montadas, chamados, tarefas devolvidas e lixeira. Base para a nota de processo.</p>
      {!eventos && <p className="pequeno suave">Lendo…</p>}
      {eventos && (
        <>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[["todos", `Todos ${eventos.length}`], ["aluno", `Aluno ${eventos.filter((e) => e.quem === "aluno").length}`], ["professor", `Professor ${eventos.filter((e) => e.quem === "professor").length}`]].map(([id, r]) => (
              <button key={id} type="button" className={`chip ${filtro === id ? "ativo" : ""}`} onClick={() => setFiltro(id)}>{r}</button>
            ))}
          </div>
          {vis.length === 0 ? <p className="pequeno suave">Nenhum registro.</p> : (
            <div className="tabela-caixa" style={{ border: "1px solid var(--linha)", borderRadius: 10, maxHeight: 460, overflowY: "auto" }}>
              <table>
                <thead><tr><th>Quando</th><th>Quem</th><th>O que</th><th>Detalhe</th></tr></thead>
                <tbody>
                  {vis.map((e, i) => (
                    <tr key={i}>
                      <td className="mono pequeno" style={{ whiteSpace: "nowrap" }}>{fmt(e.d)}</td>
                      <td>{e.quem === "aluno" ? <span className="pilula-quem cheia">👤 Aluno</span> : <span className="pilula-quem vazada">🧑‍🏫 Professor</span>}</td>
                      <td>{e.oque}</td>
                      <td className="pequeno">{e.detalhe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
