// Auditoria (só administrador): quem entrou e o que foi feito
import { useEffect, useMemo, useState } from "react";
import { lerAuditoria } from "../lib/auditoria";
import { traduzirErro, NOME_PAPEL } from "../lib/sessao";
import { carimbo } from "../lib/backup";

export default function Auditoria() {
  const [dias, setDias] = useState(7);
  const [tipo, setTipo] = useState("");
  const [busca, setBusca] = useState("");
  const [itens, setItens] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setItens(null); setErro("");
    lerAuditoria({ dias }).then(setItens).catch((e) => setErro(traduzirErro(e)));
  }, [dias]);

  const filtrados = useMemo(() => {
    const b = busca.trim().toLowerCase();
    return (itens || []).filter((i) => (!tipo || i.tipo === tipo) &&
      (!b || `${i.nome} ${i.email} ${i.acao} ${i.detalhe}`.toLowerCase().includes(b)));
  }, [itens, tipo, busca]);

  const acessos = (itens || []).filter((i) => i.tipo === "acesso");
  const pessoas = new Set(acessos.map((i) => i.uid)).size;

  const exportar = () => {
    const linhas = [["Quando", "Tipo", "Nome", "E-mail", "Perfil", "Ação", "Detalhe"],
      ...filtrados.map((i) => [i.em?.toDate?.().toLocaleString("pt-BR") || "", i.tipo, i.nome, i.email, NOME_PAPEL[i.papel] || i.papel, i.acao, i.detalhe])];
    const csv = "﻿" + linhas.map((l) => l.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = `Auditoria-CTC-${carimbo()}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  return (
    <>
      <div>
        <h1>Auditoria</h1>
        <p className="suave" style={{ maxWidth: 760 }}>
          Registro de quem entrou no CTC e das ações importantes: turmas, listas de alunos, matrículas, professores
          autorizados, backups e chamados. Ninguém consegue alterar ou apagar estes registros. As alterações no
          Banco de Dados continuam no Histórico de alterações.
        </p>
      </div>
      <div className="grade" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
        <Numero valor={itens ? acessos.length : "…"} rotulo={`entradas nos últimos ${dias} dias`} />
        <Numero valor={itens ? pessoas : "…"} rotulo="pessoas diferentes" />
        <Numero valor={itens ? itens.length - acessos.length : "…"} rotulo="ações registradas" />
      </div>
      <section className="cartao sem-padding">
        <div className="cartao-topo" style={{ alignItems: "flex-end" }}>
          <div className="linha-form" style={{ flex: 1 }}>
            <div className="campo" style={{ flex: "0 1 160px" }}>
              <label htmlFor="au-dias">Período</label>
              <select id="au-dias" value={dias} onChange={(e) => setDias(Number(e.target.value))}>
                <option value={1}>Hoje e ontem</option><option value={7}>7 dias</option>
                <option value={30}>30 dias</option><option value={120}>120 dias</option>
              </select>
            </div>
            <div className="campo" style={{ flex: "0 1 160px" }}>
              <label htmlFor="au-tipo">Tipo</label>
              <select id="au-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="">Todos</option><option value="acesso">Entradas</option><option value="acao">Ações</option>
              </select>
            </div>
            <div className="campo">
              <label htmlFor="au-busca">Buscar (nome, e-mail, ação)</label>
              <input id="au-busca" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
          </div>
          <button className="botao secundario pequeno" onClick={exportar} disabled={!filtrados.length}>Exportar (.csv)</button>
        </div>
        {erro && <div className="aviso erro" style={{ margin: 16 }}>{erro}</div>}
        <div className="tabela-caixa">
          <table>
            <thead><tr><th>Quando</th><th>Quem</th><th>Perfil</th><th>Ação</th><th>Detalhe</th></tr></thead>
            <tbody>
              {!itens && !erro && <tr><td colSpan={5} className="suave">Carregando…</td></tr>}
              {itens && filtrados.length === 0 && <tr><td colSpan={5} className="suave">Nenhum registro no período.</td></tr>}
              {filtrados.map((i) => (
                <tr key={i.id}>
                  <td className="pequeno mono">{i.em?.toDate?.().toLocaleString("pt-BR") || "…"}</td>
                  <td>{i.nome}<span className="pequeno suave" style={{ display: "block" }}>{i.email}</span></td>
                  <td className="pequeno">{NOME_PAPEL[i.papel] || i.papel || "—"}</td>
                  <td><span className={`selo ${i.tipo === "acesso" ? "cinza" : "verde"}`}>{i.acao}</span></td>
                  <td className="pequeno suave" style={{ maxWidth: 360, overflowWrap: "anywhere" }}>{i.detalhe || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="pequeno suave" style={{ padding: "8px 16px 14px" }}>Mostra até 500 registros do período escolhido.</p>
      </section>
    </>
  );
}

function Numero({ valor, rotulo }) {
  return (
    <div className="cartao" style={{ gap: 2 }}>
      <span className="mono" style={{ fontSize: 30, fontWeight: 600, color: "var(--destaque)" }}>{valor}</span>
      <span className="pequeno suave">{rotulo}</span>
    </div>
  );
}
