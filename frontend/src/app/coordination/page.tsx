"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.scss";
import { api } from "@/src/services/api";
import Cookies from "js-cookie";
import {
  FiUserPlus,
  FiTrash2,
  FiSearch,
  FiArrowLeft,
  FiPlus,
  FiX,
  FiBookOpen,
} from "react-icons/fi";

export default function CoordinationPage() {
  const router = useRouter();

  // Estados principais
  const [activeTab, setActiveTab] = useState<"alunos" | "docentes" | "turmas">(
    "alunos",
  );
  const [searchTerm, setSearchTerm] = useState("");

  const [users, setUsers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados do Modal "Nova Turma"
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [anoEncerramento, setAnoEncerramento] = useState<number | string>(
    new Date().getFullYear(),
  );
  const [submittingClass, setSubmittingClass] = useState(false);

  // Estados do Modal "Detalhes da Turma"
  const [selectedClassDetails, setSelectedClassDetails] = useState<any | null>(
    null,
  );
  const [isClassDetailsModalOpen, setIsClassDetailsModalOpen] = useState(false);

  // Estados para Atribuição Rápida de Aluno à Turma
  const [selectedClassForUser, setSelectedClassForUser] = useState<
    number | null
  >(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  useEffect(() => {
    fetchCoordinationData();
  }, []);

  // Helper flexível para identificar o cargo do usuário
  const getUserCargo = (user: any): string => {
    if (!user) return "";
    const userData = user.usuario || user;
    const cargo =
      userData.cargoEscola ||
      userData.cargo_escola ||
      userData.cargo ||
      userData.role ||
      "";
    return cargo.toString().toLowerCase().trim();
  };

  const getClassStudents = (clsUsers: any[]) => {
    return (clsUsers || []).filter((u: any) => {
      const c = getUserCargo(u);
      return c === "aluno" || c === "student";
    });
  };

  // Busca de dados com desaninhamento do Prisma
  async function fetchCoordinationData() {
    try {
      setLoading(true);
      setErrorMessage(null);

      const token = Cookies.get("trackfy_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // 1. Busca todos os usuários cadastrados no sistema (Alunos / Docentes)
      const systemUsersRes = await api
        .get("/users", { headers })
        .catch(() => api.get("/user", { headers }))
        .catch(() => ({ data: [] }));

      const systemUsersData = Array.isArray(systemUsersRes.data)
        ? systemUsersRes.data
        : systemUsersRes.data?.users || systemUsersRes.data?.data || [];

      let allUsersMap = new Map<number, any>();

      systemUsersData.forEach((u: any) => {
        const id = u.id || u.id_usuario || u.fkUsuario;
        if (id) allUsersMap.set(id, u);
      });

      // 2. Busca todas as turmas
      const classesRes = await api
        .get("/classes", { headers })
        .catch(() => ({ data: [] }));
      const classesData = classesRes.data || [];

      // 3. Busca os usuários vinculados a cada turma
      const classesWithUsers = await Promise.all(
        classesData.map(async (cls: any) => {
          const usersRes = await api
            .get(`/class/${cls.id}/users`, { headers })
            .catch(() => ({ data: [] }));

          const resData = usersRes.data;
          const rawClassUsers = Array.isArray(resData)
            ? resData
            : resData?.users || resData?.data || [];

          const unwrappedUsers = rawClassUsers.map((u: any) => {
            const userObj = u.usuario || u;
            const userId =
              userObj.id || userObj.id_usuario || userObj.fkUsuario;

            if (allUsersMap.has(userId)) {
              return allUsersMap.get(userId);
            }
            return userObj;
          });

          unwrappedUsers.forEach((user: any) => {
            const id = user.id || user.id_usuario || user.fkUsuario;
            if (id && !allUsersMap.has(id)) {
              allUsersMap.set(id, user);
            }
          });

          return {
            ...cls,
            users: unwrappedUsers,
          };
        }),
      );

      setClasses(classesWithUsers);
      setUsers(Array.from(allUsersMap.values()));
    } catch (err: any) {
      console.error("Erro ao carregar dados do banco:", err);
      setErrorMessage(
        "Não foi possível carregar os dados atualizados do banco.",
      );
    } finally {
      setLoading(false);
    }
  }

  // Criação da turma
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!anoEncerramento) {
      alert("Informe o ano de encerramento.");
      return;
    }

    try {
      setSubmittingClass(true);

      const token = Cookies.get("trackfy_token");
      const user = JSON.parse(Cookies.get("trackfy_user") || "{}");

      if (!token) {
        alert("Sessão expirada. Faça login novamente.");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const anoNum = Number(anoEncerramento);

      const response = await api.post(
        "/class",
        {
          lastYear: anoNum,
        },
        { headers },
      );

      await api.post(
        "/class/join",
        {
          code: response.data.classroom.id,
          targetUser: user.id,
        },
        { headers },
      );

      setIsClassModalOpen(false);
      setAnoEncerramento(new Date().getFullYear());
      fetchCoordinationData();
    } catch (err: any) {
      console.error("Erro ao criar turma:", err.response?.data || err);
      const status = err.response?.status;
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Erro no servidor.";
      alert(`Falha ao criar turma (${status || "Erro"}): ${errorMsg}`);
    } finally {
      setSubmittingClass(false);
    }
  };

  // Vinculação de aluno à turma
  const handleAddStudentToClass = async (classId: number) => {
    if (!selectedStudentId) return;

    try {
      const token = Cookies.get("trackfy_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await api.post(
        "/class/join",
        {
          code: classId,
          targetUser: Number(selectedStudentId),
        },
        { headers },
      );

      setSelectedClassForUser(null);
      setSelectedStudentId("");
      fetchCoordinationData();
    } catch (err) {
      console.error("Erro ao vincular aluno à turma:", err);
      alert("Não foi possível vincular o aluno à turma.");
    }
  };

  // Listas filtradas por cargo
  const studentsList = users.filter((u) => {
    const cargo = getUserCargo(u);
    return cargo === "aluno" || cargo === "student";
  });

  const teachersList = users.filter((u) => {
    const cargo = getUserCargo(u);
    return (
      !cargo.includes("coord") &&
      (cargo.includes("prof") || cargo.includes("docen") || cargo.includes("teach"))
    );
  });

  // Filtro da tabela de usuários
  const filteredUsers = users.filter((user: any) => {
    const userName = (user.nome || user.name || "").toLowerCase();
    const userEmail = (user.email || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      userName.includes(search) || userEmail.includes(search);
    const cargo = getUserCargo(user);

    if (activeTab === "alunos") {
      return matchesSearch && (cargo === "aluno" || cargo === "student");
    }
    if (activeTab === "docentes") {
      return (
        matchesSearch &&
        !cargo.includes("coord") &&
        (cargo.includes("prof") ||
          cargo.includes("docen") ||
          cargo.includes("teach"))
      );
    }

    return matchesSearch;
  });

  // Filtro das turmas
  const filteredClasses = classes.filter((cls: any) => {
    const search = searchTerm.toLowerCase();
    const className = `Turma ${cls.id}`.toLowerCase();
    return (
      className.includes(search) ||
      cls.anoEncerramento.toString().includes(search)
    );
  });

  const totalAlunos = studentsList.length;
  const totalDocentes = teachersList.length;
  const totalTurmas = classes.length;

  return (
    <div className={styles.container}>
      {/* Header Superior */}
      <header className={styles.topHeader}>
        <div className={styles.headerLeft}>
          <Link href="/dashboard" className={styles.backIcon}>
            <FiArrowLeft />
          </Link>
          <div className={styles.brandTitle}>
            <h1>Coordenação</h1>
            <span>Gestão Acadêmica</span>
          </div>
        </div>
      </header>

      {/* Métricas */}
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

      {/* Controles, Tabs e Busca */}
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
          {activeTab === "turmas" ? (
            <button
              className={styles.registerBtn}
              onClick={() => setIsClassModalOpen(true)}
            >
              <FiPlus /> Nova Turma
            </button>
          ) : (
            <button
              className={styles.registerBtn}
              onClick={() => router.push("/user-register")}
            >
              <FiUserPlus /> Cadastrar Usuário
            </button>
          )}
        </div>
      </div>

      {errorMessage && (
        <p
          style={{
            color: "#f87171",
            marginBottom: "1rem",
            fontSize: "0.85rem",
          }}
        >
          {errorMessage}
        </p>
      )}

      {/* Conteúdo Exibido */}
      {loading ? (
        <p style={{ padding: "3rem", color: "#94a3b8", textAlign: "center" }}>
          Carregando dados do banco de dados...
        </p>
      ) : activeTab === "turmas" ? (
        /* Grid de Cards das Turmas */
        <div className={styles.cardsGrid}>
          {filteredClasses.length === 0 ? (
            <p
              style={{
                color: "#64748b",
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "3rem",
              }}
            >
              Nenhuma turma encontrada.
            </p>
          ) : (
            <div className={styles.classesGrid}>
              {filteredClasses.map((cls: any, index: number) => {
                const letterBadge = String.fromCharCode(65 + (index % 26));
                const classUsers = cls.users || [];

                const studentCount = classUsers.filter((u: any) => {
                  const c = getUserCargo(u);
                  return c === "aluno" || c === "student";
                }).length;

                return (
                  <div
                    key={cls.id}
                    className={styles.classCard}
                    onClick={() => {
                      setSelectedClassDetails(cls);
                      setIsClassDetailsModalOpen(true);
                    }}
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.badge}>{letterBadge}</div>
                      <div className={styles.titleGroup}>
                        <h3>Turma {letterBadge}</h3>
                        <span>Conclusão: {cls.anoEncerramento}</span>
                      </div>
                    </div>

                    <div className={styles.cardDivider} />

                    <div className={styles.cardDetails}>
                      <div className={styles.detailRow}>
                        <span className={styles.label}>Alunos:</span>
                        <strong className={styles.countValue}>
                          {studentCount}
                        </strong>
                      </div>
                    </div>

                    <div
                      className={styles.cardFooter}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {selectedClassForUser === cls.id ? (
                        <div className={styles.quickAssignBox}>
                          <select
                            value={selectedStudentId}
                            onChange={(e) =>
                              setSelectedStudentId(e.target.value)
                            }
                          >
                            <option value="">Selecione um Aluno...</option>
                            {studentsList.map((s) => (
                              <option
                                key={s.id || s.id_usuario}
                                value={s.id || s.id_usuario}
                              >
                                {s.nome || s.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAddStudentToClass(cls.id)}
                          >
                            OK
                          </button>
                          <button
                            className={styles.cancelIcon}
                            onClick={() => setSelectedClassForUser(null)}
                          >
                            <FiX />
                          </button>
                        </div>
                      ) : (
                        <button
                          className={styles.addStudentBtn}
                          onClick={() => setSelectedClassForUser(cls.id)}
                        >
                          + Vincular Aluno
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Tabela de Alunos / Docentes */
        <div className={styles.tableContainer}>
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
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      color: "#64748b",
                      padding: "3rem",
                    }}
                  >
                    Nenhum {activeTab === "alunos" ? "aluno" : "docente"}{" "}
                    encontrado no banco.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user: any, index: number) => {
                  const userId = user.id || user.id_usuario || index;
                  const userName = user.nome || user.name || "Usuário";

                  const nameParts = userName.trim().split(" ");
                  const initials =
                    nameParts.length > 1
                      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
                      : userName.substring(0, 2).toUpperCase();

                  const rawCargo = getUserCargo(user);
                  const displayCargo = rawCargo
                    ? rawCargo.toUpperCase()
                    : "REGISTRADO";

                  return (
                    <tr key={userId}>
                      <td className={styles.userInfo}>
                        <span className={styles.avatar}>{initials}</span>
                        <span>{userName}</span>
                      </td>
                      <td style={{ color: "#3b82f6", fontWeight: 600 }}>
                        {displayCargo}
                      </td>
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
        </div>
      )}

      {/* Modal: Nova Turma */}
      {isClassModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h2>Nova Turma</h2>
              <button
                onClick={() => setIsClassModalOpen(false)}
                className={styles.closeBtn}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>ANO DE ENCERRAMENTO (CONCLUSÃO)</label>
                <input
                  type="number"
                  value={anoEncerramento}
                  onChange={(e) => setAnoEncerramento(e.target.value)}
                  placeholder="Ex: 2026"
                  required
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsClassModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submittingClass}
                >
                  {submittingClass ? "Criando..." : "Criar Turma"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detalhes da Turma (Apenas Alunos) */}
      {isClassDetailsModalOpen && selectedClassDetails && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsClassDetailsModalOpen(false)}
        >
          <div
            className={`${styles.modalCard} ${styles.classDetailsModalCard}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>
                Detalhes da Turma - Conclusão{" "}
                {selectedClassDetails.anoEncerramento}
              </h2>
              <button
                onClick={() => setIsClassDetailsModalOpen(false)}
                className={styles.closeBtn}
              >
                <FiX />
              </button>
            </div>

            <div className={styles.classDetailsBody}>
              {/* Seção Lista de Alunos */}
              <div className={styles.detailSection}>
                <div className={styles.sectionHeaderRow}>
                  <span className={styles.sectionLabel}>
                    ALUNOS MATRICULADOS
                  </span>
                  <span className={styles.studentBadgeCount}>
                    {getClassStudents(selectedClassDetails.users || []).length}{" "}
                    alunos
                  </span>
                </div>

                <div className={styles.studentsListContainer}>
                  {getClassStudents(selectedClassDetails.users || []).length ===
                    0 ? (
                    <p className={styles.emptyStudentsText}>
                      Nenhum aluno vinculado a esta turma.
                    </p>
                  ) : (
                    getClassStudents(selectedClassDetails.users || []).map(
                      (student: any, idx: number) => {
                        const sName = student.nome || student.name || "Aluno";
                        const nameParts = sName.trim().split(" ");
                        const initials =
                          nameParts.length > 1
                            ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
                            : sName.substring(0, 2).toUpperCase();

                        return (
                          <div
                            key={student.id || idx}
                            className={styles.studentItem}
                          >
                            <span className={styles.studentAvatar}>
                              {initials}
                            </span>
                            <div className={styles.studentInfo}>
                              <span className={styles.studentName}>{sName}</span>
                              <span className={styles.studentEmail}>
                                {student.email}
                              </span>
                            </div>
                          </div>
                        );
                      },
                    )
                  )}
                </div>
              </div>
            </div>

            <div className={styles.modalFooterDetails}>
              <button
                type="button"
                className={styles.submitBtn}
                onClick={() => setIsClassDetailsModalOpen(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}