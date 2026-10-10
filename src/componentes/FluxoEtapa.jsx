// "Como funciona esta etapa" (aprovado em 10/10/2026, a partir do kit da CI Unidade II).
// Fluxograma só informativo no topo das telas do aluno: não lê nem grava nada no banco.
// Abre sozinho na primeira visita a cada etapa; depois fica fechado (a escolha fica só neste
// navegador, por pessoa). Caixas: você faz · o CTC faz · o professor faz · atenção.
import { useEffect, useState } from "react";
import { auth } from "../firebase";

const COR = {
  al: ["var(--verde-claro)", "var(--verde)"],
  sy: ["#1f3147", "#8fb3d9"],
  pr: ["var(--ocre-claro)", "var(--destaque)"],
  at: ["var(--vermelho-claro)", "var(--vermelho)"],
  ok: ["var(--verde-claro)", "var(--verde-texto)"],
};
const LEGENDA = [["al", "você faz"], ["sy", "o CTC faz"], ["pr", "o professor faz"], ["at", "atenção"]];

export const FLUXOS = {
  empresa: {
    titulo: "Minha empresa",
    passos: [
      ["al", "1. Confira os dados", "razão social, nome fantasia, ramo, município e UF"],
      ["al", "2. CNPJ fictício", "use o botão Gerar, se precisar"],
      ["al", "3. Capital social", "é a base dos saldos iniciais"],
      ["al", "4. Salvar cadastro", "sem salvar, o que você digitou não vai para a empresa"],
      ["sy", "O CTC confere", "cadastro completo libera a Parametrização e a Escrituração"],
    ],
    aviso: ["at", "⚠ Atividade, regime tributário e exercício social ficam no menu Parametrização."],
  },
  parametrizacao: {
    titulo: "Parametrização",
    passos: [
      ["pr", "O professor pode fixar", "alguns parâmetros da turma — eles aparecem travados"],
      ["al", "1. Escolha os parâmetros", "exercício, regime, inventário, método de estoque, apuração, dividendos"],
      ["al", "2. Confirmar", "área Contábil (e as outras, quando a disciplina pedir)"],
      ["sy", "O CTC libera", "a Escrituração da sua empresa"],
    ],
    aviso: ["at", "⚠ Depois do primeiro lançamento a parametrização trava. Só o professor destrava."],
  },
  saldos: {
    titulo: "Saldos iniciais",
    passos: [
      ["al", "1. Credite o Capital Subscrito", "pelo capital social do cadastro"],
      ["al", "2. Debite o Ativo", "Caixa, Bancos, Imobilizado: onde o capital entrou"],
      ["sy", "O CTC soma", "total devedor = total credor?"],
      ["al", "3. Salvar saldos iniciais", "o botão só libera quando D = C"],
      ["sy", "Abertura feita", "os saldos entram no Razão, no Balancete e no Balanço"],
    ],
  },
  lancamentos: {
    titulo: "Lançamentos (Livro Diário)",
    partes: [
      { nome: "Fatos orientados e listas", passos: [
        ["sy", "O CTC mostra o fato", "o próximo dos fatos orientados ou da lista do professor"],
        ["al", "1. Leia o fato", "e escolha o tipo de operação"],
        ["al", "2. Preencha", "data, histórico, contas a débito e a crédito, valores"],
        ["sy", "O CTC confere D = C", "e só grava se fechar"],
        ["al", "3. Lançar", "o lançamento vai para o Diário"],
        ["ok", "Correção", "na hora nos fatos orientados e nas listas de sala"],
        ["pr", "Avaliativa", "a correção aparece quando o professor liberar o resultado"],
      ] },
    ],
    aviso: ["at", "⚠ Errou? Use Corrigir no lançamento. Lista avaliativa encerrada não aceita mais alterações. O que você digita e não salva fica guardado neste computador como rascunho."],
  },
  razao: {
    titulo: "Razão por conta",
    passos: [
      ["al", "1. Escolha a conta", "pelo código ou pelo nome"],
      ["sy", "O CTC mostra", "cada movimento e o saldo depois de cada um"],
      ["al", "2. Compare", "com o seu razonete do caderno"],
    ],
    aviso: ["at", "⚠ Achou erro? Corrija em Lançamentos: o Razão se atualiza sozinho."],
  },
  estoque: {
    titulo: "Controle de estoque",
    passos: [
      ["sy", "Ficha de estoque", "entradas, saídas e saldo pelo método da sua parametrização"],
      ["al", "1. Confira", "quantidades, custo unitário e CMV de cada venda"],
      ["sy", "Comparativo", "PEPS × Média (o UEPS aparece só para comparar)"],
      ["al", "Inventário periódico", "apure o CMV no fim do período, nesta aba"],
    ],
  },
  balancete: {
    titulo: "Balancete",
    passos: [
      ["sy", "O CTC soma", "débitos, créditos e saldo de cada conta"],
      ["al", "1. Confira", "total dos débitos = total dos créditos"],
      ["al", "2. Confira os saldos", "devedores = credores"],
    ],
    aviso: ["at", "⚠ O balancete fecha mesmo com conta errada (débito e crédito iguais na conta errada). Confira as contas, não só os totais."],
  },
  dre: {
    titulo: "DRE",
    passos: [
      ["al", "1. Monte a DRE", "valor de cada linha, na ordem"],
      ["sy", "O CTC confere", "linha a linha; erro fica com borda vermelha"],
      ["al", "2. Ajuste", "ou use Ver a resposta depois de tentar"],
      ["ok", "DRE pronta", "aparece assinada, para imprimir"],
    ],
  },
  are: {
    titulo: "Encerramento (ARE)",
    passos: [
      ["al", "1. Zere cada conta", "de resultado: lado e valor contra a ARE"],
      ["al", "2. Transfira o resultado", "lucro ou prejuízo para o Patrimônio Líquido"],
      ["sy", "O CTC confere", "antes de mostrar os lançamentos propostos"],
      ["al", "3. Gravar", "na data do fim do período de apuração"],
      ["ok", "Exercício encerrado", "DLPA e Balanço ficam disponíveis"],
    ],
  },
  dlpa: {
    titulo: "DLPA",
    passos: [
      ["al", "1. Destine o lucro", "Reserva Legal e dividendos, em Lançamentos (débito em 3.9)"],
      ["al", "2. Monte a DLPA", "saldo inicial, resultado, destinações, saldo final"],
      ["sy", "O CTC confere", "e mostra a DLPA pronta"],
    ],
  },
  balanco: {
    titulo: "Balanço Patrimonial",
    passos: [
      ["al", "1. Monte o Balanço", "grupos do Ativo, do Passivo e do PL, e os totais"],
      ["sy", "O CTC confere", "Ativo = Passivo + Patrimônio Líquido"],
      ["ok", "Balanço pronto", "assinado pelo administrador e pelo contador"],
    ],
  },
  questionarios: {
    titulo: "Questionários",
    passos: [
      ["pr", "O professor envia", "questionários de sala, avaliativos ou de recuperação"],
      ["al", "1. Responda", "a ordem das alternativas é diferente para cada aluno"],
      ["al", "2. Salve", "pode salvar e continuar depois"],
      ["ok", "De sala", "Enviar mostra a correção na hora"],
      ["pr", "Avaliativo", "altere até o prazo; a correção aparece quando o professor liberar"],
    ],
  },
};

