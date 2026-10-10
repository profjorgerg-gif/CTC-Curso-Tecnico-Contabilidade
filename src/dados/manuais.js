// Manuais do CTC (estrutura aprovada em 04/10/2026; o texto é revisado a cada entrega
// e finalizado quando as telas estiverem estáveis). Cada seção: { id, titulo, passos: [], dica? }.

export const ATUALIZADO_EM = "10/10/2026";

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
    "Cada lista de escrituração pode ter o seu próprio nível de ajuda (campo \"Ajuda nos lançamentos\"). Sem escolha, a lista avaliativa e a de recuperação usam \"Livre\" e a de sala usa o padrão da turma. Sugestão: Completo nos primeiros exercícios de sala, Estrutura nas listas de prática e Livre nas avaliações.",
    "Considerar tributos nas operações: \"Não\" na CB; \"Sim\" a partir de CI/CT, quando compra e venda passam a incluir ICMS, PIS e COFINS (ou o Simples Nacional), conforme o regime da empresa de cada aluno.",
  ] },
  { id: "exercicios", titulo: "Exercícios: de sala, avaliativos e recuperação", passos: [
    "Na página da turma, \"Gerar exercícios\": escolha a finalidade, a quantidade de fatos, os tipos de operação, a faixa de valores e o período; revise o gabarito e envie.",
    "Lista-modelo \"Regime de competência\": botão em Exercícios da turma. Escolha o mês de competência (dentro do exercício das empresas dos alunos) e a lista vem pronta com 11 fatos e gabarito: seguro antecipado e apropriação, folha (salários, encargos e descontos), aluguel a pagar e a receber e, no mês seguinte, os pagamentos e recebimentos.",
    "Exercício de sala: o aluno vê a correção (Confere/Diferente) na hora. Não gera nota.",
    "Exercício avaliativo: tem peso e prazo. A correção fica oculta até você clicar em \"Liberar resultado\". Depois do prazo, a lista não aceita mais lançamentos.",
    "\"Fechar e lançar notas\": o CTC calcula a nota de cada aluno (acertos ÷ total × 10, conferindo pelo estoque e método da empresa dele) e grava no quadro de notas.",
    "\"Gerar recuperação\": monta uma lista parecida, só para os alunos abaixo de 6,0. Ao fechá-la, a nota entra como recuperação do instrumento — vale a maior.",
  ] },
  { id: "questoes", titulo: "Teoria e questões teóricas", passos: [
    "Teoria: em Disciplinas, cada módulo com conteúdo tem o botão \"Estudar\". O aluno lê a mesma teoria em \"Minhas disciplinas\".",
    "Banco de questões: em Banco de Dados → Banco de questões você vê as questões de cada módulo, com gabarito e explicação. Só professores veem o banco; o administrador importa o arquivo do banco.",
    "Na página da turma, \"Lista de questões teóricas\": escolha a finalidade (sala ou avaliativo), os módulos, a quantidade e os tipos (múltipla escolha, verdadeiro ou falso, afirmações I, II, III) e sorteie. Use \"Trocar\" ou \"Remover\" antes de enviar.",
    "De sala: o aluno vê a correção e a explicação na hora. Avaliativo: o gabarito fica só com você; \"Fechar e lançar notas\" e \"Liberar resultado\" funcionam como nas listas de escrituração. A recuperação sorteia questões diferentes das da lista original.",
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
  { id: "relatorio", titulo: "Relatório de orientação", passos: [
    "No Acompanhamento da turma, aba \"Relatório de orientação\": o Resumo da turma mostra, por aluno, os itens em dia e quantas pendências estão com o aluno e com você (a sua fila de trabalho).",
    "\"Ver relatório\" (ou \"relatório\" embaixo do nome, no quadro) abre o relatório do aluno: situação por item (abertura, fatos orientados, cada lista e questionário, lançamentos, fechamento), quem age agora e o que precisa de ajuste, com o que fazer e onde.",
    "Cor = etapa; ● corrigir (pílula cheia) = erro; ○ conferir (pílula vazada) = atenção. Os filtros por etapa mostram a contagem.",
    "\"Imprimir / salvar PDF\" sai em A4 paisagem, com o nome do aluno e a data no nome do arquivo. \"Copiar texto para o aluno\" gera a orientação para colar no Classroom ou no WhatsApp — sem revelar o acerto das listas avaliativas ainda ocultas.",
    "É só leitura: nada é alterado nos dados do aluno. No Modo de teste, o botão \"Relatório\" mostra o da conta de teste (com a etiqueta CONTA DE TESTE).",
  ] },
  { id: "empresas", titulo: "Empresas e escrituração dos alunos", passos: [
    "No quadro \"Empresas dos alunos\" você vê o cadastro e a parametrização de cada um e abre a escrituração dele (\"Escrituração\").",
    "Você pode corrigir lançamentos do aluno; toda correção sua fica registrada na Auditoria.",
  ] },
  { id: "guia", titulo: "Guia Pedagógico", passos: [
    "Guia do professor (1ª aba): o mapa do CTC para o dia a dia — roteiro do dia de aula, as 4 fases (preparar, acompanhar, corrigir e orientar, fechar a nota) com o botão \"Abrir\" que leva direto à tela, \"Preciso resolver…\" e \"Boas práticas e cuidados\". As fases de preparar e fechar podem ser marcadas como feitas, por turma.",
    "Slides: escolha a disciplina e o módulo. Use as setas do teclado ou clique para avançar, \"Tela cheia\" para projetar e \"Notas do professor\" para ver as suas anotações.",
    "Plano Semestral: no mesmo formato do modelo do CEDUP Hermann Hering (A4 paisagem, com o cabeçalho da escola). Vem preenchido com a ementa oficial, os módulos, os textos-padrão da Portaria nº 874/2025 e as datas das listas avaliativas. Revise, salve e use \"Imprimir / PDF\". Nos textos, **trecho** sai em negrito.",
    "Sequência Didática (plano de aula): escolha o mês e clique em \"Nova sequência didática\". Ela herda os campos do Plano Semestral e já traz as avaliações do período.",
  ], dica: "Para gerar o PDF, escolha \"Salvar como PDF\" na janela de impressão. Se nada abrir, permita pop-ups para o CTC." },
  { id: "banco", titulo: "Banco de Dados", passos: [
    "Consulta do Plano de Contas, CFOP, NCM (por capítulo) e cronograma IBS/CBS.",
    "Professor e administrador podem corrigir o Plano de Contas; cada alteração fica no histórico.",
  ] },
  { id: "teste", titulo: "Modo de teste (ver o CTC como aluno)", passos: [
    "Abra Modo de teste no menu: cada turma sua tem uma \"Conta de teste do professor\" com matrícula fictícia (TESTE-…). Clique em \"Entrar no modo de teste →\".",
    "O CTC passa a mostrar exatamente a tela do aluno da turma: trilha, empresa, parametrização, escrituração, questionários (só os enviados) e notas. Não precisa de outra conta Google, nem de turma ou aluno de mentira.",
    "A faixa no topo lembra que você está no modo de teste; \"Sair do modo de teste\" volta à sua tela de professor. O modo vale só na aba do navegador em que foi aberto.",
    "A conta de teste não entra na lista de alunos, nas notas, no acompanhamento nem no backup, e não abre chamados de Suporte. A auditoria marca as ações como \"(modo de teste)\".",
    "\"Zerar dados de teste\" apaga a empresa, a escrituração, as respostas e o progresso de estudo da conta de teste naquela turma, para testar de novo do zero.",
  ] },
  { id: "suporte-prof", titulo: "Suporte numerado e devolução de tarefa", passos: [
    "Os chamados dos alunos das suas turmas chegam ao seu Suporte com número (Nº 0001). \"Aguardando você\" mostra os que esperam a sua resposta. Busque por número, aluno, matrícula ou assunto.",
    "Em cada chamado: \"Imprimir / salvar PDF\", \"Baixar texto (.txt)\" e \"Copiar\". Na lista, \"Exportar (.txt)\" junta todos os chamados filtrados num arquivo só.",
    "Respostas rápidas: escolha um modelo para inserir no texto; \"Guardar como resposta rápida\" salva o seu texto neste navegador.",
    "↩ Devolver tarefa (no chamado ou no Relatório de orientação): marque o que reabrir só para aquele aluno — lista de escrituração ou questionário (até a data escolhida, mesmo encerrada; no questionário, pode apagar as respostas), desfazer o encerramento do exercício, ou só orientar sobre os fatos orientados. O aluno recebe a orientação por um chamado.",
    "Problemas do sistema, de acesso ou sugestões: abra um chamado para o administrador.",
  ] },
  { id: "lixeira", titulo: "Lixeira de segurança", passos: [
    "Antes de apagar ou substituir algo, o CTC guarda uma cópia na lixeira. Se a cópia falhar, nada é apagado.",
    "Lixeira desta empresa (no fim da escrituração do aluno): lançamentos excluídos, a versão anterior de cada lançamento corrigido, encerramentos desfeitos e saldos iniciais substituídos — feitos pelo aluno ou por você.",
    "Lixeira da turma (na página da turma): listas excluídas, alunos retirados e respostas apagadas.",
    "\"Restaurar\" devolve o item (o que estiver no lugar também vai para a lixeira). \"Esvaziar itens com mais de 90 dias\" limpa os antigos: no plano gratuito não há limpeza automática.",
    "Excluir a turma não passa pela lixeira: baixe o backup antes. Para confirmar, é preciso digitar EXCLUIR.",
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
    "DRE, Encerramento (ARE), DLPA e Balanço Patrimonial, montados a partir dos seus lançamentos. Na DRE, você mesmo monta cada linha primeiro; o CTC confere e depois mostra a DRE pronta (se lançar algo novo, monte de novo). No Encerramento, você faz os lançamentos de encerramento (lado e valor de cada conta de resultado e a transferência do resultado); o CTC confere e só então libera a gravação. Na DLPA, depois do encerramento e das destinações, você monta a DLPA linha a linha antes de ver a pronta. No Balanço Patrimonial, depois do encerramento, você monta os grupos e os totais antes de ver o pronto.",
  ] },
  { id: "questionarios", titulo: "Teoria e questionários", passos: [
    "Em \"Minhas disciplinas\", abra a disciplina e clique em \"Estudar\" no módulo para ler a teoria.",
    "No fim de cada módulo, o quadro \"Próximo passo\" diz o que fazer no CTC, com o botão que leva direto à tela certa. Clique em \"Marcar como estudado\" quando terminar.",
    "Na lista de módulos, os selos mostram o seu andamento: Estudado, Questionário e Prática no CTC (verde = feito). A marcação \"Estudado\" fica guardada neste navegador.",
    "Em \"Questionários\" ficam as listas de questões enviadas pelo professor. Marque as respostas e clique em \"Salvar\" ou \"Enviar\".",
    "De sala: você vê a correção e a explicação na hora e pode refazer. Avaliativo: você pode mudar as respostas até o prazo; a correção e a nota aparecem quando o professor liberar o resultado.",
  ] },
  { id: "notas", titulo: "Minhas notas", passos: [
    "Mostra as notas que o professor publicou em cada turma, a média e a frequência.",
    "Para aprovação: média igual ou superior a 6,0 e frequência igual ou superior a 75%.",
  ] },
  { id: "ajuda-tela", titulo: "Como funciona esta etapa e rascunhos", passos: [
    "No topo de Minha empresa, Parametrização, Questionários e de cada aba da Escrituração há o quadro \"Como funciona esta etapa\": o caminho em caixas (você faz, o CTC faz, o professor faz, atenção). Ele abre sozinho na primeira visita; depois, use \"Abrir\".",
    "Enquanto você digita e ainda não salvou, aparece \"● alterações não salvas\". O CTC guarda o que você digitou neste computador: se trocar de aba, recarregar a página ou sair, ao voltar aparece \"Há um rascunho não salvo\" com \"Restaurar\" e \"Descartar\".",
    "O rascunho fica só no computador onde você digitou e vale por 14 dias. O que conta é o que você salvou: salve sempre antes de sair, principalmente em computador da escola.",
  ] },
  { id: "suporte", titulo: "Suporte", passos: [
    "Abra um chamado em \"Suporte\". Escolha o tipo e para quem: o professor da turma (dúvida de conteúdo, exercício, escrituração, questionário, notas) ou o administrador (acesso, erro no sistema, sugestão).",
    "Em \"Relacionado a\", diga onde é a dúvida (ex.: Módulo 05, aba DRE). Cada chamado recebe um número (Nº 0001): use-o para falar com o professor.",
    "Quando o professor devolver uma tarefa para você refazer, chega um chamado \"Tarefa devolvida para refazer\" com a orientação, e a lista aparece reaberta até a data indicada. Ao terminar, responda o chamado.",
  ] },
];
