# Especificação Técnica: Dashboard Context API & Integração de Dados

- **ID do Documento:** `02-dashboard-context`
- **Arquivos Afetados:**
  - `frontend/src/types/project.ts` (Tipagem da API)
  - `frontend/src/services/projectService.ts` (Client HTTP Axios)
  - `frontend/src/context/DashboardContext.tsx` (Context API & Hook)
  - `frontend/src/app/dashboard/page.tsx` (Injeção do Provider)
  - `frontend/src/components/dashboard/DashboardProjects/DashboardProjects.tsx` (Consumo reativo)
  - `frontend/src/components/dashboard/DashboardHero/DashboardHero.tsx` (Consumo de contadores)
- **Branch Associada:** `feat/dashboard`
- **Status:** Aguardando Aprovação
- **Data:** 25/10/2026

---

## 1. Visão Geral e Justificativa

Atualmente, a tela de Dashboard exibe dados 100% fixados a partir de `src/mocks/dashboard.mock.ts`. Para conectar o frontend ao banco de dados PostgreSQL via API Express sem quebrar a experiência visual do usuário, criaremos uma **Camada de Estado Global via Context API** (`DashboardContext`).

### Objetivos Principais:
1. **Consumir Dados Reais:** Buscar projetos do usuário autenticado via rota `GET /project`.
2. **Camada Híbrida Inteligente:** Mapear os dados reais da API para a interface visual e aplicar fallbacks graciosos (mocks) para dados analíticos ou propriedades não existentes no backend.
3. **Eliminar Prop Drilling:** Disponibilizar os dados de projetos, contadores de estatísticas, estados de carregamento e funções de refetch para qualquer componente descendente por meio do hook `useDashboard()`.
4. **Tratamento de Estados de UI:** Implementar tratamento explícito para:
   - **Loading State:** Skeletons visuais sutis enquanto a API responde.
   - **Error State:** Alerta amigável com opção de nova tentativa (*retry*).
   - **Empty State:** Visualização orientada à ação quando o usuário não tiver projetos cadastrados no banco.

---

## 2. Diagnóstico de Dados: API Express vs. Interface Figma

Abaixo está o levantamento detalhado de quais informações **existem na API** e quais **NÃO existem na API** e serão supridas por derivação ou mocks estruturados:

| Dado na Interface | Presente na API Express (`GET /project`)? | Como será tratado no Frontend |
| :--- | :---: | :--- |
| **ID do Projeto (`id`)** | **SIM** | Direto do banco (`projeto.id`). |
| **Título do Projeto (`tituloProjeto`)** | **SIM** | Direto do banco (`projeto.tituloProjeto`). |
| **Descrição do Projeto (`descricao`)** | **SIM** | Direto do banco (`projeto.descricao`). |
| **Prazo (`prazo`)** | **SIM** | Formatado para data amigável (ex: `Intl.DateTimeFormat` -> "15 de Outubro"). |
| **Membros do Projeto (`membros`)** | **SIM** | Mapeado da relação pivô `projeto.usuarios` (`nome`, `id` e cálculo de iniciais). |
| **Cor de Destaque do Card (`corDestaque`)** | ❌ **NÃO** | Atribuído deterministicamente por índice cíclico (`blue`, `purple`, `green`, `orange`). |
| **Status do Projeto (`status`)** | ❌ **NÃO** | Derivado pelo prazo (ex: "Em andamento", "Prazo próximo") ou fallback padrão. |
| **Progresso / % Conclusão (`progresso`)** | ❌ **NÃO** | Derivado de cálculo futuro de tarefas ou percentual atribuído de fallback (ex: 50% ou mock). |
| **Sprint Atual (`sprintAtual`)** | ❌ **NÃO** | A API possui tabela `Sprint`, mas não aninhada em `GET /project`. Usará texto informativo padrão (ex: "Sprint 01: Planejamento"). |
| **Contador de Projetos Ativos (Hero)** | **SIM** | `projetos.length` calculado em tempo real a partir da lista retornada pelo banco. |
| **Tarefas Pendentes / Relatórios (Hero)** | ❌ **NÃO** | Não há rota analítica global agregadora; mantido mock numérico. |
| **Quadro Kanban / Fluxo de Trabalho** | ❌ **NÃO (Global)** | O backend possui `GET /kanban/:projectId`, mas a dashboard exibe uma vitrine consolidada. Mantido mock estruturado. |
| **Métricas de Performance & Gráfico** | ❌ **NÃO** | Não há endpoint de tempo médio, % conclusão agregada ou score. Mantido 100% mockado. |
| **Status Online/Ausente dos Membros** | ❌ **NÃO** | O banco armazena apenas vínculos de cargo/escola; presença em tempo real não existe no backend. |

