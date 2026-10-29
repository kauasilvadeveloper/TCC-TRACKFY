# Especificação Técnica: Dashboard (Overview Hub)

- **ID do Documento:** `01-dashboard`
- **Arquivo de Destino da Rota:** `frontend/src/app/dashboard/page.tsx`
- **Branch Associada:** `feat/dashboard`
- **Status:** Aguardando Aprovação
- **Data:** 25/10/2026

---

## 1. Visão Geral e Objetivo

A tela de **Dashboard** do Trackfy atua como a página de entrada principal após a autenticação do usuário. Ela funciona como um **Hub central de visão geral (overview)**, sintetizando o estado dos projetos, fluxos de tarefas em andamento, métricas de desempenho e membros da equipe, guiando o usuário por meio de atalhos e redirecionamentos para as páginas dedicadas de cada projeto ou recurso.

### Princípios do Hub
- **Hub Estático & Vitrine Operacional:** A página consolida a visualização macro da plataforma, servindo de porta de entrada intuitiva. Ao interagir com os cards de projeto, o usuário será direcionado para o ambiente específico daquele projeto (`/projetos/[id]`).
- **Remoção da Seção de Configurações:** Por definição do escopo, a seção de configurações foi removida da tela de Dashboard, mantendo o foco exclusivo em operações, tarefas, métricas e pessoas.
- **Preparação para Ações:** Os botões principais (como `+ Criar novo projeto` e `Ver minhas tarefas`) são apresentados na interface; futuramente o botão disparará um Modal conectando-se ao endpoint `POST /project`. Nesta etapa inicial, os botões permanecem sem ação de envio ativa.
- **Dados Analíticos Mockados:** As métricas de produtividade, taxas de conclusão e gráficos de barras utilizam estruturas mockadas tipadas para garantir fidelidade visual sem dependência de rotas analíticas inexistentes no backend.

---

## 2. Estrutura Visual e Componentização

A interface é construída modularmente em `frontend/src/components/dashboard/`, respeitando a hierarquia semântica do HTML5 e os estilos definidos em `frontend/styles/_variables.scss` e `globals.scss`.

```
src/
└── components/
    └── dashboard/
        ├── DashboardNavbar/
        │   ├── DashboardNavbar.tsx
        │   └── DashboardNavbar.module.scss
        ├── DashboardHero/
        │   ├── DashboardHero.tsx
        │   └── DashboardHero.module.scss
        ├── DashboardShortcuts/
        │   ├── DashboardShortcuts.tsx
        │   └── DashboardShortcuts.module.scss
        ├── DashboardProjects/
        │   ├── DashboardProjects.tsx
        │   ├── DashboardProjects.module.scss
        │   ├── ProjectCard.tsx
        │   └── NewProjectCard.tsx
        ├── DashboardWorkflow/
        │   ├── DashboardWorkflow.tsx
        │   └── DashboardWorkflow.module.scss
        ├── DashboardPerformance/
        │   ├── DashboardPerformance.tsx
        │   └── DashboardPerformance.module.scss
        ├── DashboardMembers/
        │   ├── DashboardMembers.tsx
        │   └── DashboardMembers.module.scss
        └── DashboardCtaBanner/
            ├── DashboardCtaBanner.tsx
            └── DashboardCtaBanner.module.scss
```

---

### 2.1 Barra Superior de Navegação (`DashboardNavbar`)
- **Logo e Badge:** Marca Trackfy com indicador de versão (*Alpha*).
- **Menu Central:** Abas em estilo pill:
  - *Visão Geral* (ativo por padrão)
  - *Projetos*
  - *Tarefas*
  - *Relatórios*
- **Ações da Direita:**
  - Campo de busca global (*"Buscar projeto..."*) com ícone e atalho de teclado visual.
  - **Botão Alternador de Tema (Dark/Light):** Reutilização direta do hook `useTheme()` (`theme`, `toggleTheme`), permitindo alternância instantânea entre modo escuro e claro com feedback visual de ícone (☀️ / 🌙).
  - Botão de notificações com badge de avisos.
  - **Avatar & Perfil do Usuário:** Integrado a `useAuth()`. Exibe nome/foto do usuário autenticado e menu dropdown com dados da conta e botão de encerramento de sessão (`logout()`).

---

### 2.2 Seção Hero (`DashboardHero`)
- **Badge Superior:** Tag `DASHBOARD · PROJETOS · PERFORMANCE`.
- **Tipografia Principal:** 
  - H1: *"O trabalho da sua equipe. Em um só lugar."* com gradiente/destaque em azul royal.
  - Subtítulo com texto descritivo sobre centralização de projetos, tarefas e métricas.
- **Ações Primárias:**
  - Botão com ícone `+ Criar novo projeto` (estilizado como botão de destaque primário).
  - Link/botão secundário `Ver minhas tarefas >`.
- **Badges de Atalhos Rápidos:** Pills com contadores (*Projetos*, *Tarefas*, *Relatórios*, *Equipe*).
- **Preview Widget (Direita):** Card simulando uma janela do sistema com controles de cabeçalho (traffic lights), projeto em destaque (*"Redesign do Portal"*), métricas rápidas (Tarefas concluídas, Em aberto, Membros) e mini gráfico de barras de atividade com legenda.

