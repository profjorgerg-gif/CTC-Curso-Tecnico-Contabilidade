// Lixeira de segurança (professor): o que foi apagado ou substituído, com Restaurar.
import { useEffect, useState } from "react";
import { traduzirErro } from "../lib/sessao";
import {
  apagarDaLixeira, DIAS_NA_LIXEIRA, esvaziarAntigos, lerLixeiraDaEmpresa, lerLixeiraDaTurma, restaurarDaEmpresa, restaurarDaTurma, TIPOS_LIXEIRA,
} from "../lib/lixeira";

const quando = (ts) => ts?.toDate?.().toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) || "agora";

function Lixeira({ titulo, explicacao, caminho, ler, restaurar, aoRestaurar }) {
  const [itens, setItens] = useState(null);
  const [aberta, setAberta] = useState(false);
  const [msg, setMsg] = useState({});
  const [ocupado, setOcupado] = useState("");
  const carregar = () => ler().then(setItens).catch((e) => { setItens([]); setMsg({ tipo: "erro", texto: traduzirErro(e) }); });
  useEffect(() => { if (aberta && itens === null) carregar(); }, [aberta]);

  const fazer = async (id, fn, ok) => {
    setOcupado(id); setMsg({});
    try { const r = await fn(); setMsg({ texto: typeof ok === "function" ? ok(r) : ok }); await carregar(); } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
    setOcupado("");
  };

  return (
    <section className="cartao">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <h2>🗑 {titulo}</h2>
          <span className="pequeno suave">{explicacao}</span>
        </div>
        <button type="button" className="botao secundario pequeno" onClick={() => setAberta(!aberta)} aria-expanded={aberta}>{aberta ? "Fechar" : "Abrir a lixeira"}</button>
      </div>
      {aberta && (
        <>
          {msg.texto && <div className={`aviso ${msg.tipo || ""}`} role="status">{msg.texto}</div>}
          {itens === null && <p className="pequeno suave">Carregando…</p>}
          {itens?.length === 0 && <p className="pequeno suave">A lixeira está vazia.</p>}
          {itens?.length > 0 && (
            <div className="tabela-caixa" style={{ border: "1px solid var(--linha)", borderRadius: 10 }}>
              <table>
                <thead><tr><th>Quando</th><th>O que</th><th>Detalhe</th><th>Quem</th><th></th></tr></thead>
                <tbody>
                  {itens.map((i) => (
                    <tr key={i.id}>
                      <td className="pequeno mono">{quando(i.em)}</td>
                      <td>{TIPOS_LIXEIRA[i.tipo] || i.tipo}<span className="pequeno suave" style={{ display: "block" }}>{i.motivo}</span></td>
                      <td className="pequeno">{i.resumo}</td>
                      <td className="pequeno">{i.por}{i.porPapel === "aluno" ? " (aluno)" : ""}</td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <button type="button" className="botao pequeno" disabled={!!ocupado}
                          onClick={() => window.confirm(`Restaurar "${TIPOS_LIXEIRA[i.tipo]}: ${i.resumo}"? O que estiver no lugar também vai para a lixeira.`) && fazer(i.id, async () => { await restaurar(i); await aoRestaurar?.(); }, "Restaurado.")}>
                          {ocupado === i.id ? "…" : "Restaurar"}
                        </button>{" "}
                        <button type="button" className="botao secundario pequeno" disabled={!!ocupado}
                          onClick={() => window.confirm("Apagar este item da lixeira para sempre?") && fazer(i.id, () => apagarDaLixeira(caminho, i), "Item apagado da lixeira.")}>
                          Apagar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {itens?.length > 0 && (
            <div>
              <button type="button" className="botao secundario pequeno" disabled={!!ocupado}
                onClick={() => window.confirm(`Apagar para sempre os itens com mais de ${DIAS_NA_LIXEIRA} dias?`) && fazer("esvaziar", () => esvaziarAntigos(caminho, itens), (n) => (n ? `${n} item(ns) antigo(s) apagado(s).` : `Nenhum item com mais de ${DIAS_NA_LIXEIRA} dias.`))}>
                Esvaziar itens com mais de {DIAS_NA_LIXEIRA} dias
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export function LixeiraDaEmpresa({ empresa, aoRestaurar }) {
  return (
    <Lixeira titulo="Lixeira desta empresa" caminho={["empresas", empresa.id]}
      explicacao="Lançamentos excluídos, versões antes de cada correção, encerramentos desfeitos e saldos iniciais substituídos — do aluno ou seus."
      ler={() => lerLixeiraDaEmpresa(empresa.id)} restaurar={(i) => restaurarDaEmpresa(empresa.id, i)} aoRestaurar={aoRestaurar} />
  );
}

export function LixeiraDaTurma({ turma, aoRestaurar }) {
  return (
    <Lixeira titulo="Lixeira da turma" caminho={["turmas", turma.id]}
      explicacao="Listas excluídas, alunos retirados da turma e respostas apagadas."
      ler={() => lerLixeiraDaTurma(turma.id)} restaurar={(i) => restaurarDaTurma(turma.id, i)} aoRestaurar={aoRestaurar} />
  );
}
