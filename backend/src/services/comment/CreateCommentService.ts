import { AppError } from "../../errors/AppError";
import { prisma } from "../../prisma";

export interface CreateCommentDTO {
  taskId: number;
  userId: number;
  conteudo: string;
}

export class CreateCommentService {
  async execute({ taskId, userId, conteudo }: CreateCommentDTO) {
    const parsedTaskId = Number(taskId);
    if (!taskId || Number.isNaN(parsedTaskId) || parsedTaskId <= 0) {
      throw new AppError(
        "O ID da tarefa é obrigatório e deve ser um número inteiro válido.",
        400, // Bad Request
      );
    }

    const parsedUserId = Number(userId);
    if (!userId || Number.isNaN(parsedUserId) || parsedUserId <= 0) {
      throw new AppError("Identificador do usuário inválido.", 400); // Bad Request
    }

    if (!conteudo || !conteudo.trim()) {
      throw new AppError("O conteúdo do comentário não pode estar vazio.", 400); // Bad Request
    }

    const trimmedConteudo = conteudo.trim();

    // 1. Validação concorrente de existência de Tarefa e Usuário (Parallel I/O)
    const [taskExists, userExists] = await Promise.all([
      prisma.tarefa.findUnique({
        where: { id: taskId },
        select: { id: true },
      }),
      prisma.usuario.findUnique({
        where: { id: userId },
        select: { id: true },
      }),
    ]);

    if (!taskExists) {
      throw new AppError("Tarefa não encontrada.", 404); // Not Found
    }

    if (!userExists) {
      throw new AppError("Usuário não encontrado.", 404); // Not Found
    }

    // 2. Criação do comentário associado à tarefa e ao autor
    const comment = await prisma.comentario.create({
      data: {
        conteudo: trimmedConteudo,
        fkTarefa: taskId,
        fkUsuario: userId,
      },
      select: {
        id: true,
        conteudo: true,
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    return comment;
  }
}
