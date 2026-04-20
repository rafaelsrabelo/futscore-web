# 2026-04-20 — `/admin/atletas` consumindo BE-07

## Goal
Trocar `GET /public/athletes` pelo novo `GET /api/admin/athletes` (BE-07) com auth, busca, paginação e preparar espaço pra filtros avançados (fase 2).

## Endpoint
```
GET /api/admin/athletes
Authorization: Bearer <accessToken>   # precisa role=ADMIN
```

Query suportada (todas opcionais):
- `q` — busca livre (name/nickname/email)
- `page` (int, default 1) / `pageSize` (int 1-100, default 20)
- `primaryPosition` — GOALKEEPER | DEFENDER | MIDFIELDER | FORWARD
- `gender` — MALE | FEMALE | OTHER
- `dominantFoot` — LEFT | RIGHT
- `minAge` / `maxAge` (0-120)
- `minHeight` / `maxHeight` (float, metros)
- `minWeight` / `maxWeight` (float, kg)
- `hasManager` (boolean)
- `currentClub` (string)

Response:
```json
{
  "items": [
    {
      "id": "...",
      "nickname": "...",
      "profilePhoto": "...",
      "birthDate": "ISO",
      "age": 19,
      "gender": "MALE",
      "primaryPosition": "FORWARD",
      "secondaryPosition": null,
      "dominantFoot": "RIGHT",
      "currentClub": "...",
      "height": 1.78,        // METROS (diferente do /public/athletes que vem em cm)
      "weight": 72,
      "hasManager": false,
      "cpf": "...",
      "createdAt": "ISO",
      "user": { "id", "name", "email", "emailVerified", "isActive", "createdAt", "lastLoginAt" }
    }
  ],
  "page": 1, "pageSize": 20, "total": 187, "hasMore": true
}
```

## Acceptance criteria — Fase 1 (este PR)
- [ ] Página admin consome `/admin/athletes` via `fetchAuthed`
- [ ] Search input com debounce 300ms → `?q=...`; reset de `page` ao buscar
- [ ] Paginação anterior/próxima via URL (`?page=N`), mostra total + página atual
- [ ] Tabs de posição continuam funcionando → `?primaryPosition=...`
- [ ] Card mostra `age` do servidor (sem calcular), `height` convertida pra cm, status (ativo/verificado), email
- [ ] 401/403 da listagem → redireciona login
- [ ] `next build` limpo

## Fase 2 (futuro, não bloqueia)
- Filtros avançados: gender, foot, ranges de idade/altura/peso, hasManager, currentClub — painel colapsável
- Detalhe de atleta (`/admin/atletas/[id]`) quando BE-08 subir

## Fix colateral
- Middleware rotaciona access token no refresh. Server Component do mesmo request ainda lia o cookie antigo → 401 em `fetchAuthed`. Agora propaga o token rotacionado via header `x-admin-access-token` que `fetchAuthed` lê primeiro.

## Files
**Novos**
- `app/admin/(authenticated)/atletas/search-input.tsx` — debounced client
- `app/admin/(authenticated)/atletas/pagination.tsx` — controle prev/next

**Modificados**
- `lib/admin/types.ts` — `AdminAthleteListItem`, `AdminAthletesResponse`
- `lib/admin/constants.ts` — `FRESH_TOKEN_HEADER`
- `lib/admin/api.ts` — fetchAuthed lê token rotacionado do header
- `proxy.ts` — seta header do token quando rotaciona
- `app/admin/(authenticated)/atletas/page.tsx` — fetch authed, URL-driven
- `app/admin/(authenticated)/atletas/athlete-card.tsx` — shape novo

## Status
- 2026-04-20 [in progress]
- 2026-04-20 [shipped] fase 1 completa; `/admin/atletas` consumindo BE-07 com busca, paginação, filtro por posição e cards atualizados. Token-refresh race corrigida via `x-admin-access-token`. Bônus: olho no campo de senha do login.
