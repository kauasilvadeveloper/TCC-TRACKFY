// src/types/dashboard.ts

export type AccentColor = "blue" | "purple" | "green" | "orange";

export interface ProjectMember {
  id: number;
  nome: string;
  avatarUrl?: string;
  iniciais: string;
}

export interface DashboardProject {
  id: number;
  tituloProjeto: string;
  descricao: string;
  prazo: string;
  sprintAtual: string;
  progresso: number;
  corDestaque: AccentColor;
  status: string;
  membros: ProjectMember[];
}

export interface DashboardMember {
  id: number;
  nome: string;
  cargo: string;
  iniciais: string;
  online: boolean;
  avatarCor: string;
}

export interface DashboardWorkflowTask {
  id: number;
  titulo: string;
  stack: string;
  prioridade: "Alta" | "Média" | "Baixa";
}

export interface DashboardWorkflowColumn {
  id: string;
  titulo: string;
  tarefas: DashboardWorkflowTask[];
}

export interface DashboardPerformanceMetric {
  rotulo: string;
  valor: string;
  descricao: string;
}

export interface DashboardChartPoint {
  dia: string;
  entregas: number;
  alturaPct: number;
}

export interface DashboardShortcut {
  id: string;
  titulo: string;
  descricao: string;
  icone: string;
}

export interface DashboardHeroStat {
  rotulo: string;
  valor: string | number;
  icone: string;
}
