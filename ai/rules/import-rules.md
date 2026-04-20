# Import Rules

## Use sempre o alias `@/`
- `@/components/...`, `@/lib/...`, `@/app/...`
- Sem `../../../` — quebra em refactors de move e é banido em review

## Imports de tipo
- `import type { Athlete } from "@/lib/types"` pra tipos puros
- Misturou runtime + tipo → duas linhas, uma com modificador `type`:
  ```ts
  import { cookies } from "next/headers";
  import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
  ```

## Ordem (deixa o IDE ordenar, mas o alvo é)
1. `react` / `next/*`
2. Pacotes de terceiros
3. `@/` internos
4. Relativos (raros — só arquivos do mesmo segment)
5. Estilos / side-effects no final

## Não
- Sem `index.ts` barrel — re-exports escondem origem e inflam bundle
- Não importar server-only (`next/headers`, `cookies`, `fetchAuthed`) em Client Component. Se um CC precisar de dado com auth, receba via props ou crie um Server Action
- Não importar subpaths de `node_modules` que não estão em `exports` do pacote
- Não importar `server-only` / `client-only` por "garantia" — use o arquivo no grupo correto e deixe o Next avisar quando cruzar fronteira
