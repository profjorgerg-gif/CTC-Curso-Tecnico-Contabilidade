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
import Backup from "./telas/Backup";
import Suporte from "./telas/Suporte";
import Auditoria from "./telas/Auditoria";
import MinhaEmpresa from "./telas/Empresa";
import Escrituracao from "./telas/Escrituracao";
import Parametrizacao from "./telas/Parametrizacao";
import MinhasNotas from "./telas/Notas";
import Guia from "./telas/Guia";
import Ajuda from "./telas/Manuais";
import Questionarios from "./telas/Questionarios";
import ModoTeste from "./telas/ModoTeste";
import { lerModoTeste, matriculaDeTeste, NOME_ALUNO_TESTE, sairModoTeste } from "./lib/modoTeste";
import { definirSessaoAuditoria, registrarAcesso } from "./lib/auditoria";
import { confirmadoNesteNavegador, useSaidaPorInatividade } from "./lib/seguranca";
import { ConfirmarAluno, ConfirmarProfessor } from "./telas/Confirmacao";
import Rodape from "./componentes/Rodape";
import { limparRascunhosVencidos } from "./lib/rascunho";

limparRascunhosVencidos(); // rascunhos locais com mais de 14 dias

// Itens do menu por perfil
const MENUS = {
  aluno: [["inicio", "Início"], ["disciplinas", "Minhas disciplinas"], ["empresa", "Minha empresa"], ["parametrizacao", "Parametrização"], ["escrituracao", "Escrituração"], ["questionarios", "Questionários"], ["notas", "Minhas notas"], ["turmas", "Minhas turmas"], ["banco", "Consultas"], ["ajuda", "Ajuda"], ["suporte", "Suporte"]],
  professor: [["inicio", "Início"], ["disciplinas", "Disciplinas"], ["turmas", "Turmas e matrículas"], ["guia", "Guia Pedagógico"], ["banco", "Banco de Dados"], ["backup", "Backup"], ["teste", "Modo de teste"], ["suporte", "Suporte"]],
  admin: [["inicio", "Início"], ["disciplinas", "Disciplinas"], ["turmas", "Turmas e matrículas"], ["guia", "Guia Pedagógico"], ["banco", "Banco de Dados"], ["backup", "Backup"], ["teste", "Modo de teste"], ["suporte", "Suporte"], ["auditoria", "Auditoria"], ["autorizados", "Professores e administradores"], ["checklist", "Checklist de pendências"]],
};

// A página atual fica no endereço (#turmas, #banco...) para sobreviver ao F5
const lerPagina = () => (window.location.hash || "#inicio").slice(1).split("/");

// Toda tela leva o rodapé de direitos autorais
const comRodape = (tela) => <div className="pagina">{tela}<Rodape /></div>;

