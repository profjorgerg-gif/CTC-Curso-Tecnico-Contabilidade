// Manuais do CTC (estrutura aprovada em 04/10/2026; o texto é revisado a cada entrega
// e finalizado quando as telas estiverem estáveis). Cada seção: { id, titulo, passos: [], dica? }.

export const ATUALIZADO_EM = "04/10/2026";

export const MANUAL_PROFESSOR = [
  { id: "entrada", titulo: "Entrar no CTC", passos: [
    "Acesse ctccontabil.com.br e clique em \"Entrar com o Google\", usando a conta cadastrada pelo administrador.",
    "No primeiro acesso, crie a sua senha do CTC. Nas próximas entradas, digite essa senha depois de escolher a conta Google.",
    "Depois de 30 minutos sem uso, o CTC sai sozinho. Esqueceu a senha? Peça ao administrador para redefinir.",
  ] },
  { id: "turmas", titulo: "Turmas e matrículas", passos: [
    "Menu \"Turmas e matrículas\" → informe nome, disciplina e semestre e cole a lista de alunos (uma linha por aluno: Nome completo, matrícula).",
    "Só entra quem está na lista. No primeiro acesso, o aluno digita a matrícula e ela fica ligada à conta Google dele.",
    "Na página da turma você inclui ou retira alunos e libera uma matrícula para outra conta (\"Desvincular conta\").",
  ], dica: "Excluir a turma apaga também as empresas, listas, notas e planos dela. Faça um backup antes." },
  { id: "parametros", titulo: "Parametrização da turma", passos: [
    "Na página da turma, \"Definir parâmetros\": marque \"Fixar\" nos parâmetros que devem valer para todos (ex.: método de estoque PEPS). Os demais, cada aluno escolhe.",
    "Depois do primeiro lançamento, a parametrização do aluno trava. Para liberar, use \"Destravar parâmetros\" no quadro \"Empresas dos alunos\".",
  ] },
  { id: "lancamentos", titulo: "Lançamentos da turma (nível de ajuda e tributos)", passos: [
    "Nível de ajuda: Livre (o aluno monta tudo), Estrutura (padrão — o CTC mostra as linhas e os efeitos da operação) ou Completo (o CTC também sugere as contas).",
    "Considerar tributos nas operações: \"Não\" na CB; \"Sim\" a partir de CI/CT, quando compra e venda passam a incluir ICMS, PIS e COFINS (ou o Simples Nacional), conforme o regime da empresa de cada aluno.",
  ] },
  { id: "exercicios", titulo: "Exercícios: de sala, avaliativos e recuperação", passos: [
    "Na página da turma, \"Gerar exercícios\": escolha a finalidade, a quantidade de fatos, os tipos de operação, a faixa de valores e o período; revise o gabarito e envie.",
    "Exercício de sala: o aluno vê a correção (Confere/Diferente) na hora. Não gera nota.",
    "Exercício avaliativo: tem peso e prazo. A correção fica oculta até você clicar em \"Liberar resultado\". Depois do prazo, a lista não aceita mais lançamentos.",
    "\"Fechar e lançar notas\": o CTC calcula a nota de cada aluno (acertos ÷ total × 10, conferindo pelo estoque e método da empresa dele) e grava no quadro de notas.",
    "\"Gerar recuperação\": monta uma lista parecida, só para os alunos abaixo de 6,0. Ao fechá-la, a nota entra como recuperação do instrumento — vale a maior.",
  ] },
  { id: "notas", titulo: "Notas da turma", passos: [
    "O quadro \"Notas da turma\" reúne as listas avaliativas fechadas e as avaliações manuais (\"+ Avaliação manual\": prova, seminário, trabalho).",
    "Informe as aulas semanais: o CTC confere o número mínimo de instrumentos do PPC (1 aula: 2; 2 aulas: 3; 3 ou mais: 4) e quantos já têm recuperação paralela.",
    "Digite a frequência (%) de cada aluno, se quiser que a situação considere os 75% mínimos.",
    "Marque \"publicar\" nas avaliações que os alunos podem ver e clique em \"Salvar e publicar para os alunos\". Eles veem em \"Minhas notas\".",
    "No fim do semestre, \"Encerrar o semestre\" troca a situação para Aprovado ou Reprovado (média ≥ 6,0 e frequência ≥ 75%). Publique de novo para os alunos verem.",
  ], dica: "Use \"Exportar .csv\" para levar as notas ao diário de classe." },
  { id: "acompanhamento", titulo: "Acompanhamento da turma", passos: [
    "Na página da turma, o quadro \"Acompanhamento da turma\" mostra, para cada aluno: cadastro, parametrização, saldos iniciais, fatos orientados, cada lista enviada, balancete, encerramento e a última atividade.",
    "Cores: verde = feito/confere; ocre = em andamento ou com diferença; cinza = não começou; vermelho = balancete que não fecha ou sem atividade há mais de 7 dias.",
    "Nas listas, \"3/5 · 2 ✓\" quer dizer 3 de 5 fatos lançados e 2 conferem. Nas avaliativas ainda ocultas, só você vê o acerto.",
    "Use os filtros \"Só quem está atrasado\" e \"Só quem tem diferenças\" e clique no nome do aluno para abrir a escrituração dele. \"Atualizar\" relê os livros; \"Exportar .csv\" guarda o retrato da turma.",
  ] },
  { id: "empresas", titulo: "Empresas e escrituração dos alunos", passos: [
    "No quadro \"Empresas dos alunos\" você vê o cadastro e a parametrização de cada um e abre a escrituração dele (\"Escrituração\").",
    "Você pode corrigir lançamentos do aluno; toda correção sua fica registrada na Auditoria.",
  ] },
  { id: "guia", titulo: "Guia Pedagógico", passos: [
    "Slides: escolha a disciplina e o módulo. Use as setas do teclado ou clique para avançar, \"Tela cheia\" para projetar e \"Notas do professor\" para ver as suas anotações.",
    "Plano Semestral: vem preenchido com a ementa oficial, os módulos e as datas das listas avaliativas. Revise, salve e use \"Imprimir / PDF\".",
    "Plano de Aula Mensal: escolha o mês e clique em \"Novo plano mensal\". Ele herda os campos do Plano Semestral e já traz as listas do mês.",
  ], dica: "Para gerar o PDF, escolha \"Salvar como PDF\" na janela de impressão. Se nada abrir, permita pop-ups para o CTC." },
  { id: "banco", titulo: "Banco de Dados", passos: [
    "Consulta do Plano de Contas, CFOP, NCM (por capítulo) e cronograma IBS/CBS.",
    "Professor e administrador podem corrigir o Plano de Contas; cada alteração fica no histórico.",
  ] },
  { id: "backup", titulo: "Backup e Suporte", passos: [
    "Backup: o professor baixa o backup da turma (alunos, empresas, lançamentos, listas, notas e planos). O administrador faz o backup completo e a restauração.",
    "Suporte: abra um chamado para dúvidas ou problemas e acompanhe a resposta do administrador.",
  ] },
];