function Caixa({ p }) {
  const [tipo, titulo, texto] = p;
  const [bg, borda] = COR[tipo] || COR.sy;
  return (
    <div style={{ background: bg, border: `2px solid ${borda}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, lineHeight: 1.35, width: 168, flex: "0 0 auto" }}>
      <b style={{ display: "block", marginBottom: 2 }}>{titulo}</b>{texto}
    </div>
  );
}

export function LinhaFluxo({ passos }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "stretch", gap: 6, margin: "8px 0" }}>
      {passos.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Caixa p={p} />
          {i < passos.length - 1 && <span aria-hidden="true" style={{ fontSize: 18, color: "var(--tinta-suave)" }}>➜</span>}
        </div>
      ))}
    </div>
  );
}

export function LegendaFluxo() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 12.5 }}>
      {LEGENDA.map(([t, r]) => (
        <span key={t}><i style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: COR[t][0], border: `1px solid ${COR[t][1]}`, marginRight: 5, verticalAlign: "-1px" }} />{r}</span>
      ))}
    </div>
  );
}

export function AvisoFluxo({ a }) {
  const [bg, borda] = COR[a[0]];
  return <div style={{ background: bg, border: `2px solid ${borda}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, marginTop: 6 }}>{a[1]}</div>;
}

const chaveVisto = (etapa) => `ctc-fluxo-${auth.currentUser?.uid || "anon"}-${etapa}`;

export default function FluxoEtapa({ etapa }) {
  const fluxo = FLUXOS[etapa];
  // abre sozinho na primeira visita; a marca de "já viu" é gravada depois de mostrar
  const [aberto, setAberto] = useState(() => { try { return localStorage.getItem(chaveVisto(etapa)) !== "1"; } catch { return false; } });
  useEffect(() => { try { localStorage.setItem(chaveVisto(etapa), "1"); } catch { /* sem armazenamento */ } }, [etapa]);
  if (!fluxo) return null;
  return (
    <section className="cartao" style={{ gap: 8, padding: "10px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <strong style={{ fontSize: 14 }}>🧭 Como funciona esta etapa — {fluxo.titulo}</strong>
        <button type="button" className="botao secundario pequeno" aria-expanded={aberto} onClick={() => setAberto(!aberto)}>{aberto ? "Fechar" : "Abrir"}</button>
      </div>
      {aberto && (
        <div>
          <LegendaFluxo />
          {fluxo.partes
            ? fluxo.partes.map((pt) => <div key={pt.nome}><div className="mono pequeno" style={{ marginTop: 8, color: "var(--destaque)" }}>{pt.nome}</div><LinhaFluxo passos={pt.passos} /></div>)
            : <LinhaFluxo passos={fluxo.passos} />}
          {fluxo.aviso && <AvisoFluxo a={fluxo.aviso} />}
        </div>
      )}
    </section>
  );
}
