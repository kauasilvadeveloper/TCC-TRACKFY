// src/components/dashboard/DashboardProjects/ProjectCard.tsx
"use client";

import Link from "next/link";
import { DashboardProject } from "@/src/types/dashboard";
import styles from "./DashboardProjects.module.scss";

interface ProjectCardProps {
  project: DashboardProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projetos/${project.id}`}
      className={`${styles.projectCard} ${styles[project.corDestaque]}`}
    >
      <div className={styles.accentTopBar} />

      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <h3 className={styles.projectTitle}>{project.tituloProjeto}</h3>
          <span className={styles.progressBadge}>{project.progresso}%</span>
        </div>

        <p className={styles.sprintText}>{project.sprintAtual}</p>

        <div className={styles.progressBarContainer}>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${project.progresso}%` }}
              role="progressbar"
              aria-valuenow={project.progresso}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        <div className={styles.cardFooter}>
          <div className={styles.deadlineInfo}>
            <span className={styles.deadlineIcon} aria-hidden="true">
              📅
            </span>
            <span>{project.prazo}</span>
          </div>

          <div className={styles.avatarStack} aria-label="Membros da equipe">
            {project.membros.map((membro) => (
              <div
                key={membro.id}
                className={styles.memberAvatar}
                title={membro.nome}
              >
                {membro.iniciais}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
