// Lista de e-mails Google autorizados como professor ou administrador (decisão 6)
import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { traduzirErro } from "../lib/sessao";

const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export default function Autorizados({ sessao }) {
  const [lista, setLista] = useState(null);
  const [form, setForm] = useState({ email: "", nome: "", papel: "professor" });
  const [msg, setMsg] = useState({});
  const meuEmail = sessao.perfil?.email;

  const carregar = async () => {
    try {
      const s = await getDocs(collection(db, "autorizados"));
      setLista(s.docs.map((d) => ({ email: d.id, ...d.data() })).sort((a, b) => a.email.localeCompare(b.email)));
    } catch (e) { setMsg({ tipo: "erro", texto: traduzirErro(e) }); }
  };
  useEffect(() => { carregar(); }, []);

  const autorizar = async (e) => {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();
    if (!emailValido(email)) return setMsg({ tipo: "erro", texto: "Digite um e-mail válido." });
    try {
      await setDoc(doc(db, "autorizados", email), {
        papel: form.papel, nome: form.nome.trim(), autorizadoPor: meuEmail, autorizadoEm: serverTimestamp(),
      });
      setForm({ email: "", nome: "", papel: "professor" });
      setMsg({ texto: `${email} autorizado. Ao entrar com essa conta Google, a pessoa já terá o perfil.` });
      carregar();
    } catch (err) { setMsg({ tipo: "erro", texto: traduzirErro(err) }); }
  };

  const remover = async (email) => {
    try { await deleteDoc(doc(db, "autorizados", email)); setMsg({ texto: `${email} removido. No próximo acesso, entrará como aluno.` }); carregar(); }
    catch (err) { setMsg({ tipo: "erro", texto: traduzirErro(err) }); }
  };

  return (
    <>
      <div>
        <h1>Professores e administradores</h1>
        <p className="suave">Alunos entram pelas listas das turmas. Professores e administradores são definidos por esta lista de e-mails Google — não existe código de acesso.</p>
      </div>
      <form className="cartao" onSubmit={autorizar}>
        <h2>Autorizar e-mail</h2>
        <div className="linha-form">
          <div className="campo" style={{ flex: "2 1 240px" }}>
            <label htmlFor="a-email">E-mail Google</label>
            <input id="a-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="campo">
            <label htmlFor="a-nome">Nome</label>
            <input id="a-nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div className="campo" style={{ flex: "0 1 180px" }}>
            <label htmlFor="a-papel">Perfil</label>
            <select id="a-papel" value={form.papel} onChange={(e) => setForm({ ...form, papel: e.target.value })}>
              <option value="professor">Professor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <button className="botao">Autorizar</button>
        </div>
        {msg.texto && <div className={`aviso ${msg.tipo || ""}`} role="status">{msg.texto}</div>}
      </form>
      <section className="cartao sem-padding">
        <div className="tabela-caixa">
          <table>
            <thead><tr><th>E-mail</th><th>Nome</th><th>Perfil</th><th></th></tr></thead>
            <tbody>
              {!lista && <tr><td colSpan={4} className="suave">Carregando…</td></tr>}
              {lista?.map((a) => (
                <tr key={a.email}>
                  <td>{a.email}</td>
                  <td>{a.nome || "—"}</td>
                  <td><span className={`selo ${a.papel === "admin" ? "cheio" : "verde"}`}>{a.papel === "admin" ? "Administrador" : "Professor"}</span></td>
                  <td style={{ textAlign: "right" }}>
                    {a.email === meuEmail
                      ? <span className="pequeno suave">você</span>
                      : <button className="botao perigo pequeno" onClick={() => remover(a.email)}>Remover</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
