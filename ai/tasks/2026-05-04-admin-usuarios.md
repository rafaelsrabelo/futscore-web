---
name: 2026-05-04 Admin Usuários (CRUD + reset senha)
description: Brief de implementação da nova área `/admin/usuarios` consumindo BE-USERS (4 endpoints).
---

# 2026-05-04 — `/admin/usuarios` consumindo `/api/admin/users*`

## Goal
Adicionar a área de **Usuários** no admin (separada de Atletas/Olheiros) cobrindo os 4 endpoints novos do backend: listar, detalhar, editar, redefinir senha. Suporta `ATHLETE`, `OBSERVER` e usuários **sem role** (cadastraram conta mas não escolheram).

## Endpoints
Base: `https://futscout-api.onrender.com/api`

| Método | Rota |
|---|---|
| `GET`   | `/admin/users` (query: `q`, `role`, `page`, `pageSize`) |
| `GET`   | `/admin/users/:id` |
| `PATCH` | `/admin/users/:id` (body parcial; campos: `name`, `email`, `cpf`, `role`, `isActive`, `emailVerified`, `isImported`) |
| `POST`  | `/admin/users/:id/reset-password` (body: `{ password }`, resposta 204) |

Auth: `Authorization: Bearer <accessToken>` (role=ADMIN). Tratar 401/403→login, 404, 400, 409 (email/cpf duplicado).

⚠️ **Resposta da listagem** vem com `pagination: { page, pageSize, total, totalPages }` — formato diferente da de atletas (que vem flat). Ajustar mapping antes de passar pro componente `Pagination` (ele espera `hasMore` flag).

## Decisões já tomadas
- Rota frontend: `/admin/usuarios` (pt-BR, casa com `/admin/atletas`). API fica em inglês.
- Item de menu novo entre **Atletas** e **Partidas**, label "Usuários", ícone `UserCog` (distingue de "Atletas" que usa `Users`).
- **Mantém** `resetAthletePasswordAction` na tela de atleta (compat); cria novo `resetUserPasswordAction` para a tela de usuários.
- Botão "Ver perfil de atleta" → `/admin/atletas/${athleteProfileId}` quando `athleteProfileId !== null`.
- Botão "Ver perfil de olheiro" → desabilitado com tooltip "Em breve" (rota `/admin/olheiros/[id]` ainda não existe — `app/admin/(authenticated)/olheiros/page.tsx` é placeholder).

## Acceptance criteria
- [ ] Sidebar mostra "Usuários" abaixo de "Atletas", ícone `UserCog`, marca como ativo em `/admin/usuarios*`.
- [ ] `/admin/usuarios` renderiza tabela com: avatar (iniciais), nome+email, CPF, role (chip), plano (chip dourado p/ PREMIUM), status, último login, ações (linha clicável).
- [ ] Filtros no topo: `SearchInput` debounced (300ms) → `?q=`; dropdown role (Todos/Atleta/Olheiro/Sem role) → `?role=`. Reset de `page` ao mudar filtro.
- [ ] Paginação prev/next via URL (`?page=N`), com totais (`X de Y · N usuários`).
- [ ] `/admin/usuarios/[id]` mostra card "Conta" com todos os campos do `user` + chip de plano + 4 botões: **Editar**, **Redefinir senha**, **Ver perfil de atleta** (condicional), **Ver perfil de olheiro** (disabled).
- [ ] Modal de edição com 7 campos (`name`, `email`, `cpf`, `role`, `isActive`, `emailVerified`, `isImported`). Campos vazios não viram null exceto `cpf`. Mapeia 409 pra erro inline (email/cpf).
- [ ] Modal de redefinir senha: password + confirmação + força mínima (≥8) + botão "gerar aleatória" + copy clipboard. Toast/aviso "todos os dispositivos serão deslogados".
- [ ] Editar CPF abre `confirm()` extra (operação sensível, conforme alerta da doc).
- [ ] 401/403 em qualquer fetch → `redirect('/admin/login')`.
- [ ] `npm run lint` limpo.

## Files

**Novos**
- `lib/admin/users.ts` — fetchers `getAdminUsersList`, `getAdminUserDetail` (segue padrão de `lib/admin/athletes.ts`)
- `app/admin/(authenticated)/usuarios/page.tsx` — listagem (Server Component)
- `app/admin/(authenticated)/usuarios/search-input.tsx` — debounced (espelha o de atletas)
- `app/admin/(authenticated)/usuarios/role-filter.tsx` — dropdown URL-driven
- `app/admin/(authenticated)/usuarios/user-row.tsx` — linha da tabela
- `app/admin/(authenticated)/usuarios/pagination.tsx` — wrap do componente reutilizado, calcula `hasMore` a partir de `pagination.totalPages`
- `app/admin/(authenticated)/usuarios/[id]/page.tsx` — detalhe
- `app/admin/(authenticated)/usuarios/[id]/edit-user-dialog.tsx` — modal PATCH
- `app/admin/(authenticated)/usuarios/[id]/reset-password-button.tsx` — modal reset (separado do de atleta)

**Modificados**
- `lib/admin/types.ts` — adicionar `AdminUserListItem`, `AdminUsersResponse`, `AdminUserDetail` (+ `UserRoleFilter`, `ActivePlan`)
- `lib/admin/schemas.ts` — `updateUserSchema`, reaproveitar `resetPasswordSchema`
- `lib/admin/actions.ts` — `updateUserAction`, `resetUserPasswordAction` (mesmo padrão dos de atleta)
- `components/admin/app-sidebar.tsx` — novo item de NAV (`UserCog`) entre Atletas e Partidas

## Open questions
1. **Geração de senha aleatória**: tamanho default 16 chars, alfanumérico + símbolos seguros (`!@#$%&*`)? Ou prefere uma libsinha de palavras estilo correcthorsebatterystaple? Vou na primeira opção a menos que você diga.
2. **Chip "Sem role"**: cor neutra (cinza) ou alerta (amber)? Vou de cinza por enquanto.
3. **`role: null` no PATCH** (desfaz a role): a doc cita como "raro" — vou **não** expor essa opção no select por padrão. OK?

## Status
- 2026-05-04 [draft] aguardando revisão antes de codar.
- 2026-05-04 [shipped] entregue conforme acceptance criteria.
  - Decisões finais: gerador de senha com **strict mode** (≥1 maiúscula + minúscula + dígito + símbolo, 16 chars, `crypto.getRandomValues` + Fisher-Yates shuffle), chip "Sem role" cinza, opção `role: null` omitida do select.
  - `npm run lint` falhou por bug **pré-existente** de config no ESLint 9 (`TypeError: Converting circular structure to JSON` no validador, antes de qualquer arquivo ser lido). `tsc --noEmit` e `npm run build` passaram limpos — `/admin/usuarios` e `/admin/usuarios/[id]` aparecem no route map.
