// src/mocks/dashboard.mock.ts

import {
  DashboardProject,
  DashboardMember,
  DashboardWorkflowColumn,
  DashboardPerformanceMetric,
  DashboardChartPoint,
  DashboardShortcut,
  DashboardHeroStat,
} from "@/src/types/dashboard";

export const mockHeroStats: DashboardHeroStat[] = [
  { rotulo: "Projetos Ativos", valor: 4, icone: "folder" },
  { rotulo: "Tarefas Pendentes", valor: 28, icone: "check" },
  { rotulo: "Relatórios Gerados", valor: 14, icone: "chart" },
  { rotulo: "Membros na Equipe", valor: 8, icone: "users" },
];

export const mockShortcuts: DashboardShortcut[] = [
  {
    id: "projetos",
    titulo: "Projetos",
    descricao: "Acesse seus projetos rapidamente",
    icone: "folder",
  },
  {
    id: "tarefas",
    titulo: "Tarefas",
    descricao: "Gerencie suas tarefas pendentes",
    icone: "check",
  },
  {
    id: "relatorios",
    titulo: "Relatórios",
    descricao: "Métricas e relatórios de desempenho",
    icone: "chart",
  },
  {
    id: "equipe",
    titulo: "Equipe",
    descricao: "Pessoas e produtividade da equipe",
    icone: "users",
  },
];

export const mockProjects: DashboardProject[] = [
  {
    id: 1,
    tituloProjeto: "Redesign do Portal",
    descricao: "Refatoração completa da interface de usuário e melhorias na experiência de navegação.",
    prazo: "15 de Outubro",
    sprintAtual: "Sprint 3: Conclusão da UI",
    progresso: 74,
    corDestaque: "blue",
    status: "Em andamento",
    membros: [
      { id: 101, nome: "Carlos Maia", iniciais: "CM" },
      { id: 102, nome: "Ana Silva", iniciais: "AS" },
      { id: 103, nome: "Bruno Costa", iniciais: "BC" },
    ],
  },
  {
    id: 2,
    tituloProjeto: "App Mobile Trackfy",
    descricao: "Desenvolvimento do aplicativo nativo para acompanhamento de tarefas em tempo real.",
    prazo: "28 de Outubro",
    sprintAtual: "Sprint 5: Notificações Push",
    progresso: 45,
    corDestaque: "purple",
    status: "Em andamento",
    membros: [
      { id: 104, nome: "Larissa Rocha", iniciais: "LR" },
      { id: 105, nome: "Diego Lins", iniciais: "DL" },
      { id: 101, nome: "Carlos Maia", iniciais: "CM" },
    ],
  },
  {
    id: 3,
    tituloProjeto: "Campanha de Lançamento",
    descricao: "Planejamento e execução de marketing, landing page e materiais de divulgação.",
    prazo: "02 de Novembro",
    sprintAtual: "Sprint 2: Validação de Copy",
    progresso: 88,
    corDestaque: "green",
    status: "Quase pronto",
    membros: [
      { id: 102, nome: "Ana Silva", iniciais: "AS" },
      { id: 106, nome: "Fernanda Lima", iniciais: "FL" },
    ],
  },
  {
    id: 4,
    tituloProjeto: "Plataforma Educacional",
    descricao: "Módulo integrado de cursos e capacitação interna para colaboradores.",
    prazo: "12 de Novembro",
    sprintAtual: "Sprint 1: Arquitetura Inicial",
    progresso: 21,
    corDestaque: "orange",
    status: "Iniciando",
    membros: [
      { id: 103, nome: "Bruno Costa", iniciais: "BC" },
      { id: 105, nome: "Diego Lins", iniciais: "DL" },
      { id: 104, nome: "Larissa Rocha", iniciais: "LR" },
    ],
  },
];

export const mockWorkflowColumns: DashboardWorkflowColumn[] = [
  {
    id: "todo",
    titulo: "A Fazer",
    tarefas: [
      { id: 201, titulo: "Criar telas de onboarding", stack: "Frontend / UX", prioridade: "Alta" },
      { id: 202, titulo: "Documentar rotas de autenticação", stack: "Backend / Docs", prioridade: "Média" },
    ],
  },
  {
    id: "in_progress",
    titulo: "Em Progresso",
    tarefas: [
      { id: 203, titulo: "Integrar webhook do GitHub", stack: "Backend / API", prioridade: "Alta" },
      { id: 204, titulo: "Componentes do Dashboard", stack: "Frontend / React", prioridade: "Alta" },
    ],
  },
  {
    id: "review",
    titulo: "Em Revisão",
    tarefas: [
      { id: 205, titulo: "Validação de acessibilidade WCAG", stack: "QA / Design", prioridade: "Média" },
    ],
  },
  {
    id: "done",
    titulo: "Concluído",
    tarefas: [
      { id: 206, titulo: "Setup do banco PostgreSQL e Prisma", stack: "DevOps / DB", prioridade: "Baixa" },
    ],
  },
];

export const mockPerformanceMetrics: DashboardPerformanceMetric[] = [
  { rotulo: "Conclusão", valor: "78%", descricao: "+8% vs mês anterior" },
  { rotulo: "Tempo Médio", valor: "2.4d", descricao: "Por entrega concluída" },
  { rotulo: "Em Revisão", valor: "7", descricao: "Aguardando aprovação" },
  { rotulo: "Score de Equipe", valor: "4.8/5", descricao: "Avaliação da sprint" },
];

export const mockChartPoints: DashboardChartPoint[] = [
  { dia: "Seg", entregas: 4, alturaPct: 40 },
  { dia: "Ter", entregas: 7, alturaPct: 65 },
  { dia: "Qua", entregas: 5, alturaPct: 50 },
  { dia: "Qui", entregas: 9, alturaPct: 90 },
  { dia: "Sex", entregas: 11, alturaPct: 100 },
  { dia: "Sáb", entregas: 3, alturaPct: 30 },
  { dia: "Dom", entregas: 2, alturaPct: 20 },
];

export const mockMembers: DashboardMember[] = [
  { id: 301, nome: "Carlos Maia", cargo: "Design Lead", iniciais: "CM", online: true, avatarCor: "#3b82f6" },
  { id: 302, nome: "Ana Silva", cargo: "Frontend Dev", iniciais: "AS", online: true, avatarCor: "#8b5cf6" },
  { id: 303, nome: "Bruno Costa", cargo: "Backend Dev", iniciais: "BC", online: true, avatarCor: "#10b981" },
  { id: 304, nome: "Larissa Rocha", cargo: "QA Tester", iniciais: "LR", online: true, avatarCor: "#f59e0b" },
  { id: 305, nome: "Diego Lins", cargo: "Product Owner", iniciais: "DL", online: false, avatarCor: "#64748b" },
];
