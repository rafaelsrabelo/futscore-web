# File Naming

## Regras
- **Arquivos**: kebab-case (`player-stats-card.tsx`, `fetch-authed.ts`)
- **Componentes React**: identificador PascalCase exportado de arquivo kebab-case  
  (`export function PlayerStatsCard()` em `player-stats-card.tsx`)
- **Hooks**: `use-*.ts`, exportando `useAlgo`
- **Tipos / enums**: ficam em `lib/types.ts` como PascalCase. Só fragmentar se um módulo de domínio passar de ~200 linhas de puro tipo
- **Route segments**: lowercase. Dinâmicos: `[param]`. Route groups: `(group)`
- **Arquivos especiais Next**: `page.tsx`, `layout.tsx`, `loading.tsx`, `not-found.tsx`, `error.tsx`, `middleware.ts` — sem renomear

## Colocação
- Componentes/helpers privados de uma rota ficam dentro da pasta do segment, **não** em `components/`
  - Ex.: `app/players/[nickname]/matches-list.tsx` continua lá
- Só promover pra `components/` quando um segundo segment passar a importar
- Componentes compartilhados do admin → `components/admin/` (separado de `components/player/`, `components/ui/`, etc.)

## Não
- Não usar `index.ts` barrel. Import direto do arquivo-fonte
- Não prefixar arquivo com underscore (`_private.ts`) — se é privado, coloque dentro da pasta do consumidor
