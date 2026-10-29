// src/components/dashboard/DashboardProjects/DashboardProjects.tsx
"use client";

import { useDashboard } from "@/src/context/DashboardContext";
import { ProjectCard } from "./ProjectCard";
import { NewProjectCard } from "./NewProjectCard";
import styles from "./DashboardProjects.module.scss";

export function DashboardProjects() {
  const { projects, isLoading, error, refetchProjects } = useDashboard();

  return (
    <section id="projetos" className={styles.section} aria-labelledby="projects-title">
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div className={styles.titleArea}>
            <span className={styles.sectionTag}>Projetos</span>
            <h2 id="projects-title" className={styles.sectionTitle}>
              Escolha de onde quer continuar.
            </h2>
            <p className={styles.sectionSubtitle}>
              Veja os projetos em andamento, prioridades, progresso e membros
              envolvidos em cada etapa. Escolha por onde quer continuar e entre no
              projeto com apenas um clique.
            </p>
          </div>

          <button
            type="button"
            className={styles.createBtn}
            aria-label="Criar novo projeto"
          >
            <span>+</span>
            <span>Criar novo projeto</span>
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className={styles.errorContainer} role="alert">
            <span className={styles.errorMessage}>{error}</span>
            <button
              type="button"
              className={styles.retryBtn}
              onClick={() => refetchProjects()}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div
            className={styles.projectsGrid}
            role="status"
            aria-busy="true"
            aria-label="Carregando projetos"
          >
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className={styles.skeletonCard}>
                <div className={styles.skeletonBar} />
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonTrack} />
              </div>
            ))}
          </div>
        )}

        {/* Projects Grid or Empty State */}
        {!isLoading && !error && (
          <div className={styles.projectsGrid}>
            {projects.length > 0 ? (
              <>
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
                <NewProjectCard />
              </>
            ) : (
              <div className={styles.emptyStateContainer}>
                <span className={styles.emptyIcon} aria-hidden="true">
                  📁
                </span>
                <h3 className={styles.emptyTitle}>Nenhum projeto encontrado</h3>
                <p className={styles.emptyDesc}>
                  Você ainda não possui projetos vinculados. Comece criando o seu
                  primeiro projeto para organizar o trabalho da sua equipe.
                </p>
                <NewProjectCard />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
