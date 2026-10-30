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
  authHeaders,
  getSessionDisplayName,
  getSessionUserId,
  isStudentUser,
} from "@/src/utils/academicRole";
import { FiAlertCircle, FiBookOpen, FiRefreshCw } from "react-icons/fi";

export default function ProfessorDashboardPage() {
  const { user } = useAuth();

  // Estados principais
  const [classes, setClasses] = useState<ProfessorClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [projects, setProjects] = useState<ClassProject[]>([]);
  const [tasks, setTasks] = useState<ProfessorTask[]>([]);

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

  const professorName = useMemo(() => {
    return (
      user?.user?.name ||
      user?.name ||
      getSessionDisplayName() ||
      "Docente"
    );
  }, [user]);

  const professorFirstName = useMemo(() => {
    return professorName.split(" ")[0];
  }, [professorName]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const response = await api.get("/classes", { headers: authHeaders() });
      const rawClasses = Array.isArray(response.data) ? response.data : [];

      const fetchedClasses: ProfessorClass[] = rawClasses.map(
        (cls: RawClassResponse, index: number) => ({
          id: cls.id,
          anoEncerramento: cls.anoEncerramento,
          name: `Turma ${String.fromCharCode(65 + index)}`,
          _count: cls._count,
        }),
      );

      setClasses(fetchedClasses);
      setSelectedClassId(fetchedClasses.length > 0 ? fetchedClasses[0].id : null);
    } catch (err: unknown) {
      console.error("Erro ao buscar turmas:", err);
      setErrorMessage("Não foi possível carregar as turmas acadêmicas.");
      setClasses([]);
      setSelectedClassId(null);
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

        const res = await api.get(`/class/${selectedClassId}/users`, {
          headers: authHeaders(),
        });

        const rawUsers = res.data?.users || res.data || [];
        if (!Array.isArray(rawUsers)) {
          setStudents([]);
          return;
        }

        const mappedStudents: ClassStudent[] = rawUsers.map(
          (item: RawUserItem, idx: number) => {
            const u = item.usuario || item;
            return {
              id: u.id || item.fkUsuario || idx + 1,
              nome: u.nome || u.name || `Aluno ${idx + 1}`,
              email: u.email || "",
              sala: item.fkSala || selectedClassId || 0,
              cargoEscola: u.cargoEscola || u.cargo_escola,
            };
          },
        );

        setStudents(mappedStudents.filter((student) => isStudentUser(student)));
      } catch (err) {
        console.error("Erro ao carregar alunos da turma:", err);
        setStudents([]);
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
      setTasks([]);
      return;
    }

    if (loadingStudents) return;

    if (students.length === 0) {
      setProjects([]);
      setTasks([]);
      return;
    }

    async function fetchClassProjects() {
      try {
        setLoadingProjects(true);
        const headers = authHeaders();
        const res = await api.get("/project", { headers });
        const allProjects: RawProjectItem[] = Array.isArray(res.data)
          ? res.data
          : [];

        const studentIds = new Set(
          students
            .map((s) => Number(s.id))
            .filter((id) => !Number.isNaN(id) && id > 0),
        );

        const filtered = allProjects.filter((proj) => {
          if (!proj.usuarios || proj.usuarios.length === 0) return false;
          return proj.usuarios.some((member) =>
            studentIds.has(Number(member.usuario?.id || member.fkUsuario || 0)),
          );
        });

        const matchedProjects: ClassProject[] = await Promise.all(
          filtered.map(async (p) => {
            let pSprints: ProfessorSprint[] = [];
            let pTasks: ProfessorTask[] = [];

            try {
              const [pDetail, kDetail] = await Promise.all([
                api.get(`/project/${p.id}`, { headers }),
                api.get(`/kanban/${p.id}`, { headers }),
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
                    classId: selectedClassId || undefined,
                    comentarios: (t.comentarios || []).map(
                      (c: RawCommentItem) => ({
                        id: c.id,
                        conteudo: c.conteudo,
                        usuario: c.usuario,
                        createdAt: c.createdAt,
                      }),
                    ),
                  })),
                );
              }
            } catch (detailErr) {
              console.error(
                `Erro ao carregar detalhes do projeto ${p.id}:`,
                detailErr,
              );
            }

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
          }),
        );

        setProjects(matchedProjects);
        setTasks(matchedProjects.flatMap((p) => p.tarefas || []));
      } catch (err) {
        console.error("Erro ao carregar projetos da turma:", err);
        setProjects([]);
        setTasks([]);
      } finally {
        setLoadingProjects(false);
      }
    }

    fetchClassProjects();
  }, [selectedClassId, students, loadingStudents]);

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
    const targetProject =
      projects.find((p) => p.id === newTaskData.projectId) || projects[0];

    if (!targetProject) {
      throw new Error(
        "Não há projeto da turma para vincular a tarefa. O docente precisa ser membro do projeto.",
      );
    }

    const headers = authHeaders();
    const [pDetail, kDetail] = await Promise.all([
      api.get(`/project/${targetProject.id}`, { headers }),
      api.get(`/kanban/${targetProject.id}`, { headers }),
    ]);

    const firstSprint = pDetail.data?.sprints?.[0];
    const firstColumn = kDetail.data?.colunas?.[0];

    if (!firstSprint?.id || !firstColumn?.id) {
      throw new Error(
        "O projeto precisa ter sprint e kanban para receber uma nova tarefa.",
      );
    }

    const res = await api.post(
      "/task",
      {
        tituloTarefa: newTaskData.tituloTarefa,
        descricaoTarefa: newTaskData.descricaoTarefa,
        status: newTaskData.status,
        stack: newTaskData.stack || "Geral",
        prazoTarefa: new Date(newTaskData.prazoTarefa).toISOString(),
        fkColuna: firstColumn.id,
        fkSprint: firstSprint.id,
      },
      { headers },
    );

    const created = res.data?.data || res.data;
    const createdTask: ProfessorTask = {
      id: created.id,
      tituloTarefa: created.tituloTarefa || newTaskData.tituloTarefa,
      descricaoTarefa: created.descricaoTarefa || newTaskData.descricaoTarefa,
      status: created.status || newTaskData.status,
      stack: created.stack || newTaskData.stack,
      prazoTarefa: created.prazoTarefa || newTaskData.prazoTarefa,
      classId: selectedClassId || undefined,
      projectId: targetProject.id,
      projectTitle: targetProject.tituloProjeto,
      comentarios: [],
    };

    setTasks((prev) => [createdTask, ...prev]);
    setProjects((prev) =>
      prev.map((p) =>
        p.id === targetProject.id
          ? { ...p, tarefas: [createdTask, ...(p.tarefas || [])] }
          : p,
      ),
    );
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
      const userId =
        getSessionUserId() ||
        (user?.user?.id ? Number(user.user.id) : user?.id ? Number(user.id) : 0);

      const res = await api.post(
        `/task/${taskId}/comment`,
        { conteudo: content },
        { headers: authHeaders() },
      );

      const commentData = res.data?.data || res.data;
      const newComment: TaskComment = {
        id: commentData.id,
        conteudo: commentData.conteudo || content,
        fkTarefa: taskId,
        fkUsuario: commentData.usuario?.id || userId,
        usuario: commentData.usuario || {
          id: userId,
          nome: professorName,
          email: user?.user?.email || user?.email,
        },
        createdAt: commentData.createdAt || new Date().toISOString(),
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
      await api.delete(`/comment/${commentId}`, { headers: authHeaders() });

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
          subjectName="Acompanhamento acadêmico"
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
                  subjectName={currentClassName}
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
        projects={projects}
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
          getSessionUserId() ||
          (user?.user?.id
            ? Number(user.user.id)
            : user?.id
              ? Number(user.id)
              : undefined)
        }
      />
    </div>
  );
}
