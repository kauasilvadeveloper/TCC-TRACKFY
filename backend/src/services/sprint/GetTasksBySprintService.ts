import { prisma } from "../../prisma";

export class GetTasksBySprintService {
  async execute(fkSprint: number, creatorRole: string) {
    const allowedRoles = ["aluno", "professor"];
    if (!creatorRole || !allowedRoles.includes(creatorRole.toLowerCase())) {
      throw new Error(
        "Acesso negado: Permissão insuficiente para buscar as tarefas da sprint.",
      );
    }

    const sprint = await prisma.sprint.findUnique({
      where: {
        id: fkSprint,
      },
    });

    if (!sprint) {
      throw new Error("Sprint não encontrada");
    }

    const tarefas = await prisma.tarefa.findMany({
      where: {
        fkSprint,
      },
    });

    return tarefas;
  }
}
