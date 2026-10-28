# Especificação Técnica: Painel do Professor (Visão Geral)

- **ID do Documento:** `03-professor-dashboard`
- **Arquivo de Destino da Rota:** `frontend/src/app/professor/page.tsx`
- **Branch Associada:** `feat/professor-dashboard`
- **Status:** Aguardando Aprovação
- **Data:** 27/10/2026

---

## 1. Visão Geral e Objetivo

A tela **Painel do Professor (Visão Geral)** destina-se ao corpo docente do Trackfy para acompanhar a evolução acadêmica e o progresso das entregas dos alunos de suas turmas.

A página atua como uma central de monitoramento onde o professor pode:
- Filtrar dados por turma ativa através de um seletor dinâmico no cabeçalho.
- Analisar indicadores-chave de desempenho (KPIs) da turma: tarefas pendentes, tarefas concluídas, total de alunos e taxa de entrega.
- Visualizar as tarefas recentes com status e taxas de adesão/entrega da turma.
- Disparar ações sem sair da página através de **modais dedicados**: criação de tarefas (`+ Nova tarefa`), visualização expandida de tarefas (`Ver tarefas` / `Abrir lista de tarefas`) e gestão rápida de turmas (`Minhas Turmas`).

---

## 2. Estrutura Visual e Componentização

A interface é construída de maneira modular dentro de `frontend/src/components/professor/`, respeitando a semântica do HTML5 e os design tokens definidos em `frontend/src/app/globals.scss` e `@/src/styles/_variables.scss`.

### 2.1 Visão Hierárquica dos Componentes

```
frontend/src/
├── app/
│   └── professor/
│       ├── page.tsx                       # Rota principal do Painel do Professor
│       └── page.module.scss               # Layout do grid e container principal
└── components/
    └── professor/
        ├── ProfessorNavbar/               # Barra superior com logo, título, badge e tema
        │   ├── ProfessorNavbar.tsx
        │   └── ProfessorNavbar.module.scss
        ├── ProfessorSidebar/              # Menu lateral com perfil do docente e abas
        │   ├── ProfessorSidebar.tsx
        │   └── ProfessorSidebar.module.scss
        ├── ProfessorHeader/               # Boas-vindas, texto explicativo e seletor de turma
        │   ├── ProfessorHeader.tsx
        │   └── ProfessorHeader.module.scss
        ├── ProfessorMetricsGrid/          # Grid com 4 cards de KPIs
        │   ├── ProfessorMetricsGrid.tsx
        │   └── ProfessorMetricsGrid.module.scss
        ├── ProfessorRecentTasks/          # Card de lista de tarefas recentes e paginação
        │   ├── ProfessorRecentTasks.tsx
        │   └── ProfessorRecentTasks.module.scss
        ├── ProfessorClassSummary/         # Card lateral de resumo da turma e ação rápida
        │   ├── ProfessorClassSummary.tsx
        │   └── ProfessorClassSummary.module.scss
        └── modals/                        # Modais integrados na mesma página
            ├── CreateTaskModal/           # Modal para criação de nova tarefa
            │   ├── CreateTaskModal.tsx
            │   └── CreateTaskModal.module.scss
            ├── TaskListModal/             # Modal para listagem detalhada de tarefas
            │   ├── TaskListModal.tsx
            │   └── TaskListModal.module.scss
            └── MyClassesModal/            # Modal de listagem de turmas do professor
                ├── MyClassesModal.tsx
                └── MyClassesModal.module.scss
```

---

## 3. Detalhamento dos Componentes de Tela

### 3.1 Barra Superior (`ProfessorNavbar`)
- **Lado Esquerdo:**
  - Logo do Trackfy com ícone `T` azul e texto *"Trackfy - ÁREA DO PROFESSOR"*.
- **Centro:**
  - Título da página: `Painel do Professor`.
  - Subtítulo: `[Nome do Professor] · Área Acadêmica` (ex.: *Prof. Ana Lima · Área Acadêmica*).
