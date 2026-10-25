// src/components/dashboard/DashboardMembers/DashboardMembers.tsx
"use client";

import { useState } from "react";
import { mockMembers } from "@/src/mocks/dashboard.mock";
import styles from "./DashboardMembers.module.scss";

export function DashboardMembers() {
  const [activeTab, setActiveTab] = useState("membros");

  const onlineCount = mockMembers.filter((m) => m.online).length;

  return (
    <section id="equipe" className={styles.section} aria-labelledby="members-title">
      <div className={styles.container}>
        {/* Left Column: Context & Controls */}
        <div className={styles.leftCol}>
          <span className={styles.tag}>Membros</span>
          <h2 id="members-title" className={styles.title}>
            Pessoas, papéis e contexto no mesmo lugar.
          </h2>
          <p className={styles.description}>
            Veja quem participa do projeto, encontre dados de contato e
            acompanhe o engajamento de toda a equipe para manter o alinhamento em
            todas as etapas.
          </p>

          <div className={styles.filterTabs} role="tablist" aria-label="Abas de membros">
            <button
              type="button"
              className={`${styles.tabBtn} ${
                activeTab === "membros" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("membros")}
              role="tab"
              aria-selected={activeTab === "membros"}
            >
              Membros
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${
                activeTab === "papeis" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("papeis")}
              role="tab"
              aria-selected={activeTab === "papeis"}
            >
              Papéis
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${
                activeTab === "atividades" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("atividades")}
              role="tab"
              aria-selected={activeTab === "atividades"}
            >
              Atividades
            </button>
          </div>

          <button
            type="button"
            className={styles.actionBtn}
            aria-label="Ver equipe completa"
          >
            <span>Ver equipe</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>

        {/* Right Column: Members Widget */}
        <div className={styles.widgetCard}>
          <div className={styles.widgetHeader}>
            <span className={styles.widgetTitle}>Membros do Projeto</span>
            <div className={styles.statusBadge}>
              <span className={styles.onlinePulse} />
              <span>{onlineCount} Online agora</span>
            </div>
          </div>

          <div className={styles.membersList}>
            {mockMembers.map((member) => (
              <div key={member.id} className={styles.memberRow}>
                <div className={styles.memberInfo}>
                  <div
                    className={styles.memberAvatar}
                    style={{ backgroundColor: member.avatarCor }}
                  >
                    {member.iniciais}
                  </div>
                  <div className={styles.textGroup}>
                    <span className={styles.memberName}>{member.nome}</span>
                    <span className={styles.memberRole}>{member.cargo}</span>
                  </div>
                </div>

                <div className={styles.memberMeta}>
                  <span
                    className={`${styles.statusDot} ${
                      member.online ? styles.online : styles.offline
                    }`}
                    title={member.online ? "Online" : "Ausente"}
                  />
                  <span className={styles.arrowIcon} aria-hidden="true">
                    ›
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
