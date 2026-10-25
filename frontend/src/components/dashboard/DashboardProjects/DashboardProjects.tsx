// src/components/dashboard/DashboardProjects/DashboardProjects.tsx
"use client";

import { mockProjects } from "@/src/mocks/dashboard.mock";
import { ProjectCard } from "./ProjectCard";
import { NewProjectCard } from "./NewProjectCard";
import styles from "./DashboardProjects.module.scss";

export function DashboardProjects() {
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

        <div className={styles.projectsGrid}>
          {mockProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
          <NewProjectCard />
        </div>
      </div>
    </section>
  );
}