- **Lado Direito:**
  - Badge identificador de papel: `Professor` (fundo verde escuro/translúcido com tipografia verde esmeralda).
  - Botão Primário de Ação: `+ Nova tarefa` (ícone `+` com fundo azul de destaque), acionador do `CreateTaskModal`.
  - Botão Alternador de Tema (Dark/Light): Reutilização de `useTheme()`, permitindo troca de tema sem recarregar a página.

### 3.2 Menu Lateral (`ProfessorSidebar`)
- **Card de Perfil do Professor:**
  - Tag superior em caixa alta: `PROFESSOR`.
  - Nome: `Prof. [Nome]` (obtido via autenticação).
  - Disciplina/Área: `Desenvolvimento Web` (ou cargo escolar retornado pelo perfil).
- **Lista de Navegação (Ações da Página):**
  - **Visão Geral:** Item ativo por padrão com fundo azul realçado e ícone de grid/dashboard.
  - **Tarefas (com Badge):** Exibe ícone de prancheta, rótulo *"Tarefas"* e contagem dinâmica (ex.: `3`). Ao clicar, abre o `TaskListModal`.
  - **Minhas Turmas:** Exibe ícone de turma/usuários e rótulo *"Minhas Turmas"*. Ao clicar, abre o `MyClassesModal`.

### 3.3 Cabeçalho de Contexto e Filtro (`ProfessorHeader`)
- **Etiqueta:** `ÁREA ACADÊMICA` em tom azul/ciano sutil.
- **Título de Boas-vindas:** `Olá, [Primeiro Nome]. Acompanhe suas turmas.`
- **Descrição de Segurança & Diretrizes:** 
  > *"Aqui você visualiza o andamento das tarefas, entregas e atividades das suas turmas. As tarefas podem ter o prazo alterado ou ser excluídas, mas seu conteúdo permanece protegido."*
- **Controles da Direita:**
  - **Dropdown de Seleção de Turma:** Select estilizado listando todas as turmas vinculadas ao professor (`GET /classes`).
  - **Botão `Ver tarefas`:** Botão secundário neutro ao lado do select, acionador do `TaskListModal` com foco na turma selecionada.

### 3.4 Grid de Métricas (`ProfessorMetricsGrid`)
Grid responsivo contendo 4 cards de KPIs calculados com base na turma selecionada:
1. **Tarefas Pendentes:**
   - Ícone: Caixa de seleção/prancheta azulada.
   - Valor: Contador numérico (ex.: `2`).
   - Legenda: `exigem acompanhamento`.
2. **Tarefas Concluídas:**
   - Ícone: Checkmark verde esmeralda.
   - Valor: Contador numérico (ex.: `1`).
   - Legenda: `entregas completas`.
3. **Alunos na Turma:**
   - Ícone: Grupo de pessoas roxo/lilás.
   - Valor: Total de alunos matriculados na turma (ex.: `28`), derivado de `GET /class/:id/users`.
   - Legenda: Turno ou detalhe da turma (ex.: `Manhã`).
4. **Taxa de Entrega:**
   - Ícone: Gráfico de barras âmbar/dourado.
   - Valor: Percentual de conclusão da turma (ex.: `83%`).
   - Legenda: `considerando as tarefas atuais`.

### 3.5 Seção de Tarefas Recentes (`ProfessorRecentTasks`)
- **Header:**
  - Título: `Tarefas recentes`.
  - Subtítulo: `Tudo que o grupo está trabalhando agora`.
  - Link de Ação: `Ver todas →` (aciona o `TaskListModal`).
- **Lista de Itens:**
  - Cada item de tarefa possui:
    - Indicador de status (bolinha verde para *"Em andamento"*, bolinha cinza/azul para *"Concluída"*).
    - Título da Tarefa (ex.: *"Projeto Final — Interface Responsiva"*).
    - Metadados: Data limite formatada (*"Prazo 05 Out 2026"*), proporção de entregas (*"18/28 entregues"*), percentual de adesão (*"64% da turma"*).
    - Badge de Status: *"Em andamento"* (verde) ou *"Concluída"* (azul/cinza).
