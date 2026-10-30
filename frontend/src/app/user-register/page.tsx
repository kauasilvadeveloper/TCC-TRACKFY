"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.scss";
import { api } from "@/src/services/api";
import { authHeaders } from "@/src/utils/academicRole";
import { FiArrowLeft, FiUserPlus } from "react-icons/fi";

export default function RegisterUserPage() {
  const router = useRouter();

  // Estados dos campos do formulário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"aluno" | "docente">("aluno");

  // Estado para a sala selecionada e lista de salas
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Busca as salas/turmas disponíveis ao carregar
  useEffect(() => {
    async function fetchClasses() {
      try {
        const response = await api.get("/classes", { headers: authHeaders() });
        setClasses(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Erro ao carregar turmas:", err);
      }
    }

    fetchClasses();
  }, []);

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validações básicas
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage("Por favor, preencha todos os campos.");
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Validação de domínio baseada no cargo selecionado
    if (role === "aluno") {
      if (!trimmedEmail.endsWith("@aluno.senai.br")) {
        setErrorMessage("Para o cargo de Aluno, o e-mail deve terminar obrigatoriamente com '@aluno.senai.br'.");
        return;
      }
    } else if (role === "docente") {
      if (!trimmedEmail.endsWith("@docente.senai.br")) {
        setErrorMessage("Para o cargo de Docente, o e-mail deve terminar obrigatoriamente com '@docente.senai.br'.");
        return;
      }
    }

    if (password.length < 6) {
      setErrorMessage("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setLoading(true);

      const headers = authHeaders();
      const apiRole = role === "docente" ? "professor" : role;

      const response = await api.post("/user-register", {
        name,
        email: trimmedEmail,
        password,
        role: apiRole,
      }, { headers });

      const createdUser = response.data;
      const createdUserId = createdUser?.id || createdUser?.id_usuario;

      if (selectedClassId && createdUserId) {
        try {
          await api.post("/class/join", {
            code: Number(selectedClassId),
            targetUser: Number(createdUserId),
          }, { headers });
        } catch (joinErr) {
          console.error("Erro ao vincular sala ao usuário:", joinErr);
          setSuccessMessage(
            "Usuário cadastrado, mas não foi possível vincular à sala. Use a coordenação para fazer o vínculo.",
          );
          setName("");
          setEmail("");
          setPassword("");
          setRole("aluno");
          setSelectedClassId("");
          return;
        }
      }

      setSuccessMessage("Usuário cadastrado com sucesso!");

      // Limpa o formulário
      setName("");
      setEmail("");
      setPassword("");
      setRole("aluno");
      setSelectedClassId("");

    } catch (err: any) {
      console.error("Erro ao cadastrar usuário:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        setErrorMessage("Acesso negado. Você precisa estar autenticado como coordenador.");
        return;
      }

      setErrorMessage(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Ocorreu um erro ao cadastrar o usuário. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContainer}>

        <Link href="/coordination" className={styles.backButton}>
          <FiArrowLeft /> Voltar para o Dashboard
        </Link>

        <div className={styles.header}>
          <h2><FiUserPlus /> Cadastrar Novo Usuário</h2>
          <p>Insira os dados e selecione o cargo institucional correto</p>
        </div>

        <form onSubmit={handleRegisterUser} className={styles.form}>

          {/* Seleção de Cargo (Select) */}
          <div className={styles.fieldGroup}>
            <label htmlFor="role">
              CARGO <span className={styles.required}>*</span>
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as "aluno" | "docente")}
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                padding: "0.875rem 1rem",
                color: "#f8fafc",
                fontSize: "0.95rem",
                outline: "none",
                width: "100%",
                cursor: "pointer"
              }}
            >
              <option value="aluno">Aluno</option>
              <option value="docente">Docente</option>
            </select>
          </div>

          {/* Seleção de Sala / Turma (Select) */}
          <div className={styles.fieldGroup}>
            <label htmlFor="classId">
              SALA / TURMA
            </label>
            <select
              id="classId"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                padding: "0.875rem 1rem",
                color: "#f8fafc",
                fontSize: "0.95rem",
                outline: "none",
                width: "100%",
                cursor: "pointer"
              }}
            >
              <option value="">Selecione uma sala (opcional)...</option>
              {classes.map((cls: any) => (
                <option key={cls.id} value={cls.id}>
                  {cls.nome || `Turma #${cls.id} (Conclusão: ${cls.anoEncerramento})`}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="name">
              NOME COMPLETO <span className={styles.required}>*</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="Ex: Ana Souza"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="email">
              E-MAIL INSTITUCIONAL <span className={styles.required}>*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder={role === "aluno" ? "nome@aluno.senai.br" : "nome@docente.senai.br"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <small style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "4px", display: "block" }}>
              {role === "aluno" ? "Deve terminar com @aluno.senai.br" : "Deve terminar com @docente.senai.br"}
            </small>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="password">
              SENHA PROVISÓRIA <span className={styles.required}>*</span>
            </label>
            <input
              id="password"
              type="password"
              placeholder="Mínimo de 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
          {successMessage && <div style={{ color: "#10b981", background: "#064e3b", padding: "0.75rem", borderRadius: "8px", fontSize: "0.9rem", textAlign: "center" }}>{successMessage}</div>}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => router.push("/coordination")}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Cadastrando..." : "Cadastrar Usuário"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}