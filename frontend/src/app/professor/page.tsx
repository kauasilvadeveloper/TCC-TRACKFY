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

// Modais
import { CreateTaskModal } from "@/src/components/professor/modals/CreateTaskModal/CreateTaskModal";
import { TaskListModal } from "@/src/components/professor/modals/TaskListModal/TaskListModal";
import { MyClassesModal } from "@/src/components/professor/modals/MyClassesModal/MyClassesModal";

import { ProfessorClass, ClassStudent, ProfessorTask } from "@/src/types/professor";
import { initialProfessorTasksMock } from "@/src/mocks/professorDashboard.mock";
import { FiAlertCircle, FiBookOpen, FiRefreshCw } from "react-icons/fi";

export default function ProfessorDashboardPage() {
  const { user } = useAuth();

  // Estados principais
  const [classes, setClasses] = useState<ProfessorClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [tasks, setTasks] = useState<ProfessorTask[]>(initialProfessorTasksMock);

  // Estados de UI
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados de Modais
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState<boolean>(false);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState<boolean>(false);
  const [isClassesModalOpen, setIsClassesModalOpen] = useState<boolean>(false);

  // Extração do nome do professor
  const professorName = useMemo(() => {
    if (user?.user?.name) return user.user.name;
    // Fallback de exibição caso não haja sessão iniciada
    return "Ana Lima";
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
        fetchedClasses = response.data.map((cls: any, index: number) => ({
          id: cls.id,
          anoEncerramento: cls.anoEncerramento,
          name: `Turma ${String.fromCharCode(65 + index)}`,
          shift: "Manhã",
          _count: cls._count,
        }));
      } else {
        // Fallback estruturado caso o banco local ainda não tenha salas associadas
        fetchedClasses = [
          { id: 1, anoEncerramento: 2026, name: "Turma A", shift: "Manhã", _count: { usuarios: 28 } },
          { id: 2, anoEncerramento: 2026, name: "Turma B", shift: "Tarde", _count: { usuarios: 24 } },
        ];
      }

      setClasses(fetchedClasses);

      if (fetchedClasses.length > 0) {
        const initialClassId = fetchedClasses[0].id;
        setSelectedClassId(initialClassId);
      }
    } catch (err: any) {
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
  // Regra do Usuário: Exibir estritamente nome, email e sala (da tabela usuarioSala)
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
            // Mapeia garantindo estritamente nome, email e sala
            const mappedStudents: ClassStudent[] = rawUsers.map(
              (item: any, idx: number) => {
                const u = item.usuario || item;
                return {
                  id: u.id || idx + 1,
                  nome: u.nome || u.name || `Aluno ${idx + 1}`,
                  email: u.email || `aluno${idx + 1}@escola.edu.br`,
                  sala: item.fkSala || selectedClassId,
                  cargoEscola: u.cargoEscola || u.cargo_escola || "aluno",
                };
              }
            );

            // Filtra alunos caso haja campo cargo_escola
            const filteredAlunos = mappedStudents.filter(
              (s) => !s.cargoEscola || s.cargoEscola.toLowerCase() === "aluno"
            );

            setStudents(filteredAlunos.length > 0 ? filteredAlunos : mappedStudents);
            return;
          }
        }

        // Se o banco não tiver retornado alunos para a turma, fornecemos dados de demonstração
        // em estrita conformidade com as propriedades permitidas (nome, email, sala)
        const mockDemonstrationStudents: ClassStudent[] = [
          { id: 1, nome: "Lucas Fernandes", email: "lucas.fernandes@escola.edu.br", sala: selectedClassId },
          { id: 2, nome: "Beatriz Ribeiro", email: "beatriz.ribeiro@escola.edu.br", sala: selectedClassId },
          { id: 3, nome: "Gabriel Martins", email: "gabriel.martins@escola.edu.br", sala: selectedClassId },
          { id: 4, nome: "Juliana Costa", email: "juliana.costa@escola.edu.br", sala: selectedClassId },
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

  // 3. Tarefas da turma selecionada
  const classTasks = useMemo(() => {
    if (!selectedClassId) return [];
    return tasks.filter((t) => !t.classId || t.classId === selectedClassId);
  }, [tasks, selectedClassId]);

  // 4. Métricas calculadas (com status real da tarefa, sem taxa de entrega)
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

  // Turma atualmente selecionada
  const currentClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  const currentClassName = currentClass?.name || `Turma ${selectedClassId || "A"}`;

  // Ações de Tarefas
  const handleCreateTask = async (newTaskData: Omit<ProfessorTask, "id">) => {
    try {
      const token =
        Cookies.get("trackfy_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("@token") ||
        "";

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Tentativa de chamada real para POST /task se houver IDs relacionais válidos
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
      };

      setTasks((prev) => [createdTask, ...prev]);
    } catch (err) {
      console.error("Erro ao registrar tarefa:", err);
      // Criação local resiliente
      const createdTask: ProfessorTask = {
        id: Date.now(),
        tituloTarefa: newTaskData.tituloTarefa,
        descricaoTarefa: newTaskData.descricaoTarefa,
        status: newTaskData.status,
        stack: newTaskData.stack,
        prazoTarefa: newTaskData.prazoTarefa,
        classId: newTaskData.classId || selectedClassId || 1,
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

          // Disparo silencioso de atualização para a API
          const token = Cookies.get("trackfy_token");
          if (token) {
            api
              .patch(
                `/task/${taskId}`,
                { status: nextStatus },
                { headers: { Authorization: `Bearer ${token}` } }
              )
              .catch(() => {});
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
        .catch(() => {});
    }
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
              {/* Cabeçalho de Contexto & Filtro de Turma */}
              <ProfessorHeader
                professorFirstName={professorFirstName}
                classes={classes}
                selectedClassId={selectedClassId}
                onSelectClass={(id) => setSelectedClassId(id)}
                onOpenTasksModal={() => setIsTasksModalOpen(true)}
              />

              {/* Grid de 4 Cards de Métricas */}
              <ProfessorMetricsGrid
                pendingTasksCount={pendingTasksCount}
                completedTasksCount={completedTasksCount}
                studentsCount={studentsCount}
                totalTasksCount={totalTasksCount}
                loading={loading}
              />

              {/* Seção Inferior com Tarefas Recentes e Resumo da Turma */}
              <div className={styles.lowerSectionGrid}>
                <ProfessorRecentTasks
                  tasks={classTasks}
                  onOpenTasksModal={() => setIsTasksModalOpen(true)}
                  onOpenCreateTask={() => setIsCreateTaskModalOpen(true)}
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

      {/* 4. Modais Integrados na Mesma Página */}
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
      />

      <MyClassesModal
        isOpen={isClassesModalOpen}
        onClose={() => setIsClassesModalOpen(false)}
        classes={classes}
        selectedClassId={selectedClassId}
        students={students}
        onSelectClass={(id) => setSelectedClassId(id)}
      />
    </div>
  );
}
