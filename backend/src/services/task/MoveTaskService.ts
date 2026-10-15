import { prisma } from "../../prisma";

export interface MoveTaskDTO {
  taskId: number;
  targetColumnId: number;
  newStatus?: string;
}

export class MoveTaskService {
  async execute({ taskId, targetColumnId, newStatus }: MoveTaskDTO) {
    if (!taskId || isNaN(taskId) || taskId <= 0) {
      throw new Error(
        "O ID da tarefa é obrigatório e deve ser um número inteiro válido.",
      );
    }

    if (!targetColumnId || isNaN(targetColumnId) || targetColumnId <= 0) {
      throw new Error(
        "O ID da coluna de destino é obrigatório e deve ser um número inteiro válido.",
      );
    }

    // 1. Verificação de existência da tarefa e da coluna de destino em paralelo
    const [task, destinationColumn] = await Promise.all([
      prisma.tarefa.findUnique({
        where: { id: taskId },
        select: { id: true, fkColuna: true },
      }),
      prisma.coluna.findUnique({
        where: { id: targetColumnId },
        select: { id: true, tituloColuna: true },
      }),
    ]);

    if (!task) {
      throw new Error("Tarefa não encontrada.");
    }

    if (!destinationColumn) {
      throw new Error("A coluna de destino informada não existe.");
    }

    // 2. Se a tarefa já está na coluna solicitada, encerra sem realizar I/O desnecessário
    if (task.fkColuna === targetColumnId && !newStatus) {
      return prisma.tarefa.findUnique({
        where: { id: taskId },
        include: { coluna: true },
      });
    }

    // 3. Atualiza a coluna da tarefa (e status opcionalmente sincronizado com o título da coluna)
    const updatedTask = await prisma.tarefa.update({
      where: { id: taskId },
      data: {
        fkColuna: targetColumnId,
        ...(newStatus
          ? { status: newStatus.trim() }
          : { status: destinationColumn.tituloColuna }),
      },
      select: {
        id: true,
        tituloTarefa: true,
        status: true,
        fkColuna: true,
        coluna: {
          select: {
            id: true,
            tituloColuna: true,
            ordem: true,
          },
        },
      },
    });

    return updatedTask;
  }
}
