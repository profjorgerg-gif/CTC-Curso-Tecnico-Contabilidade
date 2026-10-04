// Slides do Guia Pedagógico: escolha da disciplina e do módulo, apresentação em
// tela cheia (setas do teclado), notas do professor e impressão (PDF pelo navegador).
import { useEffect, useRef, useState } from "react";
import { DISCIPLINAS } from "../dados/disciplinas";
import { apresentacoesDe } from "../dados/slides";

export function Slides() {
  const [disc, setDisc] = useState("cb");
  const [aberta, setAberta] = useState(null);
  const lista = apresentacoesDe(disc);
  const d = DISCIPLINAS.find((x) => x.id === disc);

  if (aberta) return <Apresentacao ap={aberta} disciplina={d} aoFechar={() => setAberta(null)} />;
  return (
    <>
      <div className="abas" role="tablist" aria-label="Disciplina">
        {DISCIPLINAS.map((x) => (
          <button key={x.id} role="tab" aria-selected={disc === x.id} className={disc === x.id ? "ativo" : ""} onClick={() => setDisc(x.id)}>
            {x.sigla}{apresentacoesDe(x.id).length ? ` · ${apresentacoesDe(x.id).length}` : ""}
          </button>
        ))}
      </div>
      <section className="cartao sem-padding">
        <div className="cartao-topo"><h2>{d.nome}</h2><span className="pequeno suave">{lista.length} de {d.modulos.length} módulo(s) com slides</span></div>
        <div className="tabela-caixa">
          <table>
            <thead><tr><th>#</th><th>Módulo</th><th>Slides</th><th></th></tr></thead>
            <tbody>
              {d.modulos.length === 0 && <tr><td colSpan={4} className="suave">Os módulos desta disciplina ainda não foram definidos.</td></tr>}
              {d.modulos.map((m, i) => {
                const ap = lista.find((a) => a.modulo === m);
                return (
                  <tr key={m}>
                    <td className="mono">{i + 1}</td>
                    <td>{m}</td>
                    <td className="mono">{ap ? ap.slides.length + 1 : "—"}</td>
                    <td style={{ textAlign: "right" }}>
                      {ap ? <button className="botao pequeno" onClick={() => setAberta(ap)}>Abrir</button> : <span className="selo cinza">Em preparação</span>}
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

function Apresentacao({ ap, disciplina, aoFechar }) {
  const total = ap.slides.length + 1; // + capa
  const [i, setI] = useState(0);
  const [notas, setNotas] = useState(false);
  const palco = useRef(null);
  const ir = (n) => setI((x) => Math.max(0, Math.min(total - 1, x + n)));

  useEffect(() => {
    const tecla = (e) => {
      if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); ir(1); }
      if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); ir(-1); }
      if (e.key === "Home") setI(0);
      if (e.key === "End") setI(total - 1);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [total]);

  const telaCheia = () => (document.fullscreenElement ? document.exitFullscreen() : palco.current?.requestFullscreen?.());
  const s = i === 0 ? null : ap.slides[i - 1];

  return (
    <>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button className="botao secundario pequeno" onClick={aoFechar}>← Módulos</button>
        <strong style={{ marginRight: "auto" }}>{disciplina.sigla} · {ap.titulo}</strong>
        <label className="pequeno" style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input type="checkbox" style={{ minHeight: 0 }} checked={notas} onChange={(e) => setNotas(e.target.checked)} /> Notas do professor
        </label>
        <button className="botao secundario pequeno" onClick={() => imprimir(ap, disciplina)}>Imprimir / PDF</button>
        <button className="botao pequeno" onClick={telaCheia}>Tela cheia</button>
      </div>
      <div ref={palco} className="slide-palco">
        <div className="slide" onClick={() => ir(1)}>
          {i === 0 ? (
            <div className="slide-capa">
              <span className="slide-selo">CTC · {disciplina.nome}</span>
              <h2>{ap.titulo}</h2>
              {ap.subtitulo && <p>{ap.subtitulo}</p>}
              <span className="slide-rodape-capa">CEDUP Hermann Hering — Curso Técnico em Contabilidade</span>
            </div>
          ) : <ConteudoSlide s={s} />}
          <span className="slide-numero">{i + 1} / {total}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }}>
        <button className="botao secundario" onClick={() => ir(-1)} disabled={i === 0} aria-label="Slide anterior">◀</button>
        <span className="mono pequeno">{i + 1} / {total}</span>
        <button className="botao secundario" onClick={() => ir(1)} disabled={i === total - 1} aria-label="Próximo slide">▶</button>
      </div>
      {notas && <div className="aviso pequeno"><strong>Notas do professor:</strong> {s?.notas || "Apresente o tema e os objetivos da aula."}</div>}
      <p className="pequeno suave" style={{ textAlign: "center", margin: 0 }}>Use as setas do teclado (← →) ou clique no slide para avançar. Em tela cheia, Esc sai.</p>
    </>
  );
}

function ConteudoSlide({ s }) {
  return (
    <div className="slide-conteudo">
      <h3>{s.titulo}</h3>
      {s.pontos && <ul>{s.pontos.map((p) => <li key={p}>{p}</li>)}</ul>}
      {s.tabela && (
        <table>
          <thead><tr>{s.tabela.cab.map((c, k) => <th key={k}>{c}</th>)}</tr></thead>
          <tbody>{s.tabela.linhas.map((l, k) => <tr key={k}>{l.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
        </table>
      )}
      {s.destaque && <p className="slide-destaque">{s.destaque}</p>}
    </div>
  );
}

// impressão: um slide por página, em paisagem, com as notas do professor embaixo
function imprimir(ap, disciplina) {
  const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pagina = (conteudo, notas) => `<div class="pg"><div class="sl">${conteudo}</div>${notas ? `<p class="nt"><b>Notas do professor:</b> ${esc(notas)}</p>` : ""}</div>`;
  const capa = pagina(`<div class="capa"><small>CTC · ${esc(disciplina.nome)}</small><h1>${esc(ap.titulo)}</h1><p>${esc(ap.subtitulo || "")}</p><small>CEDUP Hermann Hering — Curso Técnico em Contabilidade</small></div>`);
  const corpo = ap.slides.map((s) => pagina(
    `<h2>${esc(s.titulo)}</h2>${s.pontos ? `<ul>${s.pontos.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}` +
    (s.tabela ? `<table><tr>${s.tabela.cab.map((c) => `<th>${esc(c)}</th>`).join("")}</tr>${s.tabela.linhas.map((l) => `<tr>${l.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</table>` : "") +
    (s.destaque ? `<p class="dq">${esc(s.destaque)}</p>` : ""), s.notas)).join("");
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(disciplina.sigla)} — ${esc(ap.titulo)}</title><style>
    @page { size: A4 landscape; margin: 10mm; }
    body { font-family: Arial, Helvetica, sans-serif; margin: 0; color: #111; }
    .pg { page-break-after: always; height: 185mm; display: flex; flex-direction: column; gap: 4mm; }
    .sl { flex: 1; border: 1px solid #999; border-radius: 6px; padding: 10mm 14mm; }
    h1 { font-size: 30pt; margin: 8mm 0 4mm; } h2 { font-size: 22pt; margin: 0 0 6mm; color: #7a5a23; }
    ul { font-size: 15pt; line-height: 1.5; } table { border-collapse: collapse; width: 100%; font-size: 13pt; }
    th, td { border: 1px solid #888; padding: 2mm 3mm; text-align: left; } th { background: #eee; }
    .dq { font-size: 14pt; font-weight: bold; border-left: 4px solid #7a5a23; padding-left: 4mm; margin-top: 6mm; }
    .capa { display: flex; flex-direction: column; justify-content: center; height: 100%; } .capa p { font-size: 15pt; }
    .nt { font-size: 10pt; color: #333; margin: 0; }
  </style></head><body>${capa}${corpo}<script>window.onload = () => setTimeout(() => window.print(), 300);</script></body></html>`;
  const w = window.open("", "_blank");
  if (!w) return window.alert("O navegador bloqueou a janela de impressão. Permita pop-ups para o CTC.");
  w.document.open(); w.document.write(html); w.document.close();
}
