// Cronograma inicial da transição IBS/CBS (LC 214/2025).
// Fica gravado em config/ibsCbs e o administrador edita pela tela Banco de Dados.
export const CRONOGRAMA_IBS_CBS = [
  { ano: "2026", cbs: "0,9% (teste)", ibs: "0,1% (teste)", icmsIss: "100%", observacao: "Recolhimento dispensado para quem cumpre as obrigações acessórias" },
  { ano: "2027", cbs: "Alíquota de referência − 0,1 p.p.", ibs: "0,05% estadual + 0,05% municipal", icmsIss: "100%", observacao: "PIS/Cofins extintos; IPI zerado (exceto Zona Franca); Imposto Seletivo em vigor" },
  { ano: "2028", cbs: "Alíquota de referência − 0,1 p.p.", ibs: "0,05% estadual + 0,05% municipal", icmsIss: "100%", observacao: "" },
  { ano: "2029", cbs: "Alíquota de referência", ibs: "Crescente", icmsIss: "90%", observacao: "Início da redução de ICMS e ISS" },
  { ano: "2030", cbs: "Alíquota de referência", ibs: "Crescente", icmsIss: "80%", observacao: "" },
  { ano: "2031", cbs: "Alíquota de referência", ibs: "Crescente", icmsIss: "70%", observacao: "" },
  { ano: "2032", cbs: "Alíquota de referência", ibs: "Crescente", icmsIss: "60%", observacao: "" },
  { ano: "2033", cbs: "Integral", ibs: "Integral", icmsIss: "Extintos", observacao: "Fim da transição" },
];
