// Texto de teoria de um módulo (blocos de src/dados/teoria.js); **trecho** = negrito
function Rico({ texto }) {
  const partes = String(texto ?? "").split(/(\*\*[^*]+\*\*)/g);
  return <>{partes.map((p, i) => (p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>))}</>;
}

function Tabela({ cab, linhas, titulo }) {
  return (
    <div className="tabela-caixa" style={{ border: "1px solid var(--linha)", borderRadius: 10 }}>
      {titulo && <div style={{ padding: "8px 12px", fontWeight: 600, color: "var(--destaque)" }}>{titulo}</div>}
      <table>
        <thead><tr>{cab.map((c, i) => <th key={i}>{c}</th>)}</tr></thead>
        <tbody>{linhas.map((l, i) => <tr key={i}>{l.map((c, j) => <td key={j}><Rico texto={c} /></td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function Bloco({ b }) {
  if (b.t === "p") return <p style={{ margin: 0, lineHeight: 1.65 }}><Rico texto={b.texto} /></p>;
  if (b.t === "lista") {
    const Tag = b.numerada ? "ol" : "ul";
    return <Tag style={{ margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 6, lineHeight: 1.6 }}>{b.itens.map((x, i) => <li key={i}><Rico texto={x} /></li>)}</Tag>;
  }
  if (b.t === "tabela") return <Tabela {...b} />;
  if (b.t === "destaque") return <div style={{ borderLeft: "4px solid var(--destaque)", background: "rgba(199, 154, 86, .1)", padding: "10px 14px", borderRadius: "0 8px 8px 0" }}><Rico texto={b.texto} /></div>;
  if (b.t === "exemplo") {
    return (
      <div style={{ border: "1px dashed var(--linha)", borderRadius: 10, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        <span className="pequeno" style={{ color: "var(--verde-texto, #7FBF9E)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{b.titulo || "Exemplo"}</span>
        {b.itens && <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>{b.itens.map((x, i) => <li key={i}><Rico texto={x} /></li>)}</ul>}
        {b.tabela && <Tabela {...b.tabela} />}
      </div>
    );
  }
  return null;
}

export default function Teoria({ teoria }) {
  return (
    <>
      {teoria.secoes.map((s) => (
        <section key={s.titulo} className="cartao" style={{ gap: 12 }}>
          <h2>{s.titulo}</h2>
          {s.blocos.map((b, i) => <Bloco key={i} b={b} />)}
        </section>
      ))}
      {teoria.fontes?.length > 0 && (
        <section className="cartao">
          <h3 style={{ margin: 0, fontSize: 14, color: "var(--destaque)" }}>Referências</h3>
          <ul className="pequeno suave" style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>{teoria.fontes.map((f) => <li key={f}>{f}</li>)}</ul>
        </section>
      )}
    </>
  );
}