---

### 2.3 Atalhos Rápidos (`DashboardShortcuts`)
- Grid de 4 cards interativos com ícones customizados:
  1. **Projetos:** *"Acesse seus projetos rapidamente"*
  2. **Tarefas:** *"Gerencie suas tarefas pendentes"*
  3. **Relatórios:** *"Métricas e relatórios de desempenho"*
  4. **Equipe:** *"Pessoas e produtividade da equipe"*
- Efeito hover suave com elevação de borda e transição de sombra.

---

### 2.4 Vitrine de Projetos (`DashboardProjects`)
- **Cabeçalho da Seção:** 
  - Tag `PROJETOS`
  - Título: *"Escolha de onde quer continuar."*
  - Descrição introdutória.
  - Botão secundário `+ Criar novo projeto`.
- **Grid de Projetos Ativos:** Cards estilizados com identidade visual vibrante:
  - Header colorido com barra de identificação (Azul, Roxo, Verde, Laranja).
  - Título do Projeto e status/prazo.
  - Porcentagem de conclusão com badge e barra de progresso horizontal (`<progress>` estilizado ou barra customizada).
  - Avatar stack dos membros vinculados ao projeto.
  - Redirecionamento ao clicar para a rota individual (`/projetos/[id]`).
- **Card de Ação Pontilhado (`NewProjectCard`):** Card com borda tracejada convidando à criação de novos projetos (*"+ Criar novo projeto. Comece agora mesmo"*).

---

### 2.5 Fluxo de Trabalho (`DashboardWorkflow`)
- **Lado Esquerdo (Contexto):**
  - Tag `FLUXO DE TRABALHO`
  - Título: *"Tudo o que precisa ser feito, em um só fluxo."*
  - Texto explicativo sobre acompanhamento ágil.
  - Pills de visualização: *Todas as tarefas*, *Pendentes*, *Finalizadas*.
  - Botão de ação: `Abrir tarefas >` (estilizado, sem navegação ativa por ora).
- **Lado Direito (Widget Kanban):**
  - Card escuro estilizado simulando o quadro da Sprint Atual com badge *"12 ativas"*.
  - Colunas simplificadas exibindo tarefas e status em tempo real com badges categorizados.

---

### 2.6 Visão de Desempenho (`DashboardPerformance`)
- **Lado Esquerdo (Widget Analítico Mockado):**
  - Header com título *"Visão de desempenho"* e indicador de tendência (`+12%`).
  - Grid de 4 KPIs numéricos:
    - *78% Conclusão*
    - *2.4d Tempo médio*
    - *7 Em revisão*
    - *Score 4.8/5*
  - Gráfico de barras estilizado representando o volume de entregas nos períodos semanais.
- **Lado Direito (Contexto):**
  - Tag `VISÃO DE DESEMPENHO`
  - Título: *"Transforme atividade em visão."*
  - Descrição com foco em tomada de decisão.
  - Filtros de intervalo: *7 dias*, *14 dias*, *Este mês*.
  - Botão de ação: `Ver relatórios >`.

---

### 2.7 Membros da Equipe (`DashboardMembers`)
- **Lado Esquerdo (Contexto):**
  - Tag `MEMBROS`
  - Título: *"Pessoas, papéis e contexto no mesmo lugar."*
  - Texto detalhando a gestão de colaboradores e engajamento.
  - Pills de detalhe: *Membros*, *Papéis*, *Atividades*.
  - Botão de ação: `Ver equipe >`.
- **Lado Direito (Widget de Membros):**
  - Card com cabeçalho *"Membros do projeto"* e status *"Online"*.
  - Linhas com colaboradores contendo:
    - Avatar com foto ou iniciais.
    - Nome completo e papel no projeto (ex: *Design Lead*, *Frontend Dev*, *Backend Dev*, *QA Tester*).
    - Indicador visual de presença (bolinha verde para online / cinza para ausente).

---

### 2.8 Seção de Configurações
- **Status:** **EXCLUÍDA** da página de Dashboard de acordo com o direcionamento do usuário.

---

### 2.9 Banner CTA Final (`DashboardCtaBanner`)
- Bloco em card horizontal com gradiente profundo e bordas arredondadas.
- Tag: `PRONTO PARA COMEÇAR?`
- Título: *"Crie um projeto ou volte ao trabalho."*
- Descrição: *"Escolha um projeto existente ou comece uma nova iniciativa para organizar tarefas da sua equipe."*
- Botões: `+ Criar projeto` e `Acessar projetos`.

---

## 3. Mapeamento de Rotas da API Express e Gestão de Estado

