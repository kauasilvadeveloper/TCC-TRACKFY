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
    if (!sprintId || isNaN(sprintId)) {
      throw new Error("ID da sprint é obrigatório e deve ser numérico.");
    }

    const sprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
    });

    if (!sprint) {
      throw new Error("Sprint não encontrada.");
    }

    // Regra de Negócio: Impede alteração se a sprint já estiver expirada
    const now = new Date();
    if (sprint.prazoSprint < now) {
      throw new Error(
        "Operação negada: A sprint ultrapassou o prazo legal e não pode mais ser editada.",
      );
    }

    let parsedNewDeadline: Date | undefined;
    if (prazoSprint) {
      parsedNewDeadline = new Date(prazoSprint);
      if (isNaN(parsedNewDeadline.getTime()) || parsedNewDeadline < now) {
        throw new Error("O novo prazo deve ser uma data futura válida.");
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
