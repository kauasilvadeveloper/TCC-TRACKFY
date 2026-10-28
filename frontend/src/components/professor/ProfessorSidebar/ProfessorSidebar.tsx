"use client";

import React from "react";
import styles from "./ProfessorSidebar.module.scss";
import { FiGrid, FiCheckSquare, FiUsers } from "react-icons/fi";

interface ProfessorSidebarProps {
  professorName: string;
  subjectName?: string;
  taskCount: number;
  onOpenTasksModal: () => void;
  onOpenClassesModal: () => void;
}

export const ProfessorSidebar: React.FC<ProfessorSidebarProps> = ({
  professorName,
  subjectName = "Desenvolvimento Web",
  taskCount,
  onOpenTasksModal,
  onOpenClassesModal,
}) => {
  return (
    <aside className={styles.sidebar}>
      {/* Card do Professor */}
      <div className={styles.profileCard}>
        <span className={styles.roleTag}>PROFESSOR</span>
        <h2 className={styles.profileName}>
          {professorName ? `Prof. ${professorName}` : "Prof. Docente"}
        </h2>
        <span className={styles.profileSubject}>{subjectName}</span>
      </div>

      {/* Menu de Navegação */}
      <nav className={styles.navMenu}>
        <button
          type="button"
          className={`${styles.navItem} ${styles.active}`}
          aria-current="page"
        >
          <FiGrid className={styles.navIcon} />
          <span>Visão Geral</span>
        </button>

        <button
          type="button"
          className={styles.navItem}
          onClick={onOpenTasksModal}
        >
          <div className={styles.navItemContent}>
            <FiCheckSquare className={styles.navIcon} />
            <span>Tarefas</span>
          </div>
          {taskCount > 0 && <span className={styles.badge}>{taskCount}</span>}
        </button>

        <button
          type="button"
          className={styles.navItem}
          onClick={onOpenClassesModal}
        >
          <div className={styles.navItemContent}>
            <FiUsers className={styles.navIcon} />
            <span>Minhas Turmas</span>
          </div>
        </button>
      </nav>
    </aside>
  );
};

