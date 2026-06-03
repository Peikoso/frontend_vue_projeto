# Gestão financeira pessoal e CMS de notícias com painel administrativo
Descrição
---
Aplicação frontend construída com Vue 3 e Vite. Fornece interface para autenticação, gestão de finanças (movimentações, orçamento, metas), notícias e painel administrativo.

Principais recursos
---
- Autenticação de usuários
- Painel administrativo para gerenciar categorias, notícias e administradores
- Telas de movimentações, orçamento mensal, gastos e patrimônio
- Gráficos e visualizações com `chart.js`

Requisitos
---
- Node.js 16+ instalado
- Recomendado: `pnpm` (o projeto contém `pnpm-lock.yaml`). Você também pode usar `npm` ou `yarn`.

Instalação
---
No diretório do projeto execute:

```bash
pnpm install
```

Executando em desenvolvimento
---
```bash
pnpm run dev
```

Build para produção
---
```bash
pnpm run build
```

Preview da build
---
```bash
pnpm run preview
```

Scripts (conforme `package.json`)
---
- `dev`: inicia o servidor de desenvolvimento com Vite
- `build`: gera a versão otimizada para produção
- `preview`: serve a build para pré-visualização

Dependências principais
---
- `vue` — framework principal
- `vue-router` — roteamento
- `axios` — requisições HTTP
- `chart.js` — gráficos
- `@fortawesome/fontawesome-free` — ícones

Estrutura do projeto (resumida)
---
- [src](src) — código fonte
- [src/App.vue](src/App.vue) — componente raiz
- [src/main.js](src/main.js) — entrada da aplicação
- [src/components](src/components) — componentes Vue (Admin, Login, Home, Notícias, etc.)
- [public](public) — arquivos estáticos

Boa prática de desenvolvimento
---
- Use `pnpm` para garantir consistência com o `pnpm-lock.yaml`.
- Rode `pnpm run dev` durante desenvolvimento e `pnpm run build` antes de publicar.

