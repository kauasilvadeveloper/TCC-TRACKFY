"use client";

import React, { useState } from "react";
import styles from "./CreateTaskModal.module.scss";
import { FiX, FiCheck } from "react-icons/fi";
import { ProfessorClass, ProfessorTask } from "@/src/types/professor";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ProfessorClass[];
  selectedClassId: number | null;
  onCreateTask: (newTask: Omit<ProfessorTask, "id">) => Promise<void> | void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  classes,
  selectedClassId,
  onCreateTask,
}) => {
  const [tituloTarefa, setTituloTarefa] = useState("");
  const [descricaoTarefa, setDescricaoTarefa] = useState("");
  const [prazoTarefa, setPrazoTarefa] = useState("");
  const [stack, setStack] = useState("React");
  const [status, setStatus] = useState<"pendente" | "em andamento" | "concluída">("pendente");
  const [classId, setClassId] = useState<number>(selectedClassId || classes[0]?.id || 1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tituloTarefa.trim()) {
      setError("O título da tarefa é obrigatório.");
      return;
    }
    if (!prazoTarefa) {
      setError("A data limite/prazo é obrigatória.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onCreateTask({
        tituloTarefa: tituloTarefa.trim(),
        descricaoTarefa: descricaoTarefa.trim() || undefined,
        prazoTarefa,
        stack,
        status,
        classId: Number(classId),
      });

      // Limpar formulário
      setTituloTarefa("");
      setDescricaoTarefa("");
      setPrazoTarefa("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Erro ao criar tarefa.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Nova Tarefa</h3>
            <p className={styles.modalSubtitle}>
              Crie uma atividade acadêmica para acompanhamento da turma
            </p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorAlert}>{error}</div>}

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Título da Tarefa <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="Ex.: Projeto Final — Interface Responsiva"
              value={tituloTarefa}
              onChange={(e) => setTituloTarefa(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Descrição (Opcional)</label>
            <textarea
              className={styles.textarea}
              placeholder="Descreva os objetivos, entregáveis e instruções da tarefa..."
              rows={3}
              value={descricaoTarefa}
              onChange={(e) => setDescricaoTarefa(e.target.value)}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Prazo / Data Limite <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                className={styles.input}
                value={prazoTarefa}
                onChange={(e) => setPrazoTarefa(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Stack Tecnológica</label>
              <select
                className={styles.select}
                value={stack}
                onChange={(e) => setStack(e.target.value)}
              >
                <option value="React">React / Next.js</option>
                <option value="CSS / SCSS">CSS / SCSS</option>
                <option value="Node.js">Node.js / Express</option>
                <option value="TypeScript">TypeScript</option>
                <option value="HTML / CSS">HTML / CSS</option>
                <option value="Banco de Dados">Banco de Dados</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Status Inicial</label>
              <select
                className={styles.select}
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="pendente">Pendente</option>
                <option value="em andamento">Em andamento</option>
                <option value="concluída">Concluída</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Turma Vinculada</label>
              <select
                className={styles.select}
                value={classId}
                onChange={(e) => setClassId(Number(e.target.value))}
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name || `Turma ${cls.id} (${cls.anoEncerramento})`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting}
            >
              <FiCheck />
              <span>{submitting ? "Criando..." : "Criar Tarefa"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
