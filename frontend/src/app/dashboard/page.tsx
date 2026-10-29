// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAuth } from "@/src/context/AuthContext";
import { DashboardProvider } from "@/src/context/DashboardContext";
import { DashboardNavbar } from "@/src/components/dashboard/DashboardNavbar/DashboardNavbar";
import { DashboardHero } from "@/src/components/dashboard/DashboardHero/DashboardHero";
import { DashboardShortcuts } from "@/src/components/dashboard/DashboardShortcuts/DashboardShortcuts";
import { DashboardProjects } from "@/src/components/dashboard/DashboardProjects/DashboardProjects";
import { DashboardWorkflow } from "@/src/components/dashboard/DashboardWorkflow/DashboardWorkflow";
import { DashboardPerformance } from "@/src/components/dashboard/DashboardPerformance/DashboardPerformance";
import { DashboardMembers } from "@/src/components/dashboard/DashboardMembers/DashboardMembers";
import { DashboardCtaBanner } from "@/src/components/dashboard/DashboardCtaBanner/DashboardCtaBanner";
import styles from "./page.module.scss";

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const token = Cookies.get("trackfy_token");
    if (!token && !isAuthenticated) {
      router.push("/");
    } else {
      setIsCheckingAuth(false);
    }
  }, [isAuthenticated, router]);

  if (isCheckingAuth) {
    return (
      <div className={styles.loadingWrapper} role="status" aria-live="polite">
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Carregando Trackfy...</p>
      </div>
    );
  }

  return (
    <DashboardProvider>
      <div className={styles.dashboardPage}>
        <DashboardNavbar />
        <main className={styles.mainContent}>
          <DashboardHero />
          <DashboardShortcuts />
          <DashboardProjects />
          <DashboardWorkflow />
          <DashboardPerformance />
          <DashboardMembers />
          <DashboardCtaBanner />
        </main>
      </div>
    </DashboardProvider>
  );
}
