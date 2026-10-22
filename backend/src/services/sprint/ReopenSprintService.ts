import { AppError } from "../../errors/AppError";
import { prisma } from "../../prisma";

interface ReopenSprintDTO {
  userRole?: string;
  sprintId: number;
  justificativa: string;
  novoPrazo: string;
}

export class ReopenSprintService {
  async execute({
    userRole,
    sprintId,
    justificativa,
    novoPrazo,
  }: ReopenSprintDTO) {
    // 1. Autorização (RBAC - Apenas Professor)
    if (!userRole || userRole.toLowerCase() !== "professor") {
      throw new AppError(
        "Acesso negado: Apenas professores podem reabrir sprints vencidas.",
        403,
      );
    }

    // 2. Validação de presença dos campos
    if (!sprintId || !justificativa?.trim() || !novoPrazo) {
      throw new AppError(
        "Dados insuficientes: sprintId, justificativa e novoPrazo são obrigatórios.",
        400,
      );
    }

    // 3. Verificação de existência da sprint
    const sprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
    });

    if (!sprint) {
      throw new AppError("Sprint não encontrada.", 404);
    }

    // 4. Validação do novo prazo
    const dataNovoPrazo = new Date(novoPrazo);
    if (isNaN(dataNovoPrazo.getTime()) || dataNovoPrazo <= new Date()) {
      throw new AppError("O novo prazo deve ser uma data futura válida.", 400);
    }

    // 5. Atualização da sprint estendendo o prazo e gravando o histórico da justificativa
    const updatedSprint = await prisma.sprint.update({
      where: { id: sprintId },
      data: {
        prazoSprint: dataNovoPrazo,
        descricaoSprint: sprint.descricaoSprint
          ? `${sprint.descricaoSprint}\n\n[Reabertura - Professor]: ${justificativa.trim()}`
          : `[Reabertura - Professor]: ${justificativa.trim()}`,
      },
    });

    return updatedSprint;
  }
}