| Seção / Recurso | Rota do Backend Express | Método | Estratégia de Consumo |
| :--- | :--- | :--- | :--- |
| **Proteção de Rota & Autenticação** | N/A (Guarda de Rota Client-side) | Client | `useAuth()` valida sessão via cookie `trackfy_token`; se não autenticado, redireciona para `/` |
| **Projetos do Usuário** | `/project` | `GET` | Autenticado via header `Bearer <token>`. Retorna lista de projetos associados ao usuário |
| **Criação de Projeto (Futuro)** | `/project` | `POST` | Payload: `{ tituloProjeto, descricao, prazo }`. Nesta fase: botão estático |
| **Kanban / Tarefas do Projeto** | `/kanban/:projectId` | `GET` | Mock estruturado inicial com modelo alinhado ao Prisma schema |
| **Sprint / Tarefas** | `/sprint/project/:projectId` | `GET` | Mock estruturado de sprints e status |
| **Membros do Projeto** | `/class/:id/users` ou `/project/:id` | `GET` | Mock estruturado com fotos, nomes e funções |
| **Performance e Métricas** | Endpoint Analítico Futuro | `GET` | **100% Mockado** conforme solicitado |

---

### 3.1 Fluxo de Proteção e Autenticação (`useAuth`)
- **Guarda de Acesso:** A página `DashboardPage` (`/dashboard`) implementa verificação ativa de autenticação com o hook `useAuth()`.
- **Redirecionamento Automático:** Caso `isAuthenticated` seja falso ou o token no cookie `trackfy_token` não esteja presente, o usuário é redirecionado imediatamente para a tela de login (`/`) via `router.push('/')`.
- **Estado de Carregamento (Loading State):** Enquanto o estado de autenticação estiver sendo verificado, a página exibe um indicador sutil de carregamento estilizado, impedindo *flash* de conteúdo desprotegido.
- **Identificação do Usuário:** O nome e email providos pelo `user` (`User` de `src/types/auth.ts`) são consumidos para preencher o perfil do usuário na `DashboardNavbar`.
- **Ação de Logout:** O menu do perfil oferece a ação de encerramento de sessão chamando `logout('/')`.

---

### 3.2 Reutilização do Sistema de Temas (Dark / Light Mode)
- **Reutilização Integral:** Não criar nenhum novo contexto nem alterar a lógica de tema. Reutilizar diretamente o hook `useTheme()` disponibilizado por `ThemeContext` (`src/context/ThemeContext.tsx`).
- **Mecanismo Existente:**
  - `ThemeContext` gerencia o atributo `data-theme="dark" | "light"` no elemento raiz `<html>`.
  - Persistência automática em `localStorage` sob a chave `trackfy_theme`.
- **Aderência aos Tokens de Estilo:**
  - Todos os componentes utilizam variáveis CSS declaradas em `globals.scss` e `_variables.scss` (`--bg-primary`, `--bg-surface`, `--bg-input`, `--border-color`, `--text-primary`, `--text-secondary`, `--brand-primary`, etc.).
  - Isso assegura que a tela inteira responda dinamicamente e sem esforço à troca de tema acionada pelo botão da `DashboardNavbar`.

---

### 3.3 Estrutura de Mock (`src/mocks/dashboard.mock.ts`)
Para garantir tipagem TypeScript estrita e fácil substituição futura por chamadas à API, os dados estáticos serão estruturados em contratos de tipos equivalentes aos modelos do banco (`Projeto`, `Tarefa`, `Usuario`, etc.).

---

## 4. Diretrizes de Código e Padrões Arquiteturais

Conforme definido em `.antigravityrules`:
1. **Gerenciador de Pacotes:** `bun` (nunca npm ou yarn).
2. **Framework & Modo:** Next.js (App Router), React, TypeScript strict.
3. **Estilos:**
   - Exclusivamente **SCSS Modules** (`.module.scss`).
   - Uso das variáveis CSS e tokens definidos em `@/styles/_variables.scss` (`--bg-surface`, `--bg-primary`, `--border-color`, `--text-primary`, `--text-secondary`, `--brand-primary`, etc.).
   - Não utilizar Tailwind nem inline styles.
4. **Componentização:**
   - Componentes isolados em `src/components/dashboard/`.
   - Separação de tipos em `src/types/dashboard.ts` se necessário.
5. **Acessibilidade:**
   - Uso de tags semânticas (`<nav>`, `<header>`, `<main>`, `<section>`, `<article>`, `<button>`).
   - Atributos `aria-label` para ícones e botões sem rótulo visível.
   - Suporte completo ao tema Dark / Light por meio das CSS Custom Properties.

---

## 5. Critérios de Aceite para Validação

1. **Aprovação Formal da Spec:** Nenhuma codificação em `.tsx` ou `.scss` será iniciada antes da aprovação explícita desta especificação.
2. **Proteção de Rota Ativa:** Usuários não autenticados são redirecionados automaticamente para `/`.
3. **Reutilização de Dark/Light Mode:** O alternador de tema utiliza o `useTheme` existente e alterna as cores da página instantaneamente.
4. **Fidelidade Visual:** A tela deve reproduzir a hierarquia, contraste, paleta de cores navy/azul escuro, estados hover e disposição dos elementos do Figma.
5. **Ausência da Seção de Configurações:** A seção foi suprimida conforme instrução do usuário.
6. **Sem Alterações no Backend:** O backend Express permanece 100% intacto.
7. **Git Versioning:** As alterações desta etapa são commitadas diretamente na branch `feat/dashboard`.
