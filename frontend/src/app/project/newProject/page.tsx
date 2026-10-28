"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";
import { api } from "@/src/services/api";
import Cookies from "js-cookie";

export default function CreateProjectPage() {
  const router = useRouter();

  // Estados com os nomes correspondentes ao que o backend espera
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [term, setTerm] = useState("");
  const [tokenGithub, setTokenGithub] = useState(""); // Opcional, caso tenha campo no form

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

    if (!title.trim()) {
      setErrorMessage("O nome do projeto é obrigatório.");
      return;
    }

    if (!term) {
      setErrorMessage("Por favor, selecione o prazo de entrega do projeto.");
      return;
    }

    // Tratamento seguro da data para o DateTime do Prisma
    const projectDate = new Date(`${term}T00:00:00.000Z`);

    if (isNaN(projectDate.getTime())) {
      setErrorMessage("A data de prazo informada é inválida.");
      return;
    }

    try {
      setLoading(true);

      const token = Cookies.get("trackfy_token");

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // 1. Criar o Projeto -> Envia exatamente as chaves que o backend/Prisma espera
      const projectResponse = await api.post(
        "/project",
        {
          title,
          description,
          term: projectDate.toISOString(), // Converte para formato ISO compatível com DateTime
          tokenGithub: tokenGithub || null, // Envia o token caso exista ou nulo
        },
        { headers },
      );

      const createdProject = projectResponse.data;
      const projectId = createdProject?.id;

      // 2. Se houver e-mails para convidar, cadastra os membros -> Chama POST /project/member
      if (invitedEmails.length > 0 && projectId) {
        await Promise.all(
          invitedEmails.map((email) =>
            api.post(
              "/project/member",
              {
                projectId,
                email,
              },
              { headers },
            ),
          ),
        );
      }

      // Sucesso: Redireciona dinamicamente para a página do projeto recém-criado usando o ID
      if (projectId) {
        router.push(`/project/${projectId}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Erro ao criar projeto:", err);
      setErrorMessage(
        err.response?.data?.message ||
          "Ocorreu um erro ao criar o projeto. Tente novamente.",
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
        />

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
            <label htmlFor="title">
              NOME DO PROJETO <span className={styles.required}>*</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="Ex: Redesign do Portal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="description">DESCRIÇÃO</label>
            <textarea
              id="description"
              placeholder="Objetivo e escopo do projeto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="term">
              PRAZO DE ENTREGA <span className={styles.required}>*</span>
            </label>
            <input
              id="term"
              type="date"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
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
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {errorMessage && (
            <div className={styles.errorMessage}>{errorMessage}</div>
          )}

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
