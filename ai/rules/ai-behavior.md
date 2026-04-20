# AI Behavior Rules

## Sempre
- Confirmar antes de ações destrutivas (git reset, force-push, delete de branch, rm -rf)
- Ler o arquivo alvo antes de editar — não assumir estrutura
- Rodar `npm run lint` antes de declarar uma task pronta
- Se mudar UI e não puder testar visualmente, dizer isso explicitamente em vez de alegar "funcionando"
- Conventional Commits em inglês no subject (`feat:`, `fix:`, `chore:`, `refactor:`); body pode ser pt-BR

## Nunca
- Nunca inventar endpoints, campos ou nomes de rota da API. Se o contrato for desconhecido, perguntar ou checar `lib/types.ts`
- Nunca hardcodar credenciais de admin nem colocar secret em variável `NEXT_PUBLIC_*`
- Nunca tirar o dark mode nem traduzir copy pro inglês sem pedido explícito
- Nunca adicionar test runner, ORM, lib de state global, ou UI kit novo sem aprovação
- Nunca criar rotas `app/api/*` de proxy se o client pode falar direto com o backend — só quando precisar esconder um secret

## Loop de tarefas
- Toda task não-trivial gera um brief em `ai/tasks/<YYYY-MM-DD>-<slug>.md` com:
  - **Goal** — uma frase
  - **Acceptance criteria** — bullets verificáveis
  - **Files to touch** — caminhos
  - **Open questions** — o que precisa do usuário antes de começar
- Atualizar o brief conforme decisões vão acontecendo; encerrar com linha de status ao entregar

## Em dúvida
- Parar e fazer **uma** pergunta focada em vez de chutar — especialmente em torno de contrato da API, fluxo de auth e target de deploy
