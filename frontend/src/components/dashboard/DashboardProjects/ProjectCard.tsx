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
      href={`/project/${project.id}`}
      className={`${styles.projectCard} ${styles[project.corDestaque]}`}
    >
      <div className={styles.accentTopBar} />

      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <h3 className={styles.projectTitle}>{project.tituloProjeto}</h3>
        </div>

        <div className={styles.cardFooter}>
          <div className={styles.deadlineInfo}>
            <span className={styles.deadlineIcon} aria-hidden="true">
              📅
            </span>
            <span>{project.prazo}</span>
          </div>

          <div className={styles.avatarStack} aria-label="Membros da equipe">
            {project.membros.map((membro, index) => (
              <div
                key={`${membro.id}-${index}`}
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
