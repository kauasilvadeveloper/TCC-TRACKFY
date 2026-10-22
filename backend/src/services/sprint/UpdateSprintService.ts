import { AppError } from "../../errors/AppError";
import { prisma } from "../../prisma";

export interface UpdateSprintDTO {
  sprintId: number;
  tituloSprint?: string;
  descricaoSprint?: string;
  prazoSprint?: string;
}

export class UpdateSprintService {
  async execute({
    sprintId,
    tituloSprint,
    descricaoSprint,
    prazoSprint,
  }: UpdateSprintDTO) {
    const parsedSprintId = Number(sprintId);
    if (!sprintId || Number.isNaN(parsedSprintId) || parsedSprintId <= 0) {
      throw new AppError(
        "O ID da sprint é obrigatório e deve ser um número inteiro válido.",
        400, // Bad Request
      );
    }

    const sprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
    });

    if (!sprint) {
      throw new AppError("Sprint não encontrada.", 404); // Not Found
    }

    // Regra de Negócio: Impede alteração se a sprint já estiver expirada
    const now = new Date();
    if (sprint.prazoSprint < now) {
      throw new AppError(
        "Operação negada: A sprint ultrapassou o prazo legal e não pode mais ser editada.",
        422, // Unprocessable Entity (Regra de Negócio / Estado Inválido)
      );
    }

    let parsedNewDeadline: Date | undefined;
    if (prazoSprint) {
      parsedNewDeadline = new Date(prazoSprint);
      if (
        Number.isNaN(parsedNewDeadline.getTime()) ||
        parsedNewDeadline < now
      ) {
        throw new AppError(
          "O novo prazo deve ser uma data futura válida.",
          400, // Bad Request
        );
      }
    }

    const updatedSprint = await prisma.sprint.update({
      where: { id: sprintId },
      data: {
        ...(tituloSprint && { tituloSprint }),
        ...(descricaoSprint !== undefined && { descricaoSprint }),
        ...(parsedNewDeadline && { prazoSprint: parsedNewDeadline }),
      },
    });

    return updatedSprint;
  }
}
