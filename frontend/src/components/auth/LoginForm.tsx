// src/components/auth/LoginForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/src/context/AuthContext";
import styles from "./LoginForm.module.scss";

export function LoginForm() {
  const { login } = useAuth();
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
      await login({ email, password });
      console.log("deu certo");
    } catch (err: unknown) {
      // Captura a exceção tratada pelo interceptor do Axios
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro inesperado ao tentar realizar o login.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>▼</span>
        <h2>Trackfy</h2>
      </div>

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
          <a href="/recuperar-senha" className={styles.forgot}>
            Recuperar senha
          </a>
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
