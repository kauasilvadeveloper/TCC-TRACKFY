import { prisma } from "../../prisma";

export interface UpdateTaskDTO {
  taskId: number;
  tituloTarefa?: string;
  descricaoTarefa?: string;
  status?: string;
  stack?: string;
  prazoTarefa?: string;
  fkColuna?: number;
  fkSprint?: number;
  usuarioIds?: number[];
}

export class UpdateTaskService {
  async execute({
    taskId,
    tituloTarefa,
    descricaoTarefa,
    status,
    stack,
    prazoTarefa,
    fkColuna,
    fkSprint,
    usuarioIds,
  }: UpdateTaskDTO) {
    if (!taskId || isNaN(taskId) || taskId <= 0) {
      throw new Error(
        "O ID da tarefa é obrigatório e deve ser um número inteiro válido.",
      );
    }

    // 1. Verificação de existência da tarefa
    const existingTask = await prisma.tarefa.findUnique({
      where: { id: taskId },
      select: { id: true },
    });

    if (!existingTask) {
      throw new Error("Tarefa não encontrada.");
    }

    // 2. Validação condicional de FKs se forem enviadas na atualização
    if (fkColuna) {
      const colunaExists = await prisma.coluna.findUnique({
        where: { id: fkColuna },
        select: { id: true },
      });
      if (!colunaExists) throw new Error("A coluna informada não existe.");
    }

    if (fkSprint) {
      const sprintExists = await prisma.sprint.findUnique({
        where: { id: fkSprint },
        select: { id: true },
      });
      if (!sprintExists) throw new Error("A sprint informada não existe.");
    }

    // 3. Reorganização dos responsáveis na tabela pivô (tarefa_usuario)
    if (usuarioIds !== undefined) {
      await prisma.tarefaUsuario.deleteMany({
        where: { fkTarefa: taskId },
      });
    }

    // 4. Atualização parcial dos dados (PATCH semântico)
    const updatedTask = await prisma.tarefa.update({
      where: { id: taskId },
      data: {
        ...(tituloTarefa !== undefined && {
          tituloTarefa: tituloTarefa.trim(),
        }),
        ...(descricaoTarefa !== undefined && {
          descricaoTarefa: descricaoTarefa.trim(),
        }),
        ...(status !== undefined && { status: status.trim() }),
        ...(stack !== undefined && { stack: stack.trim() }),
        ...(prazoTarefa !== undefined && {
          prazoTarefa: new Date(prazoTarefa),
        }),
        ...(fkColuna !== undefined && { fkColuna }),
        ...(fkSprint !== undefined && { fkSprint }),
        ...(usuarioIds &&
          usuarioIds.length > 0 && {
            usuarios: {
              create: usuarioIds.map((fkUsuario) => ({ fkUsuario })),
            },
          }),
      },
      select: {
        id: true,
        tituloTarefa: true,
        descricaoTarefa: true,
        status: true,
        stack: true,
        prazoTarefa: true,
        fkColuna: true,
        fkSprint: true,
        usuarios: {
          select: {
            usuario: {
              select: { id: true, nome: true, email: true },
            },
          },
        },
      },
    });

    return updatedTask;
  }
}
