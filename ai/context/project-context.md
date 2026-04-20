# FutScore Web — Project Context

## O que é
Web app do **FutScore**, plataforma de jogadores e olheiros de futebol. Hoje serve:
- Landing + CTAs pra App Store / Play Store (`/`)
- Páginas públicas de perfil pra compartilhamento (`/players/[nickname]`)
- Páginas estáticas exigidas pelas lojas (`/privacy-policy`, `/delete-account`)

UI em **pt-BR**. Tema dark forçado no `<html className="dark">`.

## O que está sendo adicionado
Área admin sob `app/(admin)/`:
- Login em `/admin/login`
- Itens da sidebar: Dashboard, Atletas, Olheiros, Acessos, Notificações, Configurações
- `AppSidebar` via bloco shadcn `sidebar-07`
- Rotas protegidas por `middleware.ts` validando token da API

## Backend
API externa: `https://futscout-api.onrender.com/api`. Endpoints públicos atuais:
- `GET /public/athletes` (aceita `search`, `nickname`, `position`)
- `GET /public/athletes/:id`

Endpoints admin (auth, atletas CRUD, olheiros, notificações etc.) serão consumidos conforme a API expuser — nunca inventar rota.

## Deploy
A confirmar (provável Vercel). Não presumir variáveis de ambiente sem perguntar.

## Princípios de produto
- Admin é para operadores internos, não é uma área self-service — UX pode ser densa, orientada a tabela
- Público é o oposto: landing polida, muito espaço em branco, mobile-first
