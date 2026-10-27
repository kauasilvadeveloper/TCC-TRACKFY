"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.scss";
import { api } from "@/src/services/api";
import { FiUserPlus, FiBell, FiSun, FiTrash2, FiSearch, FiArrowLeft } from "react-icons/fi";

export default function CoordinationPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"alunos" | "docentes" | "turmas">("alunos");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [users, setUsers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCoordinationData() {
      try {
        setLoading(true);
        
        const token = localStorage.getItem("@token") || localStorage.getItem("@session") || localStorage.getItem("token") || "";
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // 1. Busca as turmas
        const classesRes = await api.get("/classes", { headers }).catch(() => ({ data: [] }));
        const classesData = classesRes.data || [];
        setClasses(classesData);

        // 2. Busca os utilizadores de todas as turmas
        let allUsers: any[] = [];
        for (const cls of classesData) {
          const usersRes = await api.get(`/class/${cls.id}/users`, { headers }).catch(() => ({ data: [] }));
          const classUsers = usersRes.data || [];
          
          for (const u of classUsers) {
            if (!allUsers.some(existing => existing.id === u.id || existing.email === u.email)) {
              allUsers.push(u);
            }
          }
        }

        setUsers(allUsers);
      } catch (err: any) {
        console.error("Erro ao carregar dados da coordenação:", err);
        setErrorMessage("Não foi possível carregar os dados do banco.");
      } finally {
        setLoading(false);
      }
    }

    fetchCoordinationData();
  }, []);

  // Filtro baseado estritamente no atributo cargo_escola do banco
  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Atributo exato do banco: cargo_escola (aluno, docente, coordenador)
    const cargo = user.cargo_escola?.toLowerCase() || "";

    if (activeTab === "alunos") {
      return matchesSearch && cargo === "aluno";
    } else if (activeTab === "docentes") {
      return matchesSearch && cargo === "docente";
    }

    return matchesSearch;
  });

  // Métricas exatas baseadas em cargo_escola
  const totalAlunos = users.filter(u => u.cargo_escola?.toLowerCase() === "aluno").length;
  const totalDocentes = users.filter(u => u.cargo_escola?.toLowerCase() === "docente").length;
  const totalTurmas = classes.length;

  return (
    <div className={styles.container}>
      
      {/* Top Header */}
      <header className={styles.topHeader}>
        <div className={styles.headerLeft}>
          <Link href="/dashboard" className={styles.backIcon}><FiArrowLeft /></Link>
          <div className={styles.brandTitle}>
            <h1>Coordenação</h1>
            <span>Gestão Acadêmica</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          {/* <FiBell className={styles.iconButton} /> */}
          {/* <FiSun className={styles.iconButton} /> */}
        </div>
      </header>

      {/* Metrics Cards */}
      <section className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span>TOTAL DE ALUNOS</span>
          <h2>{totalAlunos}</h2>
        </div>
        <div className={styles.metricCard}>
          <span>DOCENTES ATIVOS</span>
          <h2 style={{ color: "#10b981" }}>{totalDocentes}</h2>
        </div>
        <div className={styles.metricCard}>
          <span>TURMAS CADASTRADAS</span>
          <h2 style={{ color: "#f59e0b" }}>{totalTurmas}</h2>
        </div>
      </section>

      {/* Controls Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.tabs}>
          <button 
            className={activeTab === "alunos" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("alunos")}
          >
            Alunos <span>{totalAlunos}</span>
          </button>
          <button 
            className={activeTab === "docentes" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("docentes")}
          >
            Docentes <span>{totalDocentes}</span>
          </button>
          <button 
            className={activeTab === "turmas" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("turmas")}
          >
            Turmas <span>{totalTurmas}</span>
          </button>
        </div>

        <div className={styles.rightControls}>
          <div className={styles.searchBox}>
            <FiSearch />
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button 
            className={styles.registerBtn}
            onClick={() => router.push("/user-register")}
          >
            <FiUserPlus /> Cadastrar Usuário
          </button>
        </div>
      </div>

      {/* Data Table Container */}
      <div className={styles.tableContainer}>
        {errorMessage && <p style={{ padding: "1rem 1.5rem", color: "#f87171", fontSize: "0.85rem" }}>{errorMessage}</p>}
        
        {loading ? (
          <p style={{ padding: "2rem", color: "#94a3b8", textAlign: "center" }}>Carregando dados do banco...</p>
        ) : activeTab === "turmas" ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>NOME DA TURMA</th>
                <th>CÓDIGO / ID</th>
                <th>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {classes.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: "center", color: "#64748b", padding: "2rem" }}>Nenhuma turma encontrada.</td></tr>
              ) : (
                classes.map((cls: any) => (
                  <tr key={cls.id}>
                    <td><strong>{cls.name || cls.nomeTurma}</strong></td>
                    <td style={{ color: "#94a3b8" }}>{cls.id}</td>
                    <td><span className={styles.statusActive}>ATIVA</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>NOME</th>
                <th>CARGO / FUNÇÃO</th>
                <th>E-MAIL</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "#64748b", padding: "2rem" }}>Nenhum registo encontrado para esta categoria.</td></tr>
              ) : (
                filteredUsers.map((user: any, index: number) => {
                  const initials = user.name ? user.name.substring(0, 2).toUpperCase() : "US";
                  const displayCargo = user.cargo_escola ? user.cargo_escola.toUpperCase() : "REGISTRADO";
                  return (
                    <tr key={user.id || index}>
                      <td className={styles.userInfo}>
                        <span className={styles.avatar}>{initials}</span>
                        <span>{user.name}</span>
                      </td>
                      <td style={{ color: "#3b82f6", fontWeight: 600 }}>{displayCargo}</td>
                      <td style={{ color: "#94a3b8" }}>{user.email}</td>
                      <td>
                        <span className={styles.statusActive}>ATIVO</span>
                      </td>
                      <td>
                        <button className={styles.deleteBtn} title="Remover">
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}