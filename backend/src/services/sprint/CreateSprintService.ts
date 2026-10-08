import { prisma } from "../../prisma";

interface CreateSprintDTO {
  creatorRole: string;
  tituloSprint: string;
  descricaoSprint?: string;
  prazoSprint: Date;
}

export class CreateSprintService {
  async execute({
    creatorRole,
    tituloSprint,
    descricaoSprint,
    prazoSprint,
  }: CreateSprintDTO) {
    const allowedRoles = ["aluno", "professor"];
    if (!creatorRole || !allowedRoles.includes(creatorRole.toLowerCase())) {
      throw new Error(
        "Acesso negado: Permissão insuficiente para criar sprint.",
      );
    }

    const sprint = await prisma.sprint.create({
      data: {
        tituloSprint,
        descricaoSprint,
        prazoSprint,
      },
    });

    return sprint;
  }
}
