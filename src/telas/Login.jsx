import { useState } from "react";
import { entrarComGoogle, traduzirErro } from "../lib/sessao";

export default function Login() {
  const [erro, setErro] = useState("");
  const [aguarde, setAguarde] = useState(false);

  const entrar = async () => {
    setErro(""); setAguarde(true);
    try { await entrarComGoogle(); } catch (e) { setErro(traduzirErro(e)); }
    setAguarde(false);
  };

  return (
    <div className="tela-login">
      <div className="caixa-login">
        <div>
          <div className="logo">CTC</div>
          <h1 style={{ fontSize: 18, marginTop: 10 }}>Curso Técnico em Contabilidade</h1>
          <p className="suave pequeno">CEDUP Hermann Hering · plataforma integrada das disciplinas</p>
        </div>
        <button className="botao" onClick={entrar} disabled={aguarde}>
          {aguarde ? "Abrindo o Google…" : "Entrar com a conta Google"}
        </button>
        {erro && <div className="aviso erro" role="alert">{erro}</div>}
        <p className="suave pequeno">
          Alunos: no primeiro acesso, informe a matrícula que está na lista do seu professor.
          Professores: o acesso é liberado pelo administrador a partir do seu e-mail Google.
        </p>
      </div>
    </div>
  );
}
