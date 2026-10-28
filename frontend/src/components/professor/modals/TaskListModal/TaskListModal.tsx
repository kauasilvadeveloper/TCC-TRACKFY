"use client";

import React, { useState } from "react";
import styles from "./TaskListModal.module.scss";
import {
  FiX,
  FiSearch,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiClock,
  FiInbox,
} from "react-icons/fi";
import { ProfessorTask } from "@/src/types/professor";

interface TaskListModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: ProfessorTask[];
  classNameTitle: string;
  onOpenCreateTask: () => void;
  onToggleStatus: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
}

export const TaskListModal: React.FC<TaskListModalProps> = ({
  isOpen,
  onClose,
  tasks,
  classNameTitle,
  onOpenCreateTask,
  onToggleStatus,
  onDeleteTask,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "pendente" | "em andamento" | "concluída"
  >("all");

  if (!isOpen) return null;

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

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.tituloTarefa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.descricaoTarefa &&
        task.descricaoTarefa.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.stack && task.stack.toLowerCase().includes(searchTerm.toLowerCase()));

    const status = task.status.toLowerCase();
    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "concluída")
      return matchesSearch && (status.includes("conclu") || status === "done");
    if (activeFilter === "em andamento")
      return matchesSearch && (status.includes("andamento") || status === "in_progress");
    if (activeFilter === "pendente")
      return matchesSearch && (status.includes("pendente") || status === "pending");

    return matchesSearch;
  });

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Tarefas da Turma</h3>
            <p className={styles.modalSubtitle}>
              {classNameTitle} · {tasks.length} atividades cadastradas
            </p>
          </div>
          <div className={styles.headerRightActions}>
            <button
              type="button"
              className={styles.addTaskHeaderBtn}
              onClick={() => {
                onClose();
                onOpenCreateTask();
              }}
            >
              <FiPlus />
              <span>Nova tarefa</span>
            </button>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Fechar"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* Toolbar: Search and Filter Tabs */}
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por título, stack ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterTabs}>
            <button
              type="button"
              className={`${styles.filterTab} ${
                activeFilter === "all" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveFilter("all")}
            >
              Todas ({tasks.length})
            </button>
            <button
              type="button"
              className={`${styles.filterTab} ${
                activeFilter === "pendente" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveFilter("pendente")}
            >
              Pendentes (
              {
                tasks.filter((t) =>
                  t.status.toLowerCase().includes("pendente")
                ).length
              }
              )
            </button>
            <button
              type="button"
              className={`${styles.filterTab} ${
                activeFilter === "em andamento" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveFilter("em andamento")}
            >
              Em andamento (
              {
                tasks.filter((t) =>
                  t.status.toLowerCase().includes("andamento")
                ).length
              }
              )
            </button>
            <button
              type="button"
              className={`${styles.filterTab} ${
                activeFilter === "concluída" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveFilter("concluída")}
            >
              Concluídas (
              {
                tasks.filter((t) =>
                  t.status.toLowerCase().includes("conclu")
                ).length
              }
              )
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className={styles.modalBody}>
          {filteredTasks.length === 0 ? (
            <div className={styles.emptyContainer}>
              <FiInbox className={styles.emptyIcon} />
              <h4>Nenhuma tarefa encontrada</h4>
              <p>Nenhuma atividade corresponde aos critérios de filtro aplicados.</p>
            </div>
          ) : (
            <div className={styles.taskList}>
              {filteredTasks.map((task) => {
                const isDone =
                  task.status.toLowerCase().includes("conclu") ||
                  task.status === "done";

                return (
                  <div key={task.id} className={styles.taskCard}>
                    <div className={styles.taskCardLeft}>
                      <button
                        type="button"
                        className={`${styles.statusToggleBtn} ${
                          isDone ? styles.statusDone : ""
                        }`}
                        onClick={() => onToggleStatus(task.id)}
                        title={
                          isDone
                            ? "Marcar como pendente"
                            : "Marcar como concluída"
                        }
                      >
                        {isDone ? <FiCheckCircle /> : <FiClock />}
                      </button>

                      <div className={styles.taskContent}>
                        <div className={styles.taskTitleRow}>
                          <h4
                            className={`${styles.taskTitle} ${
                              isDone ? styles.strikeThrough : ""
                            }`}
                          >
                            {task.tituloTarefa}
                          </h4>
                          <span
                            className={`${styles.badge} ${
                              isDone ? styles.badgeDone : styles.badgeProgress
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>

                        {task.descricaoTarefa && (
                          <p className={styles.taskDesc}>
                            {task.descricaoTarefa}
                          </p>
                        )}

                        <div className={styles.taskMetaRow}>
                          <span>Prazo: {formatDate(task.prazoTarefa)}</span>
                          {task.stack && <span>· Stack: {task.stack}</span>}
                        </div>
                      </div>
                    </div>

                    <div className={styles.taskCardRight}>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => onDeleteTask(task.id)}
                        title="Excluir tarefa"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