export const MANUAL_ALUNO = [
  { id: "entrada", titulo: "Primeiro acesso e entrada", passos: [
    "Acesse ctccontabil.com.br e entre com a sua conta Google.",
    "No primeiro acesso, digite a sua matrícula: ela fica ligada à sua conta. Nas próximas entradas, confirme a matrícula.",
    "Depois de 30 minutos sem uso, o CTC sai sozinho.",
  ], dica: "Entrou com a conta errada? Peça ao professor para desvincular a matrícula." },
  { id: "empresa", titulo: "Minha empresa", passos: [
    "Em cada turma você tem a sua própria empresa. Complete o cadastro: razão social, nome fantasia, ramo, município e capital social.",
  ] },
  { id: "parametrizacao", titulo: "Parametrização", passos: [
    "Antes de escriturar, defina os parâmetros da empresa: exercício social, regime de reconhecimento, sistema de inventário (permanente ou periódico), método de estoque (PEPS ou Média), apuração do resultado e dados do contador.",
    "Leia a explicação de cada parâmetro. O que o professor fixou para a turma aparece travado.",
    "Depois do primeiro lançamento, os parâmetros travam; só o professor pode liberar.",
  ] },
  { id: "saldos", titulo: "Saldos iniciais", passos: [
    "Faça o lançamento de abertura: credite o Capital Social pelo capital da empresa e debite o mesmo valor em contas do Ativo (Caixa, Bancos, Imobilizado).",
    "O total devedor precisa ser igual ao total credor.",
  ] },
  { id: "lancamentos", titulo: "Lançamentos", passos: [
    "Escolha o tipo de operação (compra, venda, pagamento…): o CTC mostra as linhas do lançamento e o efeito de cada uma.",
    "Escolha a conta de cada linha (digite o código ou o nome) e informe o valor. Em Mercadorias (1.1.3.01), informe também a quantidade e, na compra, o valor unitário.",
    "Use \"+ Débito\" e \"+ Crédito\" para mais linhas (ex.: compra parte à vista, parte a prazo). A soma dos débitos precisa ser igual à dos créditos.",
    "Na venda (inventário permanente), registre no mesmo lançamento a receita e a baixa do CMV: o CTC mostra o custo pelo método da sua empresa e o botão \"Usar este custo\".",
  ], dica: "Errou? Use \"Corrigir\" no Livro Diário." },
  { id: "roteiros", titulo: "Fatos orientados e listas do professor", passos: [
    "Comece pelos 8 fatos orientados: o CTC mostra um fato por vez e indica se o seu lançamento confere.",
    "As listas que o professor enviar aparecem em abas. Exercício de sala: a correção aparece na hora.",
    "Exercício avaliativo: a correção aparece só quando o professor liberar o resultado. Lance tudo até o prazo — depois dele a lista não aceita mais lançamentos.",
    "Recuperação: se você ficou abaixo de 6,0 numa lista avaliativa, recebe a lista de recuperação. Vale a maior nota.",
  ] },
  { id: "relatorios", titulo: "Razão, estoque, balancete e demonstrações", passos: [
    "Razão por conta: o razonete (conta T) e o extrato de cada conta.",
    "Controle de estoque: a ficha (kardex) pelo método da sua empresa e o comparativo entre os métodos. No inventário periódico, faça aqui a apuração do CMV no fim do período.",
    "Balancete: débitos = créditos e saldos devedores = credores.",
    "DRE, Encerramento (ARE), DLPA e Balanço Patrimonial, montados a partir dos seus lançamentos.",
  ] },
  { id: "notas", titulo: "Minhas notas", passos: [
    "Mostra as notas que o professor publicou em cada turma, a média e a frequência.",
    "Para aprovação: média igual ou superior a 6,0 e frequência igual ou superior a 75%.",
  ] },
  { id: "suporte", titulo: "Suporte", passos: [
    "Teve um problema no CTC? Abra um chamado em \"Suporte\" e acompanhe a resposta.",
  ] },
];
