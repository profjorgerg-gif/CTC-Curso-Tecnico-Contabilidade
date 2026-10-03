// Primeiro acesso do aluno: vincula a matrícula (da lista do professor) à conta Google
import { useState } from "react";
import { doc, getDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { sair, traduzirErro } from "../lib/sessao";

export default function PrimeiroAcesso({ usuario, aoConcluir }) {
  const [matricula, setMatricula] = useState("");
  const [encontrada, setEncontrada] = useState(null);
  const [msg, setMsg] = useState({ tipo: "", texto: "" });
  const [aguarde, setAguarde] = useState(false);

  const buscar = async (e) => {
    e.preventDefault();
    const m = matricula.replace(/[.\-\s]/g, "");
    setMsg({}); setEncontrada(null);
    if (!m) return setMsg({ tipo: "erro", texto: "Digite a sua matrícula." });
    setAguarde(true);
    try {
      const snap = await getDoc(doc(db, "matriculas", m));
      if (!snap.exists()) {
        setMsg({ tipo: "erro", texto: "Esta matrícula não está em nenhuma turma. Confira o número ou fale com seu professor." });
      } else if (snap.data().uid && snap.data().uid !== usuario.uid) {
        setMsg({ tipo: "erro", texto: "Esta matrícula já está vinculada a outra conta Google. Peça ao professor para liberá-la." });
      } else {
        setEncontrada({ matricula: m, nome: snap.data().nome });
      }
    } catch (err) { setMsg({ tipo: "erro", texto: traduzirErro(err) }); }
    setAguarde(false);
  };

  const confirmar = async () => {
    setAguarde(true);
    try {
      const lote = writeBatch(db);
      lote.update(doc(db, "matriculas", encontrada.matricula), { uid: usuario.uid, vinculadoEm: serverTimestamp() });
      lote.set(doc(db, "usuarios", usuario.uid), {
        nome: encontrada.nome,
        email: (usuario.email || "").toLowerCase(),
        matricula: encontrada.matricula,
        criadoEm: serverTimestamp(),
      });
      await lote.commit();
      await aoConcluir();
    } catch (err) {
      setMsg({ tipo: "erro", texto: traduzirErro(err) });
      setAguarde(false);
    }
  };

  return (
    <div className="tela-login">
      <div className="caixa-login">
        <div>
          <div className="logo">CTC</div>
          <h1 style={{ fontSize: 18, marginTop: 10 }}>Primeiro acesso</h1>
          <p className="suave pequeno">Conta Google: {usuario.email}</p>
        </div>

        {!encontrada && (
          <form onSubmit={buscar} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="campo">
              <label htmlFor="matricula">Sua matrícula na escola</label>
              <input id="matricula" className="mono" inputMode="numeric" autoComplete="off"
                value={matricula} onChange={(e) => setMatricula(e.target.value)} placeholder="Número da matrícula" />
            </div>
            <button className="botao" disabled={aguarde}>{aguarde ? "Procurando…" : "Continuar"}</button>
          </form>
        )}

        {encontrada && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="aviso">Matrícula <strong className="mono">{encontrada.matricula}</strong> encontrada.</div>
            <p>Você é <strong>{encontrada.nome}</strong>?</p>
            <p className="suave pequeno">Ao confirmar, esta matrícula fica ligada à sua conta Google e não poderá ser usada por outra pessoa.</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="botao" onClick={confirmar} disabled={aguarde}>Sim, sou eu</button>
              <button className="botao secundario" onClick={() => setEncontrada(null)} disabled={aguarde}>Não sou eu</button>
            </div>
          </div>
        )}

        {msg.texto && <div className={`aviso ${msg.tipo}`} role="alert">{msg.texto}</div>}
        <button className="botao secundario pequeno" onClick={sair}>Entrar com outra conta</button>
      </div>
    </div>
  );
}
