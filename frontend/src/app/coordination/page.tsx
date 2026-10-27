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
      const token = localStorage.getItem("@token") || localStorage.getItem("@session") || localStorage.getItem("token");

      if (!token) {
        router.push("/");
        return;
      }

      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Busca as turmas do usuário/sistema para listar e extrair membros
        const classesRes = await api.get("/classes", { headers });
        const classesData = classesRes.data || [];
        setClasses(classesData);

        // 2. Se houver turmas, busca os usuários da primeira turma ou consolida dados reais
        // (Ajustado para puxar da rota GET /class/:id/users do seu backend)
        let allUsers: any[] = [];
        if (classesData.length > 0) {
          // Exemplo buscando da primeira turma ativa para preencher o painel
          const firstClassId = classesData[0].id;
          const usersRes = await api.get(`/class/${firstClassId}/users`, { headers });
          allUsers = usersRes.data || [];
        }

        setUsers(allUsers);
      } catch (err: any) {
        console.error("Erro ao carregar dados da coordenação:", err);
        if (err.response?.status === 401) {
          localStorage.clear();
          router.push("/");
          return;
        }
        setErrorMessage("Não foi possível carregar os dados do banco.");
      } finally {
        setLoading(false);
      }
    }

    fetchCoordinationData();
  }, [router]);

  // Filtros baseados na aba ativa e termo de busca
  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "alunos") {
      return matchesSearch && (user.role === "aluno" || !user.role || user.email?.includes("@aluno"));
    } else if (activeTab === "docentes") {
      return matchesSearch && (user.role === "docente" || user.email?.includes("@docente"));
    }
    return matchesSearch;
  });

  const totalAlunos = users.filter(u => u.role === "aluno" || u.email?.includes("@aluno")).length;
  const totalDocentes = users.filter(u => u.role === "docente" || u.email?.includes("@docente")).length;
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

      {/* Controls Bar (Tabs & Search & Action Button) */}
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

          {/* Botão solicitado alterado para Cadastrar Usuário direcionando para a rota de cadastro */}
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
        {errorMessage && <p style={{ padding: "1.5rem", color: "#f87171" }}>{errorMessage}</p>}
        
        {loading ? (
          <p style={{ padding: "2rem", color: "#94a3b8", textAlign: "center" }}>Carregando dados do banco...</p>
        ) : activeTab === "turmas" ? (
          /* Tabela de Turmas */
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
          /* Tabela de Alunos / Docentes */
          <table className={styles.table}>
            <thead>
              <tr>
                <th>NOME</th>
                <th>ID / REGISTRO</th>
                <th>E-MAIL</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "#64748b", padding: "2rem" }}>Nenhum registo encontrado no banco.</td></tr>
              ) : (
                filteredUsers.map((user: any, index: number) => {
                  const initials = user.name ? user.name.substring(0, 2).toUpperCase() : "US";
                  return (
                    <tr key={user.id || index}>
                      <td className={styles.userInfo}>
                        <span className={styles.avatar}>{initials}</span>
                        <span>{user.name}</span>
                      </td>
                      <td style={{ color: "#94a3b8" }}>{user.id ? user.id.substring(0, 8) : "N/A"}</td>
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