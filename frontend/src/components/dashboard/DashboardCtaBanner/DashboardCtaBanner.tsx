// src/components/dashboard/DashboardCtaBanner/DashboardCtaBanner.tsx
"use client";

import styles from "./DashboardCtaBanner.module.scss";

export function DashboardCtaBanner() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.bannerCard}>
          <div className={styles.textArea}>
            <span className={styles.tag}>Pronto para começar?</span>
            <h2 className={styles.title}>
              Crie um projeto ou volte ao trabalho.
            </h2>
            <p className={styles.description}>
              Escolha um projeto existente ou comece uma nova iniciativa para
              organizar tarefas, colaboradores e prazos da sua equipe.
            </p>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryBtn}
              aria-label="Criar novo projeto"
            >
              <span>+</span>
              <span>Criar projeto</span>
            </button>

            <a href="#projetos" className={styles.outlineBtn}>
              <span>Acessar projetos</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <footer className={styles.footer}>
          <p>Trackfy © 2026. Todos os direitos reservados.</p>
          <div className={styles.statusLine}>
            <span className={styles.statusIndicator} aria-hidden="true" />
            <span>Todos os sistemas operacionais</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
