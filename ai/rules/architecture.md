# Architecture Rules

## Route groups
- `app/(public)/...` — landing, perfis, páginas estáticas (sem auth)
- `app/(admin)/...` — admin, protegido por middleware
Ambos compartilham `app/layout.tsx` no topo. Cada grupo tem seu próprio `layout.tsx` aninhado:
- Público: `<Header/>` + conteúdo
- Admin: `<AppSidebar/>` (shadcn `sidebar-07`) + conteúdo

## Fluxo de dados
1. **Server Component** chama `fetch` contra o backend, com `revalidate` (leitura pública) ou header `Authorization` (admin)
2. Passa props serializáveis pra **Client Components** interativos (filtros, diálogos, forms)
3. Mutations → Server Actions, ou chamadas client-side diretas ao backend. **Não** criar `app/api/*` de proxy, a menos que um secret precise ficar no servidor

## Auth (admin)
- Login: POST pro backend → token retornado gravado em **cookie httpOnly** por Server Action / Route Handler
- `middleware.ts` inspeciona o cookie em todo request `(admin)` e redireciona pra `/admin/login` se ausente/expirado
- Helper `fetchAuthed()` em `lib/api.ts` lê o cookie via `cookies()` e anexa `Authorization: Bearer <token>` às requisições

## Estado
- Server state: Server Components + `revalidate`. Sem TanStack Query até haver necessidade real (listas com mutação otimista)
- Client state: `useState` / `useReducer`. Sem Zustand / Redux
- Forms: `<form action={serverAction}>` quando possível; React Hook Form + Zod apenas se o form crescer

## O que NÃO adicionar sem aprovação
- tRPC, GraphQL, Prisma ou qualquer DB local
- Backend extra dentro deste repo
- Projeto Vite/SPA separado pro admin
- BFF / camadas intermediárias de API
