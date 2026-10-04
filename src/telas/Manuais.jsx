// Manual do Professor e Manual do Aluno (Guia Pedagógico; o do aluno também em "Ajuda").
import { ATUALIZADO_EM, MANUAL_ALUNO, MANUAL_PROFESSOR } from "../dados/manuais";

function Manual({ titulo, secoes, intro }) {
  return (
    <>
      <section className="cartao">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <h2>{titulo}</h2>
            <span className="pequeno suave">{intro} · atualizado em {ATUALIZADO_EM}</span>
          </div>
          <button className="botao secundario pequeno" onClick={() => imprimir(titulo, secoes)}>Imprimir / PDF</button>
        </div>
        <nav aria-label="Índice" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {secoes.map((s, i) => <a key={s.id} href={`#manual-${s.id}`} className="botao secundario pequeno" style={{ textDecoration: "none" }} onClick={(e) => { e.preventDefault(); document.getElementById(`manual-${s.id}`)?.scrollIntoView({ behavior: "smooth" }); }}>{i + 1}. {s.titulo}</a>)}
        </nav>
      </section>
      {secoes.map((s, i) => (
        <section key={s.id} id={`manual-${s.id}`} className="cartao">
          <h2><span className="mono" style={{ color: "var(--destaque)" }}>{i + 1}.</span> {s.titulo}</h2>
          <ol style={{ margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 6 }}>
            {s.passos.map((p) => <li key={p}>{p}</li>)}
          </ol>
          {s.dica && <div className="aviso pequeno"><strong>Dica:</strong> {s.dica}</div>}
        </section>
      ))}
    </>
  );
}

export const ManualDoProfessor = () => <Manual titulo="Manual do Professor" secoes={MANUAL_PROFESSOR} intro="Passo a passo das telas do professor" />;
export const ManualDoAluno = () => <Manual titulo="Manual do Aluno" secoes={MANUAL_ALUNO} intro={"O mesmo manual que o aluno vê em \"Ajuda\""} />;

// "Ajuda" no menu do aluno
export default function Ajuda() {
  return (
    <>
      <div>
        <h1>Ajuda</h1>
        <p className="suave">Como usar o CTC, passo a passo. Ainda com dúvida? Abra um chamado em "Suporte".</p>
      </div>
      <Manual titulo="Manual do Aluno" secoes={MANUAL_ALUNO} intro="CTC — Curso Técnico em Contabilidade" />
    </>
  );
}

function imprimir(titulo, secoes) {
  const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>CTC — ${esc(titulo)}</title><style>
    @page { size: A4; margin: 18mm 16mm; } body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; color: #111; }
    h1 { font-size: 18pt; margin: 0 0 2mm; } .sub { color: #555; margin: 0 0 8mm; } h2 { font-size: 13pt; margin: 6mm 0 2mm; color: #7a5a23; }
    ol { margin: 0; padding-left: 7mm; } li { margin: 1.5mm 0; } .dica { border-left: 3px solid #7a5a23; padding: 1mm 3mm; margin-top: 2mm; background: #f6f1e7; }
    section { break-inside: avoid; }
  </style></head><body><h1>CTC — ${esc(titulo)}</h1><p class="sub">CEDUP Hermann Hering — Curso Técnico em Contabilidade · atualizado em ${esc(ATUALIZADO_EM)}</p>
  ${secoes.map((s, i) => `<section><h2>${i + 1}. ${esc(s.titulo)}</h2><ol>${s.passos.map((p) => `<li>${esc(p)}</li>`).join("")}</ol>${s.dica ? `<p class="dica"><b>Dica:</b> ${esc(s.dica)}</p>` : ""}</section>`).join("")}
  <script>window.onload = () => setTimeout(() => window.print(), 300);</script></body></html>`;
  const w = window.open("", "_blank");
  if (!w) return window.alert("O navegador bloqueou a janela de impressão. Permita pop-ups para o CTC.");
  w.document.open(); w.document.write(html); w.document.close();
}
