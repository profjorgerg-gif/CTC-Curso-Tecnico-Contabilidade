// Menu lateral (aprovado em 10/10/2026, a partir do kit da CI Unidade II): para professor e
// administrador, os itens ficam agrupados por tarefa, com o número de chamados que aguardam
// você no Suporte; os grupos de ferramentas e de administração podem ser recolhidos (a escolha
// fica neste navegador). O menu do aluno continua uma lista simples.
import { useEffect, useState } from "react";
import { aguardandoMim, listarChamados } from "../lib/suporte";

const GRUPOS = [
  { itens: ["inicio"] },
  { rotulo: "hoje", itens: ["turmas", "suporte"] },
  { rotulo: "preparar e consultar", itens: ["disciplinas", "guia", "banco"] },
  { id: "ferramentas", rotulo: "ferramentas", recolhivel: true, itens: ["backup", "teste"] },
  { id: "administracao", rotulo: "administração", recolhivel: true, itens: ["auditoria", "autorizados", "checklist"] },
];
const AVISOS = { teste: "como aluno" };
const CHAVE = "ctc-menu-recolhido";
const lerRecolhidos = () => { try { return JSON.parse(localStorage.getItem(CHAVE) || "{}") || {}; } catch { return {}; } };

export default function MenuLateral({ menu, pagina, ir, sessao, papel }) {
  const [badge, setBadge] = useState(0);
  const [recolhidos, setRecolhidos] = useState(lerRecolhidos);
  const porTarefa = papel !== "aluno";
  // chamados aguardando você: relido ao abrir o CTC e sempre que você sai do Suporte
  useEffect(() => {
    if (!porTarefa || pagina === "suporte") return;
    listarChamados(sessao).then((c) => setBadge(aguardandoMim(sessao, c))).catch(() => {});
  }, [porTarefa, pagina === "suporte"]);

  const rotulos = Object.fromEntries(menu);
  const Botao = ({ id }) => (
    <button key={id} className={pagina === id ? "ativo" : ""} onClick={() => ir(id)}>
      <span style={{ flex: 1 }}>{rotulos[id]}</span>
      {id === "suporte" && badge > 0 && <span className="menu-badge" title="Chamados aguardando a sua resposta">{badge}</span>}
      {AVISOS[id] && <span className="menu-aviso">{AVISOS[id]}</span>}
    </button>
  );
  if (!porTarefa) {
    return <nav className="menu" aria-label="Menu principal">{menu.map(([id]) => <Botao key={id} id={id} />)}</nav>;
  }
  const alternar = (g) => {
    const n = { ...recolhidos, [g]: !recolhidos[g] };
    setRecolhidos(n); try { localStorage.setItem(CHAVE, JSON.stringify(n)); } catch { /* sem armazenamento */ }
  };
  const usados = new Set(GRUPOS.flatMap((g) => g.itens));
  const grupos = [...GRUPOS, { rotulo: "outros", itens: menu.map(([id]) => id).filter((id) => !usados.has(id)) }]
    .map((g) => ({ ...g, itens: g.itens.filter((id) => rotulos[id]) })).filter((g) => g.itens.length);
  return (
    <nav className="menu" aria-label="Menu principal">
      {grupos.map((g, i) => {
        const fechado = g.recolhivel && recolhidos[g.id] && !g.itens.includes(pagina);
        return (
          <div key={g.id || g.rotulo || i} className="menu-grupo">
            {g.rotulo && (g.recolhivel
              ? <button type="button" className="menu-rotulo" aria-expanded={!fechado} onClick={() => alternar(g.id)}>{g.rotulo} {fechado ? "▸" : "▾"}</button>
              : <span className="menu-rotulo">{g.rotulo}</span>)}
            {!fechado && g.itens.map((id) => <Botao key={id} id={id} />)}
          </div>
        );
      })}
    </nav>
  );
}
