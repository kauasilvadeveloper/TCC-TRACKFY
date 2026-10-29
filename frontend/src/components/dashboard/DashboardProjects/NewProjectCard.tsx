// src/components/dashboard/DashboardProjects/NewProjectCard.tsx
"use client";

import { useRouter } from "next/navigation";
import styles from "./DashboardProjects.module.scss";

export function NewProjectCard() {
  const router = useRouter();

  return (
    <button
      type="button"
      className={styles.newProjectDottedCard}
      aria-label="Criar novo projeto"
      onClick={() => router.push("/project/newProject")}
    >
      <div className={styles.plusIconBox} aria-hidden="true">
        +
      </div>
      <div>
        <h4 className={styles.newCardTitle}>Criar novo projeto</h4>
        <p className={styles.newCardSubtitle}>Comece agora mesmo</p>
      </div>
    </button>
  );
}