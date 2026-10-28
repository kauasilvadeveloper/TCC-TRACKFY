"use client";

import React from "react";
import styles from "./ProfessorNavbar.module.scss";
import { FiPlus, FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "@/src/context/ThemeContext";

interface ProfessorNavbarProps {
  professorName: string;
  onOpenCreateTask: () => void;
}

export const ProfessorNavbar: React.FC<ProfessorNavbarProps> = ({
  professorName,
  onOpenCreateTask,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={styles.navbar}>
      <div className={styles.brandContainer}>
        <div className={styles.brandLogo}>T</div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>Trackfy</span>
          <span className={styles.brandSub}>ÁREA DO PROFESSOR</span>
        </div>
      </div>

      <div className={styles.centerContainer}>
        <h1 className={styles.pageTitle}>Painel do Professor</h1>
        <p className={styles.pageSubtitle}>
          {professorName ? `Prof. ${professorName}` : "Prof. Docente"} · Área Acadêmica
        </p>
      </div>

      <div className={styles.actionsContainer}>
        <div className={styles.roleBadge}>Professor</div>

        <button
          type="button"
          className={styles.createTaskButton}
          onClick={onOpenCreateTask}
        >
          <FiPlus className={styles.plusIcon} />
          <span>Nova tarefa</span>
        </button>

        <button
          type="button"
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label="Alternar tema"
        >
          {theme === "dark" ? <FiSun /> : <FiMoon />}
        </button>
      </div>
    </header>
  );
};
