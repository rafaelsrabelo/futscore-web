# 2026-04-20 — Auth real + login redesign + atletas ScoutTerminal

## Goal
Trocar o stub de auth pelo fluxo real da API (guia em `/docs/AUTENTICACAO-ADMIN.md` do backend), migrar a URL da API para env var, redesenhar `/admin/login` em split 6-6 e reconstruir `/admin/atletas` no padrão ScoutTerminal (print do Stitch).

## Decisões
- **Tokens em cookies httpOnly** (access + refresh). Access 15m; refresh 7d. Refresh rotacionado pelo backend a cada uso.
- **Refresh + verify feitos no middleware (`proxy.ts`)**: cada request pra `/admin/*` valida o access token via `GET /admin/auth/verify`, refreshea se expirado, rejeita + limpa cookies se inválido. Payload do verify é propagado pro Server Component via header `x-admin-session`, então `getSession()` é leitura cheap (sem round-trip extra).
- **Login também valida role**: após `POST /auth/sessions`, chama `/admin/auth/verify`. Se 403, usuário é athlete/observer → recusa login com mensagem clara e NÃO grava cookies.
- **API_URL como env var server-side** (`process.env.API_URL`). Sem `NEXT_PUBLIC_` — fetch acontece só em Server Component / Server Action / middleware.
- **Atletas consome `GET /public/athletes`** por enquanto (endpoint admin não exposto). Ratings/overall não existem no schema público — cards mostram dados reais (idade, clube, altura, peso, pé). Swap quando a API admin vier.

## Acceptance criteria
- [ ] `.env.example` com `API_URL=...` documentado
- [ ] `POST /auth/sessions` no login; 401 → "E-mail ou senha inválidos."; 403 do verify → "Este login não tem acesso ao painel admin."
- [ ] Refresh automático em cada request admin (access expirado → usa refresh → atualiza cookies). Falha dupla → limpa cookies + redirect login.
- [ ] `DELETE /auth/sessions` no logout (best-effort) antes de limpar cookies locais.
- [ ] `/admin/login` em split 6-6 (form esquerda, hero direita) — mobile: hero oculto
- [ ] `/admin/atletas` replica padrão ScoutTerminal: header "TALENT POOL", tabs de posição via URL, grid de cards com stats reais
- [ ] `tsc --noEmit` + `next build` limpos

## Files
**Novos**
- `.env.example`
- `app/admin/login/login-hero.tsx` — SVG campo + copy (placeholder fácil de trocar por foto real)
- `app/admin/(authenticated)/atletas/position-filter.tsx` — tabs client, state via URL
- `app/admin/(authenticated)/atletas/athlete-card.tsx` — card ScoutTerminal

**Reescritos**
- `lib/admin/constants.ts` — 2 cookies + SESSION_HEADER
- `lib/admin/types.ts` — AdminUser com userId/role; tipos do guia de integração
- `lib/admin/api.ts` — API_URL via env, fetchAuthed limpo
- `lib/admin/auth.ts` — getSession lê header do middleware (cheap)
- `lib/admin/actions.ts` — loginAction real (sessions + verify), logoutAction real
- `proxy.ts` — verify + refresh + header injection
- `app/admin/login/page.tsx` — split 6-6
- `app/admin/(authenticated)/atletas/page.tsx` — rewrite

**Editado**
- `app/players/[nickname]/page.tsx` — usa `process.env.API_URL`

## Open questions
- Imagem real pro hero do login: você tem uma? Se sim, dropa em `public/images/login-hero.jpg` — já deixei a troca isolada no `LoginHero`.
- Endpoint admin de listagem de atletas com paginação/rating: quando estiver exposto, refatoro o fetch do `/admin/atletas`.

## Status
- 2026-04-20 [in progress] iniciada
- 2026-04-20 [shipped] `next build` limpo. Auth real plugada (POST /auth/sessions + /admin/auth/verify + /auth/refresh no proxy). Login split 6-6 entregue. Atletas ScoutTerminal rodando em cima do `GET /public/athletes`.

## Follow-ups
- Criar `.env.local` com `API_URL=https://futscout-api.onrender.com/api` (arquivo não versionado — .env.example já está na raiz)
- Trocar `GET /public/athletes` pelo endpoint admin quando exposto (`rating`, paginação server, ordenação)
- Dropar foto real em `public/images/login-hero.jpg` e swap no `login-hero.tsx` (bloco comentado no topo do arquivo)
- Lint quebrado (FlatCompat × eslint-config-next@16) continua — task separada
