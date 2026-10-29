"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";
import { api } from "@/src/services/api";
import Cookies from "js-cookie";
import { User } from "@/src/types/user";

export default function CreateProjectPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [term, setTerm] = useState("");
  const [tokenGithub, setTokenGithub] = useState("");

  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [invitedUsers, setInvitedUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassesAndUsers = async () => {
      try {
        const token = Cookies.get("trackfy_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const rawUser = Cookies.get("trackfy_user");
        let currentUserId: string | number | null = null;

        console.log("🔍 [TRACKFY DEBUG 1] Cookie rawUser:", rawUser);

        if (rawUser) {
          try {
            const parsed = JSON.parse(rawUser);
            currentUserId =
              parsed.id ??
              parsed.usuarioId ??
              parsed.fkUsuario ??
              parsed.FK_usuario ??
              parsed.user?.id;
            console.log(
              "🔍 [TRACKFY DEBUG 1.1] User retornado do cookie:",
              parsed,
            );
            console.log(
              "🔍 [TRACKFY DEBUG 1.2] ID do Usuário Logado Extraído:",
              currentUserId,
            );
          } catch (e) {
            console.error(
              "❌ [TRACKFY DEBUG ERROR] Erro ao decodificar trackfy_user:",
              e,
            );
          }
        }

        // 1. Busca as salas associadas ao usuário
        const response = await api.get("/classes", { headers });
        console.log(
          "🔍 [TRACKFY DEBUG 2] Resposta GET /classes:",
          response.data,
        );

        const classes = Array.isArray(response.data) ? response.data : [];

        if (classes.length === 0) {
          console.warn(
            "⚠️ [TRACKFY DEBUG 2.1] Nenhuma sala encontrada na requisição /classes.",
          );
        }

        // 2. Busca os alunos de cada sala pela rota /class/:id/users
        const userPromises = classes.map((cls: any) => {
          console.log(
            `🔍 [TRACKFY DEBUG 3] Disparando GET /class/${cls.id}/users...`,
          );
          return api.get(`/class/${cls.id}/users`, { headers }).catch((err) => {
            console.error(
              `❌ [TRACKFY DEBUG ERROR] Erro ao buscar /class/${cls.id}/users:`,
              err.response || err,
            );
            return null;
          });
        });

        const responses = await Promise.all(userPromises);
        const usersMap = new Map<string, any>();

        responses.forEach((res, index) => {
          const classId = classes[index]?.id;
          if (!res || !res.data) {
            console.warn(
              `⚠️ [TRACKFY DEBUG 4] Sem resposta válida para sala ID ${classId}`,
            );
            return;
          }

          console.log(
            `🔍 [TRACKFY DEBUG 4] Resposta de /class/${classId}/users:`,
            res.data,
          );

          const rawMembers: any[] = Array.isArray(res.data)
            ? res.data
            : res.data.users ||
            res.data.usuarios ||
            res.data.alunos ||
            res.data.members ||
            [];

          console.log(
            `🔍 [TRACKFY DEBUG 4.1] Lista bruta de membros da sala ${classId}:`,
            rawMembers,
          );

          rawMembers.forEach((item) => {
            const userObj = item.usuario || item.user || item.aluno || item;

            // Mapeamento correto para fkUsuario
            const uid =
              item?.fkUsuario ??
              item?.FK_usuario ??
              item?.fk_usuario ??
              userObj?.fkUsuario ??
              userObj?.FK_usuario ??
              userObj?.id ??
              userObj?.usuarioId ??
              item?.usuarioId ??
              item?.id;

            const displayName =
              userObj?.nome ??
              userObj?.name ??
              userObj?.email ??
              item?.nome ??
              item?.name ??
              item?.email ??
              `Usuário #${uid}`;

            console.log("🔍 [TRACKFY DEBUG 4.2] Processando item:", {
              uid,
              currentUserId,
              matchWithLoggedUser: String(uid) === String(currentUserId),
              itemBruto: item,
            });

            // Adiciona se houver ID válido e não for o usuário logado
            if (
              uid !== undefined &&
              uid !== null &&
              String(uid) !== String(currentUserId)
            ) {
              usersMap.set(String(uid), {
                ...item,
                ...userObj,
                id: uid,
                displayName,
              });
            }
          });
        });

        const finalUsersList = Array.from(usersMap.values());
        console.log(
          "✅ [TRACKFY DEBUG 5] Lista final de usuários para o Select:",
          finalUsersList,
        );

        setAvailableUsers(finalUsersList);
      } catch (err) {
        console.error("❌ [TRACKFY DEBUG ERROR] Erro geral no useEffect:", err);
      }
    };

    fetchClassesAndUsers();
  }, []);

  const handleAddMember = () => {
    if (!selectedUserId) return;

    const userToAdd = availableUsers.find(
      (u) => String(u.id) === String(selectedUserId),
    );

    if (!userToAdd) return;

    if (invitedUsers.some((u) => String(u.id) === String(selectedUserId))) {
      setErrorMessage("Este usuário já foi adicionado à lista.");
      return;
    }

    setInvitedUsers((prev) => [...prev, userToAdd]);
    setSelectedUserId("");
    setErrorMessage(null);
  };

  const handleRemoveMember = (userIdToRemove: number | string) => {
    setInvitedUsers((prev) =>
      prev.filter((u) => String(u.id) !== String(userIdToRemove)),
    );
  };

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

    const projectDate = new Date(`${term}T00:00:00.000Z`);

    if (isNaN(projectDate.getTime())) {
      setErrorMessage("A data de prazo informada é inválida.");
      return;
    }

    try {
      setLoading(true);

      const token = Cookies.get("trackfy_token");
      const rawUser = Cookies.get("trackfy_user");
      let currentUserId: number | string | null = null;

      if (rawUser) {
        try {
          const parsedUser = JSON.parse(rawUser);
          currentUserId =
            parsedUser.id ??
            parsedUser.usuarioId ??
            parsedUser.fkUsuario ??
            parsedUser.FK_usuario ??
            parsedUser.user?.id;
        } catch (err) {
          console.error("Erro ao converter trackfy_user:", err);
        }
      }

      if (!currentUserId) {
        setErrorMessage(
          "Sessão inválida. Não foi possível obter o ID do usuário logado.",
        );
        setLoading(false);
        return;
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // 1. Criar o Projeto
      const projectResponse = await api.post(
        "/project",
        {
          title,
          description,
          term: projectDate.toISOString(),
          tokenGithub: tokenGithub || null,
        },
        { headers },
      );

      const createdProject = projectResponse.data;
      const projectId = createdProject?.id;

      // 2. Convida os membros selecionados
      if (invitedUsers.length > 0 && projectId) {
        await Promise.all(
          invitedUsers.map((targetUser) =>
            api.post(
              "/project/member",
              {
                projectId: Number(projectId),
                targetUserId: Number(targetUser.id),
                usuarioId: Number(currentUserId),
                funcaoId: 1,
              },
              { headers },
            ),
          ),
        );
      }

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

        <div className={styles.header}>
          <h2>Criar Novo Projeto</h2>
          <p>Preencha as informações para começar</p>
        </div>

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
            <label htmlFor="memberSelect">CONVIDAR MEMBROS DA SALA</label>
            <div className={styles.inviteRow}>
              <div className={styles.inputWrapper}>
                <select
                  id="memberSelect"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">Selecione um usuário...</option>
                  {availableUsers.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className={styles.addButton}
                onClick={handleAddMember}
                disabled={!selectedUserId}
              >
                Adicionar
              </button>
            </div>

            {invitedUsers.length > 0 && (
              <div className={styles.tagsContainer}>
                {invitedUsers.map((u: any) => (
                  <div key={u.id} className={styles.tag}>
                    <span className={styles.avatarIcon}>
                      {u.displayName.charAt(0).toUpperCase()}
                    </span>
                    <span>{u.displayName}</span>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => handleRemoveMember(u.id)}
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
