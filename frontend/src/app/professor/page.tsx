"use client";

import React, { useEffect, useState, useMemo } from "react";
import styles from "./page.module.scss";
import Cookies from "js-cookie";
import { api } from "@/src/services/api";
import { useAuth } from "@/src/context/AuthContext";
import { ProfessorNavbar } from "@/src/components/professor/ProfessorNavbar/ProfessorNavbar";
import { ProfessorSidebar } from "@/src/components/professor/ProfessorSidebar/ProfessorSidebar";
import { ProfessorHeader } from "@/src/components/professor/ProfessorHeader/ProfessorHeader";
import { ProfessorMetricsGrid } from "@/src/components/professor/ProfessorMetricsGrid/ProfessorMetricsGrid";
import { ProfessorRecentTasks } from "@/src/components/professor/ProfessorRecentTasks/ProfessorRecentTasks";
import { ProfessorClassSummary } from "@/src/components/professor/ProfessorClassSummary/ProfessorClassSummary";
import { ProfessorClassProjects } from "@/src/components/professor/ProfessorClassProjects/ProfessorClassProjects";

// Modais
import { CreateTaskModal } from "@/src/components/professor/modals/CreateTaskModal/CreateTaskModal";
import { TaskListModal } from "@/src/components/professor/modals/TaskListModal/TaskListModal";
import { MyClassesModal } from "@/src/components/professor/modals/MyClassesModal/MyClassesModal";
import { ProjectManageModal } from "@/src/components/professor/modals/ProjectManageModal/ProjectManageModal";
import { TaskDetailsModal } from "@/src/components/professor/modals/TaskDetailsModal/TaskDetailsModal";

import {
  ProfessorClass,
  ClassStudent,
  ProfessorTask,
  ClassProject,
  TaskComment,
  ProfessorSprint,
  RawClassResponse,
  RawUserItem,
  RawProjectItem,
  RawSprintItem,
  RawColumnItem,
  RawTaskItem,
  RawCommentItem,
} from "@/src/types/professor";
import {
  initialProfessorTasksMock,
  initialProfessorProjectsMock,
} from "@/src/mocks/professorDashboard.mock";
import { FiAlertCircle, FiBookOpen, FiRefreshCw } from "react-icons/fi";

