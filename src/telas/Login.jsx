import { useState } from "react";
import { entrarComGoogle, traduzirErro } from "../lib/sessao";
import { DISCIPLINAS } from "../dados/disciplinas";
import Caduceu from "../componentes/Caduceu";
import { CHAVE_SAIU_INATIVO, INATIVIDADE_MIN } from "../lib/seguranca";

// aviso quando a pessoa saiu sozinha por ficar parada
function saiuPorInatividade() {
  try { const v = sessionStorage.getItem(CHAVE_SAIU_INATIVO); sessionStorage.removeItem(CHAVE_SAIU_INATIVO); return !!v; } catch { return false; }
}

// Tela de entrada (opção 7 — Monograma + Trilha, com o caduceu ao lado do CTC — aprovado em 04/10/2026)
export default function Login() {
  const [erro, setErro] = useState("");
  const [inativo] = useState(saiuPorInatividade);
  const [aguarde, setAguarde] = useState(false);

  const entrar = async () => {
    setErro(""); setAguarde(true);
    try { await entrarComGoogle(); } catch (e) { setErro(traduzirErro(e)); }
    setAguarde(false);
  };

  return (
    <div className="login-dividido">
      <section className="login-apresentacao" aria-label="Sobre o CTC">
        <div className="login-marca">
          <Caduceu className="login-caduceu" />
          <div className="login-titulo">
            <span className="login-monograma">CTC</span>
            <h1>Curso Técnico em Contabilidade</h1>
            <p>Plataforma didática do curso: teoria, prática e avaliação na mesma empresa.</p>
          </div>
        </div>

        <ol className="login-trilha">
          {DISCIPLINAS.map((d) => (
            <li key={d.id}>
              <span className="login-numero">{String(d.etapa).padStart(2, "0")}</span>
              <span className="login-sigla">{d.sigla}</span>
              <span>{d.nome}</span>
            </li>
          ))}
        </ol>
      </section>

      <main className="login-lado">
        <div className="login-cartao">
          <div className="login-cartao-topo">
            <span className="login-cadeado" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="var(--destaque)" strokeWidth="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="var(--destaque)" strokeWidth="2" />
              </svg>
            </span>
            <h2>Entrar no CTC</h2>
          </div>
          <p className="login-texto">Entre com sua conta Google para acessar a plataforma.</p>
          {inativo && <div className="aviso atencao" role="status">Você saiu automaticamente depois de {INATIVIDADE_MIN} minutos sem usar o CTC.</div>}
          <button className="botao login-botao" onClick={entrar} disabled={aguarde}>
            <span className="login-g" aria-hidden="true">G</span>
            {aguarde ? "Abrindo o Google…" : "Continuar com o Google"}
          </button>
          {erro && <div className="aviso erro" role="alert">{erro}</div>}
          <div className="login-divisor" />
          <div className="login-avisos">
            <p><strong>Alunos:</strong> depois do Google, confirme a sua matrícula (a que está na lista do seu professor).</p>
            <p><strong>Professores:</strong> depois do Google, digite a sua senha do CTC. O acesso é liberado pelo administrador a partir do seu e-mail Google.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
