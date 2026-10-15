import { prisma } from "../../prisma";

export interface DeleteTaskDTO {
  taskId: number;
}

export class DeleteTaskService {
  async execute({ taskId }: DeleteTaskDTO) {
    if (!taskId || isNaN(taskId) || taskId <= 0) {
      throw new Error(
        "O ID da tarefa é obrigatório e deve ser um número inteiro válido.",
      );
    }

    // 1. Verificação de existência da tarefa
    const task = await prisma.tarefa.findUnique({
      where: { id: taskId },
      select: { id: true },
    });

    if (!task) {
      throw new Error("Tarefa não encontrada.");
    }

    // 2. Remoção física da tarefa (Cascata configurada na migration para Comentario e TarefaUsuario)
    await prisma.tarefa.delete({
      where: { id: taskId },
    });

    return { id: taskId };
  }
}
