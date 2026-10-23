// src/app/page.tsx
"use client";

import Image from "next/image";
import { LoginForm } from "@/src/components/auth/LoginForm";
import { useTheme } from "@/src/context/ThemeContext";
import styles from "@/src/app/page.module.scss";

export default function LoginPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.themeToggleBtn}
        onClick={toggleTheme}
        aria-label="Mudar tema"
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      <div className={styles.bannerSection}>
        <Image
          src="/public/foto-login.webp"
          alt="Equipe trabalhando reunida"
          fill
          priority
          className={styles.bgImage}
        />
        <div className={styles.bannerOverlay}>
          <h1>Gestão de projetos sem complexidade.</h1>
          <p>
            Rastreie tarefas, colabore em equipe e entregue resultados com total
            visibilidade.
          </p>
        </div>
      </div>

      <main className={styles.formSection}>
        <LoginForm />
      </main>
    </div>
  );
}
