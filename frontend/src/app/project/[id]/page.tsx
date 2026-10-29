"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.scss";
import { api } from "@/src/services/api";
import Cookies from "js-cookie";
import {
  FiArrowLeft, FiPlus, FiAlertCircle, FiCheckCircle,
  FiUsers, FiCalendar, FiLayers, FiCheckSquare,
  FiBarChart2, FiX, FiTag, FiCheck, FiGrid,
  FiMessageSquare, FiTrash2, FiLock, FiChevronRight, FiEdit2,
} from "react-icons/fi";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(dateStr?: string): string {
  if (!dateStr) return "Sem prazo";
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

function toInputDate(dateStr?: string): string {
  if (!dateStr) return "";
  try { return new Date(dateStr).toISOString().split("T")[0]; } catch { return ""; }
}

function getSprintStatus(sprint: any): { label: string; color: string } {
  if (!sprint?.prazoSprint) return { label: "Sem prazo", color: "#64748b" };
  return new Date(sprint.prazoSprint) >= new Date()
    ? { label: "Ativa", color: "#10b981" }
    : { label: "Encerrada", color: "#f87171" };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProjectDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id;

  // ── Core state
  const [project, setProject] = useState<any>(null);
  const [sprints, setSprints] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── UI
  const [activeTab, setActiveTab] = useState<"overview" | "sprints" | "tasks" | "kanban">("overview");
  const [userRole, setUserRole] = useState("aluno");

  // ── Drag & Drop
  const [draggingTaskId, setDraggingTaskId] = useState<number | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<number | null>(null);

  // ── Create Sprint Modal
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [newSprintTitle, setNewSprintTitle] = useState("");
  const [newSprintDeadline, setNewSprintDeadline] = useState("");
  const [newSprintDesc, setNewSprintDesc] = useState("");
  const [sprintDateErr, setSprintDateErr] = useState<string | null>(null);
  const [isSubmittingSprint, setIsSubmittingSprint] = useState(false);

  // ── Create Task Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [newTaskStack, setNewTaskStack] = useState("React / Next.js");
  const [newTaskStatus, setNewTaskStatus] = useState("Pendente");
  const [newTaskSprintId, setNewTaskSprintId] = useState("");
  const [newTaskMemberIds, setNewTaskMemberIds] = useState<number[]>([]);
  const [taskCreateDateErr, setTaskCreateDateErr] = useState<string | null>(null);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // ── Sprint Detail Modal
  const [selectedSprint, setSelectedSprint] = useState<any>(null);
  const [isSprintDetailOpen, setIsSprintDetailOpen] = useState(false);
  const [editSprintTitle, setEditSprintTitle] = useState("");
  const [editSprintDeadline, setEditSprintDeadline] = useState("");
  const [editSprintDesc, setEditSprintDesc] = useState("");
  const [editSprintDateErr, setEditSprintDateErr] = useState<string | null>(null);
  const [isSubmittingSprintEdit, setIsSubmittingSprintEdit] = useState(false);

  // ── Task Detail Modal
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [taskDetailTab, setTaskDetailTab] = useState<"details" | "comments">("details");
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDesc, setEditTaskDesc] = useState("");
  const [editTaskDeadline, setEditTaskDeadline] = useState("");
  const [editTaskStack, setEditTaskStack] = useState("React / Next.js");
  const [editTaskStatus, setEditTaskStatus] = useState("Pendente");
  const [editTaskSprintId, setEditTaskSprintId] = useState("");
  const [editTaskMemberIds, setEditTaskMemberIds] = useState<number[]>([]);
  const [editTaskDateErr, setEditTaskDateErr] = useState<string | null>(null);
  const [isSubmittingTaskEdit, setIsSubmittingTaskEdit] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // ── Create Kanban Modal
  const [isKanbanModalOpen, setIsKanbanModalOpen] = useState(false);
  const [newKanbanName, setNewKanbanName] = useState("");
  const [isSubmittingKanban, setIsSubmittingKanban] = useState(false);

  // ─── Derived ──────────────────────────────────────────────────────────────
  const isProfessor = userRole.toLowerCase() === "professor";

  const projectMaxDate = (() => {
    const d = project?.prazo || project?.term;
    if (!d) return "";
    return toInputDate(d);
  })();

  const projectMembers = (project?.usuarios || [])
    .map((u: any) => u.usuario).filter(Boolean);

  const pendingCount = tasks.filter((t) => {
    const s = (t.status || "").toLowerCase();
    return !s.includes("conclu") && s !== "done";
  }).length;

  const doneCount = tasks.filter((t) => {
    const s = (t.status || "").toLowerCase();
    return s.includes("conclu") || s === "done";
  }).length;

  const activeSprint = (() => {
    const now = new Date();
    const future = sprints.filter((s) => s.prazoSprint && new Date(s.prazoSprint) >= now);
    if (!future.length) return null;
    return future.reduce((a: any, b: any) =>
      new Date(a.prazoSprint) < new Date(b.prazoSprint) ? a : b
    );
  })();

  const getTasksByCol = (colId: number) =>
    tasks.filter((t: any) => t.fkColuna === colId);

  const getSprintMaxDate = (sid: string | number) => {
    const s = sprints.find((x: any) => String(x.id) === String(sid));
    return s?.prazoSprint ? toInputDate(s.prazoSprint) : "";
  };

  const getToken = () => Cookies.get("trackfy_token") || "";
  const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

  // ─── Role detection ────────────────────────────────────────────────────────
  useEffect(() => {
    const raw = Cookies.get("trackfy_user");
    if (raw) {
      try {
        const p = JSON.parse(raw);
        setUserRole(p.cargoEscola || p.role || "aluno");
      } catch { }
    }
  }, []);

  // ─── Fetch data ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      if (!projectId) { setLoading(false); return; }
      if (!getToken()) { router.push("/"); return; }
      try {
        setLoading(true);
        const h = authHeaders();
        const pRes = await api.get(`/project/${projectId}`, { headers: h });
        setProject(pRes.data);
        setSprints(Array.isArray(pRes.data?.sprints) ? pRes.data.sprints : []);

        try {
          const kRes = await api.get(`/kanban/${projectId}`, { headers: h });
          const cols = kRes.data?.colunas || [];
          setColumns(cols);
          setTasks(cols.flatMap((col: any) =>
            (col.tarefas || []).map((t: any) => ({
              ...t, fkColuna: col.id, colunaNome: col.tituloColuna,
            }))
          ));
        } catch (kErr: any) {
          if (kErr?.response?.status === 404) {
            try {
              const kNew = await api.post("/kanban",
                { tituloKanban: "Quadro Principal", fkProjeto: Number(projectId) },
                { headers: h }
              );
              if (kNew.data?.id) {
                const kid = kNew.data.id;
                const [c1, c2, c3] = await Promise.all([
                  api.post("/kanban/column", { tituloColuna: "A Fazer", fkKanban: kid }, { headers: h }),
                  api.post("/kanban/column", { tituloColuna: "Em Andamento", fkKanban: kid }, { headers: h }),
                  api.post("/kanban/column", { tituloColuna: "Concluído", fkKanban: kid }, { headers: h }),
                ]);
                setColumns([c1.data, c2.data, c3.data]);
                setProject((p: any) => ({ ...p, kanbans: [...(p?.kanbans || []), kNew.data] }));
              }
            } catch { }
          }
        }
      } catch (err: any) {
        if (err?.response?.status === 401) { localStorage.clear(); router.push("/"); return; }
        setErrorMessage("Não foi possível carregar os dados do projeto.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  // ─── Drag & Drop ──────────────────────────────────────────────────────────
  const handleDrop = async (e: React.DragEvent, targetCol: any) => {
    e.preventDefault();
    setDragOverColumnId(null);
    if (!draggingTaskId || !targetCol?.id) return;
    const task = tasks.find((t: any) => t.id === draggingTaskId);
    if (!task || task.fkColuna === targetCol.id) { setDraggingTaskId(null); return; }
    const prev = [...tasks];
    setTasks((ts) => ts.map((t: any) =>
      t.id === draggingTaskId
        ? { ...t, fkColuna: targetCol.id, colunaNome: targetCol.tituloColuna, status: targetCol.tituloColuna }
        : t
    ));
    try {
      await api.patch(`/task/${draggingTaskId}/move`,
        { targetColumnId: targetCol.id },
        { headers: authHeaders() }
      );
    } catch {
      setTasks(prev);
      alert("Erro ao mover tarefa. Tente novamente.");
    } finally {
      setDraggingTaskId(null);
    }
  };

  // ─── Sprint handlers ───────────────────────────────────────────────────────
  const onSprintDeadlineChange = (val: string) => {
    setNewSprintDeadline(val);
    setSprintDateErr(projectMaxDate && val > projectMaxDate
      ? `A sprint não pode ultrapassar o prazo do projeto (${formatDate(projectMaxDate)}).`
      : null
    );
  };

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSprintTitle.trim() || !newSprintDeadline || sprintDateErr) return;
    try {
      setIsSubmittingSprint(true);
      const res = await api.post("/sprint", {
        tituloSprint: newSprintTitle.trim(),
        prazoSprint: new Date(newSprintDeadline + "T23:59:59").toISOString(),
        descricaoSprint: newSprintDesc.trim() || undefined,
      }, { headers: authHeaders() });
      setSprints((p) => [...p, res.data]);
      setNewSprintTitle(""); setNewSprintDeadline(""); setNewSprintDesc(""); setSprintDateErr(null);
      setIsSprintModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Erro ao criar sprint.");
    } finally {
      setIsSubmittingSprint(false);
    }
  };

  const openSprintDetail = (sprint: any) => {
    setSelectedSprint(sprint);
    setEditSprintTitle(sprint.tituloSprint || "");
    setEditSprintDeadline(toInputDate(sprint.prazoSprint));
    setEditSprintDesc(sprint.descricaoSprint || "");
    setEditSprintDateErr(null);
    setIsSprintDetailOpen(true);
  };

  const onEditSprintDeadline = (val: string) => {
    setEditSprintDeadline(val);
    setEditSprintDateErr(projectMaxDate && val > projectMaxDate
      ? `A sprint não pode ultrapassar o prazo do projeto (${formatDate(projectMaxDate)}).`
      : null
    );
  };

  const handleUpdateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSprint || editSprintDateErr) return;
    try {
      setIsSubmittingSprintEdit(true);
      const payload: any = {
        tituloSprint: editSprintTitle.trim(),
        descricaoSprint: editSprintDesc.trim() || undefined,
      };
      if (isProfessor && editSprintDeadline) {
        payload.prazoSprint = new Date(editSprintDeadline + "T23:59:59").toISOString();
      }
      const res = await api.patch(`/sprint/${selectedSprint.id}`, payload, { headers: authHeaders() });
      setSprints((p) => p.map((s: any) => s.id === selectedSprint.id ? { ...s, ...res.data } : s));
      setIsSprintDetailOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Erro ao atualizar sprint.");
    } finally {
      setIsSubmittingSprintEdit(false);
    }
  };

  // ─── Task handlers ─────────────────────────────────────────────────────────
  const onTaskDeadlineChange = (val: string) => {
    setNewTaskDeadline(val);
    const max = getSprintMaxDate(newTaskSprintId);
    setTaskCreateDateErr(max && val > max
      ? `O prazo não pode ultrapassar o prazo da sprint (${formatDate(max)}).`
      : null
    );
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskDeadline || !newTaskSprintId || taskCreateDateErr) return;
    let colId = columns[0]?.id;
    if (!colId) {
      try {
        const kr = await api.get(`/kanban/${projectId}`, { headers: authHeaders() });
        if (kr.data?.colunas?.length) { colId = kr.data.colunas[0].id; setColumns(kr.data.colunas); }
      } catch { }
    }
    if (!colId) { alert("Sem coluna disponível no quadro."); return; }
    try {
      setIsSubmittingTask(true);
      const res = await api.post("/task", {
        tituloTarefa: newTaskTitle.trim(),
        descricaoTarefa: newTaskDesc.trim() || undefined,
        status: newTaskStatus,
        stack: newTaskStack,
        prazoTarefa: new Date(newTaskDeadline + "T23:59:59").toISOString(),
        fkSprint: Number(newTaskSprintId),
        fkColuna: Number(colId),
        usuarioIds: newTaskMemberIds.length > 0 ? newTaskMemberIds : undefined,
      }, { headers: authHeaders() });
      setTasks((p) => [...p, { ...res.data, fkColuna: colId, colunaNome: columns[0]?.tituloColuna }]);
      setNewTaskTitle(""); setNewTaskDesc(""); setNewTaskDeadline("");
      setNewTaskStack("React / Next.js"); setNewTaskStatus("Pendente");
      setNewTaskSprintId(""); setNewTaskMemberIds([]); setTaskCreateDateErr(null);
      setIsTaskModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Erro ao criar tarefa.");
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const openTaskDetail = (task: any) => {
    setSelectedTask(task);
    setEditTaskTitle(task.tituloTarefa || "");
    setEditTaskDesc(task.descricaoTarefa || "");
    setEditTaskDeadline(toInputDate(task.prazoTarefa));
    setEditTaskStack(task.stack || "React / Next.js");
    setEditTaskStatus(task.status || "Pendente");
    setEditTaskSprintId(String(task.fkSprint || ""));
    setEditTaskMemberIds((task.usuarios || []).map((u: any) => u.usuario?.id || u.id).filter(Boolean));
    setEditTaskDateErr(null);
    setDeleteConfirmOpen(false);
    setTaskDetailTab("details");
    setNewComment("");
    setIsTaskDetailOpen(true);
  };

  const onEditTaskDeadline = (val: string) => {
    setEditTaskDeadline(val);
    const max = getSprintMaxDate(editTaskSprintId);
    setEditTaskDateErr(max && val > max
      ? `O prazo não pode ultrapassar o prazo da sprint (${formatDate(max)}).`
      : null
    );
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || editTaskDateErr) return;
    try {
      setIsSubmittingTaskEdit(true);
      const payload: any = {
        tituloTarefa: editTaskTitle.trim(),
        descricaoTarefa: editTaskDesc.trim() || undefined,
        status: editTaskStatus,
        stack: editTaskStack,
        fkSprint: editTaskSprintId ? Number(editTaskSprintId) : undefined,
        usuarioIds: editTaskMemberIds,
      };
      if (isProfessor && editTaskDeadline) {
        payload.prazoTarefa = new Date(editTaskDeadline + "T23:59:59").toISOString();
      }
      const res = await api.patch(`/task/${selectedTask.id}`, payload, { headers: authHeaders() });
      setTasks((p) => p.map((t: any) => t.id === selectedTask.id ? { ...t, ...res.data } : t));
      setIsTaskDetailOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Erro ao atualizar tarefa.");
    } finally {
      setIsSubmittingTaskEdit(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    try {
      await api.delete(`/task/${selectedTask.id}`, { headers: authHeaders() });
      setTasks((p) => p.filter((t: any) => t.id !== selectedTask.id));
      setIsTaskDetailOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Erro ao excluir tarefa.");
    }
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTask) return;
    try {
      setIsSubmittingComment(true);
      const res = await api.post(
        `/task/${selectedTask.id}/comment`,
        { conteudo: newComment.trim() },
        { headers: authHeaders() }
      );
      const commentData = res.data?.data || res.data;
      setSelectedTask((p: any) => ({
        ...p,
        comentarios: [...(p.comentarios || []), commentData],
      }));
      setNewComment("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Erro ao criar comentário.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // ─── Kanban creation ───────────────────────────────────────────────────────
  const handleCreateKanban = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKanbanName.trim()) return;
    try {
      setIsSubmittingKanban(true);
      const res = await api.post("/kanban",
        { tituloKanban: newKanbanName.trim(), fkProjeto: Number(projectId) },
        { headers: authHeaders() }
      );
      if (res.data?.id) {
        const kid = res.data.id;
        await Promise.all([
          api.post("/kanban/column", { tituloColuna: "A Fazer", fkKanban: kid }, { headers: authHeaders() }),
          api.post("/kanban/column", { tituloColuna: "Em Andamento", fkKanban: kid }, { headers: authHeaders() }),
          api.post("/kanban/column", { tituloColuna: "Concluído", fkKanban: kid }, { headers: authHeaders() }),
        ]);
      }
      setProject((p: any) => ({ ...p, kanbans: [...(p?.kanbans || []), res.data] }));
      setNewKanbanName("");
      setIsKanbanModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Erro ao criar quadro.");
    } finally {
      setIsSubmittingKanban(false);
    }
  };

  // ─── Loading / Error ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.container} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p style={{ color: "#94a3b8" }}>Carregando painel do projeto...</p>
      </div>
    );
  }

  if (errorMessage || !project) {
    return (
      <div className={styles.container} style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "1rem", height: "100vh" }}>
        <p style={{ color: "#f87171" }}>{errorMessage || "Projeto não encontrado."}</p>
        <Link href="/dashboard" style={{ color: "#3b82f6", textDecoration: "underline" }}>Voltar para o Dashboard</Link>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  const openTask = (task: any) => {
    if (!newTaskSprintId && sprints.length > 0) setNewTaskSprintId(String(sprints[0].id));
    setIsTaskModalOpen(true);
  };
  const guardedOpenTask = () => {
    if (sprints.length === 0) { alert("Crie ao menos uma sprint antes de adicionar tarefas."); setIsSprintModalOpen(true); return; }
    if (!newTaskSprintId && sprints.length > 0) setNewTaskSprintId(String(sprints[0].id));
    setIsTaskModalOpen(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>

        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <Link href="/dashboard" className={styles.backLink}><FiArrowLeft /> Projetos</Link>
            <div className={styles.projectTitleRow}>
              <h1>{project.title || project.tituloProjeto}</h1>
              <span>
                <FiCalendar />
                Prazo: {formatDate(project?.prazo || project?.term)}
              </span>
            </div>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.newProjectBtn} onClick={() => router.push("/project/newProject")}>
              <FiPlus /> Novo Projeto
            </button>
          </div>
        </header>

        {/* ─── Tabs ───────────────────────────────────────────────────────── */}
        <div className={styles.navTabsContainer}>
          {([
            { key: "overview", icon: <FiBarChart2 />, label: "Visão Geral" },
            { key: "sprints", icon: <FiLayers />, label: `Sprints (${sprints.length})` },
            { key: "tasks", icon: <FiCheckSquare />, label: `Tarefas (${tasks.length})` },
            { key: "kanban", icon: <FiGrid />, label: "Kanban" },
          ] as const).map(({ key, icon, label }) => (
            <button
              key={key}
              className={`${styles.tabBtn} ${activeTab === key ? styles.activeTab : ""}`}
              onClick={() => setActiveTab(key)}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* ─── Body ───────────────────────────────────────────────────────── */}
        <div className={styles.dashboardBody}>

          {/* ══ VISÃO GERAL ════════════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <>
              {(project.description || project.descricao) && (
                <div className={styles.projectDescriptionBox}>
                  <strong>Sobre o Projeto:</strong>
                  {project.description || project.descricao}
                </div>
              )}

              {/* Metrics */}
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.cardHeader}><span>Tarefas Pendentes</span><FiAlertCircle color="#f59e0b" size={18} /></div>
                  <div className={styles.cardContent}><div className={styles.bigNumber}>{pendingCount}</div><div className={styles.subtext}>Aguardando conclusão</div></div>
                </div>
                <div className={styles.metricCard}>
                  <div className={styles.cardHeader}><span>Tarefas Concluídas</span><FiCheckCircle color="#10b981" size={18} /></div>
                  <div className={styles.cardContent}><div className={styles.bigNumber}>{doneCount}</div><div className={styles.subtext}>Finalizadas com sucesso</div></div>
                </div>
                <div className={styles.metricCard}>
                  <div className={styles.cardHeader}><span>Membros do Projeto</span><FiUsers color="#3b82f6" size={18} /></div>
                  <div className={styles.cardContent}><div className={styles.bigNumber}>{projectMembers.length || 1}</div><div className={styles.subtext}>Colaboradores ativos</div></div>
                </div>
              </div>

              {/* Active sprint banner */}
              {activeSprint && (
                <div className={styles.activeSprintBanner}>
                  <span className={styles.pulsingDot} />
                  <strong>Sprint Ativa:</strong>
                  <span>{activeSprint.tituloSprint}</span>
                  <span className={styles.activeSprintDate}><FiCalendar size={13} /> Encerra em: {formatDate(activeSprint.prazoSprint)}</span>
                </div>
              )}

              {/* Quick actions */}
              <div className={styles.quickActionsRow}>
                <button className={styles.secondaryActionBtn} onClick={() => setIsSprintModalOpen(true)}><FiPlus /> Criar Sprint</button>
                <button className={styles.primaryActionBtn} onClick={guardedOpenTask}><FiPlus /> Adicionar Tarefa</button>
              </div>

              {/* Kanban Board */}
              <div className={styles.kanbanSection}>
                <div className={styles.kanbanSectionHeader}>
                  <h3>Quadro de Tarefas</h3>
                  <div className={styles.kanbanSelectRow}>
                    <select className={styles.kanbanSelect}>
                      {(project?.kanbans || []).length === 0
                        ? <option value="">Quadro Principal</option>
                        : (project.kanbans || []).map((k: any) => (
                          <option key={k.id} value={k.id}>{k.tituloKanban}</option>
                        ))}
                    </select>
                    <button className={styles.miniActionBtn} onClick={() => setIsKanbanModalOpen(true)}><FiPlus /> Novo Quadro</button>
                  </div>
                </div>

                {columns.length === 0 ? (
                  <div className={styles.emptyState}><FiGrid size={40} color="#64748b" /><p>Nenhuma coluna no quadro.</p></div>
                ) : (
                  <div className={styles.kanbanBoard}>
                    {columns.map((col: any) => {
                      const colTasks = getTasksByCol(col.id);
                      return (
                        <div
                          key={col.id}
                          className={`${styles.kanbanColumn} ${dragOverColumnId === col.id ? styles.dragOver : ""}`}
                          onDragOver={(e) => { e.preventDefault(); setDragOverColumnId(col.id); }}
                          onDragLeave={() => setDragOverColumnId(null)}
                          onDrop={(e) => handleDrop(e, col)}
                        >
                          <div className={styles.kanbanColumnHeader}>
                            <span className={styles.kanbanColumnTitle}>{col.tituloColuna}</span>
                            <span className={styles.kanbanColumnCount}>{colTasks.length}</span>
                          </div>
                          <div className={styles.kanbanCards}>
                            {colTasks.map((task: any) => {
                              const taskSprint = sprints.find((s: any) => s.id === task.fkSprint);
                              return (
                                <div
                                  key={task.id}
                                  className={`${styles.kanbanCard} ${draggingTaskId === task.id ? styles.dragging : ""}`}
                                  draggable
                                  onDragStart={() => setDraggingTaskId(task.id)}
                                  onDragEnd={() => { setDraggingTaskId(null); setDragOverColumnId(null); }}
                                  onClick={() => openTaskDetail(task)}
                                >
                                  <div className={styles.kanbanCardTitle}>{task.tituloTarefa}</div>
                                  {task.stack && (
                                    <span className={styles.stackBadgeSmall}><FiTag size={10} /> {task.stack}</span>
                                  )}
                                  <div className={styles.kanbanCardFooter}>
                                    {task.prazoTarefa && (
                                      <span className={styles.kanbanCardMeta}><FiCalendar size={11} /> {formatDate(task.prazoTarefa)}</span>
                                    )}
                                    {taskSprint && (
                                      <span className={styles.kanbanCardMeta}><FiLayers size={11} /> {taskSprint.tituloSprint}</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                            {colTasks.length === 0 && (
                              <div className={styles.emptyColumn}>Arraste tarefas aqui</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ══ SPRINTS ════════════════════════════════════════════════════════ */}
          {activeTab === "sprints" && (
            <div className={styles.tabSection}>
              <div className={styles.sectionHeader}>
                <div><h3>Sprints do Projeto</h3><p className={styles.sectionSubtitle}>Ciclos de desenvolvimento e prazos</p></div>
                <button className={styles.primaryActionBtn} onClick={() => setIsSprintModalOpen(true)}><FiPlus /> Nova Sprint</button>
              </div>
              {sprints.length === 0 ? (
                <div className={styles.emptyState}>
                  <FiLayers size={44} color="#64748b" />
                  <p>Nenhuma sprint cadastrada.</p>
                  <button className={styles.secondaryActionBtn} onClick={() => setIsSprintModalOpen(true)}>Criar Primeira Sprint</button>
                </div>
              ) : (
                <div className={styles.sprintsGrid}>
                  {sprints.map((sprint: any) => {
                    const { label: sLabel, color: sColor } = getSprintStatus(sprint);
                    const isActive = activeSprint?.id === sprint.id;
                    const sprintTasks = tasks.filter((t: any) => t.fkSprint === sprint.id);
                    return (
                      <div
                        key={sprint.id}
                        className={`${styles.sprintCard} ${isActive ? styles.activeSprintCard : ""}`}
                        onClick={() => openSprintDetail(sprint)}
                      >
                        <div className={styles.sprintCardHeader}>
                          <h4>{sprint.tituloSprint}</h4>
                          <span className={styles.sprintStatusBadge} style={{ background: `${sColor}20`, color: sColor, border: `1px solid ${sColor}40` }}>
                            {sLabel}
                          </span>
                        </div>
                        {sprint.descricaoSprint && <p className={styles.sprintDescription}>{sprint.descricaoSprint}</p>}
                        <div className={styles.sprintCardFooter}>
                          <span className={styles.sprintDateBadge}><FiCalendar size={13} /> {formatDate(sprint.prazoSprint)}</span>
                          <span className={styles.tasksCountBadge}><FiCheckSquare size={13} /> {sprintTasks.length} tarefa{sprintTasks.length !== 1 ? "s" : ""}</span>
                        </div>
                        {isActive && <div className={styles.activeSprintIndicator}><span className={styles.pulsingDot} /> Sprint em andamento</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══ TAREFAS ════════════════════════════════════════════════════════ */}
          {activeTab === "tasks" && (
            <div className={styles.tabSection}>
              <div className={styles.sectionHeader}>
                <div><h3>Tarefas do Projeto</h3><p className={styles.sectionSubtitle}>Acompanhe o andamento de cada atividade</p></div>
                <button className={styles.primaryActionBtn} onClick={guardedOpenTask}><FiPlus /> Nova Tarefa</button>
              </div>
              {tasks.length === 0 ? (
                <div className={styles.emptyState}>
                  <FiCheckSquare size={44} color="#64748b" />
                  <p>Nenhuma tarefa cadastrada.</p>
                </div>
              ) : (
                <div className={styles.tasksGrid}>
                  {tasks.map((task: any) => {
                    const taskSprint = sprints.find((s: any) => s.id === task.fkSprint);
                    const assigned = (task.usuarios || []).map((u: any) => u.usuario?.nome || u.usuario?.email).filter(Boolean);
                    const sl = (task.status || "").toLowerCase();
                    const isDone = sl.includes("conclu") || sl === "done";
                    const isProgress = sl.includes("andamento");
                    return (
                      <div key={task.id} className={styles.taskCard} onClick={() => openTaskDetail(task)}>
                        <div className={styles.taskBadges}>
                          <span className={`${styles.statusBadge} ${isDone ? styles.statusDone : isProgress ? styles.statusProgress : styles.statusPending}`}>
                            {task.status || "Pendente"}
                          </span>
                          {task.stack && <span className={styles.stackBadge}><FiTag size={12} /> {task.stack}</span>}
                          {taskSprint && <span className={styles.sprintBadge}><FiLayers size={12} /> {taskSprint.tituloSprint}</span>}
                        </div>
                        <h4 className={styles.taskTitle}>{task.tituloTarefa}</h4>
                        {task.descricaoTarefa && <p className={styles.taskDescription}>{task.descricaoTarefa}</p>}
                        <div className={styles.taskCardFooter}>
                          {task.prazoTarefa && <span className={styles.taskDate}><FiCalendar size={13} /> {formatDate(task.prazoTarefa)}</span>}
                          {assigned.length > 0 && <span className={styles.assignedMembers}><FiUsers size={13} /> {assigned.join(", ")}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══ KANBAN GALLERY ═════════════════════════════════════════════════ */}
          {activeTab === "kanban" && (
            <div className={styles.tabSection}>
              <div className={styles.sectionHeader}>
                <div><h3>Quadros Kanban</h3><p className={styles.sectionSubtitle}>Gerencie todos os quadros deste projeto</p></div>
                <button className={styles.primaryActionBtn} onClick={() => setIsKanbanModalOpen(true)}><FiPlus /> Novo Quadro</button>
              </div>
              {(!project?.kanbans || project.kanbans.length === 0) ? (
                <div className={styles.emptyState}>
                  <FiGrid size={44} color="#64748b" />
                  <p>Nenhum quadro Kanban criado.</p>
                  <button className={styles.secondaryActionBtn} onClick={() => setIsKanbanModalOpen(true)}>Criar Primeiro Quadro</button>
                </div>
              ) : (
                <div className={styles.kanbanGallery}>
                  {(project.kanbans || []).map((k: any) => (
                    <div key={k.id} className={styles.kanbanGalleryCard}>
                      <div className={styles.kanbanGalleryIcon}><FiGrid size={22} color="#3b82f6" /></div>
                      <h4 className={styles.kanbanGalleryTitle}>{k.tituloKanban}</h4>
                      {k.descricaoKanban && <p className={styles.kanbanGalleryDesc}>{k.descricaoKanban}</p>}
                      <div className={styles.kanbanGalleryMeta}>
                        <span><FiLayers size={13} /> {columns.length} colunas</span>
                        <span><FiCheckSquare size={13} /> {tasks.length} tarefas</span>
                      </div>
                      <button className={styles.kanbanOpenBtn} onClick={() => setActiveTab("overview")}>
                        Ver no Quadro <FiChevronRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/*  MODAIS                                                               */}
      {/* ══════════════════════════════════════════════════════════════════════ */}

      {/* ── Criar Sprint ──────────────────────────────────────────────────── */}
      {isSprintModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsSprintModalOpen(false)}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Criar Nova Sprint</h3>
                <p className={styles.modalSubtitle}>Defina o ciclo de entregas para a equipe</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsSprintModalOpen(false)}><FiX /></button>
            </div>
            <form onSubmit={handleCreateSprint} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Título da Sprint <span className={styles.required}>*</span></label>
                <input type="text" placeholder="Ex: Sprint 1 — Autenticação" className={styles.input} value={newSprintTitle} onChange={(e) => setNewSprintTitle(e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Data de Término / Prazo <span className={styles.required}>*</span>
                </label>
                <input
                  type="date" className={`${styles.input} ${sprintDateErr ? styles.inputError : ""}`}
                  value={newSprintDeadline} onChange={(e) => onSprintDeadlineChange(e.target.value)}
                  max={projectMaxDate || undefined}
                />
                {sprintDateErr && <span className={styles.dateErrorMsg}>{sprintDateErr}</span>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Descrição (Opcional)</label>
                <textarea placeholder="Descreva as metas desta sprint..." rows={3} className={styles.textarea} value={newSprintDesc} onChange={(e) => setNewSprintDesc(e.target.value)} />
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsSprintModalOpen(false)} disabled={isSubmittingSprint}>Cancelar</button>
                <button type="submit" className={styles.submitBtn} disabled={isSubmittingSprint || !!sprintDateErr}>
                  <FiCheck /> <span>{isSubmittingSprint ? "Criando..." : "Salvar Sprint"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Criar Tarefa ──────────────────────────────────────────────────── */}
      {isTaskModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsTaskModalOpen(false)}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Criar Nova Tarefa</h3>
                <p className={styles.modalSubtitle}>Adicione uma atividade detalhada ao projeto</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsTaskModalOpen(false)}><FiX /></button>
            </div>
            <form onSubmit={handleCreateTask} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Título <span className={styles.required}>*</span></label>
                <input type="text" placeholder="Ex: Criar tela de login" className={styles.input} value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Descrição (Opcional)</label>
                <textarea rows={2} className={styles.textarea} value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Prazo <span className={styles.required}>*</span>
                    {!isProfessor && <span className={styles.lockedHint}><FiLock size={12} /> Apenas professor</span>}
                  </label>
                  <input
                    type="date" className={`${styles.input} ${taskCreateDateErr ? styles.inputError : ""}`}
                    value={newTaskDeadline} onChange={(e) => onTaskDeadlineChange(e.target.value)}
                    max={newTaskSprintId ? getSprintMaxDate(newTaskSprintId) : undefined}
                    disabled={!isProfessor} required={isProfessor}
                  />
                  {taskCreateDateErr && <span className={styles.dateErrorMsg}>{taskCreateDateErr}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Stack Tecnológica</label>
                  <select className={styles.select} value={newTaskStack} onChange={(e) => setNewTaskStack(e.target.value)}>
                    <option>React / Next.js</option>
                    <option>Node.js / Express</option>
                    <option>TypeScript</option>
                    <option>CSS / SCSS</option>
                    <option>Banco de Dados / Prisma</option>
                    <option>Outro</option>
                  </select>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Status Inicial</label>
                  <select className={styles.select} value={newTaskStatus} onChange={(e) => setNewTaskStatus(e.target.value)}>
                    <option>Pendente</option>
                    <option>Em andamento</option>
                    <option>Concluída</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Sprint <span className={styles.required}>*</span></label>
                  <select className={styles.select} value={newTaskSprintId}
                    onChange={(e) => { setNewTaskSprintId(e.target.value); setNewTaskDeadline(""); setTaskCreateDateErr(null); }} required>
                    <option value="">Selecione uma sprint...</option>
                    {sprints.map((s: any) => <option key={s.id} value={s.id}>{s.tituloSprint}</option>)}
                  </select>
                </div>
              </div>
              {projectMembers.length > 0 && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Membros Responsáveis (Opcional)</label>
                  <div className={styles.membersCheckList}>
                    {projectMembers.map((m: any) => (
                      <label key={m.id} className={styles.checkboxLabel}>
                        <input type="checkbox" checked={newTaskMemberIds.includes(m.id)}
                          onChange={() => setNewTaskMemberIds((p) => p.includes(m.id) ? p.filter((x) => x !== m.id) : [...p, m.id])} />
                        <span>{m.nome || m.email}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsTaskModalOpen(false)} disabled={isSubmittingTask}>Cancelar</button>
                <button type="submit" className={styles.submitBtn} disabled={isSubmittingTask || !!taskCreateDateErr}>
                  <FiCheck /> <span>{isSubmittingTask ? "Criando..." : "Salvar Tarefa"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Detalhe da Sprint ─────────────────────────────────────────────── */}
      {isSprintDetailOpen && selectedSprint && (
        <div className={styles.modalOverlay} onClick={() => setIsSprintDetailOpen(false)}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Detalhes da Sprint</h3>
                {(() => {
                  const { label, color } = getSprintStatus(selectedSprint);
                  return <span className={styles.detailStatusPill} style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>{label}</span>;
                })()}
              </div>
              <button className={styles.closeBtn} onClick={() => setIsSprintDetailOpen(false)}><FiX /></button>
            </div>
            <form onSubmit={handleUpdateSprint} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Título</label>
                <input type="text" className={styles.input} value={editSprintTitle} onChange={(e) => setEditSprintTitle(e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Data de Término
                  {!isProfessor && <span className={styles.lockedHint}><FiLock size={12} /> Apenas professor</span>}
                </label>
                <input
                  type="date" className={`${styles.input} ${editSprintDateErr ? styles.inputError : ""}`}
                  value={editSprintDeadline} onChange={(e) => onEditSprintDeadline(e.target.value)}
                  max={projectMaxDate || undefined} disabled={!isProfessor}
                />
                {editSprintDateErr && <span className={styles.dateErrorMsg}>{editSprintDateErr}</span>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Descrição</label>
                <textarea rows={3} className={styles.textarea} value={editSprintDesc} onChange={(e) => setEditSprintDesc(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Tarefas Vinculadas</label>
                <div className={styles.linkedList}>
                  {tasks.filter((t: any) => t.fkSprint === selectedSprint.id).length === 0
                    ? <p className={styles.helperText}>Nenhuma tarefa vinculada a esta sprint.</p>
                    : tasks.filter((t: any) => t.fkSprint === selectedSprint.id).map((t: any) => (
                      <div key={t.id} className={styles.linkedItem}>
                        <span>{t.tituloTarefa}</span>
                        <span className={styles.linkedItemStatus}>{t.status}</span>
                      </div>
                    ))}
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsSprintDetailOpen(false)} disabled={isSubmittingSprintEdit}>Fechar</button>
                <button type="submit" className={styles.submitBtn} disabled={isSubmittingSprintEdit || !!editSprintDateErr}>
                  <FiCheck /> <span>{isSubmittingSprintEdit ? "Salvando..." : "Salvar Alterações"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Detalhe da Tarefa ─────────────────────────────────────────────── */}
      {isTaskDetailOpen && selectedTask && (
        <div className={styles.modalOverlay} onClick={() => setIsTaskDetailOpen(false)}>
          <div className={`${styles.modalContainer} ${styles.modalLarge}`} onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Detalhes da Tarefa</h3>
                <p className={styles.modalSubtitle}>{selectedTask.tituloTarefa}</p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                {isProfessor && (
                  <button type="button" className={styles.dangerIconBtn} title="Excluir tarefa"
                    onClick={() => setDeleteConfirmOpen(true)}>
                    <FiTrash2 size={15} />
                  </button>
                )}
                <button className={styles.closeBtn} onClick={() => setIsTaskDetailOpen(false)}><FiX /></button>
              </div>
            </div>

            {/* Inner tabs */}
            <div className={styles.innerTabs}>
              <button className={`${styles.innerTab} ${taskDetailTab === "details" ? styles.activeInnerTab : ""}`}
                onClick={() => setTaskDetailTab("details")}><FiEdit2 size={13} /> Detalhes</button>
              <button className={`${styles.innerTab} ${taskDetailTab === "comments" ? styles.activeInnerTab : ""}`}
                onClick={() => setTaskDetailTab("comments")}><FiMessageSquare size={13} /> Comentários ({(selectedTask.comentarios || []).length})</button>
            </div>

            {/* Details */}
            {taskDetailTab === "details" && (
              <form onSubmit={handleUpdateTask} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Título</label>
                  <input type="text" className={styles.input} value={editTaskTitle} onChange={(e) => setEditTaskTitle(e.target.value)} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Descrição</label>
                  <textarea rows={3} className={styles.textarea} value={editTaskDesc} onChange={(e) => setEditTaskDesc(e.target.value)} />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Prazo
                      {!isProfessor && <span className={styles.lockedHint}><FiLock size={12} /> Apenas professor</span>}
                    </label>
                    <input
                      type="date" className={`${styles.input} ${editTaskDateErr ? styles.inputError : ""}`}
                      value={editTaskDeadline} onChange={(e) => onEditTaskDeadline(e.target.value)}
                      max={editTaskSprintId ? getSprintMaxDate(editTaskSprintId) : undefined} disabled={!isProfessor}
                    />
                    {editTaskDateErr && <span className={styles.dateErrorMsg}>{editTaskDateErr}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Stack</label>
                    <select className={styles.select} value={editTaskStack} onChange={(e) => setEditTaskStack(e.target.value)}>
                      <option>React / Next.js</option><option>Node.js / Express</option>
                      <option>TypeScript</option><option>CSS / SCSS</option>
                      <option>Banco de Dados / Prisma</option><option>Outro</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Status</label>
                    <select className={styles.select} value={editTaskStatus} onChange={(e) => setEditTaskStatus(e.target.value)}>
                      <option>Pendente</option><option>Em andamento</option><option>Concluída</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Sprint
                      {!isProfessor && <span className={styles.lockedHint}><FiLock size={12} /> Apenas professor</span>}
                    </label>
                    <select className={styles.select} value={editTaskSprintId}
                      onChange={(e) => { setEditTaskSprintId(e.target.value); setEditTaskDeadline(""); setEditTaskDateErr(null); }}
                      disabled={!isProfessor}>
                      <option value="">Selecione...</option>
                      {sprints.map((s: any) => <option key={s.id} value={s.id}>{s.tituloSprint}</option>)}
                    </select>
                  </div>
                </div>
                {projectMembers.length > 0 && (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Membros Responsáveis</label>
                    <div className={styles.membersCheckList}>
                      {projectMembers.map((m: any) => (
                        <label key={m.id} className={styles.checkboxLabel}>
                          <input type="checkbox" checked={editTaskMemberIds.includes(m.id)}
                            onChange={() => setEditTaskMemberIds((p) => p.includes(m.id) ? p.filter((x) => x !== m.id) : [...p, m.id])} />
                          <span>{m.nome || m.email}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {deleteConfirmOpen && (
                  <div className={styles.deleteConfirm}>
                    <p>Tem certeza? Esta ação não pode ser desfeita.</p>
                    <div className={styles.deleteConfirmActions}>
                      <button type="button" className={styles.cancelBtn} onClick={() => setDeleteConfirmOpen(false)}>Cancelar</button>
                      <button type="button" className={styles.dangerBtnSolid} onClick={handleDeleteTask}>Excluir Tarefa</button>
                    </div>
                  </div>
                )}
                <div className={styles.modalFooter}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setIsTaskDetailOpen(false)} disabled={isSubmittingTaskEdit}>Fechar</button>
                  <button type="submit" className={styles.submitBtn} disabled={isSubmittingTaskEdit || !!editTaskDateErr}>
                    <FiCheck /> <span>{isSubmittingTaskEdit ? "Salvando..." : "Salvar Alterações"}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Comments */}
            {taskDetailTab === "comments" && (
              <div className={styles.commentsTab}>
                <div className={styles.commentsList}>
                  {(selectedTask.comentarios || []).length === 0 ? (
                    <div className={styles.emptyComments}>
                      <FiMessageSquare size={32} color="#64748b" />
                      <p>Nenhum comentário ainda.</p>
                    </div>
                  ) : (
                    (selectedTask.comentarios || []).map((c: any, i: number) => (
                      <div key={i} className={styles.commentItem}>
                        <div className={styles.commentAvatar}>
                          {(c.usuario?.nome || c.usuario?.email || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.commentContent}>
                          <span className={styles.commentAuthor}>{c.usuario?.nome || c.usuario?.email || "Usuário"}</span>
                          <p className={styles.commentText}>{c.conteudo}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {isProfessor ? (
                  <form onSubmit={handleCreateComment} className={styles.commentForm}>
                    <textarea placeholder="Escreva um comentário..." rows={3} className={styles.textarea}
                      value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                    <div className={styles.modalFooter} style={{ paddingTop: "0.75rem" }}>
                      <button type="submit" className={styles.submitBtn} disabled={isSubmittingComment || !newComment.trim()}>
                        <FiMessageSquare /> <span>{isSubmittingComment ? "Enviando..." : "Comentar"}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className={styles.commentReadOnly}><FiLock size={14} /> Somente professores podem adicionar comentários.</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Criar Kanban ──────────────────────────────────────────────────── */}
      {isKanbanModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsKanbanModalOpen(false)}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Novo Quadro Kanban</h3>
                <p className={styles.modalSubtitle}>Crie um quadro para organizar as tarefas</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsKanbanModalOpen(false)}><FiX /></button>
            </div>
            <form onSubmit={handleCreateKanban} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nome do Quadro <span className={styles.required}>*</span></label>
                <input type="text" placeholder="Ex: Sprint Board, Backlog, Bugs" className={styles.input}
                  value={newKanbanName} onChange={(e) => setNewKanbanName(e.target.value)} required />
              </div>
              <p className={styles.helperText}>Colunas padrão criadas automaticamente: A Fazer, Em Andamento, Concluído.</p>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsKanbanModalOpen(false)} disabled={isSubmittingKanban}>Cancelar</button>
                <button type="submit" className={styles.submitBtn} disabled={isSubmittingKanban}>
                  <FiGrid /> <span>{isSubmittingKanban ? "Criando..." : "Criar Quadro"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
