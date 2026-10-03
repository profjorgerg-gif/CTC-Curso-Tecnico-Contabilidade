# CTC — Curso Técnico em Contabilidade

Plataforma integrada das disciplinas do Curso Técnico em Contabilidade do CEDUP Hermann Hering.

- **Site:** https://profjorgerg-gif.github.io/CTC-Curso-Tecnico-Contabilidade/
- **Firebase:** projeto `ctc-curso-tecnico-contabil` (plano Spark, sem custo)
- **Tecnologia:** React + Vite, Firebase Authentication (Google) e Firestore, publicado pelo GitHub Pages

## Fase 1 — Base (esta versão)

| Parte | O que faz |
| --- | --- |
| Login | Somente conta Google. Sem senha própria e sem código de acesso. |
| Professores e administradores | Definidos por uma lista de e-mails (`autorizados`). O administrador inclui e remove pela tela. |
| Turmas | O professor cria a turma com disciplina e semestre e cola a lista "Nome, matrícula". |
| Primeiro acesso do aluno | O aluno informa a matrícula; se ela estiver numa lista, fica ligada à conta Google dele. |
| Trilha e disciplinas | As 7 disciplinas na ordem do curso; o aluno acessa só as das suas turmas. |
| Banco de Dados | Plano de Contas oficial (295 contas), CFOP (619), NCM (15.157) e cronograma IBS/CBS. Correções ficam no histórico. |
| Segurança | Regras do Firestore por perfil e por turma (`firestore.rules`). |

As disciplinas recebem conteúdo a partir da Fase 2.

## Regras de custo zero

1. Plano Spark, **sem cartão cadastrado** no Firebase.
2. Nada de Cloud Functions nem Firebase Storage.
3. Tabelas grandes (CFOP, NCM, plano oficial) são arquivos do próprio site, em `public/dados`.

## Estrutura dos dados (Firestore)

| Coleção | Conteúdo |
| --- | --- |
| `autorizados/{email}` | `papel` ("admin" ou "professor") e `nome` |
| `usuarios/{uid}` | perfil do aluno: `nome`, `email`, `matricula` |
| `matriculas/{matricula}` | `nome`, `turmas` (lista de ids) e `uid` da conta vinculada |
| `turmas/{id}` | `nome`, `disciplina`, `semestre`, professor |
| `turmas/{id}/alunos/{matricula}` | aluno na lista da turma |
| `config/planoContas` | plano de contas em uso |
| `config/ibsCbs` | cronograma IBS/CBS |
| `historico/{id}` | quem alterou o quê e quando (não pode ser apagado) |

## Arquivos

- `src/telas/` — telas (Login, Primeiro acesso, Início, Disciplinas, Turmas, Banco de Dados, Autorizados)
- `src/lib/` — sessão, turmas e leitura das tabelas
- `src/dados/` — lista das disciplinas e cronograma IBS/CBS inicial
- `public/dados/` — plano de contas, CFOP e NCM
- `scripts/montar-plano.mjs` — como o plano de 295 contas foi montado (CB + CI + nomes da Unidade II)
- `firestore.rules` — regras de segurança (colar no Console Firebase)
- `.github/workflows/deploy.yml` — publicação automática no GitHub Pages

## Desenvolvimento local (opcional)

```
npm install
npm run dev
```
