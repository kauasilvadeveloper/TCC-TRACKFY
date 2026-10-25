"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./page.module.scss";

// Se você tiver uma instância centralizada do axios com o interceptor de token, importe-a aqui.
// Exemplo: import { api } from "@/services/api";
const api = axios; 

export default function CreateProjectPage() {
  const router = useRouter();

  const [tituloProjeto, setTituloProjeto] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prazo, setPrazo] = useState("");
  const [memberEmailInput, setMemberEmailInput] = useState("");
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Adicionar e-mail na lista de convites
  const handleAddMember = () => {
    const trimmedEmail = memberEmailInput.trim().toLowerCase();
    
    if (!trimmedEmail) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Por favor, insira um endereço de e-mail válido.");
      return;
    }

    if (invitedEmails.includes(trimmedEmail)) {
      setErrorMessage("Este e-mail já foi adicionado à lista.");
      return;
    }

    setInvitedEmails((prev) => [...prev, trimmedEmail]);
    setMemberEmailInput("");
    setErrorMessage(null);
  };

  // Remover e-mail da lista
  const handleRemoveMember = (emailToRemove: string) => {
    setInvitedEmails((prev) => prev.filter((e) => e !== emailToRemove));
  };

  // Envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!tituloProjeto.trim()) {
      setErrorMessage("O nome do projeto é obrigatório.");
      return;
    }

    if (!prazo) {
      setErrorMessage("Por favor, selecione o prazo de entrega do projeto.");
      return;
    }

    try {
      setLoading(true);

      // Recupera o token do localStorage caso utilize autenticação via Bearer token manual
      const token = localStorage.getItem("@token"); // Ajuste a chave conforme o seu sistema de login

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // 1. Criar o Projeto -> Chama a rota POST /project
      const projectResponse = await api.post("/project", {
        tituloProjeto,
        descricao,
        prazo: new Date(prazo).toISOString(),
      }, { headers });

      const createdProject = projectResponse.data;
      const projectId = createdProject.id;

      // 2. Se houver e-mails para convidar, cadastra os membros -> Chama POST /project/member
      if (invitedEmails.length > 0 && projectId) {
        await Promise.all(
          invitedEmails.map((email) =>
            api.post("/project/member", {
              projectId,
              email,
            }, { headers })
          )
        );
      }

      // Sucesso: Redireciona de volta para o dashboard/projetos
      router.push("/dashboard"); // Ajuste para a rota principal do seu dashboard
    } catch (err: any) {
      console.error("Erro ao criar projeto:", err);
      setErrorMessage(
        err.response?.data?.message ||
          "Ocorreu um erro ao criar o projeto. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContainer}>
        {/* Botão Fechar / Voltar */}
        <button 
          className={styles.closeButton} 
          onClick={() => router.back()} 
          aria-label="Fechar"
        >
          
        </button>

        <button 
          type="button" 
          className={styles.backButton} 
          onClick={() => router.back()}
        >
         Voltar para projetos
        </button>

        {/* Cabeçalho */}
        <div className={styles.header}>
          <h2>Criar Novo Projeto</h2>
          <p>Preencha as informações para começar</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label htmlFor="tituloProjeto">
              NOME DO PROJETO <span className={styles.required}>*</span>
            </label>
            <input
              id="tituloProjeto"
              type="text"
              placeholder="Ex: Redesign do Portal"
              value={tituloProjeto}
              onChange={(e) => setTituloProjeto(e.target.value)}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="descricao">DESCRIÇÃO</label>
            <textarea
              id="descricao"
              placeholder="Objetivo e escopo do projeto..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="prazo">
              PRAZO DE ENTREGA <span className={styles.required}>*</span>
            </label>
            <input
              id="prazo"
              type="date"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>CONVIDAR MEMBROS</label>
            <div className={styles.inviteRow}>
              <div className={styles.inputWrapper}>
                
                <input
                  type="email"
                  placeholder="email@empresa.com"
                  value={memberEmailInput}
                  onChange={(e) => setMemberEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddMember();
                    }
                  }}
                />
              </div>
              <button
                type="button"
                className={styles.addButton}
                onClick={handleAddMember}
              >
                Adicionar
              </button>
            </div>

            {invitedEmails.length > 0 && (
              <div className={styles.tagsContainer}>
                {invitedEmails.map((email) => (
                  <div key={email} className={styles.tag}>
                    <span className={styles.avatarIcon}>
                      {email.charAt(0).toUpperCase()}
                    </span>
                    <span>{email}</span>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => handleRemoveMember(email)}
                    >
                      
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Criando..." : "Criar Projeto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}