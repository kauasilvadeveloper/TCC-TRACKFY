// src/components/dashboard/DashboardPerformance/DashboardPerformance.tsx
"use client";

import { useState } from "react";
import {
  mockPerformanceMetrics,
  mockChartPoints,
} from "@/src/mocks/dashboard.mock";
import styles from "./DashboardPerformance.module.scss";

export function DashboardPerformance() {
  const [period, setPeriod] = useState("7d");

  return (
    <section
      id="relatorios"
      className={styles.section}
      aria-labelledby="performance-title"
    >
      <div className={styles.container}>
        {/* Left Column: Analytics Widget */}
        <div className={styles.widgetCard}>
          <div className={styles.widgetHeader}>
            <span className={styles.widgetTitle}>Visão de Desempenho</span>
            <div className={styles.trendBadge} aria-label="Tendência positiva de 12%">
              <span aria-hidden="true">▲</span>
              <span>+12%</span>
            </div>
          </div>

          <div className={styles.widgetBody}>
            <div className={styles.kpiGrid}>
              {mockPerformanceMetrics.map((kpi, index) => (
                <div key={index} className={styles.kpiCard}>
                  <span className={styles.kpiValue}>{kpi.valor}</span>
                  <span className={styles.kpiLabel}>{kpi.rotulo}</span>
                  <span className={styles.kpiDesc}>{kpi.descricao}</span>
                </div>
              ))}
            </div>

            <div className={styles.chartCard}>
              <div className={styles.chartTitleRow}>
                <h4>Volume de Entregas por Dia</h4>
                <span>Últimos 7 dias</span>
              </div>

              <div className={styles.barChart}>
                {mockChartPoints.map((point, index) => (
                  <div key={index} className={styles.barCol}>
                    <div className={styles.barTrack}>
                      <div
                        className={`${styles.barFill} ${
                          point.alturaPct === 100 ? styles.highlight : ""
                        }`}
                        style={{ height: `${point.alturaPct}%` }}
                        title={`${point.dia}: ${point.entregas} entregas finalizadas`}
                      />
                    </div>
                    <span className={styles.barLabel}>{point.dia}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Context & Controls */}
        <div className={styles.rightCol}>
          <span className={styles.tag}>Visão de Desempenho</span>
          <h2 id="performance-title" className={styles.title}>
            Transforme atividade em visão.
          </h2>
          <p className={styles.description}>
            Acompanhe a produtividade da sua equipe com métricas de tempo,
            entregas e tarefas concluídas para tomar decisões mais rápidas e
            precisas.
          </p>

          <div
            className={styles.filterTabs}
            role="tablist"
            aria-label="Filtro de período"
          >
            <button
              type="button"
              className={`${styles.tabBtn} ${
                period === "7d" ? styles.active : ""
              }`}
              onClick={() => setPeriod("7d")}
              role="tab"
              aria-selected={period === "7d"}
            >
              7 dias
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${
                period === "14d" ? styles.active : ""
              }`}
              onClick={() => setPeriod("14d")}
              role="tab"
              aria-selected={period === "14d"}
            >
              14 dias
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${
                period === "month" ? styles.active : ""
              }`}
              onClick={() => setPeriod("month")}
              role="tab"
              aria-selected={period === "month"}
            >
              Este mês
            </button>
          </div>

          <button
            type="button"
            className={styles.actionBtn}
            aria-label="Ver relatórios completos de desempenho"
          >
            <span>Ver relatórios</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
