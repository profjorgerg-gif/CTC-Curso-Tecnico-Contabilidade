// Uma questão teórica: mostra o enunciado, as afirmações (I, II, III) e as alternativas.
// modo "gabarito": destaca a correta (professor). modo "responder": o aluno marca.
// modo "correcao": mostra a marcada, a correta e a explicação.
import { LETRAS, ROMANOS, ordemDasAlternativas } from "../lib/questoes";

export default function Questao({ q, n, modo = "responder", resposta, aoResponder, correta, explicacao, matricula = "", desabilitada }) {
  const opcoes = q.tipo === "vf"
    ? [{ valor: true, texto: "Verdadeiro" }, { valor: false, texto: "Falso" }]
    : ordemDasAlternativas(q, matricula).map((i) => ({ valor: i, texto: q.alternativas[i] }));
  const certa = correta ?? q.correta;
  const marcou = resposta !== undefined && resposta !== null;
  const acertou = marcou && (q.tipo === "vf" ? resposta === certa : Number(resposta) === Number(certa));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid var(--linha-suave)", paddingTop: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
        <span className="mono" style={{ color: "var(--destaque)", fontWeight: 600 }}>{String(n).padStart(2, "0")}</span>
        <span className="selo cinza">{q.tipo === "me" ? "Múltipla escolha" : q.tipo === "vf" ? "Verdadeiro ou falso" : "Afirmações"}</span>
        {modo === "correcao" && (marcou
          ? <span className={`selo ${acertou ? "verde" : "vermelho"}`}>{acertou ? "Certa" : "Errada"}</span>
          : <span className="selo ocre">Sem resposta</span>)}
      </div>
      <p style={{ margin: 0 }}>{q.enunciado}</p>
      {q.tipo === "af" && (
        <ol style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
          {q.afirmacoes.map((a, i) => <li key={i}><strong className="mono">{ROMANOS[i]}.</strong> {a}</li>)}
        </ol>
      )}
      <div role="radiogroup" aria-label={`Questão ${n}`} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {opcoes.map((o, k) => {
          const rotulo = q.tipo === "vf" ? "" : `${LETRAS[k]}) `;
          const ehCerta = q.tipo === "vf" ? o.valor === certa : Number(o.valor) === Number(certa);
          const ehMarcada = marcou && (q.tipo === "vf" ? resposta === o.valor : Number(resposta) === Number(o.valor));
          let estilo = { border: "1px solid var(--linha)", borderRadius: 8, padding: "8px 12px", display: "flex", gap: 10, alignItems: "center" };
          if ((modo === "gabarito" || modo === "correcao") && ehCerta) estilo = { ...estilo, borderColor: "var(--verde, #7FBF9E)", background: "var(--verde-claro)" };
          if (modo === "correcao" && ehMarcada && !ehCerta) estilo = { ...estilo, borderColor: "var(--vermelho)", background: "var(--vermelho-claro)" };
          if (modo === "responder" && ehMarcada) estilo = { ...estilo, borderColor: "var(--destaque)" };
          return (
            <label key={k} style={{ ...estilo, cursor: modo === "responder" && !desabilitada ? "pointer" : "default" }}>
              {modo === "responder" && (
                <input type="radio" name={`q-${q.id}`} checked={ehMarcada} disabled={desabilitada} onChange={() => aoResponder?.(o.valor)} style={{ minHeight: 0 }} />
              )}
              <span>{rotulo}{o.texto}</span>
              {modo !== "responder" && ehCerta && <span className="pequeno" style={{ marginLeft: "auto", color: "var(--verde-texto)" }}>correta</span>}
              {modo === "correcao" && ehMarcada && !ehCerta && <span className="pequeno" style={{ marginLeft: "auto", color: "var(--vermelho)" }}>sua resposta</span>}
            </label>
          );
        })}
      </div>
      {(modo === "gabarito" || modo === "correcao") && explicacao && <div className="aviso pequeno"><strong>Explicação:</strong> {explicacao}</div>}
    </div>
  );
}
