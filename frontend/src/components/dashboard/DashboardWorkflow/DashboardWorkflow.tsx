// src/components/dashboard/DashboardWorkflow/DashboardWorkflow.tsx
"use client";

import { useState } from "react";
import { mockWorkflowColumns } from "@/src/mocks/dashboard.mock";
import styles from "./DashboardWorkflow.module.scss";

export function DashboardWorkflow() {
  const [activeFilter, setActiveFilter] = useState("all");

  const getPriorityClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "alta":
        return styles.alta;
      case "média":
      case "media":
        return styles.media;
      default:
        return styles.baixa;
    }
  };

  return (
    <section id="tarefas" className={styles.section} aria-labelledby="workflow-title">
      <div className={styles.container}>
        {/* Left Column: Context & Controls */}
        <div className={styles.leftCol}>
          <span className={styles.tag}>Fluxo de Trabalho</span>
          <h2 id="workflow-title" className={styles.title}>
            Tudo o que precisa ser feito, em um só fluxo.
          </h2>
          <p className={styles.description}>
            Visualize o fluxo das tarefas da sua equipe com status claros e
            visualização ágil para não perder nenhuma entrega importante.
          </p>

          <div className={styles.filterTabs} role="tablist" aria-label="Filtro de tarefas">
            <button
              type="button"
              className={`${styles.tabBtn} ${
                activeFilter === "all" ? styles.active : ""
              }`}
              onClick={() => setActiveFilter("all")}
              role="tab"
              aria-selected={activeFilter === "all"}
            >
              Todas as tarefas
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${
                activeFilter === "pending" ? styles.active : ""
              }`}
              onClick={() => setActiveFilter("pending")}
              role="tab"
              aria-selected={activeFilter === "pending"}
            >
              Pendentes
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${
                activeFilter === "done" ? styles.active : ""
              }`}
              onClick={() => setActiveFilter("done")}
              role="tab"
              aria-selected={activeFilter === "done"}
            >
              Finalizadas
            </button>
          </div>

          <button
            type="button"
            className={styles.actionBtn}
            aria-label="Abrir quadro de tarefas completo"
          >
            <span>Abrir tarefas</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>

        {/* Right Column: Workflow Board Widget */}
        <div className={styles.boardCard}>
          <div className={styles.boardHeader}>
            <div className={styles.boardTitle}>
              <span>Quadro da Sprint Atual</span>
            </div>
            <span className={styles.activeBadge}>12 ativas</span>
          </div>

          <div className={styles.boardGrid}>
            {mockWorkflowColumns.map((col) => (
              <div key={col.id} className={styles.column}>
                <div className={styles.colHeader}>
                  <span className={styles.colTitle}>{col.titulo}</span>
                  <span className={styles.taskCount}>
                    {col.tarefas.length}
                  </span>
                </div>

                <div className={styles.taskList}>
                  {col.tarefas.map((task) => (
                    <div key={task.id} className={styles.taskItem}>
                      <p className={styles.taskTitle}>{task.titulo}</p>
                      <div className={styles.taskMeta}>
                        <span className={styles.stackBadge}>{task.stack}</span>
                        <span
                          className={`${styles.priorityBadge} ${getPriorityClass(
                            task.prioridade
                          )}`}
                        >
                          {task.prioridade}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
