"use client";

import React from "react";
import styles from "./ProfessorHeader.module.scss";
import { FiChevronDown } from "react-icons/fi";
import { ProfessorClass } from "@/src/types/professor";

interface ProfessorHeaderProps {
  professorFirstName: string;
  classes: ProfessorClass[];
  selectedClassId: number | null;
  onSelectClass: (classId: number) => void;
  onOpenTasksModal: () => void;
}

export const ProfessorHeader: React.FC<ProfessorHeaderProps> = ({
  professorFirstName,
  classes,
  selectedClassId,
  onSelectClass,
  onOpenTasksModal,
}) => {
  return (
    <section className={styles.headerSection}>
      <div className={styles.textContainer}>
        <span className={styles.sectionBadge}>ÁREA ACADÊMICA</span>
        <h2 className={styles.greetingTitle}>
          Olá, {professorFirstName || "Professor"}. Acompanhe suas turmas.
        </h2>
        <p className={styles.greetingDesc}>
          Aqui você visualiza o andamento das tarefas, entregas e atividades das suas turmas.
          As tarefas podem ter o prazo alterado ou ser excluídas, mas seu conteúdo permanece protegido.
        </p>
      </div>

      <div className={styles.controlsContainer}>
        <div className={styles.selectWrapper}>
          <select
            className={styles.classSelect}
            value={selectedClassId || ""}
            onChange={(e) => onSelectClass(Number(e.target.value))}
            disabled={classes.length === 0}
          >
            {classes.length === 0 ? (
              <option value="">Sem turmas</option>
            ) : (
              classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name || `Turma ${cls.id} (${cls.anoEncerramento})`}
                </option>
              ))
            )}
          </select>
          <FiChevronDown className={styles.selectChevron} />
        </div>

        <button
          type="button"
          className={styles.viewTasksButton}
          onClick={onOpenTasksModal}
        >
          Ver tarefas
        </button>
      </div>
    </section>
  );
};