---

## 3. Arquitetura da Solução

### 3.1 Serviço de Projetos (`frontend/src/services/projectService.ts`)
Cliente HTTP que utiliza a instância do Axios existente (`src/services/api.ts`):
```typescript
export interface ApiProjetoUsuario {
  usuario: {
    id: number;
    nome: string;
    email: string;
  };
  funcaoProjeto: {
    id: number;
    tituloFuncaoProjeto: string;
  };
}

export interface ApiProjeto {
  id: number;
  tituloProjeto: string;
  descricao: string;
  prazo: string;
  tokenGithub: string | null;
  usuarios: ApiProjetoUsuario[];
}

export const projectService = {
  async getProjects(): Promise<ApiProjeto[]> {
    const response = await api.get<ApiProjeto[]>("/project");
    return response.data;
  },
};
```

---

### 3.2 Contexto do Dashboard (`frontend/src/context/DashboardContext.tsx`)
O contexto encapsula a busca na API e expõe:
- `projects: DashboardProject[]`: Lista normalizada para a interface visual.
- `isLoading: boolean`: Indicador de carregamento.
- `error: string | null`: Mensagem de erro caso a requisição falhe.
- `refetchProjects: () => Promise<void>`: Permite recarregar os dados após mutações (criação de projetos).
- `heroStats: DashboardHeroStat[]`: Contadores atualizados dinamicamente (ex: projetos ativos baseado na API).

#### Estratégia de Fallback:
- Se a API retornar projetos reais, a interface renderiza os projetos do banco.
- Se o usuário não possuir projetos (array vazio), a interface renderiza um **Empty State** elegante com botão para criar o primeiro projeto.
- Em caso de indisponibilidade da API, exibe estado de erro amigável com botão de tentar novamente, sem quebrar a renderização.

---

### 3.3 Tratamento de Estados Visuais de UI

1. **Estado de Carregamento (Skeleton):**
   - Na vitrine de projetos, cards esqueleto pulsantes com shimmer sutil nos mesmos formatos dos cards finais, respeitando o tema ativo (Dark/Light).
2. **Estado Vazio (Empty State):**
   - Card central convidativo: *"Nenhum projeto encontrado"*, informando que o usuário pode iniciar uma nova iniciativa com o botão `+ Criar novo projeto`.
3. **Estado de Erro (Error State):**
   - Alerta discreto com mensagem de aviso e botão *"Tentar novamente"*, sem desmontar a Navbar ou o Hero.

---

## 4. Padrões de Código e Diretrizes

Conforme `.antigravityrules`:
- **Package Manager:** Bun (`bun run dev`).
- **Commits:** Estritamente em **inglês**.
- **Sem alterações no Backend:** O backend Express e o schema Prisma permanecem intactos.
- **Estilização:** SCSS Modules (`.module.scss`) utilizando as variáveis de `globals.scss` e `_variables.scss`.
- **Acessibilidade:** Regiões de loading com `role="status"` e `aria-busy="true"`.

---

## 5. Critérios de Aceite para Validação

1. **Aprovação Formal da Spec:** Nenhum código `.ts` ou `.tsx` será alterado antes da revisão e aprovação desta spec.
2. **Integração Real com `GET /project`:** O contexto deve disparar a chamada à API Express com token JWT presente no header.
3. **Mapeamento Transparente:** Os projetos reais devem ser renderizados nos componentes com nomes, descrições, prazos e membros do banco.
4. **Isolamento de Erros:** Falhas de rede não quebram a Dashboard; um estado de retry é fornecido.
5. **Git Versioning:** Commits em inglês realizados na branch `feat/dashboard`.
