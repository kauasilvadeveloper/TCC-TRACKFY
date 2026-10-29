"use client";

import React, { useState } from "react";
import styles from "./ProjectManageModal.module.scss";
import {
  FiX,
  FiFolder,
  FiCalendar,
  FiLayers,
  FiCheckSquare,
  FiUsers,
  FiClock,
  FiCheck,
  FiMessageSquare,
  FiEdit2,
  FiInbox,
} from "react-icons/fi";
import { ClassProject, ProfessorSprint, ProfessorTask } from "@/src/types/professor";

interface ProjectManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ClassProject | null;
  onUpdateSprintDeadline: (sprintId: number, newDeadline: string) => Promise<void>;
  onOpenTaskDetails: (task: ProfessorTask) => void;
}

export const ProjectManageModal: React.FC<ProjectManageModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateSprintDeadline,
  onOpenTaskDetails,
}) => {
  const [activeTab, setActiveTab] = useState<"sprints" | "tasks">("sprints");
  const [editingSprintId, setEditingSprintId] = useState<number | null>(null);
  const [editSprintDate, setEditSprintDate] = useState<string>("");
  const [savingSprintId, setSavingSprintId] = useState<number | null>(null);
  const [sprintFeedback, setSprintFeedback] = useState<{ id: number; message: string } | null>(null);

  if (!isOpen || !project) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Sem prazo";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getSprintStatus = (deadlineStr?: string) => {
    if (!deadlineStr) return { label: "Sem prazo", className: styles.statusSprintActive };
    const isPast = new Date(deadlineStr) < new Date();
    return isPast
      ? { label: "Encerrada", className: styles.statusSprintEnded }
      : { label: "Ativa", className: styles.statusSprintActive };
  };

  const handleStartEditSprint = (sprint: ProfessorSprint) => {
    setEditingSprintId(sprint.id);
    try {
      const d = new Date(sprint.prazoSprint);
      setEditSprintDate(d.toISOString().split("T")[0]);
    } catch {
      setEditSprintDate("");
    }
  };

  const handleSaveSprintDeadline = async (sprintId: number) => {
    if (!editSprintDate) return;
    try {
      setSavingSprintId(sprintId);
      await onUpdateSprintDeadline(sprintId, editSprintDate);
      setSprintFeedback({ id: sprintId, message: "Prazo da Sprint atualizado!" });
      setEditingSprintId(null);
      setTimeout(() => setSprintFeedback(null), 3000);
    } catch (err) {
      console.error("Erro ao salvar prazo da sprint:", err);
    } finally {
      setSavingSprintId(null);
    }
  };

  const sprints = project.sprints || [];
  const tasks = project.tarefas || [];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerText}>
            <span className={styles.badgeCategory}>
              <FiFolder /> Gerenciamento de Projeto
            </span>
            <h3 className={styles.modalTitle}>{project.tituloProjeto}</h3>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fechar"
          >
            <FiX />
          </button>
        </div>

        {/* Informações Resumidas do Projeto */}
        <div style={{ padding: "1.25rem 1.5rem 0 1.5rem" }}>
          <div className={styles.projectInfoBox}>
            {project.descricao && (
              <p className={styles.projectDesc}>{project.descricao}</p>
            )}

            <div className={styles.infoChipsRow}>
              <span className={styles.infoChip}>
                <FiCalendar /> Prazo Final: {formatDate(project.prazo)}
              </span>
              <span className={styles.infoChip}>
                <FiLayers /> {sprints.length} Sprints
              </span>
              <span className={styles.infoChip}>
                <FiCheckSquare /> {tasks.length} Tarefas
              </span>
            </div>

            {project.usuarios && project.usuarios.length > 0 && (
              <div className={styles.membersRow}>
                {project.usuarios.map((u, i) => (
                  <span key={i} className={styles.memberTag}>
                    <FiUsers />
                    {u.usuario?.nome || "Aluno"}
                    {u.funcaoProjeto?.tituloFuncaoProjeto
                      ? ` (${u.funcaoProjeto.tituloFuncaoProjeto})`
                      : ""}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Abas */}
        <div className={styles.tabsBar}>
          <button
            type="button"
            className={`${styles.tabBtn} ${
              activeTab === "sprints" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("sprints")}
          >
            <FiLayers />
            <span>Sprints</span>
            <span className={styles.tabCountBadge}>{sprints.length}</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${
              activeTab === "tasks" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("tasks")}
          >
            <FiCheckSquare />
            <span>Tarefas do Projeto</span>
            <span className={styles.tabCountBadge}>{tasks.length}</span>
          </button>
        </div>

        {/* Conteúdo da Aba */}
        <div className={styles.modalBody}>
          {activeTab === "sprints" ? (
            <div className={styles.sprintsList}>
              {sprints.length === 0 ? (
                <div className={styles.emptyState}>
                  <FiInbox style={{ fontSize: "2rem" }} />
                  <span>Nenhuma sprint cadastrada para este projeto.</span>
                </div>
              ) : (
                sprints.map((sprint) => {
                  const status = getSprintStatus(sprint.prazoSprint);
                  const isEditing = editingSprintId === sprint.id;
                  const isSaving = savingSprintId === sprint.id;
                  const hasFeedback = sprintFeedback?.id === sprint.id;

                  return (
                    <div key={sprint.id} className={styles.sprintCard}>
                      <div className={styles.sprintHeader}>
                        <div className={styles.sprintTitleArea}>
                          <h4 className={styles.sprintTitle}>
                            {sprint.tituloSprint}
                          </h4>
                          <span className={status.className}>
                            {status.label}
                          </span>
                        </div>
                      </div>

                      {sprint.descricaoSprint && (
                        <p className={styles.sprintDesc}>
                          {sprint.descricaoSprint}
                        </p>
                      )}

                      {/* Controle de Prazo da Sprint */}
                      <div className={styles.sprintDeadlineEditBox}>
                        <div className={styles.currentDeadlinelnfo}>
                          <FiClock />
                          <span>Prazo da Sprint:</span>
                          <span className={styles.deadlineDateText}>
                            {formatDate(sprint.prazoSprint)}
                          </span>
                          {hasFeedback && (
                            <span style={{ color: "#34d399", fontWeight: 600, marginLeft: "0.5rem" }}>
                              <FiCheck /> {sprintFeedback.message}
                            </span>
                          )}
                        </div>

                        <div className={styles.editDeadlineToogleArea}>
                          {isEditing ? (
                            <>
                              <input
                                type="date"
                                value={editSprintDate}
                                onChange={(e) => setEditSprintDate(e.target.value)}
                                className={styles.dateInputSmall}
                              />
                              <button
                                type="button"
                                className={styles.saveSprintDateBtn}
                                onClick={() => handleSaveSprintDeadline(sprint.id)}
                                disabled={isSaving || !editSprintDate}
                              >
                                {isSaving ? "Salvando..." : "Salvar"}
                              </button>
                              <button
                                type="button"
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "var(--text-muted)",
                                  cursor: "pointer",
                                  fontSize: "0.8rem",
                                }}
                                onClick={() => setEditingSprintId(null)}
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className={styles.saveSprintDateBtn}
                              style={{
                                backgroundColor: "var(--bg-card)",
                                color: "var(--text-primary)",
                                border: "1px solid var(--border-color)",
                              }}
                              onClick={() => handleStartEditSprint(sprint)}
                            >
                              <FiEdit2 />
                              <span>Editar Prazo</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className={styles.tasksList}>
              {tasks.length === 0 ? (
                <div className={styles.emptyState}>
                  <FiInbox style={{ fontSize: "2rem" }} />
                  <span>Nenhuma tarefa cadastrada para este projeto.</span>
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className={styles.taskItemRow}>
                    <div className={styles.taskInfoLeft}>
                      <h5 className={styles.taskTitleText}>{task.tituloTarefa}</h5>
                      <div className={styles.taskSubMeta}>
                        <span>Status: {task.status}</span>
                        <span>·</span>
                        <span>Prazo: {formatDate(task.prazoTarefa)}</span>
                        {task.stack && (
                          <>
                            <span>·</span>
                            <span>{task.stack}</span>
                          </>
                        )}
                        {task.comentarios && task.comentarios.length > 0 && (
                          <>
                            <span>·</span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "var(--brand-accent)" }}>
                              <FiMessageSquare /> {task.comentarios.length} comentários
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className={styles.taskActionsRight}>
                      <button
                        type="button"
                        className={styles.manageTaskBtn}
                        onClick={() => onOpenTaskDetails(task)}
                      >
                        <FiEdit2 />
                        <span>Prazo & Feedbacks</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

