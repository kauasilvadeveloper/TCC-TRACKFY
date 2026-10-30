// src/components/dashboard/DashboardShortcuts/DashboardShortcuts.tsx
"use client";

import Link from "next/link";

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

      </div>
    </section>
  );
}
