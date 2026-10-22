import { AppError } from "../../errors/AppError";
import { prisma } from "../../prisma";

export interface DeleteTaskDTO {
  taskId: number;
}

export class DeleteTaskService {
  async execute({ taskId }: DeleteTaskDTO) {
    const parsedTaskId = Number(taskId);

    if (!taskId || Number.isNaN(parsedTaskId) || parsedTaskId <= 0) {
      throw new AppError(
        "O ID da tarefa é obrigatório e deve ser um número inteiro válido.",
        400, // Bad Request
      );
    }

    // 1. Verificação de existência da tarefa
    const task = await prisma.tarefa.findUnique({
      where: { id: taskId },
      select: { id: true },
    });

    if (!task) {
      throw new AppError("Tarefa não encontrada.", 404); // Not Found
    }

    // 2. Remoção física da tarefa (Cascata configurada na migration para Comentario e TarefaUsuario)
    await prisma.tarefa.delete({
      where: { id: taskId },
    });

    return { id: taskId };
  }
}