- **Controles de Paginação/Carrossel:**
  - Indicadores pontilhados no rodapé do card para alternar entre páginas de tarefas recentes.

### 3.6 Resumo da Turma (`ProfessorClassSummary`)
- **Header:**
  - Título: `Resumo da turma`.
  - Subtítulo: `[Nome da Turma] · [Área/Curso]` (ex.: *Turma A · Desenvolvimento Web*).
- **Barra de Progresso:**
  - Rótulo `Entregas` com indicador percentual (ex.: `83%`).
  - Barra de progresso horizontal (`progress bar`) com preenchimento em gradiente azul.
- **Card Interno de Ação Rápida (`Ação rápida`):**
  - Fundo sutilmente escurecido com borda suave.
  - Título: `Ação rápida`.
  - Mensagem em destaque: `Revise as tarefas com prazo próximo.`
  - Link de ação: `Abrir lista de tarefas →` (aciona o `TaskListModal`).

---

## 4. Modais Integrados na Mesma Página

Conforme especificado, nenhuma das ações principais redireciona para páginas externas; todas abrem modais interativos na própria tela:

### 4.1 Modal de Criação de Tarefa (`CreateTaskModal`)
- **Gatilho:** Botão superior `+ Nova tarefa`.
- **Campos do Formulário:**
  - Título da tarefa (`tituloTarefa`) - Input text (obrigatório).
  - Descrição da tarefa (`descricaoTarefa`) - Textarea (opcional).
  - Prazo da tarefa (`prazoTarefa`) - Input date (obrigatório).
  - Stack técnica (`stack`) - Input text ou select (ex.: React, Node, CSS).
  - Turma vinculada - Select preenchido automaticamente com a turma selecionada no header.
  - Status inicial (`status`) - Padrão "Pendente".
- **Ações:**
  - `Cancelar` (fecha o modal).
  - `Criar Tarefa` (dispara chamada para `POST /task` se campos válidos).

### 4.2 Modal de Lista de Tarefas (`TaskListModal`)
- **Gatilhos:**
  - Botão `Ver tarefas` no cabeçalho.
  - Item de menu `Tarefas (3)` na barra lateral.
  - Link `Ver todas →` no bloco de Tarefas Recentes.
  - Link `Abrir lista de tarefas →` no bloco de Ação Rápida.
- **Conteúdo:**
  - Cabeçalho com nome da turma ativa e campo de busca rápida por título da tarefa.
  - Filtro por status (*Todas*, *Em andamento*, *Concluídas*, *Pendentes*).
  - Tabela ou lista de cards com todas as tarefas cadastradas da turma, data de prazo, progresso de entregas e botão de edição rápida de prazo/exclusão (conforme regras do backend `PATCH /task/:id` e `DELETE /task/:id`).

### 4.3 Modal de Minhas Turmas (`MyClassesModal`)
- **Gatilho:** Item de menu `Minhas Turmas` na barra lateral.
- **Conteúdo:**
  - Lista de todas as turmas retornadas por `GET /classes` para o professor logado.
  - Para cada turma: ID da sala, ano de encerramento (`anoEncerramento`), total de membros cadastrados (`_count.usuarios`) e botão para selecionar a turma ativa diretamente.

---

## 5. Mapeamento de Rotas Express: Dados Reais vs Dados Mockados

A regra técnica primordial é **NÃO alterar o backend Express**. Abaixo está a discriminação exata entre o que é consumido da API e quais dados analíticos são mockados com suas justificativas técnicas baseadas no Prisma Schema existente.

