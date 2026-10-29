"use client";

import React, { useState } from "react";
import styles from "./ProfessorRecentTasks.module.scss";
import { FiInbox, FiPlus, FiChevronRight } from "react-icons/fi";
import { ProfessorTask } from "@/src/types/professor";

interface ProfessorRecentTasksProps {
  tasks: ProfessorTask[];
  onOpenTasksModal: () => void;
  onOpenCreateTask: () => void;
  loading?: boolean;
}

export const ProfessorRecentTasks: React.FC<ProfessorRecentTasksProps> = ({
  tasks,
  onOpenTasksModal,
  onOpenCreateTask,
  loading = false,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 3;

  const totalPages = Math.ceil(tasks.length / pageSize) || 1;
  const displayedTasks = tasks.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
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

  const getStatusLabel = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("conclu") || s === "done") return "Concluída";
    if (s.includes("andamento") || s === "in_progress") return "Em andamento";
    return "Pendente";
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Tarefas recentes</h3>
          <p className={styles.subtitle}>Tudo que o grupo está trabalhando agora</p>
        </div>
        <button
          type="button"
          className={styles.viewAllButton}
          onClick={onOpenTasksModal}
        >
          <span>Ver todas</span>
          <FiChevronRight />
        </button>
      </div>

      {loading ? (
        <div className={styles.taskList}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={`${styles.taskItem} ${styles.skeletonItem}`}>
              <div className={styles.skeletonDot} />
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonMeta} />
              </div>
              <div className={styles.skeletonBadge} />
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        /* Empty State */
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrapper}>
            <FiInbox className={styles.emptyIcon} />
          </div>
          <h4 className={styles.emptyTitle}>Nenhum dado cadastrado ainda</h4>
          <p className={styles.emptyDesc}>
            Não há tarefas cadastradas para esta turma até o momento. Comece criando a primeira
            tarefa para acompanhar os alunos.
          </p>
          <button
            type="button"
            className={styles.emptyCta}
            onClick={onOpenCreateTask}
          >
            <FiPlus />
            <span>Criar primeira tarefa</span>
          </button>
        </div>
      ) : (
        <div className={styles.taskList}>
          {displayedTasks.map((task) => {
            const statusClass = getStatusClass(task.status);
            const statusLabel = getStatusLabel(task.status);

            return (
              <div key={task.id} className={styles.taskItem}>
                <div className={styles.leftInfo}>
                  <span className={`${styles.statusDot} ${statusClass}`} />
                  <div className={styles.titleAndMeta}>
                    <h4 className={styles.taskTitle}>{task.tituloTarefa}</h4>
                    <span className={styles.taskMeta}>
                      Prazo {formatDate(task.prazoTarefa)}
                      {task.stack && ` · Stack: ${task.stack}`}
                    </span>
                  </div>
                </div>

                <div className={styles.rightInfo}>
                  <span className={`${styles.statusBadge} ${statusClass}`}>
                    {statusLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination / Dots indicator */}
      {!loading && tasks.length > pageSize && (
        <div className={styles.paginationFooter}>
          <div className={styles.dotsWrapper}>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`${styles.dot} ${
                  currentPage === idx ? styles.activeDot : ""
                }`}
                onClick={() => setCurrentPage(idx)}
                aria-label={`Página ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

