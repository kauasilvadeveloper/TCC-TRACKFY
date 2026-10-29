"use client";

import React from "react";
import styles from "./ProfessorClassProjects.module.scss";
import {
  FiFolder,
  FiCalendar,
  FiLayers,
  FiCheckSquare,
  FiArrowRight,
  FiInbox,
} from "react-icons/fi";
import { ClassProject, ProfessorTask } from "@/src/types/professor";

interface ProfessorClassProjectsProps {
  projects: ClassProject[];
  classNameTitle: string;
  onOpenProjectManage: (project: ClassProject) => void;
  onOpenTaskDetails?: (task: ProfessorTask) => void;
  loading?: boolean;
}

export const ProfessorClassProjects: React.FC<ProfessorClassProjectsProps> = ({
  projects,
  classNameTitle,
  onOpenProjectManage,
  loading = false,
}) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Sem prazo";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className={styles.projectsSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.headerTitleWrapper}>
          <div className={styles.titleRow}>
            <h3 className={styles.sectionTitle}>Projetos da Turma</h3>
            <span className={styles.badgeCount}>{projects.length}</span>
          </div>
          <p className={styles.sectionSubtitle}>
            Projetos desenvolvidos pelas equipes e alunos vinculados a {classNameTitle}
          </p>
        </div>
      </div>

      {loading ? (
        <div className={styles.projectsGrid}>
          {[1, 2].map((i) => (
            <div
              key={i}
              className={`${styles.projectCard} ${styles.skeletonCard}`}
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className={styles.emptyState}>
          <FiInbox className={styles.emptyIcon} />
          <h4>Nenhum projeto encontrado nesta turma</h4>
          <p>
            Os alunos matriculados ainda não iniciaram projetos acadêmicos ou não foram
            vinculados aos repositórios correspondentes.
          </p>
        </div>
      ) : (
        <div className={styles.projectsGrid}>
          {projects.map((project) => {
            const memberList = project.usuarios || [];
            const sprintsCount = project.sprints?.length || 0;
            const tasksCount = project.tarefas?.length || 0;
            const completedTasks =
              project.tarefas?.filter(
                (t) =>
                  t.status.toLowerCase().includes("conclu") ||
                  t.status === "done"
              ).length || 0;

            return (
              <div key={project.id} className={styles.projectCard}>
                <div className={styles.cardTop}>
                  <div className={styles.cardHeaderRow}>
                    <div className={styles.projectIconTitle}>
                      <div className={styles.projectIconWrapper}>
                        <FiFolder />
                      </div>
                      <div>
                        <h4 className={styles.projectTitle}>
                          {project.tituloProjeto}
                        </h4>
                      </div>
                    </div>

                    <span className={styles.deadlineBadge}>
                      <FiCalendar /> {formatDate(project.prazo)}
                    </span>
                  </div>

                  {project.descricao && (
                    <p className={styles.projectDescription}>
                      {project.descricao}
                    </p>
                  )}

                  {/* Alunos Membros */}
                  <div className={styles.membersSection}>
                    <span className={styles.membersLabel}>Alunos da Equipe</span>
                    <div className={styles.membersList}>
                      {memberList.length === 0 ? (
                        <span className={styles.membersLabel}>Sem membros associados</span>
                      ) : (
                        memberList.map((m, idx) => (
                          <div
                            key={m.usuario?.id || idx}
                            className={styles.memberPill}
                            title={m.usuario?.email || m.usuario?.nome}
                          >
                            <span className={styles.memberAvatarSmall}>
                              {(m.usuario?.nome || "A").charAt(0).toUpperCase()}
                            </span>
                            <span>{m.usuario?.nome || "Aluno"}</span>
                            {m.funcaoProjeto?.tituloFuncaoProjeto && (
                              <span className={styles.memberRole}>
                                · {m.funcaoProjeto.tituloFuncaoProjeto}
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Métricas Rápidas */}
                <div className={styles.cardMetricsRow}>
                  <div className={styles.metricItem}>
                    <FiLayers className={styles.metricIcon} />
                    <span>Sprints:</span>
                    <span className={styles.metricValue}>{sprintsCount}</span>
                  </div>
                  <div className={styles.metricItem}>
                    <FiCheckSquare className={styles.metricIcon} />
                    <span>Tarefas:</span>
                    <span className={styles.metricValue}>
                      {completedTasks}/{tasksCount}
                    </span>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <button
                    type="button"
                    className={styles.manageBtn}
                    onClick={() => onOpenProjectManage(project)}
                  >
                    <span>Gerenciar Sprints & Tarefas</span>
                    <FiArrowRight />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