export default function ProfessorDashboardPage() {
  const { user } = useAuth();

  // Estados principais
  const [classes, setClasses] = useState<ProfessorClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [projects, setProjects] = useState<ClassProject[]>([]);
  const [tasks, setTasks] = useState<ProfessorTask[]>(initialProfessorTasksMock);

  // Estados de UI
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados de Modais
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState<boolean>(false);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState<boolean>(false);
  const [isClassesModalOpen, setIsClassesModalOpen] = useState<boolean>(false);

  // Modais de Projeto e Detalhes da Tarefa
  const [selectedProject, setSelectedProject] = useState<ClassProject | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);

  const [selectedTask, setSelectedTask] = useState<ProfessorTask | null>(null);
  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState<boolean>(false);

  // Extração do nome do professor
  const professorName = useMemo(() => {
    if (user?.user?.name) return user.user.name;
    return "Prof. Ana Lima";
  }, [user]);

  const professorFirstName = useMemo(() => {
    return professorName.split(" ")[0];
  }, [professorName]);

  // 1. Busca inicial das turmas do professor (GET /classes)
  const fetchClasses = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const token =
        Cookies.get("trackfy_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("@token") ||
        "";

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await api.get("/classes", { headers }).catch(() => null);

      let fetchedClasses: ProfessorClass[] = [];

      if (response && Array.isArray(response.data) && response.data.length > 0) {
        fetchedClasses = response.data.map((cls: RawClassResponse, index: number) => ({
          id: cls.id,
          anoEncerramento: cls.anoEncerramento,
          name: `Turma ${String.fromCharCode(65 + index)}`,
          shift: "Manhã",
          _count: cls._count,
        }));
      } else {
        fetchedClasses = [
          { id: 1, anoEncerramento: 2026, name: "Turma A", shift: "Manhã", _count: { usuarios: 28 } },
          { id: 2, anoEncerramento: 2026, name: "Turma B", shift: "Tarde", _count: { usuarios: 24 } },
        ];
      }

      setClasses(fetchedClasses);

      if (fetchedClasses.length > 0) {
        setSelectedClassId(fetchedClasses[0].id);
      }
    } catch (err: unknown) {
      console.error("Erro ao buscar turmas:", err);
      setErrorMessage("Não foi possível carregar as turmas acadêmicas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // 2. Busca dos alunos da turma selecionada (GET /class/:id/users)
  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      return;
    }

    async function fetchStudentsByClass() {
      try {
        setLoadingStudents(true);
        const token =
          Cookies.get("trackfy_token") ||
          localStorage.getItem("token") ||
          localStorage.getItem("@token") ||
          "";

        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await api
          .get(`/class/${selectedClassId}/users`, { headers })
          .catch(() => null);

        if (res && res.data) {
          const rawUsers = res.data.users || res.data;
          if (Array.isArray(rawUsers) && rawUsers.length > 0) {
            const mappedStudents: ClassStudent[] = rawUsers.map(
              (item: RawUserItem, idx: number) => {
                const u = item.usuario || item;
                return {
                  id: u.id || idx + 1,
                  nome: u.nome || u.name || `Aluno ${idx + 1}`,
                  email: u.email || `aluno${idx + 1}@escola.edu.br`,
                  sala: item.fkSala || selectedClassId || 1,
                  cargoEscola: u.cargoEscola || u.cargo_escola || "aluno",
                };
              }
            );

            const filteredAlunos = mappedStudents.filter(
              (s) => !s.cargoEscola || s.cargoEscola.toLowerCase() === "aluno"
            );

            setStudents(filteredAlunos.length > 0 ? filteredAlunos : mappedStudents);
            return;
          }
        }

        const currentSala = selectedClassId || 1;
        const mockDemonstrationStudents: ClassStudent[] = [
          { id: 1, nome: "Lucas Fernandes", email: "lucas.fernandes@escola.edu.br", sala: currentSala },
          { id: 2, nome: "Beatriz Ribeiro", email: "beatriz.ribeiro@escola.edu.br", sala: currentSala },
          { id: 3, nome: "Gabriel Martins", email: "gabriel.martins@escola.edu.br", sala: currentSala },
          { id: 4, nome: "Juliana Costa", email: "juliana.costa@escola.edu.br", sala: currentSala },
        ];
        setStudents(mockDemonstrationStudents);
      } catch (err) {
        console.error("Erro ao carregar alunos da turma:", err);
      } finally {
        setLoadingStudents(false);
      }
    }

    fetchStudentsByClass();
  }, [selectedClassId]);

  // 3. Conexão Turma ➔ Alunos ➔ Projetos dos Alunos
  useEffect(() => {
    if (!selectedClassId) {
      setProjects([]);
      return;
    }

    async function fetchClassProjects() {
      try {
        setLoadingProjects(true);
        const token =
          Cookies.get("trackfy_token") ||
          localStorage.getItem("token") ||
          localStorage.getItem("@token") ||
          "";

        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Busca projetos gerais do usuário logado via GET /project
        const res = await api.get("/project", { headers }).catch(() => null);

        const studentIds = new Set(students.map((s) => s.id));

        let matchedProjects: ClassProject[] = [];

        if (res && Array.isArray(res.data) && res.data.length > 0) {
          // Filtra projetos que possuam algum aluno da turma selecionada
          const filtered = res.data.filter((proj: RawProjectItem) => {
            if (!proj.usuarios || proj.usuarios.length === 0) return false;
            return proj.usuarios.some((u) =>
              studentIds.has(u.usuario?.id || u.fkUsuario || 0)
            );
          });

          const targetProjects: RawProjectItem[] = filtered.length > 0 ? filtered : res.data;

          matchedProjects = await Promise.all(
            targetProjects.map(async (p: RawProjectItem) => {
              let pSprints: ProfessorSprint[] = [];
              let pTasks: ProfessorTask[] = [];

              try {
                const [pDetail, kDetail] = await Promise.all([
                  api.get(`/project/${p.id}`, { headers }).catch(() => null),
                  api.get(`/kanban/${p.id}`, { headers }).catch(() => null),
                ]);

                if (pDetail?.data?.sprints) {
                  pSprints = pDetail.data.sprints.map((s: RawSprintItem) => ({
                    id: s.id,
                    tituloSprint: s.tituloSprint,
                    descricaoSprint: s.descricaoSprint,
                    prazoSprint: s.prazoSprint,
                  }));
                }

                if (kDetail?.data?.colunas) {
                  pTasks = kDetail.data.colunas.flatMap((col: RawColumnItem) =>
                    (col.tarefas || []).map((t: RawTaskItem) => ({
                      id: t.id,
                      tituloTarefa: t.tituloTarefa,
                      descricaoTarefa: t.descricaoTarefa,
                      status: t.status,
                      stack: t.stack,
                      prazoTarefa: t.prazoTarefa,
                      projectId: p.id,
                      projectTitle: p.tituloProjeto,
                      comentarios: (t.comentarios || []).map((c: RawCommentItem) => ({
                        id: c.id,
                        conteudo: c.conteudo,
                        usuario: c.usuario,
                        createdAt: c.createdAt || new Date().toISOString(),
                      })),
                    }))
                  );
                }
              } catch { }

              return {
                id: p.id,
                tituloProjeto: p.tituloProjeto,
                descricao: p.descricao,
                prazo: p.prazo,
                tokenGithub: p.tokenGithub,
                classId: selectedClassId || undefined,
                usuarios: p.usuarios || [],
                sprints: pSprints,
                tarefas: pTasks,
              };
            })
          );
        }

        // Caso a API não tenha projetos vinculados ao banco para os alunos, usa os mocks associados
        if (matchedProjects.length === 0) {
          const fallback = initialProfessorProjectsMock.filter(
            (p) => !p.classId || p.classId === selectedClassId
          );
          matchedProjects = fallback.length > 0 ? fallback : initialProfessorProjectsMock.slice(0, 2);
        }

        setProjects(matchedProjects);

        // Agrega as tarefas dos projetos para exibição sincronizada
        const aggregatedTasks = matchedProjects.flatMap((p) => p.tarefas || []);
        if (aggregatedTasks.length > 0) {
          setTasks(aggregatedTasks);
        }
      } catch (err) {
        console.error("Erro ao carregar projetos da turma:", err);
        const fallback = initialProfessorProjectsMock.filter(
          (p) => !p.classId || p.classId === selectedClassId
        );
        setProjects(fallback);
      } finally {
        setLoadingProjects(false);
      }
    }

    fetchClassProjects();
  }, [selectedClassId, students]);

  // 4. Tarefas da turma selecionada
  const classTasks = useMemo(() => {
    if (!selectedClassId) return [];
    return tasks.filter((t) => !t.classId || t.classId === selectedClassId);
  }, [tasks, selectedClassId]);

  // 5. Métricas calculadas
  const pendingTasksCount = useMemo(() => {
    return classTasks.filter((t) => {
      const s = t.status.toLowerCase();
      return s.includes("pendente") || s.includes("andamento") || s === "in_progress";
    }).length;
  }, [classTasks]);

  const completedTasksCount = useMemo(() => {
    return classTasks.filter((t) => {
      const s = t.status.toLowerCase();
      return s.includes("conclu") || s === "done";
    }).length;
  }, [classTasks]);

  const studentsCount = students.length;
  const totalTasksCount = classTasks.length;

  const currentClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  const currentClassName = currentClass?.name || `Turma ${selectedClassId || "A"}`;

  // ─── AÇÕES DE TAREFAS & STATUS ───
  const handleCreateTask = async (newTaskData: Omit<ProfessorTask, "id">) => {
    try {
      const token =
        Cookies.get("trackfy_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("@token") ||
        "";

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const payload = {
        tituloTarefa: newTaskData.tituloTarefa,
        descricaoTarefa: newTaskData.descricaoTarefa,
        status: newTaskData.status,
        stack: newTaskData.stack || "Geral",
        prazoTarefa: new Date(newTaskData.prazoTarefa).toISOString(),
        fkColuna: 1,
        fkSprint: 1,
      };

      const res = await api.post("/task", payload, { headers }).catch(() => null);

      const createdTask: ProfessorTask = {
        id: res?.data?.id || Date.now(),
        tituloTarefa: newTaskData.tituloTarefa,
        descricaoTarefa: newTaskData.descricaoTarefa,
        status: newTaskData.status,
        stack: newTaskData.stack,
        prazoTarefa: newTaskData.prazoTarefa,
        classId: newTaskData.classId || selectedClassId || 1,
        comentarios: [],
      };

      setTasks((prev) => [createdTask, ...prev]);
    } catch (err) {
      console.error("Erro ao registrar tarefa:", err);
      const createdTask: ProfessorTask = {
        id: Date.now(),
        tituloTarefa: newTaskData.tituloTarefa,
        descricaoTarefa: newTaskData.descricaoTarefa,
        status: newTaskData.status,
        stack: newTaskData.stack,
        prazoTarefa: newTaskData.prazoTarefa,
        classId: newTaskData.classId || selectedClassId || 1,
        comentarios: [],
      };
      setTasks((prev) => [createdTask, ...prev]);
    }
  };

  const handleToggleStatus = async (taskId: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus =
            t.status.toLowerCase().includes("conclu") || t.status === "done"
              ? "pendente"
              : "concluída";

          const token = Cookies.get("trackfy_token");
          if (token) {
            api
              .patch(
                `/task/${taskId}`,
                { status: nextStatus },
                { headers: { Authorization: `Bearer ${token}` } }
              )
              .catch(() => { });
          }

          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = async (taskId: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    const token = Cookies.get("trackfy_token");
    if (token) {
      api
        .delete(`/task/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch(() => { });
    }
  };

  // ─── AÇÕES DE EDIÇÃO DE PRAZO DE TAREFA ───
  const handleUpdateTaskDeadline = async (taskId: number, newDeadline: string) => {
    try {
      const token =
        Cookies.get("trackfy_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("@token") ||
        "";

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const updatedPrazoIso = new Date(newDeadline).toISOString();

      await api
        .patch(
          `/task/${taskId}`,
          { prazoTarefa: updatedPrazoIso },
          { headers }
        )
        .catch(() => null);

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, prazoTarefa: updatedPrazoIso } : t
        )
      );

      setSelectedTask((prev) =>
        prev && prev.id === taskId
          ? { ...prev, prazoTarefa: updatedPrazoIso }
          : prev
      );

      setProjects((prev) =>
        prev.map((p) => ({
          ...p,
          tarefas: p.tarefas?.map((t) =>
            t.id === taskId ? { ...t, prazoTarefa: updatedPrazoIso } : t
          ),
        }))
      );

      setSelectedProject((prev) =>
        prev
          ? {
            ...prev,
            tarefas: prev.tarefas?.map((t) =>
              t.id === taskId ? { ...t, prazoTarefa: updatedPrazoIso } : t
            ),
          }
          : null
      );
    } catch (err) {
      console.error("Erro ao atualizar prazo da tarefa:", err);
    }
  };

  // ─── AÇÕES DE COMENTÁRIOS DE TAREFAS ───
  const handleAddComment = async (taskId: number, content: string) => {
    try {
      const token =
        Cookies.get("trackfy_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("@token") ||
        "";

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const userId = user?.user?.id ? Number(user.user.id) : (user?.id ? Number(user.id) : 99);

      const res = await api
        .post(
          `/task/${taskId}/comment`,
          { conteudo: content, userId },
          { headers }
        )
        .catch(() => null);

      const newComment: TaskComment = {
        id: res?.data?.id || Date.now(),
        conteudo: content,
        fkTarefa: taskId,
        fkUsuario: userId,
        usuario: {
          id: userId,
          nome: professorName,
          email: user?.user?.email || "professor@trackfy.edu",
        },
        createdAt: new Date().toISOString(),
      };

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, comentarios: [...(t.comentarios || []), newComment] }
            : t
        )
      );

      setSelectedTask((prev) =>
        prev && prev.id === taskId
          ? { ...prev, comentarios: [...(prev.comentarios || []), newComment] }
          : prev
      );

      setProjects((prev) =>
        prev.map((p) => ({
          ...p,
          tarefas: p.tarefas?.map((t) =>
            t.id === taskId
              ? { ...t, comentarios: [...(t.comentarios || []), newComment] }
              : t
          ),
        }))
      );

      setSelectedProject((prev) =>
        prev
          ? {
            ...prev,
            tarefas: prev.tarefas?.map((t) =>
              t.id === taskId
                ? { ...t, comentarios: [...(t.comentarios || []), newComment] }
                : t
            ),
          }
          : null
      );
    } catch (err) {
      console.error("Erro ao adicionar comentário:", err);
    }
  };

  const handleDeleteComment = async (commentId: number, taskId: number) => {
    try {
      const token =
        Cookies.get("trackfy_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("@token") ||
        "";

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await api.delete(`/comment/${commentId}`, { headers }).catch(() => null);

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
              ...t,
              comentarios: (t.comentarios || []).filter(
                (c) => c.id !== commentId
              ),
            }
            : t
        )
      );

      setSelectedTask((prev) =>
        prev && prev.id === taskId
          ? {
            ...prev,
            comentarios: (prev.comentarios || []).filter(
              (c) => c.id !== commentId
            ),
          }
          : prev
      );

      setProjects((prev) =>
        prev.map((p) => ({
          ...p,
          tarefas: p.tarefas?.map((t) =>
            t.id === taskId
              ? {
                ...t,
                comentarios: (t.comentarios || []).filter(
                  (c) => c.id !== commentId
                ),
              }
              : t
          ),
        }))
      );

      setSelectedProject((prev) =>
        prev
          ? {
            ...prev,
            tarefas: prev.tarefas?.map((t) =>
              t.id === taskId
                ? {
                  ...t,
                  comentarios: (t.comentarios || []).filter(
                    (c) => c.id !== commentId
                  ),
                }
                : t
            ),
          }
          : null
      );
    } catch (err) {
      console.error("Erro ao excluir comentário:", err);
    }
  };

  // ─── AÇÕES DE EDIÇÃO DE PRAZO DE SPRINT ───
  const handleUpdateSprintDeadline = async (
    sprintId: number,
    newDeadline: string
  ) => {
    try {
      const token =
        Cookies.get("trackfy_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("@token") ||
        "";

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const updatedDeadlineIso = new Date(newDeadline).toISOString();

      await api
        .patch(
          `/sprint/${sprintId}`,
          { prazoSprint: updatedDeadlineIso },
          { headers }
        )
        .catch(() => null);

      setProjects((prev) =>
        prev.map((p) => ({
          ...p,
          sprints: p.sprints?.map((s) =>
            s.id === sprintId ? { ...s, prazoSprint: updatedDeadlineIso } : s
          ),
        }))
      );

      setSelectedProject((prev) =>
        prev
          ? {
            ...prev,
            sprints: prev.sprints?.map((s) =>
              s.id === sprintId ? { ...s, prazoSprint: updatedDeadlineIso } : s
            ),
          }
          : null
      );
    } catch (err) {
      console.error("Erro ao atualizar prazo da sprint:", err);
    }
  };

  // Disparo para abrir modal de gerenciar projeto
  const handleOpenProjectManage = (project: ClassProject) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };

  // Disparo para abrir modal de detalhes da tarefa
  const handleOpenTaskDetails = (task: ProfessorTask) => {
    setSelectedTask(task);
    setIsTaskDetailsModalOpen(true);
  };

  return (
    <div className={styles.layout}>
      {/* 1. Barra de Navegação Superior */}
      <ProfessorNavbar
        professorName={professorName}
        onOpenCreateTask={() => setIsCreateTaskModalOpen(true)}
      />

      <div className={styles.bodyWrapper}>
        {/* 2. Menu Lateral Esquerdo */}
        <ProfessorSidebar
          professorName={professorName}
          subjectName="Desenvolvimento Web"
          taskCount={pendingTasksCount}
          onOpenTasksModal={() => setIsTasksModalOpen(true)}
          onOpenClassesModal={() => setIsClassesModalOpen(true)}
        />

        {/* 3. Conteúdo Principal */}
        <main className={styles.mainContent}>
          {errorMessage && (
            <div className={styles.errorBanner}>
              <FiAlertCircle />
              <span>{errorMessage}</span>
              <button
                type="button"
                className={styles.retryBtn}
                onClick={fetchClasses}
              >
                <FiRefreshCw /> Tentar novamente
              </button>
            </div>
          )}

          {/* Estado de tela vazia quando não há turmas cadastradas */}
          {!loading && classes.length === 0 ? (
            <div className={styles.globalEmptyState}>
              <div className={styles.globalEmptyIcon}>
                <FiBookOpen />
              </div>
              <h3>Nenhuma turma vinculada ao seu perfil</h3>
              <p>
                Você ainda não foi alocado em nenhuma turma ativa. Entre em contato com
                a coordenação acadêmica para vincular suas salas.
              </p>
            </div>
          ) : (
            <>
              {/* Cabeçalho de Contexto & Filtro de Turma (Select) */}
              <ProfessorHeader
                professorFirstName={professorFirstName}
                classes={classes}
                selectedClassId={selectedClassId}
                onSelectClass={(id) => setSelectedClassId(id)}
                onOpenTasksModal={() => setIsTasksModalOpen(true)}
              />

              {/* Grid de Cards de Métricas */}
              <ProfessorMetricsGrid
                pendingTasksCount={pendingTasksCount}
                completedTasksCount={completedTasksCount}
                studentsCount={studentsCount}
                totalTasksCount={totalTasksCount}
                loading={loading}
              />

              {/* Seção Superior: Projetos da Turma Selecionada */}
              <ProfessorClassProjects
                projects={projects}
                classNameTitle={currentClassName}
                onOpenProjectManage={handleOpenProjectManage}
                onOpenTaskDetails={handleOpenTaskDetails}
                loading={loadingProjects}
              />

              {/* Seção Inferior com Tarefas Recentes e Resumo da Turma */}
              <div className={styles.lowerSectionGrid}>
                <ProfessorRecentTasks
                  tasks={classTasks}
                  onOpenTasksModal={() => setIsTasksModalOpen(true)}
                  onOpenCreateTask={() => setIsCreateTaskModalOpen(true)}
                  onOpenTaskDetails={handleOpenTaskDetails}
                  loading={loading}
                />

                <ProfessorClassSummary
                  classNameTitle={currentClassName}
                  subjectName="Desenvolvimento Web"
                  students={students}
                  selectedClassId={selectedClassId}
                  onOpenTasksModal={() => setIsTasksModalOpen(true)}
                  loading={loadingStudents}
                />
              </div>
            </>
          )}
        </main>
      </div>

      {/* 4. Modais Integrados */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        classes={classes}
        selectedClassId={selectedClassId}
        onCreateTask={handleCreateTask}
      />

      <TaskListModal
        isOpen={isTasksModalOpen}
        onClose={() => setIsTasksModalOpen(false)}
        tasks={classTasks}
        classNameTitle={currentClassName}
        onOpenCreateTask={() => setIsCreateTaskModalOpen(true)}
        onToggleStatus={handleToggleStatus}
        onDeleteTask={handleDeleteTask}
        onOpenTaskDetails={handleOpenTaskDetails}
      />

      <MyClassesModal
        isOpen={isClassesModalOpen}
        onClose={() => setIsClassesModalOpen(false)}
        classes={classes}
        selectedClassId={selectedClassId}
        students={students}
        onSelectClass={(id) => setSelectedClassId(id)}
      />

      <ProjectManageModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        onUpdateSprintDeadline={handleUpdateSprintDeadline}
        onOpenTaskDetails={handleOpenTaskDetails}
      />

      <TaskDetailsModal
        isOpen={isTaskDetailsModalOpen}
        onClose={() => {
          setIsTaskDetailsModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onUpdateDeadline={handleUpdateTaskDeadline}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        currentUserId={
          user?.user?.id
            ? Number(user.user.id)
            : user?.id
            ? Number(user.id)
            : undefined
        }
      />
    </div>
  );
}