| Recurso na Interface | Rota Backend / Fonte | Método | Status de Origem | Justificativa / Formato |
| :--- | :--- | :--- | :--- | :--- |
| **Sessão / Docente** | Cookies / `useAuth()` | Client | **Real (API)** | Nome, email e cargo do professor autenticado via JWT |
| **Turmas do Professor** | `/classes` | `GET` | **Real (API)** | Retorna `[{ id, anoEncerramento, _count: { usuarios } }]` |
| **Alunos da Turma** | `/class/:id/users` | `GET` | **Real (API)** | Retorna lista de usuários vinculados à turma selecionada |
| **Criação de Tarefa** | `/task` | `POST` | **Real (API)** | Dispara cadastro no backend ao submeter o modal |
| **Edição de Tarefa** | `/task/:id` | `PATCH` | **Real (API)** | Permite alterar prazo ou status no modal |
| **Exclusão de Tarefa** | `/task/:id` | `DELETE` | **Real (API)** | Remove tarefa do sistema |
| **Métricas da Turma** (Pendentes, Concluídas, Taxa %) | N/A | Local/Mock | **Mockado** | *Ver Justificativa 1 abaixo* |
| **Taxa de Entrega de Alunos** (ex: "18/28 entregues") | N/A | Local/Mock | **Mockado** | *Ver Justificativa 2 abaixo* |
| **Turno & Nome Fantasia** (ex: "Turma A", "Manhã") | N/A | Local/Mock | **Mockado** | *Ver Justificativa 3 abaixo* |

### Justificativas Técnicas para os Dados Mockados

1. **Ausência de Vínculo Direto entre Turma (`Sala`) e `Projeto` / `Tarefa` no Banco:**
   - No schema do banco (`schema.prisma`), a entidade `Sala` relaciona-se exclusivamente com a pivot `UsuarioSala`. Não existe chave estrangeira ou relacionamento entre `Sala` e `Projeto`, nem entre `Sala` e `Tarefa`.
   - Por este motivo, o backend não possui um endpoint como `GET /class/:id/metrics` ou `GET /class/:id/tasks`. As métricas agregadas (*Tarefas Pendentes*, *Tarefas Concluídas*, *Taxa de Entrega 83%*) serão geradas via mock estruturado em `src/mocks/professorDashboard.mock.ts` mapeado pelo `classId`.
2. **Inexistência de Tabela de Submissões/Entregas Coletivas:**
   - A entidade `Tarefa` no banco possui apenas `status`, `prazoTarefa`, `fkColuna` e `fkSprint`. Não existe um modelo relacional de "Entrega de Tarefa por Aluno" que permita computar quantos alunos de uma turma de 28 pessoas já submeteram a atividade (ex.: *"18/28 entregues"*). Essa informação analítica será provida pelo mock tipado.
3. **Atributos de Apresentação da Turma:**
   - No Prisma, o modelo `Sala` armazena apenas `id: Int` e `anoEncerramento: Int`. Nome fantasia (ex.: *"Turma A - Desenvolvimento Web"*) e turno (*"Manhã"*) serão gerados via camada de formatação/mock no frontend para enriquecer a experiência visual apresentada no Figma.

---

## 6. Estados de Interface (UI States)

### 6.1 Estado de Filtro Dinâmico por Turma
- A página mantém um estado local `selectedClassId: number`.
- Ao carregar a lista de turmas via `GET /classes`, a primeira turma é selecionada automaticamente como padrão.
- Ao alternar a turma no `<select>`:
  1. O estado `selectedClassId` é atualizado.
  2. Dispara nova consulta a `GET /class/:selectedClassId/users` para obter os alunos reais daquela turma específica.
  3. Atualiza os contadores, o resumo e a lista de tarefas para refletir o contexto da turma escolhida.

### 6.2 Estados Vazios (Empty States)
A interface deve cobrir com clareza três cenários de vazio:
1. **Sem Turmas Cadastradas:**
   - Caso `GET /classes` retorne uma lista vazia (`classes.length === 0`).
   - **Exibição:** Card central com ícone ilustrativo de turma vazia e mensagem:
     > *"Nenhuma turma encontrada. Você ainda não foi alocado em nenhuma turma ativa. Entre em contato com a coordenação acadêmica."*
