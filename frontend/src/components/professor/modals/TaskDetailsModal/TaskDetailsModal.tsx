"use client";

import React, { useState, useEffect } from "react";
import styles from "./TaskDetailsModal.module.scss";
import {
  FiX,
  FiCalendar,
  FiMessageSquare,
  FiSend,
  FiTrash2,
  FiCheck,
  FiInfo,
} from "react-icons/fi";
import { ProfessorTask, TaskComment } from "@/src/types/professor";

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: ProfessorTask | null;
  onUpdateDeadline: (taskId: number, newDeadline: string) => Promise<void>;
  onAddComment: (taskId: number, content: string) => Promise<void>;
  onDeleteComment?: (commentId: number, taskId: number) => Promise<void>;
  currentUserId?: number;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  isOpen,
  onClose,
  task,
  onUpdateDeadline,
  onAddComment,
  onDeleteComment,
  currentUserId,
}) => {
  const [deadlineInput, setDeadlineInput] = useState<string>("");
  const [isSavingDeadline, setIsSavingDeadline] = useState(false);
  const [deadlineSuccess, setDeadlineSuccess] = useState(false);

  const [commentInput, setCommentInput] = useState<string>("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (task?.prazoTarefa) {
      try {
        const d = new Date(task.prazoTarefa);
        if (!isNaN(d.getTime())) {
          setDeadlineInput(d.toISOString().split("T")[0]);
        }
      } catch {
        setDeadlineInput("");
      }
    } else {
      setDeadlineInput("");
    }
    setDeadlineSuccess(false);
    setCommentInput("");
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSaveDeadline = async () => {
    if (!deadlineInput) return;
    try {
      setIsSavingDeadline(true);
      await onUpdateDeadline(task.id, deadlineInput);
      setDeadlineSuccess(true);
      setTimeout(() => setDeadlineSuccess(false), 2500);
    } catch (err) {
      console.error("Erro ao salvar prazo:", err);
    } finally {
      setIsSavingDeadline(false);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      await onAddComment(task.id, commentInput.trim());
      setCommentInput("");
    } catch (err) {
      console.error("Erro ao enviar comentário:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatCommentDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusClass = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("conclu") || s === "done") return styles.statusDone;
    if (s.includes("andamento") || s === "in_progress") return styles.statusInProgress;
    return styles.statusPending;
  };

  const comments: TaskComment[] = task.comentarios || [];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerText}>
            <span className={styles.taskTypeBadge}>
              <FiInfo /> Detalhes da Tarefa {task.projectTitle ? `· ${task.projectTitle}` : ""}
            </span>
            <h3 className={styles.modalTitle}>{task.tituloTarefa}</h3>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <FiX />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* Informações Gerais */}
          <div className={styles.sectionBox}>
            <span className={styles.sectionLabel}>Descrição e Status</span>
            {task.descricaoTarefa ? (
              <p className={styles.taskDescription}>{task.descricaoTarefa}</p>
            ) : (
              <p className={styles.taskDescription} style={{ color: "var(--text-muted)" }}>
                Sem descrição cadastrada para esta atividade.
              </p>
            )}

            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaItemLabel}>Status Atual:</span>
                <span className={`${styles.statusBadge} ${getStatusClass(task.status)}`}>
                  {task.status}
                </span>
              </div>
              {task.stack && (
                <div className={styles.metaItem}>
                  <span className={styles.metaItemLabel}>Tecnologia / Stack:</span>
                  <span className={styles.metaItemValue}>{task.stack}</span>
                </div>
              )}
            </div>
          </div>

          {/* Edição de Prazo da Tarefa */}
          <div className={styles.sectionBox}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>
                <FiCalendar /> Prazo de Entrega da Tarefa
              </span>
              {deadlineSuccess && (
                <span className={styles.successFeedback}>
                  <FiCheck /> Prazo atualizado!
                </span>
              )}
            </div>

            <div className={styles.deadlineContainer}>
              <input
                type="date"
                value={deadlineInput}
                onChange={(e) => setDeadlineInput(e.target.value)}
                className={styles.dateInput}
              />
              <button
                type="button"
                className={styles.saveDateBtn}
                onClick={handleSaveDeadline}
                disabled={isSavingDeadline || !deadlineInput}
              >
                {isSavingDeadline ? "Salvando..." : "Salvar Novo Prazo"}
              </button>
            </div>
          </div>

          {/* Seção de Comentários */}
          <div className={styles.commentsSection}>
            <div className={styles.commentsHeader}>
              <span className={styles.sectionLabel}>
                <FiMessageSquare /> Comentários & Feedbacks ({comments.length})
              </span>
            </div>

            {comments.length === 0 ? (
              <div className={styles.emptyComments}>
                Nenhum feedback registrado nesta tarefa ainda. Seja o primeiro a deixar uma orientação!
              </div>
            ) : (
              <div className={styles.commentsList}>
                {comments.map((comment) => {
                  const authorName = comment.usuario?.nome || "Professor / Aluno";
                  const initial = authorName.charAt(0).toUpperCase();
                  const isAuthor =
                    currentUserId && comment.usuario?.id === currentUserId;

                  return (
                    <div key={comment.id} className={styles.commentCard}>
                      <div className={styles.commentTopRow}>
                        <div className={styles.commentAuthorInfo}>
                          <span className={styles.commentAvatar}>{initial}</span>
                          <span className={styles.authorName}>{authorName}</span>
                          {comment.createdAt && (
                            <span className={styles.commentDate}>
                              · {formatCommentDate(comment.createdAt)}
                            </span>
                          )}
                        </div>

                        {onDeleteComment && (!currentUserId || isAuthor) && (
                          <button
                            type="button"
                            className={styles.deleteCommentBtn}
                            onClick={() => onDeleteComment(comment.id, task.id)}
                            title="Excluir comentário"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>

                      <p className={styles.commentContent}>{comment.conteudo}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Formulário de Novo Comentário */}
            <form onSubmit={handleSendComment} className={styles.commentForm}>
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Escreva um feedback ou orientação para o aluno nesta tarefa..."
                className={styles.commentTextarea}
                rows={3}
              />
              <div className={styles.commentFormFooter}>
                <button
                  type="submit"
                  className={styles.sendCommentBtn}
                  disabled={!commentInput.trim() || isSubmittingComment}
                >
                  <FiSend />
                  <span>{isSubmittingComment ? "Enviando..." : "Enviar Comentário"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

