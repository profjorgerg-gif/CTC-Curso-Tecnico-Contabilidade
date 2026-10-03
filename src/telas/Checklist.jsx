// Checklist de pendências do desenvolvimento do CTC (só administrador).
// A lista vem de public/dados/checklist.json e é atualizada a cada fase entregue.
import { useEffect, useMemo, useState } from "react";
import { carregarTabela } from "../lib/arquivos";

export default function Checklist() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");
  const [verConcluidas, setVerConcluidas] = useState(false);

  useEffect(() => {
    // sem cache: sempre a versão publicada mais recente
    fetch(`${import.meta.env.BASE_URL}dados/checklist.json?v=${Date.now()}`)
      .then((r) => r.json()).then(setDados)
      .catch(() => carregarTabela("checklist").then(setDados).catch(() => setErro("Não foi possível carregar o checklist.")));
  }, []);

  const { pendentes, concluidas, grupos } = useMemo(() => {
    const itens = dados?.itens || [];
    const pend = itens.filter((i) => !i.feito);
    const g = [];
    pend.forEach((i) => {
      let grupo = g.find((x) => x.fase === i.fase);
      if (!grupo) g.push((grupo = { fase: i.fase, itens: [] }));
      grupo.itens.push(i);
    });
    return { pendentes: pend, concluidas: itens.filter((i) => i.feito), grupos: g };
  }, [dados]);

  const total = (dados?.itens || []).length;
  const pct = total ? Math.round((concluidas.length / total) * 100) : 0;

  return (
    <>
      <div>
        <h1>Checklist de pendências</h1>
        <p className="suave">O que falta para o CTC ficar completo. A lista é atualizada a cada fase entregue{dados ? ` · última atualização em ${dados.atualizadoEm.split("-").reverse().join("/")}` : ""}.</p>
      </div>
      {erro && <div className="aviso erro">{erro}</div>}

      {dados && (
        <section className="cartao">
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "baseline" }}>
            <div><span className="mono" style={{ fontSize: 32, fontWeight: 600, color: pendentes.length ? "var(--ocre)" : "var(--verde)" }}>{pendentes.length}</span> <span className="suave">pendente(s)</span></div>
            <div><span className="mono" style={{ fontSize: 20, fontWeight: 600, color: "var(--verde)" }}>{concluidas.length}</span> <span className="suave">concluída(s) de {total}</span></div>
          </div>
          <div aria-label={`${pct}% concluído`} style={{ height: 8, background: "var(--linha-suave)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: "var(--verde)" }} />
          </div>
          {pendentes.length === 0 && <div className="aviso">Todas as pendências foram concluídas.</div>}
        </section>
      )}

      {grupos.map((g) => (
        <section key={g.fase} className="cartao sem-padding">
          <div className="cartao-topo"><h2>{g.fase}</h2><span className="pequeno suave">{g.itens.length} pendente(s)</span></div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {g.itens.map((i) => (
              <li key={i.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 18px", borderTop: "1px solid var(--linha-suave)", flexWrap: "wrap" }}>
                <span aria-hidden="true" style={{ width: 16, height: 16, border: "1.5px solid #b9c0b8", borderRadius: 4, flex: "none" }} />
                <span style={{ flex: "1 1 260px" }}>{i.item}</span>
                <span className={`selo ${i.quem === "Professor" ? "ocre" : i.quem === "Claude" ? "verde" : "cinza"}`}>{i.quem === "Professor" ? "Com você" : i.quem === "Claude" ? "Com o Claude" : i.quem}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {concluidas.length > 0 && (
        <section className="cartao">
          <button className="botao secundario pequeno" style={{ alignSelf: "flex-start" }} onClick={() => setVerConcluidas(!verConcluidas)}>
            {verConcluidas ? "Ocultar" : "Ver"} concluídas ({concluidas.length})
          </button>
          {verConcluidas && concluidas.map((i) => <p key={i.id} className="suave pequeno">✓ {i.fase} — {i.item}</p>)}
        </section>
      )}
    </>
  );
}
