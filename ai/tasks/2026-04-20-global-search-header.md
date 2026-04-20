# 2026-04-20 — Busca global no header admin (BE-21)

## Goal
Adicionar um campo de busca global no topbar do admin que consulta
`GET /api/admin/search` (BE-21) e mostra resultados agrupados em **Atletas** e
**Partidas**. Abre via clique ou atalho **⌘K / Ctrl+K**.

## Backend
BE-21 ainda **pendente** (`[ ]` na lista de tasks do backend). Spec conhecida:

```
GET /api/admin/search?q=<term>&limit=5
Authorization: Bearer <accessToken>

200 {
  "athletes": [
    { "id", "name", "slug", "photoUrl", "position", "currentClub" }
  ],
  "matches": [
    { "id", "date", "adversaryTeam", "myTeamScore", "adversaryScore",
      "athlete": { "id", "name", "photoUrl" } }
  ]
}

400 se q < 2 chars
401/403 herdado de verifyJwt + verifyAdmin
```

## Design
- **Trigger no topbar**: pill "Buscar atletas ou partidas... ⌘K" (desktop) / ícone (mobile)
- **Dialog** (shadcn dialog): input no topo, lista rolável abaixo
- **Debounce 300ms** — fetch client contra `/admin/api/search?q=...` (route handler local)
- **Route handler** (server-side) lê cookie + chama BE-21 via `fetchAuthed`. Não
  expõe o access token pro browser.
- **Resultados agrupados**: seção "Atletas" (click → `/players/[slug|id]`) e
  "Partidas" (click → placeholder `/admin/partidas/[id]`, disabled até BE-11)
- **Estados**: vazio (`q < 2`), loading, erro com status HTTP, sem resultados
- **Navegação com teclado**: ⌘K abre; Esc fecha (do Dialog). Seta/Enter fica pra
  uma iteração futura (cmdk)

## Acceptance criteria
- [ ] Trigger visível no topbar admin (desktop + mobile com degradação)
- [ ] Atalho ⌘K / Ctrl+K abre o dialog
- [ ] Input debounce 300ms → `GET /admin/api/search?q=...`
- [ ] Route handler local protege o token e proxya pro backend
- [ ] Resultados renderizados agrupados; clicar em atleta navega pro perfil público
- [ ] 404 do backend (BE-21 não deployado) mostra erro claro, sem tela branca
- [ ] `next build` limpo

## Files
**Novos**
- `app/admin/api/search/route.ts` — proxy local
- `components/admin/global-search.tsx` — dialog + trigger
- `lib/admin/types.ts` (extender) — `GlobalSearchAthlete`, `GlobalSearchMatch`, `GlobalSearchResponse`

**Modificado**
- `app/admin/(authenticated)/layout.tsx` — encaixa o `<GlobalSearch />` no topbar

## Fora de escopo
- Navegação com seta/enter entre resultados (depende de `cmdk`)
- Destaque de termo no resultado
- Histórico de buscas recentes
- Detalhe de partidas (depende de BE-11)

## Status
- 2026-04-20 [in progress]
- 2026-04-20 [shipped] UI completa, route handler `/admin/api/search` proxyando BE-21. Enquanto o backend responder 404, o dialog mostra "Busca indisponível / Endpoint de busca ainda não deployado (HTTP 404)". Quando BE-21 subir, zero mudança no frontend.
