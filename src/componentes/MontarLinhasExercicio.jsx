// Exercício "monte a demonstração" com dados prontos (ex.: DLPA do Módulo 11): mostra os dados
// do caso e o aluno preenche as linhas da demonstração. Não vale nota.
import MontarDemonstracao from "./MontarDemonstracao";

export default function MontarLinhasExercicio({ ex }) {
  return (
    <>
      <section className="cartao" style={{ gap: 10 }}>
        <h2>{ex.titulo}</h2>
        <p className="pequeno suave" style={{ margin: 0 }}>{ex.instrucao}</p>
        <div className="tabela-caixa" style={{ border: "1px solid var(--linha)", borderRadius: 10, maxWidth: 620 }}>
          <table>
            <thead><tr><th>Dados do caso</th><th style={{ textAlign: "right" }}>Valor</th></tr></thead>
            <tbody>{ex.dados.map(([r, v]) => <tr key={r}><td>{r}</td><td className="mono" style={{ textAlign: "right" }}>{v}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <MontarDemonstracao titulo={ex.montar} subtitulo={`${ex.empresa} · não vale nota`} linhas={ex.linhas} chave={`ctc-pratica-${ex.id}`} dica={ex.dica} depois={ex.depois} />
    </>
  );
}
