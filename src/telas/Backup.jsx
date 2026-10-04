// Tela de Backup — professor baixa a turma; administrador baixa tudo e restaura
import { useEffect, useRef, useState } from "react";
import { useTurmas } from "../lib/useTurmas";
import { traduzirErro } from "../lib/sessao";
import { disciplinaPorId } from "../dados/disciplinas";
import {
  backupCompleto, backupDaTurma, conferirArquivo, lerUltimoBackup, restaurarBackup, resumo,
} from "../lib/backup";

export default function Backup({ sessao, papel }) {
  const ehAdmin = papel === "admin";
  return (
    <>
      <div>
        <h1>Backup</h1>
        <p className="suave" style={{ maxWidth: 760 }}>
          Os dados do CTC ficam salvos na nuvem automaticamente. O backup é uma cópia em arquivo (.json) para
          guardar fora do sistema — por exemplo, numa pasta "CTC – Backups" do seu Google Drive.
          Recomendado: ao fim de cada bimestre e antes de cada atualização grande.
        </p>
      </div>
      {ehAdmin && <BackupCompleto sessao={sessao} />}
      <BackupTurma sessao={sessao} ehAdmin={ehAdmin} />
      {ehAdmin && <Restaurar sessao={sessao} />}
    </>
  );
}

// ---------- administrador: backup completo ----------
function BackupCompleto({ sessao }) {
  const [ultimo, setUltimo] = useState(undefined);
  const [gerando, setGerando] = useState(false);
  const [msg, setMsg] = useState({});
  const carregar = () => lerUltimoBackup().then(setUltimo).catch(() => setUltimo(null));
  useEffect(() => { carregar(); }, []);

  const gerar = async () => {
    setGerando(true); setMsg({});
    try {
      const r = await backupCompleto(sessao);
      setMsg({ tipo: "", texto: `Arquivo ${r.arquivo} baixado — ${resumo(r.contagem)}.` });
      carregar();
    } catch (e) {
      setMsg({ tipo: "erro", texto: traduzirErro(e) });
    }
    setGerando(false);
  };

  return (
    <section className="cartao">
      <h2>Backup completo</h2>
      <p className="suave pequeno">
        Um único arquivo com tudo: professores e administradores autorizados, perfis dos alunos, matrículas,
        turmas com as listas de alunos, Plano de Contas e demais tabelas editadas, e o histórico de alterações.
      </p>
      <UltimoBackup ultimo={ultimo} />
      <div><button className="botao" onClick={gerar} disabled={gerando}>{gerando ? "Gerando backup…" : "Baixar backup completo"}</button></div>
      {msg.texto && <div className={`aviso ${msg.tipo}`} role="status">{msg.texto}</div>}
    </section>
  );
}

export function diasDesde(ts) {
  const d = ts?.toDate?.();
  return d ? Math.floor((Date.now() - d.getTime()) / 86400000) : null;
}

export function UltimoBackup({ ultimo }) {
  if (ultimo === undefined) return <p className="pequeno suave">Conferindo o último backup…</p>;
  const dias = diasDesde(ultimo?.ultimoCompleto);
  if (dias === null) return <div className="aviso atencao">Nenhum backup completo foi feito ainda.</div>;
  const quando = ultimo.ultimoCompleto.toDate().toLocaleString("pt-BR");
  const texto = `Último backup completo: ${quando} (${dias === 0 ? "hoje" : `há ${dias} dia${dias > 1 ? "s" : ""}`}), por ${ultimo.porNome}.`;
  return <div className={`aviso ${dias > 30 ? "atencao" : ""}`}>{texto}{dias > 30 && " Já passou de 30 dias — faça um novo backup."}</div>;
}

