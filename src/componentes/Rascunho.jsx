// Avisos da proteção contra digitação perdida (ver lib/rascunho.js).

const quando = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
};

// faixa "há um rascunho não salvo" com Restaurar / Descartar
export function AvisoRascunho({ r, oque = "este formulário" }) {
  if (!r.encontrado) return null;
  return (
    <div className="aviso atencao" role="status" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      <span style={{ flex: "1 1 320px" }}>
        <strong>Há um rascunho não salvo</strong> — {oque}, de {quando(r.encontrado.em)}. Ele ficou guardado neste computador porque você saiu antes de salvar.
      </span>
      <button type="button" className="botao pequeno" onClick={r.restaurar}>Restaurar</button>
      <button type="button" className="botao secundario pequeno" onClick={r.descartar}>Descartar</button>
    </div>
  );
}

// selo "● alterações não salvas" (fica ao lado do botão de salvar)
export function SeloNaoSalvo({ sujo }) {
  if (!sujo) return null;
  return <span className="pequeno" role="status" style={{ color: "var(--ocre)", fontWeight: 600 }}>● alterações não salvas</span>;
}
