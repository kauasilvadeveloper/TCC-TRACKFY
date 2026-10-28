"use client";

import React, { useState } from "react";
import styles from "./MyClassesModal.module.scss";
import { FiX, FiUsers, FiCheck, FiBookOpen } from "react-icons/fi";
import { ProfessorClass, ClassStudent } from "@/src/types/professor";

interface MyClassesModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ProfessorClass[];
  selectedClassId: number | null;
  students: ClassStudent[];
  onSelectClass: (classId: number) => void;
}

export const MyClassesModal: React.FC<MyClassesModalProps> = ({
  isOpen,
  onClose,
  classes,
  selectedClassId,
  students,
  onSelectClass,
}) => {
  const [activeTab, setActiveTab] = useState<"classes" | "students">("classes");

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Minhas Turmas</h3>
            <p className={styles.modalSubtitle}>
              Turmas acadêmicas vinculadas ao seu perfil de professor
            </p>
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

        {/* Abas */}
        <div className={styles.tabsRow}>
          <button
            type="button"
            className={`${styles.tabBtn} ${
              activeTab === "classes" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("classes")}
          >
            <FiBookOpen />
            <span>Turmas ({classes.length})</span>
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${
              activeTab === "students" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("students")}
          >
            <FiUsers />
            <span>Alunos Matriculados ({students.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          {activeTab === "classes" ? (
            <div className={styles.classesList}>
              {classes.length === 0 ? (
                <div className={styles.emptyContainer}>
                  <FiBookOpen className={styles.emptyIcon} />
                  <h4>Nenhuma turma vinculada</h4>
                  <p>Você ainda não está alocado em turmas acadêmicas ativas.</p>
                </div>
              ) : (
                classes.map((cls) => {
                  const isSelected = cls.id === selectedClassId;

                  return (
                    <div
                      key={cls.id}
                      className={`${styles.classCard} ${
                        isSelected ? styles.selectedCard : ""
                      }`}
                    >
                      <div className={styles.classInfo}>
                        <div className={styles.titleRow}>
                          <h4 className={styles.className}>
                            {cls.name || `Turma ${cls.id}`}
                          </h4>
                          {isSelected && (
                            <span className={styles.activeTag}>
                              <FiCheck /> Ativa
                            </span>
                          )}
                        </div>
                        <span className={styles.classMeta}>
                          Ano de Encerramento: {cls.anoEncerramento} ·{" "}
                          {cls._count?.usuarios ?? students.length} membros
                        </span>
                      </div>

                      <button
                        type="button"
                        className={`${styles.selectClassBtn} ${
                          isSelected ? styles.alreadySelected : ""
                        }`}
                        onClick={() => {
                          onSelectClass(cls.id);
                          onClose();
                        }}
                        disabled={isSelected}
                      >
                        {isSelected ? "Selecionada" : "Visualizar Turma"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Lista de Alunos: Exibindo estritamente Nome, Email e Sala */
            <div className={styles.studentsList}>
              {students.length === 0 ? (
                <div className={styles.emptyContainer}>
                  <FiUsers className={styles.emptyIcon} />
                  <h4>Nenhum aluno matriculado</h4>
                  <p>Não há estudantes cadastrados nesta turma no momento.</p>
                </div>
              ) : (
                <div className={styles.studentsTable}>
                  <div className={styles.tableHeader}>
                    <span>Nome do Aluno</span>
                    <span>Email</span>
                    <span>Sala</span>
                  </div>
                  {students.map((student, idx) => (
                    <div key={student.id || idx} className={styles.tableRow}>
                      <span className={styles.studentName}>{student.nome}</span>
                      <span className={styles.studentEmail}>{student.email}</span>
                      <span className={styles.studentSala}>
                        Sala {student.sala || selectedClassId}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