// ---------- professor (e administrador): backup da turma ----------
function BackupTurma({ sessao, ehAdmin }) {
  const { turmas, carregando, erro } = useTurmas(sessao);
  const [turmaId, setTurmaId] = useState("");
  const [gerando, setGerando] = useState(false);
  const [msg, setMsg] = useState({});
  const turma = turmas.find((t) => t.id === turmaId);

  const gerar = async () => {
    setGerando(true); setMsg({});
    try {
      const r = await backupDaTurma(sessao, turma);
      setMsg({ tipo: "", texto: `Arquivo ${r.arquivo} baixado — ${r.alunos} aluno(s).` });
    } catch (e) {
      setMsg({ tipo: "erro", texto: traduzirErro(e) });
    }
    setGerando(false);
  };

  return (
    <section className="cartao">
      <h2>Backup da turma</h2>
      <p className="suave pequeno">
        Baixa a turma escolhida com a lista de alunos e a situação de cada matrícula. A partir da Fase 2, inclui
        também o trabalho de cada aluno. {ehAdmin ? "" : "Se for preciso restaurar, o administrador faz isso a partir do backup completo."}
      </p>
      {erro && <div className="aviso erro">{erro}</div>}
      {!carregando && turmas.length === 0 && <div className="aviso atencao">Você ainda não tem turmas.</div>}
      {turmas.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <label className="pequeno suave" htmlFor="turma-backup">Turma</label>
          <select id="turma-backup" value={turmaId} onChange={(e) => setTurmaId(e.target.value)} style={{ minWidth: 280 }}>
            <option value="">Escolha a turma…</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome} · {disciplinaPorId(t.disciplina)?.sigla || t.disciplina} · {t.semestre}
              </option>
            ))}
          </select>
          <button className="botao" onClick={gerar} disabled={!turma || gerando}>{gerando ? "Gerando…" : "Baixar backup da turma"}</button>
        </div>
      )}
      {msg.texto && <div className={`aviso ${msg.tipo}`} role="status">{msg.texto}</div>}
    </section>
  );
}

// ---------- administrador: restaurar ----------
function Restaurar({ sessao }) {
  const entrada = useRef(null);
  const [arquivo, setArquivo] = useState(null); // { nome, dados }
  const [confirmacao, setConfirmacao] = useState("");
  const [progresso, setProgresso] = useState(null);
  const [msg, setMsg] = useState({});

  const escolher = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setMsg({}); setArquivo(null); setConfirmacao("");
    const leitor = new FileReader();
    leitor.onload = () => {
      try { setArquivo({ nome: f.name, dados: conferirArquivo(leitor.result) }); }
      catch (err) { setMsg({ tipo: "erro", texto: err.message }); }
    };
    leitor.readAsText(f, "utf-8");
  };

  const restaurar = async () => {
    setMsg({}); setProgresso([0, 1]);
    try {
      const n = await restaurarBackup(sessao, arquivo.dados, (feito, total) => setProgresso([feito, total]));
      setMsg({ tipo: "", texto: `Restauração concluída: ${n} registro(s) gravado(s). A página vai recarregar.` });
      setArquivo(null); setConfirmacao("");
      setTimeout(() => window.location.reload(), 2500);
    } catch (e) {
      setMsg({ tipo: "erro", texto: `A restauração parou no meio: ${traduzirErro(e)} O que já foi gravado continua; você pode repetir com o mesmo arquivo.` });
    }
    setProgresso(null);
  };

  const d = arquivo?.dados;
  return (
    <section className="cartao" style={{ borderColor: "#6b3b3b" }}>
      <h2>Restaurar backup</h2>
      <p className="suave pequeno">
        Use só em emergência. O CTC recoloca o que está no arquivo (turmas, listas, matrículas, perfis,
        professores e tabelas). <strong>Nada que foi criado depois do backup é apagado.</strong> Registros que existem
        nos dois lugares voltam a ficar como estavam no arquivo. O histórico não é regravado — ele nunca é apagado.
      </p>
      <div>
        <button className="botao secundario" onClick={() => entrada.current?.click()} disabled={!!progresso}>Escolher arquivo de backup…</button>
        <input ref={entrada} type="file" accept=".json,application/json" onChange={escolher} hidden />
      </div>
      {d && (
        <div className="aviso atencao" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span>
            <strong>{arquivo.nome}</strong> — gerado em {new Date(d.geradoEm).toLocaleString("pt-BR")}
            {d.geradoPor?.nome ? ` por ${d.geradoPor.nome}` : ""}.
          </span>
          <span>Contém: {resumo(d.contagem)}.</span>
          <label className="pequeno" htmlFor="confirma-restaurar">Para confirmar, digite <strong>RESTAURAR</strong>:</label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input id="confirma-restaurar" className="mono" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} autoComplete="off" style={{ maxWidth: 220 }} />
            <button className="botao perigo" onClick={restaurar} disabled={confirmacao !== "RESTAURAR" || !!progresso}>
              {progresso ? `Restaurando… ${progresso[0]} de ${progresso[1]}` : "Restaurar agora"}
            </button>
            <button className="botao secundario" onClick={() => { setArquivo(null); setConfirmacao(""); }} disabled={!!progresso}>Cancelar</button>
          </div>
        </div>
      )}
      {msg.texto && <div className={`aviso ${msg.tipo}`} role="status">{msg.texto}</div>}
    </section>
  );
}
