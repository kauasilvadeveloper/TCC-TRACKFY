"use client";

import React from "react";
import styles from "./ProfessorMetricsGrid.module.scss";
import { FiCheckSquare, FiCheckCircle, FiUsers, FiLayers } from "react-icons/fi";

interface ProfessorMetricsGridProps {
  pendingTasksCount: number;
  completedTasksCount: number;
  studentsCount: number;
  totalTasksCount: number;
  loading?: boolean;
}

export const ProfessorMetricsGrid: React.FC<ProfessorMetricsGridProps> = ({
  pendingTasksCount,
  completedTasksCount,
  studentsCount,
  totalTasksCount,
  loading = false,
}) => {
  if (loading) {
    return (
      <section className={styles.grid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`${styles.card} ${styles.skeletonCard}`}>
            <div className={styles.skeletonIcon} />
            <div className={styles.skeletonLabel} />
            <div className={styles.skeletonValue} />
            <div className={styles.skeletonSub} />
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className={styles.grid}>
      {/* 1. Tarefas Pendentes */}
      <div className={`${styles.card} ${styles.pendingCard}`}>
        <div className={styles.cardHeader}>
          <FiCheckSquare className={styles.cardIcon} />
        </div>
        <span className={styles.cardLabel}>TAREFAS PENDENTES</span>
        <div className={styles.cardValue}>{pendingTasksCount}</div>
        <span className={styles.cardSub}>exigem acompanhamento</span>
      </div>

      {/* 2. Tarefas Concluídas */}
      <div className={`${styles.card} ${styles.completedCard}`}>
        <div className={styles.cardHeader}>
          <FiCheckCircle className={styles.cardIcon} />
        </div>
        <span className={styles.cardLabel}>TAREFAS CONCLUÍDAS</span>
        <div className={styles.cardValue}>{completedTasksCount}</div>
        <span className={styles.cardSub}>finalizadas</span>
      </div>

      {/* 3. Alunos na Turma */}
      <div className={`${styles.card} ${styles.studentsCard}`}>
        <div className={styles.cardHeader}>
          <FiUsers className={styles.cardIcon} />
        </div>
        <span className={styles.cardLabel}>ALUNOS NA TURMA</span>
        <div className={styles.cardValue}>{studentsCount}</div>
        <span className={styles.cardSub}>cadastrados na turma</span>
      </div>

      {/* 4. Total de Tarefas */}
      <div className={`${styles.card} ${styles.totalCard}`}>
        <div className={styles.cardHeader}>
          <FiLayers className={styles.cardIcon} />
        </div>
        <span className={styles.cardLabel}>TOTAL DE TAREFAS</span>
        <div className={styles.cardValue}>{totalTasksCount}</div>
        <span className={styles.cardSub}>atividades registradas</span>
      </div>
    </section>
  );
};
