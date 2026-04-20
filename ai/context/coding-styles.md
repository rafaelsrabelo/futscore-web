# Coding Styles

## TypeScript
- `strict: true`. Sem `any` — prefira `unknown` + narrowing ou o operador `satisfies`
- Imports de tipo: `import type { ... }` (ou modificador `type` quando misturado)
- Tipos de domínio ficam em `lib/types.ts`. Não redeclare enums que já existem lá

## React 19 + Next 16 App Router
- **Padrão é Server Component.** Só adicione `"use client"` quando precisar de state, effects, browser APIs ou handlers
- Dados em Server Component: `await fetch(...)` com `{ next: { revalidate: N } }` pra leituras cacheáveis. Sem libs de cliente HTTP
- Em Next 16, `params` e `searchParams` são `Promise` — sempre `await`
- Mantenha "client islands" pequenos e colocados dentro da pasta do route segment

## Tailwind CSS v4
- Tema em `app/globals.css` via `@theme`. **Não** criar `tailwind.config.ts`
- Gradientes do projeto usam o padrão `bg-linear-to-br from-primary/… to-transparent` — siga ao adicionar blocos parecidos
- Use `cn()` de `@/lib/utils` pra compor classes condicionais

## shadcn/ui
- Style `new-york`, base `neutral`. Adicione componentes com `npx shadcn@latest add <name>` — nunca copie manual
- Estenda primitivas por composição, sem editar o source em `components/ui/*`

## Icons
- Apenas `lucide-react`. Import nomeado: `import { Activity } from "lucide-react"`

## Copy
- Todas as strings visíveis ao usuário em **pt-BR**
- No admin, prefira termos consistentes já usados na landing ("atletas", não "jogadores", quando o contexto for interno)
