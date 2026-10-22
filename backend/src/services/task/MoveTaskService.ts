import { AppError } from "../../errors/AppError";
import { prisma } from "../../prisma";

export interface MoveTaskDTO {
  taskId: number;
  targetColumnId: number;
  newStatus?: string;
}

export class MoveTaskService {
  async execute({ taskId, targetColumnId, newStatus }: MoveTaskDTO) {
    const parsedTaskId = Number(taskId);
    if (!taskId || Number.isNaN(parsedTaskId) || parsedTaskId <= 0) {
      throw new AppError(
        "O ID da tarefa é obrigatório e deve ser um número inteiro válido.",
        400, // Bad Request
      );
    }

    // 2. Validação do ID da Coluna de Destino (Kanban Validation)
    const parsedTargetColumnId = Number(targetColumnId);
    if (
      !targetColumnId ||
      Number.isNaN(parsedTargetColumnId) ||
      parsedTargetColumnId <= 0
    ) {
      throw new AppError(
        "O ID da coluna de destino é obrigatório e deve ser um número inteiro válido.",
        400, // Bad Request
      );
    }

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
      throw new AppError("Tarefa não encontrada.", 404); // Not Found
    }

    if (!destinationColumn) {
      throw new AppError(
        "A coluna de destino informada não existe.",
        404, // Not Found
      );
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
