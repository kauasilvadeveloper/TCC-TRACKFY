import { AppError } from "../../errors/AppError";
import { prisma } from "../../prisma";

export class GetTasksBySprintService {
  async execute(fkSprint: number, creatorRole: string) {
    const allowedRoles = ["aluno", "professor"];

    if (!creatorRole || !allowedRoles.includes(creatorRole.toLowerCase())) {
      throw new AppError(
        "Acesso negado: Permissão insuficiente para buscar as tarefas da sprint.",
        403, // Forbidden
      );
    }

    const sprint = await prisma.sprint.findUnique({
      where: {
        id: fkSprint,
      },
    });

    if (!sprint) {
      throw new AppError("Sprint não encontrada.", 404); // Not Found
    }

    const tarefas = await prisma.tarefa.findMany({
      where: {
        fkSprint,
      },
    });

    return tarefas;
  }
}
