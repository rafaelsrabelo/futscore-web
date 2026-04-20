# 2026-04-20 — Admin area (login + shell + section stubs)

## Goal
Entregar o shell completo do admin: login funcional (stubbed), layout com sidebar, user menu (avatar + nome + ações), theme toggle, e uma page stub pra cada item de menu. Nenhuma integração real com endpoint de admin nesta entrega — apenas fundação pronta pra plugar a API.

## Acceptance criteria
- [x] `/admin/login` renderiza form (email + senha) com validação zod e mensagens em pt-BR
- [x] Submit válido seta cookie httpOnly `admin_token` e redireciona pra `/admin`
- [x] `proxy.ts` (ex-`middleware.ts`, convenção Next 16) bloqueia qualquer `/admin/*` sem cookie e redireciona pra login; usuário logado em `/admin/login` vai pra `/admin`
- [x] `/admin` e subpáginas renderizam sob layout com sidebar fixa:
  - Dashboard, Atletas, Olheiros, Acessos, Notificações, Configurações
- [x] Topbar mostra avatar + nome + e-mail + dropdown com: Perfil (disabled), Tema (toggle), Sair
- [x] Botão "Sair" limpa cookie e redireciona pra `/admin/login`
- [x] Theme toggle alterna dark/light via `next-themes` (classe no `<html>`, persistência em localStorage)
- [ ] `npm run lint` — **broken** pre-existente (FlatCompat × eslint-config-next@16, erro de circular JSON). Validado via `tsc --noEmit` e `next build` — ambos limpos.

## Non-goals (fora desta task)
- Integração real com endpoints de auth — deixar TODO explícito
- CRUD de atletas/olheiros/etc — páginas são placeholders com título + estado vazio
- React Query — entra na próxima task, quando tivermos a primeira tabela real
- Paginação, filtros, gráficos — idem

## Files to touch
**Novos**
- `middleware.ts` (raiz)
- `lib/admin/auth.ts` — `login`, `logout`, `getSession` (Server Actions + helpers)
- `lib/admin/api.ts` — `fetchAuthed()` stubbed
- `lib/admin/schemas.ts` — zod schema do login
- `app/admin/layout.tsx` — ThemeProvider wrapper
- `app/admin/login/page.tsx` + `app/admin/login/login-form.tsx`
- `app/admin/(authenticated)/layout.tsx` — sidebar + topbar
- `app/admin/(authenticated)/page.tsx` — Dashboard
- `app/admin/(authenticated)/atletas/page.tsx`
- `app/admin/(authenticated)/olheiros/page.tsx`
- `app/admin/(authenticated)/acessos/page.tsx`
- `app/admin/(authenticated)/notificacoes/page.tsx`
- `app/admin/(authenticated)/configuracoes/page.tsx`
- `components/admin/app-sidebar.tsx`
- `components/admin/user-menu.tsx`
- `components/admin/theme-provider.tsx`
- `components/admin/theme-toggle.tsx`
- `components/ui/dropdown-menu.tsx` (shadcn)

**Editados**
- `app/layout.tsx` — remover `className="dark"` hardcoded, envolver com ThemeProvider (defaultTheme `dark` mantém público escuro)
- `package.json` — deps novas

## Dependências adicionadas
- `zod` — validação
- `next-themes` — toggle global (UI do toggle só no admin)
- `@radix-ui/react-dropdown-menu` — dropdown do user menu (via shadcn CLI)

Nenhuma dependência de state global (Zustand/Redux) nem React Query — alinhado com `ai/rules/architecture.md`.

## Auth strategy (stub)
Cookie `admin_token` httpOnly, path `/`, secure em prod.  
`getSession()` lê o cookie e, se presente, retorna `{ user: { name, email } }` **fake**. Troca quando a API expuser:
- `POST /auth/login` → `{ token, user }`
- `GET /auth/me` pra validar/hidratar sessão
- `POST /auth/logout` (opcional)

Ponto único de troca: `lib/admin/auth.ts`. `TODO(api-swap)` marcado.

## Open questions (pro usuário)
1. Endpoint e payload reais do login? (aguardando)
2. Token no body ou em `Set-Cookie` pela própria API?
3. Refresh token ou só access?
4. Deploy target (Vercel?) pra gente travar `secure` cookie e env vars

## Status
- 2026-04-20 [in progress] iniciada
- 2026-04-20 [shipped] shell completo; rota `/admin/login` + `/admin/*` funcionando em build; auth é stub. Próximo passo: trocar stub por API real assim que endpoints confirmados.

## Follow-ups abertos
- Lint quebrado (FlatCompat × eslint-config-next@16) — migrar para flat config nativo do Next 16 (`eslint-config-next` exporta config pronta agora). Task separada.
- Convenção `middleware.ts` → `proxy.ts` aplicada (Next 16). Confirmar se outros projetos do workspace também precisam migrar.
- Ao plugar API real: trocar `lib/admin/actions.ts#loginAction` e `lib/admin/auth.ts#getSession` (dois pontos marcados `TODO(api-swap)`).
