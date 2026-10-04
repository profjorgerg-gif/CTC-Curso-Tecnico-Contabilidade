// Etapa extra depois do Google: senha (professor/admin) ou matrícula (aluno)
import { useEffect, useState } from "react";
import { sair, traduzirErro, NOME_PAPEL } from "../lib/sessao";
import {
  confirmarMatricula, confirmarSenha, conferirSenhaNova, criarSenha, lerSituacaoSenha,
  SENHA_MINIMA, VALIDADE_HORAS,
} from "../lib/seguranca";

function Caixa({ titulo, usuario, papel, children }) {
  return (
    <div className="tela-login">
      <div className="caixa-login">
        <div>
          <div className="logo">CTC</div>
          <h1 style={{ fontSize: 20, marginTop: 10 }}>{titulo}</h1>
          <p className="suave pequeno">{usuario.email} · {NOME_PAPEL[papel]}</p>
        </div>
        {children}
        <button className="botao secundario pequeno" style={{ alignSelf: "flex-start" }} onClick={sair}>Usar outra conta / sair</button>
      </div>
    </div>
  );
}

// ---------------- professor e administrador ----------------
export function ConfirmarProfessor({ sessao, aoConfirmar }) {
  const { usuario, papel } = sessao;
  const [situacao, setSituacao] = useState(undefined);
  const [senha, setSenha] = useState("");
  const [repetir, setRepetir] = useState("");
  const [ver, setVer] = useState(false);
  const [msg, setMsg] = useState("");
  const [aguarde, setAguarde] = useState(false);

  useEffect(() => {
    lerSituacaoSenha(usuario.email.toLowerCase()).then(setSituacao).catch((e) => setMsg(traduzirErro(e)));
  }, [usuario.uid]);

  const criando = situacao === null;

  const enviar = async (e) => {
    e.preventDefault();
    setMsg("");
    if (criando) {
      const problema = conferirSenhaNova(senha, repetir);
      if (problema) return setMsg(problema);
    }
    setAguarde(true);
    try {
      if (criando) await criarSenha(usuario, senha);
      else await confirmarSenha(usuario, situacao, senha);
      aoConfirmar();
    } catch (err) {
      setMsg(err?.code ? traduzirErro(err) : err.message);
      setSenha(""); setAguarde(false);
    }
  };

  if (situacao === undefined && !msg) return <Caixa titulo="Confirmação de acesso" usuario={usuario} papel={papel}><p className="suave">Carregando…</p></Caixa>;

  return (
    <Caixa titulo={criando ? "Crie a sua senha do CTC" : "Digite a sua senha do CTC"} usuario={usuario} papel={papel}>
      <p className="suave pequeno">
        {criando
          ? `É o seu primeiro acesso com senha. Ela será pedida a cada entrada, além da conta Google — protege a área do professor se o Google ficar aberto num computador da escola. Mínimo de ${SENHA_MINIMA} caracteres, com letras e números.`
          : `A confirmação vale até você fechar o navegador (no máximo ${VALIDADE_HORAS} horas). Esqueceu a senha? Peça ao administrador para redefinir.`}
      </p>
      <form onSubmit={enviar} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="campo">
          <label htmlFor="senha">{criando ? "Nova senha" : "Senha"}</label>
          <input id="senha" type={ver ? "text" : "password"} autoComplete={criando ? "new-password" : "current-password"} value={senha} onChange={(e) => setSenha(e.target.value)} autoFocus />
        </div>
        {criando && (
          <div className="campo">
            <label htmlFor="senha2">Repita a senha</label>
            <input id="senha2" type={ver ? "text" : "password"} autoComplete="new-password" value={repetir} onChange={(e) => setRepetir(e.target.value)} />
          </div>
        )}
        <label className="pequeno suave" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={ver} onChange={(e) => setVer(e.target.checked)} style={{ minHeight: 0 }} /> Mostrar senha
        </label>
        {msg && <div className="aviso erro" role="alert">{msg}</div>}
        <button className="botao" disabled={aguarde || !senha}>{aguarde ? "Conferindo…" : criando ? "Criar senha e entrar" : "Entrar"}</button>
      </form>
    </Caixa>
  );
}

// ---------------- aluno ----------------
export function ConfirmarAluno({ sessao, aoConfirmar }) {
  const { usuario, papel } = sessao;
  const [matricula, setMatricula] = useState("");
  const [msg, setMsg] = useState("");
  const [aguarde, setAguarde] = useState(false);
  const enviar = async (e) => {
    e.preventDefault();
    setMsg(""); setAguarde(true);
    try { await confirmarMatricula(usuario, matricula); aoConfirmar(); }
    catch (err) { setMsg(err?.code ? traduzirErro(err) : err.message); setAguarde(false); }
  };
  return (
    <Caixa titulo="Confirme a sua matrícula" usuario={usuario} papel={papel}>
      <p className="suave pequeno">
        Para entrar, confirme a matrícula ligada a esta conta Google. A confirmação vale até você fechar o navegador.
      </p>
      <form onSubmit={enviar} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="campo">
          <label htmlFor="conf-mat">Matrícula</label>
          <input id="conf-mat" className="mono" inputMode="numeric" autoComplete="off" value={matricula} onChange={(e) => setMatricula(e.target.value)} autoFocus />
        </div>
        {msg && <div className="aviso erro" role="alert">{msg} Se a conta não for a sua, clique em "Usar outra conta".</div>}
        <button className="botao" disabled={aguarde || !matricula.trim()}>{aguarde ? "Conferindo…" : "Entrar"}</button>
      </form>
    </Caixa>
  );
}
