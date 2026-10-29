"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.scss";
import { api } from "@/src/services/api";
import Cookies from "js-cookie";
import {
  FiArrowLeft,
  FiPlus,
  FiAlertCircle,
  FiCheckCircle,
  FiUsers,
  FiCalendar,
  FiLayers,
  FiCheckSquare,
  FiBarChart2,
  FiX,
  FiTag,
  FiCheck,
} from "react-icons/fi";

export default function ProjectDashboardPage() {
  const params = useParams();
  const router = useRouter();

  // Captura do ID dinâmico da URL
  const projectId = params?.id;

  const [project, setProject] = useState<any>(null);
  const [sprints, setSprints] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<"overview" | "sprints" | "tasks">(
    "overview",
  );
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados dos Modais
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Formulário de Sprint
  const [newSprintTitle, setNewSprintTitle] = useState("");
  const [newSprintDeadline, setNewSprintDeadline] = useState("");
  const [newSprintDescription, setNewSprintDescription] = useState("");
  const [isSubmittingSprint, setIsSubmittingSprint] = useState(false);

  // Formulário de Tarefa
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [newTaskStack, setNewTaskStack] = useState("React / Next.js");
  const [newTaskStatus, setNewTaskStatus] = useState("Pendente");
  const [newTaskSprintId, setNewTaskSprintId] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  useEffect(() => {
    async function fetchProjectData() {
      if (!projectId) {
        setLoading(false);
        return;
      }

      const token = Cookies.get("trackfy_token");

      if (!token) {
        router.push("/");
        return;
      }

      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Busca os dados do projeto
        const projectRes = await api.get(`/project/${projectId}`, { headers });
        setProject(projectRes.data);

        // 2. Carrega as sprints do projeto retornadas pela API
        const projectSprints = Array.isArray(projectRes.data?.sprints)
          ? projectRes.data.sprints
          : [];
        setSprints(projectSprints);

        // 3. Busca o Kanban do projeto para obter colunas e tarefas
        try {
          const kanbanRes = await api.get(`/kanban/${projectId}`, { headers });
          if (kanbanRes.data?.colunas) {
            setColumns(kanbanRes.data.colunas);

            const extractedTasks = kanbanRes.data.colunas.flatMap(
              (col: any) =>
                (col.tarefas || []).map((t: any) => ({
                  ...t,
                  colunaNome: col.tituloColuna,
                })),
            );
            setTasks(extractedTasks);
          }
        } catch (kanbanErr: any) {
          // Se o projeto ainda não tiver Kanban (404), inicializa com colunas padrão
          if (kanbanErr?.response?.status === 404) {
            try {
              const createdKanban = await api.post(
                "/kanban",
                {
                  tituloKanban: `Quadro - ${projectRes.data.tituloProjeto || "Projeto"}`,
                  fkProjeto: Number(projectId),
                },
                { headers },
              );

              if (createdKanban.data?.id) {
                const kId = createdKanban.data.id;
                const [col1, col2, col3] = await Promise.all([
                  api.post("/kanban/column", { tituloColuna: "A Fazer", fkKanban: kId }, { headers }),
                  api.post("/kanban/column", { tituloColuna: "Em Andamento", fkKanban: kId }, { headers }),
                  api.post("/kanban/column", { tituloColuna: "Concluído", fkKanban: kId }, { headers }),
                ]);
                setColumns([col1.data, col2.data, col3.data]);
              }
            } catch (autoKanbanErr) {
              console.warn("Aviso ao provisionar Kanban inicial:", autoKanbanErr);
            }
          }
        }
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

  // Criação de Sprint
  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSprintTitle.trim()) {
      alert("Por favor, preencha o título da sprint.");
      return;
    }
    if (!newSprintDeadline) {
      alert("Por favor, selecione a data de término da sprint.");
      return;
    }

    const token = Cookies.get("trackfy_token");
    if (!token) {
      alert("Sessão expirada. Faça login novamente.");
      router.push("/");
      return;
    }

    try {
      setIsSubmittingSprint(true);
      const headers = { Authorization: `Bearer ${token}` };

      const res = await api.post(
        `/sprint`,
        {
          tituloSprint: newSprintTitle.trim(),
          prazoSprint: new Date(newSprintDeadline).toISOString(),
          descricaoSprint: newSprintDescription.trim() || undefined,
        },
        { headers },
      );

      setSprints((prev) => [...prev, res.data]);
      setNewSprintTitle("");
      setNewSprintDeadline("");
      setNewSprintDescription("");
      setIsSprintModalOpen(false);
    } catch (err: any) {
      console.error("Erro ao criar sprint:", err);
      alert(err.response?.data?.message || "Erro ao criar sprint.");
    } finally {
      setIsSubmittingSprint(false);
    }
  };

  // Criação de Tarefa
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      alert("Por favor, informe o título da tarefa.");
      return;
    }
    if (!newTaskDeadline) {
      alert("Por favor, informe o prazo limite da tarefa.");
      return;
    }
    if (!newTaskSprintId) {
      alert("Por favor, selecione uma sprint para associar a tarefa.");
      return;
    }

    const token = Cookies.get("trackfy_token");
    if (!token) {
      alert("Sessão expirada. Faça login novamente.");
      router.push("/");
      return;
    }

    // Associa automaticamente à primeira coluna do Kanban
    let targetColumnId = columns[0]?.id;

    if (!targetColumnId) {
      try {
        const kanbanRes = await api.get(`/kanban/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (kanbanRes.data?.colunas?.length > 0) {
          targetColumnId = kanbanRes.data.colunas[0].id;
          setColumns(kanbanRes.data.colunas);
        }
      } catch (err) {
        console.warn("Erro ao buscar coluna Kanban para a tarefa:", err);
      }
    }

    if (!targetColumnId) {
      alert("Não foi possível identificar a coluna do quadro para a tarefa.");
      return;
    }

    try {
      setIsSubmittingTask(true);
      const headers = { Authorization: `Bearer ${token}` };

      const res = await api.post(
        `/task`,
        {
          tituloTarefa: newTaskTitle.trim(),
          descricaoTarefa: newTaskDescription.trim() || undefined,
          status: newTaskStatus,
          stack: newTaskStack,
          prazoTarefa: new Date(newTaskDeadline).toISOString(),
          fkSprint: Number(newTaskSprintId),
          fkColuna: Number(targetColumnId),
          usuarioIds:
            selectedUserIds.length > 0
              ? selectedUserIds.map((id) => Number(id))
              : undefined,
        },
        { headers },
      );

      setTasks((prev) => [...prev, res.data]);

      // Resetar formulário
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskDeadline("");
      setNewTaskStack("React / Next.js");
      setNewTaskStatus("Pendente");
      setNewTaskSprintId("");
      setSelectedUserIds([]);
      setIsTaskModalOpen(false);
    } catch (err: any) {
      console.error("Erro ao criar tarefa:", err);
      alert(err.response?.data?.message || "Erro ao criar tarefa.");
    } finally {
      setIsSubmittingTask(false);
    }
  };

  if (loading) {
    return (
      <div
        className={styles.container}
        style={{
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          height: "100vh",
        }}
      >
        <p style={{ color: "#94a3b8" }}>Carregando painel do projeto...</p>
      </div>
    );
  }

  if (errorMessage || !project) {
    return (
      <div
        className={styles.container}
        style={{
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          height: "100vh",
        }}
      >
        <p style={{ color: "#f87171" }}>
          {errorMessage || "Projeto não encontrado."}
        </p>
        <Link
          href="/dashboard"
          style={{ color: "#3b82f6", textDecoration: "underline" }}
        >
          Voltar para o Dashboard
        </Link>
      </div>
    );
  }

  const projectMembers =
    project?.usuarios?.map((u: any) => u.usuario).filter(Boolean) ||
    project?.members ||
    [];

  const pendingTasksCount = tasks.filter((t: any) => {
    const s = (t.status || "").toLowerCase();
    return s !== "concluída" && s !== "concluida" && s !== "done" && !t.completed;
  }).length;

  const completedTasksCount = tasks.filter((t: any) => {
    const s = (t.status || "").toLowerCase();
    return s === "concluída" || s === "concluida" || s === "done" || t.completed;
  }).length;

  const formattedTerm = project?.term || project?.prazo
    ? new Date(project.term || project.prazo).toLocaleDateString("pt-BR")
    : "Sem prazo definido";

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
                <span
                  style={{
                    display: "inline-flex",
                    marginRight: "4px",
                    verticalAlign: "middle",
                  }}
                >
                  <FiCalendar />
                </span>
                Prazo: {formattedTerm}
              </span>
            </div>
          </div>

          <div className={styles.headerRight}>
            <button
              className={styles.newProjectBtn}
              onClick={() => router.push("/project/newProject")}
            >
              <FiPlus /> Novo Projeto
            </button>
          </div>
        </header>

        {/* Abas de Navegação */}
        <div className={styles.navTabsContainer}>
          <button
            onClick={() => setActiveTab("overview")}
            className={`${styles.tabBtn} ${activeTab === "overview" ? styles.activeTab : ""}`}
          >
            <FiBarChart2 /> Visão Geral
          </button>
          <button
            onClick={() => setActiveTab("sprints")}
            className={`${styles.tabBtn} ${activeTab === "sprints" ? styles.activeTab : ""}`}
          >
            <FiLayers /> Sprints ({sprints.length})
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`${styles.tabBtn} ${activeTab === "tasks" ? styles.activeTab : ""}`}
          >
            <FiCheckSquare /> Tarefas ({tasks.length})
          </button>
        </div>

        <div className={styles.dashboardBody}>
          {/* Aba 1: Visão Geral */}
          {activeTab === "overview" && (
            <>
              {project.description || project.descricao ? (
                <div className={styles.projectDescriptionBox}>
                  <strong>Sobre o Projeto:</strong>
                  {project.description || project.descricao}
                </div>
              ) : null}

              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.cardHeader}>
                    <span>Tarefas Pendentes</span>
                    <FiAlertCircle color="#f59e0b" size={18} />
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.bigNumber}>{pendingTasksCount}</div>
                    <div className={styles.subtext}>Aguardando conclusão</div>
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.cardHeader}>
                    <span>Tarefas Concluídas</span>
                    <FiCheckCircle color="#10b981" size={18} />
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.bigNumber}>{completedTasksCount}</div>
                    <div className={styles.subtext}>Finalizadas com sucesso</div>
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.cardHeader}>
                    <span>Membros do Projeto</span>
                    <FiUsers color="#3b82f6" size={18} />
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.bigNumber}>
                      {projectMembers.length || 1}
                    </div>
                    <div className={styles.subtext}>Colaboradores ativos</div>
                  </div>
                </div>
              </div>

              <div className={styles.quickActionsRow}>
                <button
                  className={styles.secondaryActionBtn}
                  onClick={() => setIsSprintModalOpen(true)}
                >
                  <FiPlus /> Criar Nova Sprint
                </button>
                <button
                  className={styles.primaryActionBtn}
                  onClick={() => {
                    if (sprints.length === 0) {
                      alert("Crie ao menos uma Sprint antes de adicionar tarefas.");
                      setIsSprintModalOpen(true);
                      return;
                    }
                    if (!newTaskSprintId && sprints.length > 0) {
                      setNewTaskSprintId(String(sprints[0].id));
                    }
                    setIsTaskModalOpen(true);
                  }}
                >
                  <FiPlus /> Adicionar Tarefa
                </button>
              </div>
            </>
          )}

          {/* Aba 2: Sprints */}
          {activeTab === "sprints" && (
            <div className={styles.tabSection}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3>Sprints do Projeto</h3>
                  <p className={styles.sectionSubtitle}>
                    Ciclos de desenvolvimento e prazos de entrega
                  </p>
                </div>
                <button
                  className={styles.primaryActionBtn}
                  onClick={() => setIsSprintModalOpen(true)}
                >
                  <FiPlus /> Nova Sprint
                </button>
              </div>

              {sprints.length === 0 ? (
                <div className={styles.emptyState}>
                  <FiLayers size={44} color="#64748b" />
                  <p>Nenhuma sprint cadastrada para este projeto.</p>
                  <button
                    className={styles.secondaryActionBtn}
                    onClick={() => setIsSprintModalOpen(true)}
                  >
                    Criar Primeira Sprint
                  </button>
                </div>
              ) : (
                <div className={styles.sprintsGrid}>
                  {sprints.map((sprint: any) => {
                    const sprintTasks = tasks.filter(
                      (t: any) =>
                        t.fkSprint === sprint.id || t.sprint?.id === sprint.id,
                    );
                    const deadlineFormatted = sprint.prazoSprint
                      ? new Date(sprint.prazoSprint).toLocaleDateString("pt-BR")
                      : "Sem prazo";

                    return (
                      <div key={sprint.id} className={styles.sprintCard}>
                        <div className={styles.sprintCardHeader}>
                          <h4>{sprint.tituloSprint || sprint.name}</h4>
                          <span className={styles.sprintDateBadge}>
                            <FiCalendar size={13} /> {deadlineFormatted}
                          </span>
                        </div>

                        {sprint.descricaoSprint && (
                          <p className={styles.sprintDescription}>
                            {sprint.descricaoSprint}
                          </p>
                        )}

                        <div className={styles.sprintCardFooter}>
                          <span className={styles.tasksCountBadge}>
                            <FiCheckSquare size={13} /> {sprintTasks.length}{" "}
                            {sprintTasks.length === 1 ? "tarefa" : "tarefas"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Aba 3: Tarefas */}
          {activeTab === "tasks" && (
            <div className={styles.tabSection}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3>Tarefas do Projeto</h3>
                  <p className={styles.sectionSubtitle}>
                    Acompanhe o andamento de cada atividade
                  </p>
                </div>
                <button
                  className={styles.primaryActionBtn}
                  onClick={() => {
                    if (sprints.length === 0) {
                      alert("Crie ao menos uma Sprint antes de adicionar tarefas.");
                      setIsSprintModalOpen(true);
                      return;
                    }
                    if (!newTaskSprintId && sprints.length > 0) {
                      setNewTaskSprintId(String(sprints[0].id));
                    }
                    setIsTaskModalOpen(true);
                  }}
                >
                  <FiPlus /> Nova Tarefa
                </button>
              </div>

              {tasks.length === 0 ? (
                <div className={styles.emptyState}>
                  <FiCheckSquare size={44} color="#64748b" />
                  <p>Nenhuma tarefa cadastrada neste projeto.</p>
                  <button
                    className={styles.secondaryActionBtn}
                    onClick={() => {
                      if (sprints.length === 0) {
                        alert("Crie ao menos uma Sprint antes de adicionar tarefas.");
                        setIsSprintModalOpen(true);
                        return;
                      }
                      if (!newTaskSprintId && sprints.length > 0) {
                        setNewTaskSprintId(String(sprints[0].id));
                      }
                      setIsTaskModalOpen(true);
                    }}
                  >
                    Criar Primeira Tarefa
                  </button>
                </div>
              ) : (
                <div className={styles.tasksGrid}>
                  {tasks.map((task: any) => {
                    const taskSprint =
                      task.sprint?.tituloSprint ||
                      sprints.find((s: any) => s.id === task.fkSprint)
                        ?.tituloSprint ||
                      (task.fkSprint ? `Sprint #${task.fkSprint}` : "Geral");

                    const taskDeadline = task.prazoTarefa
                      ? new Date(task.prazoTarefa).toLocaleDateString("pt-BR")
                      : null;

                    const assignedUsers =
                      task.usuarios
                        ?.map((u: any) => u.usuario?.nome || u.usuario?.email)
                        .filter(Boolean) || [];

                    const statusStr = (task.status || "Pendente").toLowerCase();
                    const isDone =
                      statusStr.includes("conclu") || statusStr === "done";
                    const isInProgress =
                      statusStr.includes("andamento") ||
                      statusStr === "in_progress";

                    const statusClass = isDone
                      ? styles.statusDone
                      : isInProgress
                      ? styles.statusProgress
                      : styles.statusPending;

                    return (
                      <div key={task.id} className={styles.taskCard}>
                        <div className={styles.taskCardHeader}>
                          <div className={styles.taskBadges}>
                            <span
                              className={`${styles.statusBadge} ${statusClass}`}
                            >
                              {task.status || "Pendente"}
                            </span>
                            {task.stack && (
                              <span className={styles.stackBadge}>
                                <FiTag size={12} /> {task.stack}
                              </span>
                            )}
                            <span className={styles.sprintBadge}>
                              <FiLayers size={12} /> {taskSprint}
                            </span>
                          </div>
                        </div>

                        <h4 className={styles.taskTitle}>
                          {task.tituloTarefa || task.title}
                        </h4>

                        {task.descricaoTarefa && (
                          <p className={styles.taskDescription}>
                            {task.descricaoTarefa}
                          </p>
                        )}

                        <div className={styles.taskCardFooter}>
                          <div className={styles.footerMeta}>
                            {taskDeadline && (
                              <span className={styles.taskDate}>
                                <FiCalendar size={13} /> {taskDeadline}
                              </span>
                            )}
                          </div>

                          {assignedUsers.length > 0 && (
                            <div className={styles.assignedMembers}>
                              <FiUsers size={13} />
                              <span>{assignedUsers.join(", ")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Criação de Sprint */}
      {isSprintModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsSprintModalOpen(false)}
        >
          <div
            className={styles.modalContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Criar Nova Sprint</h3>
                <p className={styles.modalSubtitle}>
                  Defina o ciclo de entregas e prazo para a equipe
                </p>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsSprintModalOpen(false)}
                aria-label="Fechar"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleCreateSprint} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Título da Sprint <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Sprint 1 — Autenticação e Layout"
                  className={styles.input}
                  value={newSprintTitle}
                  onChange={(e) => setNewSprintTitle(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Data de Término / Prazo <span className={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  className={styles.input}
                  value={newSprintDeadline}
                  onChange={(e) => setNewSprintDeadline(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Descrição (Opcional)</label>
                <textarea
                  placeholder="Descreva as metas e escopo desta sprint..."
                  rows={3}
                  className={styles.textarea}
                  value={newSprintDescription}
                  onChange={(e) => setNewSprintDescription(e.target.value)}
                />
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsSprintModalOpen(false)}
                  disabled={isSubmittingSprint}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isSubmittingSprint}
                >
                  <FiCheck />
                  <span>{isSubmittingSprint ? "Criando..." : "Salvar Sprint"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Criação de Tarefa */}
      {isTaskModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsTaskModalOpen(false)}
        >
          <div
            className={styles.modalContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Criar Nova Tarefa</h3>
                <p className={styles.modalSubtitle}>
                  Adicione uma atividade detalhada ao projeto
                </p>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsTaskModalOpen(false)}
                aria-label="Fechar"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Título da Tarefa <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Criar tela de login responsiva"
                  className={styles.input}
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Descrição (Opcional)</label>
                <textarea
                  placeholder="Descreva o objetivo, critérios e regras da tarefa..."
                  rows={3}
                  className={styles.textarea}
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Prazo / Data Limite <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="date"
                    className={styles.input}
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Stack Tecnológica</label>
                  <select
                    className={styles.select}
                    value={newTaskStack}
                    onChange={(e) => setNewTaskStack(e.target.value)}
                  >
                    <option value="React / Next.js">React / Next.js</option>
                    <option value="Node.js / Express">Node.js / Express</option>
                    <option value="TypeScript">TypeScript</option>
                    <option value="CSS / SCSS">CSS / SCSS</option>
                    <option value="Banco de Dados / Prisma">
                      Banco de Dados / Prisma
                    </option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Status Inicial</label>
                  <select
                    className={styles.select}
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value)}
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Concluída">Concluída</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Sprint Vinculada <span className={styles.required}>*</span>
                  </label>
                  <select
                    className={styles.select}
                    value={newTaskSprintId}
                    onChange={(e) => setNewTaskSprintId(e.target.value)}
                    required
                  >
                    <option value="">Selecione uma sprint...</option>
                    {sprints.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.tituloSprint || s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Membros Responsáveis */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Membros Responsáveis (Opcional)
                </label>
                {projectMembers.length === 0 ? (
                  <p className={styles.helperText}>
                    Nenhum colaborador vinculado a este projeto.
                  </p>
                ) : (
                  <div className={styles.membersCheckList}>
                    {projectMembers.map((member: any) => {
                      const isChecked = selectedUserIds.includes(member.id);
                      return (
                        <label key={member.id} className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedUserIds((prev) =>
                                  prev.filter((id) => id !== member.id),
                                );
                              } else {
                                setSelectedUserIds((prev) => [
                                  ...prev,
                                  member.id,
                                ]);
                              }
                            }}
                          />
                          <span>{member.nome || member.email}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsTaskModalOpen(false)}
                  disabled={isSubmittingTask}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isSubmittingTask}
                >
                  <FiCheck />
                  <span>{isSubmittingTask ? "Criando..." : "Salvar Tarefa"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
