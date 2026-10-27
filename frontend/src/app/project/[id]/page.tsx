"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.scss";
import { api } from "@/src/services/api";
import { 
  FiArrowLeft, 
  FiPlus, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiUsers, 
  FiCalendar,
  FiLayers,
  FiCheckSquare,
  FiBarChart2
} from "react-icons/fi";

export default function ProjectDashboardPage() {
  const params = useParams();
  const router = useRouter();
  
  // Captura correta do ID dinâmico da URL
  const projectId = params?.id;

  const [project, setProject] = useState<any>(null);
  const [sprints, setSprints] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState<"overview" | "sprints" | "tasks">("overview");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newSprintName, setNewSprintName] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");

  useEffect(() => {
    async function fetchProjectData() {
      if (!projectId) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("@token") || localStorage.getItem("@session") || localStorage.getItem("token");

      if (!token) {
        router.push("/");
        return;
      }

      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Busca os dados principais do projeto (Rota GET /project/:id válida no seu routes.ts)
        const projectRes = await api.get(`/project/${projectId}`, { headers });
        setProject(projectRes.data);

        // Inicializa vazias para evitar requisições a rotas não mapeadas no backend atual
        setSprints([]);
        setTasks([]);

      } catch (error: any) {
        console.error("Erro ao carregar dados do projeto:", error);
        
        if (error.response?.status === 401) {
          localStorage.clear();
          router.push("/");
          return;
        }

        setErrorMessage("Não foi possível carregar os dados do projeto.");
      } finally {
        setLoading(false);
      }
    }

    fetchProjectData();
  }, [projectId, router]);

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSprintName.trim()) return;
    try {
      const token = localStorage.getItem("@token") || localStorage.getItem("@session") || localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await api.post(`/sprint`, { name: newSprintName, projectId }, { headers });
      setSprints((prev) => [...prev, res.data]);
      setNewSprintName("");
      setIsSprintModalOpen(false);
    } catch (err) {
      alert("Erro ao criar sprint.");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const token = localStorage.getItem("@token") || localStorage.getItem("@session") || localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await api.post(`/task`, { title: newTaskTitle, projectId }, { headers });
      setTasks((prev) => [...prev, res.data]);
      setNewTaskTitle("");
      setIsTaskModalOpen(false);
    } catch (err) {
      alert("Erro ao criar tarefa.");
    }
  };

  if (loading) {
    return (
      <div className={styles.container} style={{ justifyContent: "center", alignItems: "center", display: "flex", height: "100vh" }}>
        <p style={{ color: "#94a3b8" }}>Carregando painel do projeto...</p>
      </div>
    );
  }

  if (errorMessage || !project) {
    return (
      <div className={styles.container} style={{ justifyContent: "center", alignItems: "center", display: "flex", flexDirection: "column", gap: "1rem", height: "100vh" }}>
        <p style={{ color: "#f87171" }}>{errorMessage || "Projeto não encontrado."}</p>
        <Link href="/dashboard" style={{ color: "#3b82f6", textDecoration: "underline" }}>Voltar para o Dashboard</Link>
      </div>
    );
  }

  const pendingTasksCount = tasks.filter((t: any) => !t.completed && t.status !== "DONE").length;
  const completedTasksCount = tasks.filter((t: any) => t.completed || t.status === "DONE").length;
  const formattedTerm = project?.term ? new Date(project.term).toLocaleDateString('pt-BR') : "Sem prazo definido";

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <Link href="/dashboard" className={styles.backLink}>
              <FiArrowLeft /> Projetos
            </Link>
            <div className={styles.projectTitleRow}>
              <h1>{project.title || project.tituloProjeto}</h1>
              <span>
                <span style={{ display: 'inline-flex', marginRight: '4px', verticalAlign: 'middle' }}>
                  <FiCalendar />
                </span> 
                Prazo: {formattedTerm}
              </span>
            </div>
          </div>

          <div className={styles.headerRight}>
            <button 
              className={styles.newProjectBtn}
              onClick={() => router.push("/project")}
            >
              <FiPlus /> Novo Projeto
            </button>
          </div>
        </header>

        <div style={{ display: "flex", gap: "1rem", padding: "1.5rem 2rem 0 2rem", borderBottom: "1px solid #1e293b" }}>
          <button
            onClick={() => setActiveTab("overview")}
            style={{
              background: "transparent",
              border: "none",
              color: activeTab === "overview" ? "#3b82f6" : "#94a3b8",
              padding: "0.75rem 1rem",
              cursor: "pointer",
              fontWeight: 600,
              borderBottom: activeTab === "overview" ? "2px solid #3b82f6" : "2px solid transparent",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <FiBarChart2 /> Visão Geral
          </button>
          <button
            onClick={() => setActiveTab("sprints")}
            style={{
              background: "transparent",
              border: "none",
              color: activeTab === "sprints" ? "#3b82f6" : "#94a3b8",
              padding: "0.75rem 1rem",
              cursor: "pointer",
              fontWeight: 600,
              borderBottom: activeTab === "sprints" ? "2px solid #3b82f6" : "2px solid transparent",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <FiLayers /> Sprints ({sprints.length})
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            style={{
              background: "transparent",
              border: "none",
              color: activeTab === "tasks" ? "#3b82f6" : "#94a3b8",
              padding: "0.75rem 1rem",
              cursor: "pointer",
              fontWeight: 600,
              borderBottom: activeTab === "tasks" ? "2px solid #3b82f6" : "2px solid transparent",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <FiCheckSquare /> Tarefas ({tasks.length})
          </button>
        </div>

        <div className={styles.dashboardBody}>
          {activeTab === "overview" && (
            <>
              {project.description && (
                <div style={{ background: "#0f172a", border: "1px solid #1e293b", padding: "1.25rem", borderRadius: "12px", color: "#94a3b8", marginBottom: "1rem" }}>
                  <strong style={{ color: "#f8fafc", display: "block", marginBottom: "0.5rem" }}>Sobre o Projeto:</strong>
                  {project.description}
                </div>
              )}

              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.cardHeader}>
                    <span>Tarefas Pendentes</span>
                    <FiAlertCircle color="#f59e0b" size={18} />
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.bigNumber}>{pendingTasksCount}</div>
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.cardHeader}>
                    <span>Tarefas Concluídas</span>
                    <FiCheckCircle color="#10b981" size={18} />
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.bigNumber}>{completedTasksCount}</div>
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.cardHeader}>
                    <span>Membros / Convites</span>
                    <FiUsers color="#3b82f6" size={18} />
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.bigNumber}>{project.members?.length || 1}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button 
                  onClick={() => setIsSprintModalOpen(true)}
                  style={{ background: "#1e293b", color: "#fff", border: "1px solid #334155", padding: "0.75rem 1.25rem", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
                >
                  + Criar Nova Sprint
                </button>
                <button 
                  onClick={() => setIsTaskModalOpen(true)}
                  style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "0.75rem 1.25rem", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
                >
                  + Adicionar Tarefa
                </button>
              </div>
            </>
          )}

          {activeTab === "sprints" && (
            <div className={styles.sectionCard} style={{ background: "#0f172a", border: "1px solid #1e293b", padding: "1.5rem", borderRadius: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3>Sprints do Projeto</h3>
                <button 
                  onClick={() => setIsSprintModalOpen(true)}
                  style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer" }}
                >
                  Nova Sprint
                </button>
              </div>
              {sprints.length === 0 ? (
                <p style={{ color: "#94a3b8" }}>Nenhuma sprint cadastrada nesta sessão.</p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {sprints.map((sprint: any) => (
                    <li key={sprint.id} style={{ background: "#1e293b", padding: "1rem", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                      <span>{sprint.name}</span>
                      <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{sprint.status || "Ativa"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "tasks" && (
            <div className={styles.sectionCard} style={{ background: "#0f172a", border: "1px solid #1e293b", padding: "1.5rem", borderRadius: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3>Tarefas do Projeto</h3>
                <button 
                  onClick={() => setIsTaskModalOpen(true)}
                  style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer" }}
                >
                  Nova Tarefa
                </button>
              </div>
              {tasks.length === 0 ? (
                <p style={{ color: "#94a3b8" }}>Nenhuma tarefa cadastrada nesta sessão.</p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {tasks.map((task: any) => (
                    <li key={task.id} style={{ background: "#1e293b", padding: "1rem", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>{task.title}</span>
                      <span style={{ fontSize: "0.85rem", color: task.completed ? "#10b981" : "#f59e0b" }}>
                        {task.completed ? "Concluída" : "Pendente"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {isSprintModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <form onSubmit={handleCreateSprint} style={{ background: "#0f172a", border: "1px solid #1e293b", padding: "2rem", borderRadius: "12px", width: "400px", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 style={{ color: "#fff", margin: 0 }}>Criar Nova Sprint</h3>
            <input 
              type="text" 
              placeholder="Nome da Sprint (ex: Sprint 1)" 
              value={newSprintName}
              onChange={(e) => setNewSprintName(e.target.value)}
              style={{ background: "#1e293b", border: "1px solid #334155", padding: "0.75rem", borderRadius: "8px", color: "#fff" }}
              required
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button type="button" onClick={() => setIsSprintModalOpen(false)} style={{ background: "transparent", color: "#94a3b8", border: "none", cursor: "pointer" }}>Cancelar</button>
              <button type="submit" style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer" }}>Salvar</button>
            </div>
          </form>
        </div>
      )}

      {isTaskModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <form onSubmit={handleCreateTask} style={{ background: "#0f172a", border: "1px solid #1e293b", padding: "2rem", borderRadius: "12px", width: "400px", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 style={{ color: "#fff", margin: 0 }}>Criar Nova Tarefa</h3>
            <input 
              type="text" 
              placeholder="Título da tarefa..." 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              style={{ background: "#1e293b", border: "1px solid #334155", padding: "0.75rem", borderRadius: "8px", color: "#fff" }}
              required
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button type="button" onClick={() => setIsTaskModalOpen(false)} style={{ background: "transparent", color: "#94a3b8", border: "none", cursor: "pointer" }}>Cancelar</button>
              <button type="submit" style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer" }}>Salvar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}