// src/components/auth/LoginForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/src/context/AuthContext";
import styles from "./LoginForm.module.scss";
import { Brand } from "../dashboard/Brand/Brand";
import axios from "axios";

export function LoginForm() {
  const { login, user, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (email.endsWith("@docente.senai.br")) {
        await login({ email, password }, "/professor");
      } else if (email.endsWith("@coordenador.senai.br")) {
        await login({ email, password }, "/coordination");
      } else {
        await login({ email, password });
      }

      console.log("Usuário logado com sucesso");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const backendMessage = err.response?.data?.message;

        if (!err.response) {
          setError(
            "Não foi possível conectar ao servidor. Verifique sua internet.",
          );
        } else if (status === 400 || status === 401) {
          setError(
            "E-mail ou senha inválidos. Confira seus dados e tente novamente.",
          );
        } else if (status === 403) {
          setError(
            "Acesso negado. Seu usuário não possui permissão para entrar.",
          );
        } else if (status === 404) {
          setError("Conta não encontrada com este e-mail.");
        } else if (status === 429) {
          setError(
            "Muitas tentativas de login. Aguarde alguns minutos e tente novamente.",
          );
        } else if (status && status >= 500) {
          setError(
            "O servidor está temporariamente indisponível. Tente mais tarde.",
          );
        } else {
          setError(
            backendMessage ||
              "Não foi possível realizar o login. Tente novamente.",
          );
        }
      } else if (err instanceof Error) {
        // Caso o interceptor do Axios já tenha lançado um Error customizado
        setError(
          err.message === "Network Error"
            ? "Falha de conexão com o servidor. Verifique sua rede."
            : err.message,
        );
      } else {
        setError("Ocorreu um erro inesperado ao tentar realizar o login.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <Brand />
      <p className={styles.subtitle}>Entre com suas credenciais para acessar</p>

      {error && <div className={styles.errorAlert}>{error}</div>}

      <div className={styles.field}>
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          placeholder="voce@aluno.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label htmlFor="senha">Senha</label>
        </div>
        <div className={styles.inputWrapper}>
          <input
            id="senha"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Alternar visibilidade da senha"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </button>

      <p className={styles.terms}>
        Ao continuar, você concorda com os nossos{" "}
        <a href="/termos">Termos de Uso</a> e{" "}
        <a href="/privacidade">Políticas de Privacidade</a>
      </p>
    </form>
  );
}