2. **Turma Selecionada sem Alunos:**
   - Caso `GET /class/:id/users` retorne array vazio.
   - **Exibição:** Card de métrica "Alunos na Turma" exibe `0` e um badge de alerta informando: *"Nenhum aluno matriculado nesta turma até o momento."*
3. **Turma Selecionada sem Tarefas:**
   - Caso a turma selecionada não possua tarefas cadastradas.
   - **Exibição:** Na seção de "Tarefas recentes", exibe container com bordas sutis, ícone de prancheta vazia e o texto:
     > *"Nenhum dado cadastrado ainda para esta turma. Comece criando a primeira tarefa para acompanhar o andamento dos alunos."*
     - Botão em destaque no próprio estado vazio: `+ Criar primeira tarefa`.

### 6.3 Estado de Carregamento (Skeleton Loading)
- Enquanto as consultas da API estiverem em andamento (`loading === true`):
  - No seletor de turma: Skeleton retangular pulsante.
  - Nos 4 cards de KPIs: Skeletons retangulares simulando os números e legendas.
  - Na lista de tarefas recentes: 3 linhas esqueléticas simulando os blocos de tarefas.
  - No resumo da turma: Skeleton circular/barra pulsante.

### 6.4 Estado de Erro (Error State)
- Caso haja falha nas requisições HTTP (`401`, `500` ou falha de conexão com a API):
  - Exibição de um banner discreto no topo com o erro retornado.
  - Botão `Tentar novamente` que reexecuta o ciclo de busca de dados sem exigir recarregamento total da página.

---

## 7. Diretrizes de Código e Padrões Arquiteturais

1. **Package Manager:** `bun` estritamente (nunca `npm` ou `yarn`).
2. **Framework & Modo:** Next.js (App Router), React, TypeScript strict mode sem uso de `any` descuidado.
3. **Estilos:**
   - Exclusivamente **SCSS Modules** (`.module.scss`).
   - Importar rigorosamente os design tokens de `@src/styles/_variables.scss` (`$bg-primary`, `$bg-surface`, `$border-color`, `$text-primary`, etc.) e variáveis globais.
   - Proibido uso de Tailwind ou estilos inline.
4. **Gerenciamento de Ícones:**
   - Utilizar biblioteca padrão já presente no projeto: `react-icons/fi` ou ícones SVG semânticos equivalentes.
5. **Autenticação & Sessão:**
   - Respeitar o padrão já adotado no projeto (`cookies` / `localStorage` para leitura do token e headers `Authorization: Bearer <token>`).
6. **Backend Intacto:** Nenhuma alteração de código ou schema no diretório `backend/`.

---

## 8. Critérios de Aceite para Validação

- [ ] **Aprovação da Spec:** Nenhuma linha de `.tsx` ou `.scss` será criada antes da aprovação explícita desta especificação pelo usuário.
- [ ] **Modais Integrados:** Os botões `+ Nova tarefa`, `Ver tarefas` e `Minhas Turmas` abrem modais interativos na própria página, sem redirecionamentos externos indesejados.
- [ ] **Filtro de Turma Dinâmico:** A alternância no select de turmas atualiza os dados da tela conforme a turma especificada.
- [ ] **Tratamento de Dados Reais e Mocks:** Integração efetiva com `GET /classes` e `GET /class/:id/users`, com mocks tipados para as métricas analíticas não suportadas pelo banco.
- [ ] **Empty States Claros:** Mensagens explícitas de dados vazios para ausência de turmas, alunos ou tarefas.
- [ ] **Fidelidade Visual ao Figma:** Cores, tipografia, contraste do tema escuro, bordas arredondadas e badges idênticos ao layout fornecido.
- [ ] **Versionamento Git:** Modificações commitadas na branch `feat/professor-dashboard`.
