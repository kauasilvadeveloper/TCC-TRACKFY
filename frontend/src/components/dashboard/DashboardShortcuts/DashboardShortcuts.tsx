// src/components/dashboard/DashboardShortcuts/DashboardShortcuts.tsx
"use client";

import Link from "next/link";
import { mockShortcuts } from "@/src/mocks/dashboard.mock";
import styles from "./DashboardShortcuts.module.scss";

export function DashboardShortcuts() {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "folder":
        return "📁";
      case "check":
        return "📋";
      case "chart":
        return "📈";
      case "users":
        return "👥";
      default:
        return "⚡";
    }
  };

  return (
    <section className={styles.shortcutsSection} aria-label="Atalhos Rápidos">
      <div className={styles.container}>
        <div className={styles.grid}>
          {mockShortcuts.map((shortcut) => (
            <Link
              key={shortcut.id}
              href={`#${shortcut.id}`}
              className={styles.card}
            >
              <div className={styles.iconBox} aria-hidden="true">
                {getIcon(shortcut.icone)}
              </div>
              <div className={styles.content}>
                <h3 className={styles.cardTitle}>{shortcut.titulo}</h3>
                <p className={styles.cardDesc}>{shortcut.descricao}</p>
              </div>
              <span className={styles.arrowIcon} aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
