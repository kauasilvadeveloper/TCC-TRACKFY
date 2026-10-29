// src/components/dashboard/DashboardNavbar/DashboardNavbar.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import styles from "./DashboardNavbar.module.scss";

export function DashboardNavbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "US";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Left Section: Brand & Nav Links */}
        <div className={styles.leftSection}>
          <Link href="/dashboard" className={styles.brand}>
            <span className={styles.logoIcon}>▼</span>
            <span className={styles.brandName}>Trackfy</span>
          </Link>
          <span className={styles.alphaBadge}>Alpha</span>

          <nav aria-label="Navegação Principal">
            <ul className={styles.navLinks}>
              <li className={styles.navItem}>
                <Link
                  href="/dashboard"
                  className={`${styles.navLink} ${styles.active}`}
                >
                  Visão Geral
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link href="#projetos" className={styles.navLink}>
                  Projetos
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link href="#tarefas" className={styles.navLink}>
                  Tarefas
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link href="#relatorios" className={styles.navLink}>
                  Relatórios
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Right Section: Search, Theme Toggle, Notification & Profile */}
        <div className={styles.rightSection}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon} aria-hidden="true">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar projeto..."
              aria-label="Buscar projeto"
              className={styles.searchInput}
            />
            <kbd className={styles.shortcutKey}>⌘K</kbd>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            className={styles.iconButton}
            onClick={toggleTheme}
            aria-label={`Alternar para modo ${theme === "dark" ? "claro" : "escuro"}`}
            title={`Modo ${theme === "dark" ? "claro" : "escuro"}`}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* Notifications Button */}
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Notificações"
            title="Notificações"
          >
            🔔
            <span className={styles.notificationDot} />
          </button>

          {/* User Profile & Dropdown */}
          <div className={styles.profileContainer} ref={dropdownRef}>
            <button
              type="button"
              className={styles.profileButton}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <div className={styles.avatar}>
                {getInitials(user?.name)}
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>
                  {user?.name || "Usuário"}
                </span>
                <span className={styles.userRole}>
                  {user?.email || "Membro"}
                </span>
              </div>
              <span className={styles.dropdownIcon} aria-hidden="true">
                ▼
              </span>
            </button>

            {dropdownOpen && (
              <div className={styles.dropdownMenu}>
                <div className={styles.dropdownHeader}>
                  <p className={styles.dropdownName}>{user?.name || "Usuário"}</p>
                  <p className={styles.dropdownEmail}>{user?.email || ""}</p>
                </div>
                <button
                  type="button"
                  className={styles.dropdownItem}
                  onClick={() => setDropdownOpen(false)}
                >
                  👤 Meu Perfil
                </button>
                <button
                  type="button"
                  className={styles.dropdownItem}
                  onClick={() => setDropdownOpen(false)}
                >
                  ⚙️ Preferências
                </button>
                <button
                  type="button"
                  className={`${styles.dropdownItem} ${styles.logout}`}
                  onClick={() => logout("/")}
                >
                  🚪 Sair da conta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
