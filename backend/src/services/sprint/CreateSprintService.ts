import { AppError } from "../../errors/AppError";
import { prisma } from "../../prisma";

interface CreateSprintDTO {
  creatorRole: string;
  tituloSprint: string;
  descricaoSprint?: string;
  prazoSprint: Date;
  projetoId: number;
}

export class CreateSprintService {
  async execute({
    creatorRole,
    tituloSprint,
    descricaoSprint,
    prazoSprint,
    projetoId,
  }: CreateSprintDTO) {
    const allowedRoles = ["aluno", "professor"];
    if (!creatorRole || !allowedRoles.includes(creatorRole.toLowerCase())) {
      throw new AppError(
        "Acesso negado: Permissão insuficiente para criar sprint.",
        403, // Forbidden
      );
    }

    const sprint = await prisma.sprint.create({
      data: {
        tituloSprint,
        descricaoSprint,
        prazoSprint,
      },
    });

    await prisma.projetoSprint.create({
      data: {
        fkProjeto: projetoId,
        fkSprint: sprint.id,
      },
    });

    return sprint;
  }
}
