# FutScore Web

Plataforma web do FutScore para visualização de perfis de jogadores e olheiros.

## 🚀 Tecnologias

- **Next.js 15** com App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** - Componentes UI
- **Lucide React** - Ícones

## 📁 Estrutura do Projeto

```
/app
  /players
    /[nickname]       # Página de detalhes do jogador
      page.tsx
      not-found.tsx
    page.tsx          # Listagem de jogadores
    search-filters.tsx # Componente de busca (client-side)
  page.tsx            # Página inicial
  layout.tsx
  globals.css

/components/ui        # Componentes shadcn
  button.tsx
  card.tsx
  input.tsx
  select.tsx
  avatar.tsx
  badge.tsx

/lib
  types.ts           # Tipos TypeScript da API
  utils.ts           # Utilitários
```

## 🎨 Páginas

### Página Inicial (`/`)
- Hero section com grid 6-6
- Apresentação da plataforma
- CTAs para baixar o aplicativo
- Recursos principais

### Listagem de Jogadores (`/players`)
- Grid de cards com todos os jogadores
- Busca por nome (client-side)
- Filtro por posição
- Cache de 60 segundos
- Paginação automática

### Perfil do Jogador (`/players/[nickname]`)
- Informações completas do jogador
- Estatísticas de partidas
- Feed de vídeos
- Biografia e detalhes

## 🔌 API

Base URL: `https://futscout-api.onrender.com/api`

### Endpoints Usados

- `GET /public/athletes` - Lista todos os atletas
- `GET /public/athletes/:id` - Detalhes de um atleta específico

### Parâmetros de Query

- `search` - Busca por nome
- `position` - Filtro por posição (GOALKEEPER, DEFENDER, MIDFIELDER, FORWARD)

## 🎨 Tema

A aplicação usa tema **escuro por padrão** com a paleta de cores do shadcn configurada.

Cor primária: Verde (definida no `globals.css`)

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar produção
npm start
```

## 📱 Funcionalidades Mobile

- Design 100% responsivo
- Touch-friendly
- Otimizado para iOS e Android

## 🔄 Cache e Performance

- Server Components para melhor performance
- Revalidação de cache a cada 60 segundos
- Imagens otimizadas com Next.js Image
- Lazy loading automático

## 🎯 Próximos Passos

- [ ] Adicionar paginação na listagem
- [ ] Implementar player de vídeo in-app
- [ ] Adicionar página de estatísticas avançadas
- [ ] Implementar sistema de favoritos (requer autenticação)
- [ ] Adicionar filtros avançados (idade, clube, etc)
- [ ] Implementar gráficos de evolução

## 📄 Licença

© 2025 FutScore. Todos os direitos reservados.
