import { prisma } from "../../prisma";

export class GetSprintsByProjectService {
  async execute(projectId: number) {
    const projectExists = await prisma.projeto.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!projectExists) {
      const error = new Error("Projeto não encontrado.");
      (error as any).status = 404;
      throw error;
    }

    return await prisma.sprint.findMany({
      where: {
        projetos: {
          some: {
            fkProjeto: projectId,
          },
        },
      },
      select: {
        id: true,
        tituloSprint: true,
        descricaoSprint: true,
        prazoSprint: true,
        _count: {
          select: { tarefas: true },
        },
      },
      orderBy: {
        prazoSprint: "asc",
      },
    });
  }
}
