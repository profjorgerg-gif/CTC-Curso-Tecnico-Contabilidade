import { useEffect, useState } from "react";
import { useSessao, sair, NOME_PAPEL } from "./lib/sessao";
import Login from "./telas/Login";
import PrimeiroAcesso from "./telas/PrimeiroAcesso";
import Inicio from "./telas/Inicio";
import Disciplinas from "./telas/Disciplinas";
import Turmas from "./telas/Turmas";
import BancoDados from "./telas/BancoDados";
import Autorizados from "./telas/Autorizados";
import Checklist from "./telas/Checklist";

// Itens do menu por perfil
const MENUS = {
  aluno: [["inicio", "Início"], ["disciplinas", "Minhas disciplinas"], ["turmas", "Minhas turmas"], ["banco", "Consultas"]],
  professor: [["inicio", "Início"], ["disciplinas", "Disciplinas"], ["turmas", "Turmas e matrículas"], ["banco", "Banco de Dados"]],
  admin: [["inicio", "Início"], ["disciplinas", "Disciplinas"], ["turmas", "Turmas e matrículas"], ["banco", "Banco de Dados"], ["autorizados", "Professores e administradores"], ["checklist", "Checklist de pendências"]],
};

// A página atual fica no endereço (#turmas, #banco...) para sobreviver ao F5
const lerPagina = () => (window.location.hash || "#inicio").slice(1).split("/");

export default function App() {
  const sessao = useSessao();
  const [rota, setRota] = useState(lerPagina);

  useEffect(() => {
    const ouvir = () => setRota(lerPagina());
    window.addEventListener("hashchange", ouvir);
    return () => window.removeEventListener("hashchange", ouvir);
  }, []);

  const ir = (...partes) => { window.location.hash = partes.join("/"); };

  if (sessao.carregando) return <div className="tela-login"><p className="suave">Carregando…</p></div>;
  if (!sessao.usuario) return <Login />;
  if (sessao.erro) {
    return (
      <div className="tela-login">
        <div className="caixa-login">
          <div className="aviso erro">{sessao.erro}</div>
          <button className="botao secundario" onClick={sair}>Sair e tentar de novo</button>
        </div>
      </div>
    );
  }
  if (sessao.papel === "aluno" && !sessao.perfil?.matricula) {
    return <PrimeiroAcesso usuario={sessao.usuario} aoConcluir={sessao.recarregar} />;
  }

  const papel = sessao.papel;
  const menu = MENUS[papel];
  const [pagina, ...resto] = menu.some(([id]) => id === rota[0]) ? rota : ["inicio"];
  const props = { sessao, papel, ir, rota: resto };

  return (
    <>
      <header className="topo">
        <div className="marca">
          <strong>CTC</strong>
          <span className="suave">Curso Técnico em Contabilidade</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span className="pequeno suave">{sessao.perfil?.nome || sessao.usuario.displayName}</span>
          <span className="selo verde">{NOME_PAPEL[papel]}</span>
          <button className="botao secundario pequeno" onClick={sair}>Sair</button>
        </div>
      </header>
      <div className="corpo">
        <nav className="menu" aria-label="Menu principal">
          {menu.map(([id, rotulo]) => (
            <button key={id} className={pagina === id ? "ativo" : ""} onClick={() => ir(id)}>{rotulo}</button>
          ))}
        </nav>
        <main className="conteudo">
          {pagina === "inicio" && <Inicio {...props} />}
          {pagina === "disciplinas" && <Disciplinas {...props} />}
          {pagina === "turmas" && <Turmas {...props} />}
          {pagina === "banco" && <BancoDados {...props} />}
          {pagina === "autorizados" && <Autorizados {...props} />}
          {pagina === "checklist" && <Checklist {...props} />}
        </main>
      </div>
    </>
  );
}
