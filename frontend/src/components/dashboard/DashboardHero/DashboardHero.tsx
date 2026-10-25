// src/components/dashboard/DashboardHero/DashboardHero.tsx
"use client";

import { mockChartPoints } from "@/src/mocks/dashboard.mock";
import { useDashboard } from "@/src/context/DashboardContext";
import styles from "./DashboardHero.module.scss";

export function DashboardHero() {
  const { heroStats } = useDashboard();
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "folder":
        return "📁";
      case "check":
        return "✅";
      case "chart":
        return "📊";
      case "users":
        return "👥";
      default:
        return "📌";
    }
  };

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.container}>
        {/* Left Column: Headlines & CTA */}
        <div className={styles.leftCol}>
          <div className={styles.categoryTag}>
            <span className={styles.sparkle}>✦</span>
            <span>Dashboard · Projetos · Performance</span>
          </div>

          <h1 id="hero-title" className={styles.title}>
            O trabalho da sua equipe. <br />
            <span className={styles.accentText}>Em um só lugar.</span>
          </h1>

          <p className={styles.description}>
            O Trackfy conecta projetos, tarefas, relatórios, equipe e configurações
            em uma experiência única para você saber o que está acontecendo e o que
            precisa acontecer depois.
          </p>

          <div className={styles.actionRow}>
            <button
              type="button"
              className={styles.primaryBtn}
              aria-label="Criar novo projeto"
            >
              <span>+</span>
              <span>Criar novo projeto</span>
            </button>

            <a href="#tarefas" className={styles.secondaryBtn}>
              <span>Ver minhas tarefas</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className={styles.statsRow}>
            {heroStats.map((stat, index) => (
              <div key={index} className={styles.statItem}>
                <span className={styles.statIcon} aria-hidden="true">
                  {getIcon(stat.icone)}
                </span>
                <span>
                  <strong className={styles.statNumber}>{stat.valor}</strong>{" "}
                  {stat.rotulo}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive System Preview Window */}
        <div className={styles.mockupCard}>
          <div className={styles.windowBar}>
            <div className={styles.windowControls} aria-hidden="true">
              <span className={`${styles.dot} ${styles.close}`} />
              <span className={`${styles.dot} ${styles.minimize}`} />
              <span className={`${styles.dot} ${styles.maximize}`} />
            </div>
            <span className={styles.windowTitle}>preview-window.tsx</span>
            <span className={styles.windowStatusBadge}>Em andamento</span>
          </div>

          <div className={styles.mockupBody}>
            <div className={styles.mockupHeader}>
              <div className={styles.projectInfo}>
                <h3>Redesign do Portal</h3>
                <p>Trackfy Core Experience</p>
              </div>
              <span className={styles.sprintBadge}>Sprint 03</span>
            </div>

            <div className={styles.mockupMetrics}>
              <div className={styles.metricBox}>
                <div className={styles.metricNum}>12</div>
                <div className={styles.metricLabel}>Tarefas Concluídas</div>
              </div>
              <div className={styles.metricBox}>
                <div className={styles.metricNum}>47</div>
                <div className={styles.metricLabel}>Em Aberto</div>
              </div>
              <div className={styles.metricBox}>
                <div className={styles.metricNum}>6</div>
                <div className={styles.metricLabel}>Membros Ativos</div>
              </div>
            </div>

            <div className={styles.chartContainer}>
              <div className={styles.chartHeader}>
                <h4>Atividade Semanal da Sprint</h4>
                <span>+18% entregas</span>
              </div>

              <div className={styles.barChart}>
                {mockChartPoints.map((point, index) => (
                  <div key={index} className={styles.barCol}>
                    <div className={styles.barTrack}>
                      <div
                        className={`${styles.barFill} ${
                          point.alturaPct >= 90 ? styles.peak : ""
                        }`}
                        style={{ height: `${point.alturaPct}%` }}
                        title={`${point.dia}: ${point.entregas} entregas`}
                      />
                    </div>
                    <span className={styles.barLabel}>{point.dia}</span>
                  </div>
                ))}
              </div>

              <div className={styles.chartLegend}>
                <div className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.blue}`} />
                  <span>Concluídas</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.purple}`} />
                  <span>Em andamento</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.orange}`} />
                  <span>Atrasadas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
