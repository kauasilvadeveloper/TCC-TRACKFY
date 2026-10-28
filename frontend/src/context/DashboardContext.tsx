// src/context/DashboardContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { projectService } from "@/src/services/projectService";
import { ApiProjeto } from "@/src/types/project";
import {
  DashboardProject,
  DashboardHeroStat,
  AccentColor,
} from "@/src/types/dashboard";
import { mockHeroStats } from "@/src/mocks/dashboard.mock";
import { useAuth } from "@/src/context/AuthContext";

interface DashboardContextType {
  projects: DashboardProject[];
  isLoading: boolean;
  error: string | null;
  refetchProjects: () => Promise<void>;
  heroStats: DashboardHeroStat[];
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

const ACCENT_COLORS: AccentColor[] = ["blue", "purple", "green", "orange"];

function getInitials(name?: string): string {
  if (!name) return "US";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
    }).format(date);
  } catch {
    return dateStr;
  }
}

function mapApiToDashboardProject(
  apiProj: ApiProjeto,
  index: number
): DashboardProject {
  const defaultProgresses = [74, 45, 88, 21];

  return {
    id: apiProj.id,
    tituloProjeto: apiProj.tituloProjeto,
    descricao: apiProj.descricao || "Sem descrição informada.",
    prazo: formatDate(apiProj.prazo),
    sprintAtual: "Sprint 01: Planejamento e Execução",
    progresso: defaultProgresses[index % defaultProgresses.length],
    corDestaque: ACCENT_COLORS[index % ACCENT_COLORS.length],
    status: "Em andamento",
    membros: (apiProj.usuarios || []).map((u) => ({
      id: u.usuario.id,
      nome: u.usuario.nome,
      iniciais: getInitials(u.usuario.nome),
    })),
  };
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await projectService.getProjects();
      const mapped = (data || []).map(mapApiToDashboardProject);
      setProjects(mapped);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Não foi possível carregar os projetos. Verifique a conexão.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("isAuthenticated", isAuthenticated, "user", user);
    if (!isAuthenticated) {
      fetchProjects();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchProjects]);

  // Atualiza dinamicamente o contador de projetos ativos no Hero
  const heroStats: DashboardHeroStat[] = mockHeroStats.map((stat) => {
    if (stat.rotulo.toLowerCase().includes("projeto")) {
      return {
        ...stat,
        valor: projects.length,
      };
    }
    return stat;
  });

  return (
    <DashboardContext.Provider
      value={{
        projects,
        isLoading,
        error,
        refetchProjects: fetchProjects,
        heroStats,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error(
      "useDashboard deve ser utilizado dentro de um DashboardProvider."
    );
  }
  return context;
};
