# Plano — Redesenho da página do atleta inspirado no oGol

Status: **decisões tomadas, pronto para implementação** (ver seção 7)

## 1. Objetivo

Reformular `app/players/[nickname]/page.tsx` (perfil público do atleta) inspirando-se no layout do
[oGol](https://www.ogol.com.br/jogador/dudinha/597338), mantendo a identidade visual atual do
FutScore (dark mode forçado, verde `--primary: #06BB6D`, componentes shadcn `new-york`).

## 2. Layout de referência (oGol)

Estrutura observada na página do jogador no oGol:

- **Banner/header**: nome, número de camisa, idade, posição, categoria (ex.: Feminino), esporte
- **Foto + dados pessoais**: nome completo, data de nascimento, naturalidade, nacionalidade, pé
  dominante, status ("Em atividade")
- **Abas horizontais**: Página Inicial, Notícias, Jogos Realizados, Temporada a Temporada,
  Histórico de Competições, etc.
- **Clube atual**: logo + nome em destaque
- **Tabela temporada a temporada**: ano, clube, jogos (J), gols (G), assistências (ASS)
- **Jogos recentes**: adversário, placar, data, competição
- **Títulos**: lista colapsável de conquistas
- **Extras**: companheiros de equipe, "monte a escalação", fotos por temporada, histórico de
  transferências

## 3. Auditoria de dados — o que a API do FutScore entrega hoje

Fonte: `GET /public/athletes/:id` (via `AthleteDetailResponse` em `lib/types.ts`).

| Seção do oGol | Temos hoje? | Campo/fonte no FutScore |
|---|---|---|
| Nome, idade, posição | ✅ | `athlete.user.name`, `birthDate` (calculamos idade), `primaryPosition`/`secondaryPosition` |
| Foto | ✅ | `athlete.profilePhoto` |
| Data de nascimento, naturalidade | ⚠️ parcial | `birthDate` existe; naturalidade não — só temos `address` (endereço atual, não local de nascimento) |
| Nacionalidade | ❌ | não existe campo no `Athlete` |
| Pé dominante | ✅ | `dominantFoot` |
| Status "em atividade" | ❌ | não existe (sem conceito de contrato/vínculo ativo) |
| Número da camisa | ❌ | não existe em `Athlete` |
| Categoria (sexo/base) | ✅ | `gender`, e `Match.category` (U5..PROFISSIONAL) por partida |
| Clube atual | ✅ | `athlete.currentClub` (string livre, sem logo/id de time) |
| Tabela temporada a temporada (J/G/A) | ⚠️ parcial, requer cálculo | `finishedMatches: MatchGroup[]` já vem **agrupado por competição**, cada `Match` tem `date`, `result`, `myTeamScore`, `adversaryScore`, `performanceRating`, `category`, `modality`; **não há gols/assistências por partida diretamente** — teríamos que inferir contando `videoFeed` do tipo `GOAL`/`ASSIST` e cruzar com `video.match` |
| Jogos recentes/realizados | ✅ | `finishedMatches` → `matches[]` (adversário, placar, data, local, competição, resultado) |
| Títulos | ❌ | não existe |
| Companheiros de equipe | ❌ | não existe (times não têm elenco exposto publicamente) |
| Histórico de transferências | ❌ | não existe |
| Fotos por temporada | ❌ | só há `profilePhoto` (uma foto) |
| Valor de mercado / gráfico | ❌ | não existe (não faz sentido no domínio de base/amador) |

Dados que a API **tem** e o oGol **não usa** (diferenciais do FutScore a preservar/destacar):
- `biography` (texto livre "Sobre")
- Redes sociais: `instagramUrl`, `twitterUrl`, `youtubeUrl`
- Físico: `height`, `weight`
- Empresário/representação: `managerName`, `managerCompany`, `managerContact`, `hasManager`
- Comissão técnica pessoal: `hasNutritionist`, `hasPsychologist`, `hasPersonalTrainer`
- `favorites` / `isFavorite` (engajamento), `isPremium` (selo)
- `videoFeed: VideoPlay[]` — vídeos de lances classificados por tipo (`GOAL`, `ASSIST`,
  `DIFFICULT_SAVE`, etc.) e por eixo (`PHYSICAL`/`TACTICAL`/`TECHNICAL`/`MENTAL`) — isso é o
  equivalente "highlight reel" que o oGol não tem
- `performanceRating` por partida (nota de desempenho) — também sem equivalente no oGol

## 4. Lacunas (não dá pra replicar 1:1 sem mudança de API)

Sem inventar contrato novo (regra do projeto em `ai/rules/ai-behavior.md`), os seguintes blocos do
oGol **ficam de fora** desta iteração, a menos que o usuário confirme que o backend vai expor:
1. Número da camisa
2. Naturalidade / nacionalidade
3. Gols e assistências por partida/temporada como número oficial (só dá pra **estimar** via
   contagem de `videoFeed` do tipo GOAL/ASSIST, com aviso de que é "baseado em vídeos cadastrados")
4. Títulos, elenco/companheiros, transferências, valor de mercado, múltiplas fotos por temporada

## 5. Proposta de estrutura da nova página (mantendo paleta atual)

Layout de **2 colunas a partir de `lg`** (empilha em 1 coluna abaixo disso, mobile-first):

**Coluna esquerda (sidebar, ~1/3, sticky em `lg`)**
1. Foto grande, nome, `@nickname`, badges (premium, favoritos)
2. Dados pessoais: idade, altura, peso, pé dominante, posição(ões), clube atual
3. Redes sociais (`instagramUrl`, `twitterUrl`, `youtubeUrl`)
4. Empresário/representação (`managerName`, `managerCompany`, `managerContact`) e comissão técnica
   pessoal (`hasNutritionist`, `hasPsychologist`, `hasPersonalTrainer`) — só renderiza se houver
   dado

**Coluna direita (~2/3, área principal com `Tabs` shadcn)**
1. **Sobre** (bio) — sempre visível acima das abas
2. Aba **Visão Geral**: campo com posição (`PlayerFieldPosition`) + estatísticas V/E/D
   (`PlayerStatsCard`)
3. Aba **Partidas**: `finishedMatches: MatchGroup[]` renderizado como tabela/lista **agrupada por
   competição** (usa o agrupamento que a API já entrega, sem inferir ano/temporada) — jogos,
   resultado, placar, nota de desempenho por grupo
4. Aba **Vídeos**: grid atual de `videoFeed`, com um resumo estatístico no topo contando gols e
   assistências **estimados** a partir de `type === "GOAL" | "ASSIST"`, com legenda explícita tipo
   "estimativa baseada em vídeos cadastrados" (não é estatística oficial)

## 6. Componentes impactados

- `app/players/[nickname]/page.tsx` — reestruturar em grid 2 colunas + `Tabs`
- `app/players/[nickname]/matches-list.tsx` — trocar `flatMap` por agrupamento real usando
  `MatchGroup[]` (uma seção por `group.competition`)
- `components/matches/match-list-item.tsx` — ajustar se o agrupamento mudar o formato
- `components/player/player-stats-card.tsx`, `player-field-position.tsx` — reaproveitar sem
  mudanças estruturais
- Novo componente `components/player/player-social-links.tsx` (redes sociais)
- Novo componente `components/player/player-sidebar.tsx` (agrega dados pessoais + empresário +
  comissão técnica na coluna esquerda)
- Novo componente `components/player/player-video-stats.tsx` (resumo gols/assistências estimados)
- Instalar `npx shadcn@latest add tabs` (componente ainda não existe no projeto)

## 7. Decisões (validadas com o usuário em 2026-08-02)

1. **Gols/assistências estimados**: mostrar, com legenda deixando claro que é estimativa baseada
   em vídeos cadastrados (não estatística oficial).
2. **Navegação**: usar `Tabs` do shadcn (mais fiel ao oGol) — requer `npx shadcn@latest add tabs`.
3. **Agrupamento de partidas**: por competição (`MatchGroup.competition`, já pronto na API) — sem
   inferir ano/temporada a partir de `date`.
4. **Naturalidade / nacionalidade / número de camisa**: fora desta entrega. Anotado como pedido
   futuro pro backend (seção 8) — não bloqueia esta implementação.
5. **Layout**: 2 colunas a partir de `lg` (sidebar fixa à esquerda + conteúdo com abas à direita),
   1 coluna abaixo disso.

## 8. Fora de escopo (confirmado)

- Valor de mercado, gráfico de evolução, transferências, elenco/companheiros, títulos — sem dado
  de origem, não inventar.
- Naturalidade, nacionalidade e número de camisa — **pedido futuro pro backend**, não implementar
  agora nem simular no front.
