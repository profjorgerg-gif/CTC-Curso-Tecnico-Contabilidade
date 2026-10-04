// Modelos de lançamento por tipo de operação (aprovado em 04/10/2026).
// O nível de ajuda é definido pelo professor na turma:
//  - "livre": uma linha de débito e uma de crédito, em branco;
//  - "estrutura": as linhas e os efeitos da operação (D/C), contas em branco;
//  - "completo": também as contas que não dependem do caso; o aluno digita os valores.
// Tributos nas operações (ICMS, PIS, COFINS) só entram quando a turma marcar,
// conforme o regime tributário da empresa.

export const TIPOS_OPERACAO = [
  { id: "livre", nome: "Lançamento livre" },
  { id: "compra", nome: "Compra de mercadorias" },
  { id: "venda", nome: "Venda de mercadorias" },
  { id: "pagamento", nome: "Pagamento (fornecedores, contas a pagar)" },
  { id: "recebimento", nome: "Recebimento (clientes, contas a receber)" },
  { id: "despesa", nome: "Despesa" },
  { id: "financeira", nome: "Operação financeira" },
  { id: "imobilizado", nome: "Compra de imobilizado" },
];

export const NIVEIS_AJUDA = [
  { valor: "livre", rotulo: "Livre", ajuda: "O aluno monta todas as linhas sozinho." },
  { valor: "estrutura", rotulo: "Estrutura", ajuda: "O CTC mostra as linhas e os efeitos da operação (D/C); o aluno escolhe as contas e digita os valores." },
  { valor: "completo", rotulo: "Completo", ajuda: "O CTC também preenche as contas que não dependem do caso; o aluno calcula os valores." },
];

const L = (d, efeito, conta = "") => ({ d, efeito, conta, valor: "", quantidade: "", valorUnitario: "" });

// linhas de cada operação: [lado, efeito, conta sugerida no nível "completo"]
function linhasDa(tipo, { periodico, tributos, regime, contribuinteIcms }) {
  const simples = regime === "Simples Nacional";
  const real = regime === "Lucro Real";
  const icms = contribuinteIcms !== "nao";
  switch (tipo) {
    case "compra": {
      const l = [L("D", "Mercadorias (custo de aquisição)", "1.1.3.01")];
      if (tributos && !simples && icms) l.push(L("D", "ICMS a recuperar", "1.1.2.11"));
      if (tributos && real) l.push(L("D", "PIS a recuperar", "1.1.2.14"), L("D", "COFINS a recuperar", "1.1.2.15"));
      l.push(L("C", "Pagamento à vista ou obrigação com o fornecedor"));
      return l;
    }
    case "venda": {
      const l = [L("D", "Receita: recebimento ou direito a receber"), L("C", "Receita bruta de vendas", "4.1.1.01")];
      if (tributos && simples) l.push(L("D", "Simples Nacional sobre a venda"), L("C", "Simples Nacional a recolher", "2.1.8.12"));
      if (tributos && !simples && icms) l.push(L("D", "ICMS sobre vendas", "4.2.01"), L("C", "ICMS a recolher", "2.1.8.04"));
      if (tributos && !simples) l.push(L("D", "PIS/COFINS sobre vendas", "4.2.02"), L("C", "PIS a recolher", "2.1.8.05"), L("C", "COFINS a recolher", "2.1.8.06"));
      if (!periodico) l.push(L("D", "CMV — custo das mercadorias vendidas", "6.2.01"), L("C", "Baixa do estoque", "1.1.3.01"));
      return l;
    }
    case "pagamento": return [L("D", "Baixa da obrigação"), L("C", "Saída do dinheiro (Caixa ou Banco)")];
    case "recebimento": return [L("D", "Entrada do dinheiro (Caixa ou Banco)"), L("C", "Baixa do direito a receber")];
    case "despesa": return [L("D", "Despesa"), L("C", "Pagamento ou obrigação")];
    case "financeira": return [L("D", "Débito"), L("C", "Crédito")];
    case "imobilizado": return [L("D", "Bem do imobilizado"), L("C", "Pagamento ou financiamento")];
    default: return [L("D", ""), L("C", "")];
  }
}

export function modeloDeLancamento(tipo, nivel, contexto) {
  if (nivel === "livre" || tipo === "livre" || !tipo) return [L("D", ""), L("C", "")];
  return linhasDa(tipo, contexto).map((p) => (nivel === "completo" ? p : { ...p, conta: "" }));
}

// configuração dos lançamentos da turma (definida pelo professor)
export function configLancamentos(turma) {
  return { ajuda: turma?.configLancamentos?.ajuda || "estrutura", tributos: turma?.configLancamentos?.tributos === "sim" };
}

// quando a operação escolhida não combina com as contas, um aviso ajuda o aluno a pensar
export function avisosDaOperacao(tipo, partidas, plano) {
  const avisos = [];
  const grupo = (c) => (c || "").split(".")[0];
  const cred = partidas.filter((p) => p.d === "C" && p.conta);
  const deb = partidas.filter((p) => p.d === "D" && p.conta);
  if (tipo === "venda" && cred.length && !cred.some((p) => grupo(p.conta) === "4")) {
    avisos.push("Na venda, o crédito principal costuma ser uma conta de Receita (grupo 4).");
  }
  if (tipo === "venda" && cred.some((p) => p.conta === "1.1.3.01") && !deb.some((p) => p.conta === "6.2.01")) {
    avisos.push("Crédito em Mercadorias numa venda é a baixa do estoque: ela vem junto com o débito no CMV (6.2.01).");
  }
  if (tipo === "compra" && !deb.some((p) => p.conta === "1.1.3.01")) avisos.push("Na compra de mercadorias, o débito principal é o estoque (1.1.3.01).");
  if (tipo === "despesa" && deb.length && !deb.some((p) => grupo(p.conta) === "5")) avisos.push("A despesa é debitada numa conta do grupo 5 (Despesas).");
  return avisos;
}
