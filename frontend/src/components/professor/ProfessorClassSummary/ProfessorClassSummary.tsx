"use client";

import React from "react";
import styles from "./ProfessorClassSummary.module.scss";
import { FiArrowRight, FiUserCheck, FiUsers } from "react-icons/fi";
import { ClassStudent } from "@/src/types/professor";

interface ProfessorClassSummaryProps {
  classNameTitle: string;
  subjectName?: string;
  students: ClassStudent[];
  selectedClassId: number | null;
  onOpenTasksModal: () => void;
  loading?: boolean;
}

export const ProfessorClassSummary: React.FC<ProfessorClassSummaryProps> = ({
  classNameTitle,
  subjectName = "Desenvolvimento Web",
  students,
  selectedClassId,
  onOpenTasksModal,
  loading = false,
}) => {
  return (
    <aside className={styles.summaryCard}>
      <div className={styles.header}>
        <h3 className={styles.title}>Resumo da turma</h3>
        <p className={styles.subtitle}>
          {classNameTitle} · {subjectName}
        </p>
      </div>

      {/* Seção de Alunos: Exibindo estritamente Nome, Email e Sala */}
      <div className={styles.studentsSection}>
        <div className={styles.studentsHeader}>
          <span className={styles.sectionLabel}>Alunos da Turma</span>
          <span className={styles.studentsCountBadge}>
            {students.length} cadastrados
          </span>
        </div>

        {loading ? (
          <div className={styles.studentsList}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={`${styles.studentItem} ${styles.skeletonItem}`}>
                <div className={styles.skeletonAvatar} />
                <div className={styles.skeletonInfo}>
                  <div className={styles.skeletonText} />
                  <div className={styles.skeletonSub} />
                </div>
              </div>
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className={styles.emptyStudents}>
            <FiUsers className={styles.emptyIcon} />
            <p className={styles.emptyText}>
              Nenhum aluno matriculado nesta turma até o momento.
            </p>
          </div>
        ) : (
          <div className={styles.studentsList}>
            {students.slice(0, 4).map((student, idx) => (
              <div key={student.id || idx} className={styles.studentItem}>
                <div className={styles.studentAvatar}>
                  <FiUserCheck className={styles.avatarIcon} />
                </div>
                <div className={styles.studentInfo}>
                  <span className={styles.studentName}>{student.nome}</span>
                  <span className={styles.studentEmail}>{student.email}</span>
                </div>
                <div className={styles.studentClassBadge}>
                  Sala {student.sala || selectedClassId}
                </div>
              </div>
            ))}
            {students.length > 4 && (
              <span className={styles.moreStudentsHint}>
                + {students.length - 4} outros alunos cadastrados
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bloco de Ação Rápida */}
      <div className={styles.quickActionBox}>
        <span className={styles.quickActionLabel}>Ação rápida</span>
        <p className={styles.quickActionText}>
          Revise as tarefas com prazo próximo.
        </p>
        <button
          type="button"
          className={styles.quickActionLink}
          onClick={onOpenTasksModal}
        >
          <span>Abrir lista de tarefas</span>
          <FiArrowRight />
        </button>
      </div>
    </aside>
  );
};