export default function App() {
  const sessao = useSessao();
  const [rota, setRota] = useState(lerPagina);

  useEffect(() => {
    const ouvir = () => setRota(lerPagina());
    window.addEventListener("hashchange", ouvir);
    return () => window.removeEventListener("hashchange", ouvir);
  }, []);
  // modo de teste: o professor vê o CTC como aluno (ver lib/modoTeste.js)
  const [, setVersaoTeste] = useState(0);
  useEffect(() => {
    const ouvir = () => { setVersaoTeste((n) => n + 1); setRota(lerPagina()); };
    window.addEventListener("ctc-modo-teste", ouvir);
    return () => window.removeEventListener("ctc-modo-teste", ouvir);
  }, []);

  const ir = (...partes) => { window.location.hash = partes.join("/"); };

  // confirmação a cada entrada (senha do professor / matrícula do aluno)
  const [, atualizar] = useState(0);
  const confirmado = !!sessao.usuario && confirmadoNesteNavegador(sessao.usuario.uid);
  useSaidaPorInatividade(confirmado ? sessao.usuario.uid : null, sair);

  // auditoria: guarda quem está usando e registra a entrada (uma vez por sessão, depois de confirmar)
  useEffect(() => {
    definirSessaoAuditoria(sessao);
    if (confirmado && sessao.papel && !sessao.carregando) registrarAcesso(sessao);
  }, [sessao.usuario?.uid, sessao.papel, sessao.perfil?.nome, sessao.carregando, confirmado]);

  if (sessao.carregando) return comRodape(<div className="tela-login"><p className="suave">Carregando…</p></div>);
  if (!sessao.usuario) return comRodape(<Login />);
  if (sessao.erro) {
    return comRodape(
      <div className="tela-login">
        <div className="caixa-login">
          <div className="aviso erro">{sessao.erro}</div>
          <button className="botao secundario" onClick={sair}>Sair e tentar de novo</button>
        </div>
      </div>
    );
  }
  if (sessao.papel === "aluno" && !sessao.perfil?.matricula) {
    return comRodape(<PrimeiroAcesso usuario={sessao.usuario} aoConcluir={sessao.recarregar} />);
  }
  if (!confirmado) {
    const aoConfirmar = () => atualizar((n) => n + 1);
    return comRodape(sessao.papel === "aluno"
      ? <ConfirmarAluno sessao={sessao} aoConfirmar={aoConfirmar} />
      : <ConfirmarProfessor sessao={sessao} aoConfirmar={aoConfirmar} />);
  }

  const teste = sessao.papel !== "aluno" ? lerModoTeste(sessao.usuario.uid) : null;
  const sess = teste
    ? { ...sessao, papel: "aluno", papelReal: sessao.papel, teste, perfil: { nome: NOME_ALUNO_TESTE, matricula: matriculaDeTeste(sessao.usuario.uid) } }
    : sessao;
  const papel = sess.papel;
  // no modo de teste o Suporte só escreve ao professor da turma (você mesmo)
  const menu = MENUS[papel];
  // telas abertas por dentro de outras (sem item próprio no menu)
  const ocultas = papel === "aluno" ? [] : ["escrituracao"];
  const [pagina, ...resto] = menu.some(([id]) => id === rota[0]) || ocultas.includes(rota[0]) ? rota : ["inicio"];
  const props = { sessao: sess, papel, ir, rota: resto };

  return comRodape(
    <>
      <header className="topo">
        <div className="marca">
          <strong>CTC</strong>
          <span className="suave">Curso Técnico em Contabilidade</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span className="pequeno suave">{sess.perfil?.nome || sessao.usuario.displayName}</span>
          <span className={`selo ${teste ? "ocre" : "verde"}`}>{teste ? "Modo de teste" : NOME_PAPEL[papel]}</span>
          <button className="botao secundario pequeno" onClick={sair}>Sair</button>
        </div>
      </header>
      {teste && (
        <div className="faixa-teste" role="status">
          <span><strong>Modo de teste</strong> · {teste.turmaNome} · você está vendo o CTC como aluno ({sess.perfil.matricula})</span>
          <button className="botao pequeno" onClick={sairModoTeste}>Sair do modo de teste</button>
        </div>
      )}
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
          {pagina === "backup" && <Backup {...props} />}
          {pagina === "suporte" && <Suporte {...props} />}
          {pagina === "auditoria" && <Auditoria {...props} />}
          {pagina === "empresa" && <MinhaEmpresa {...props} />}
          {pagina === "parametrizacao" && <Parametrizacao {...props} />}
          {pagina === "notas" && <MinhasNotas {...props} />}
          {pagina === "guia" && <Guia {...props} />}
          {pagina === "ajuda" && <Ajuda {...props} />}
          {pagina === "questionarios" && <Questionarios {...props} />}
          {pagina === "teste" && <ModoTeste {...props} />}
          {pagina === "escrituracao" && <Escrituracao key={resto.join("/")} {...props} />}
        </main>
      </div>
    </>
  );
}
