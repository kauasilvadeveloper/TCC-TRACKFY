import { prisma } from "../../prisma";

export interface CreateCommentDTO {
  taskId: number;
  userId: number;
  conteudo: string;
}

export class CreateCommentService {
  async execute({ taskId, userId, conteudo }: CreateCommentDTO) {
    if (!taskId || isNaN(taskId) || taskId <= 0) {
      throw new Error(
        "O ID da tarefa é obrigatório e deve ser um número inteiro válido.",
      );
    }

    if (!userId || isNaN(userId) || userId <= 0) {
      throw new Error("Identificador do usuário não autenticado ou inválido.");
    }

    if (!conteudo || !conteudo.trim()) {
      throw new Error("O conteúdo do comentário não pode estar vazio.");
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
      throw new Error("Tarefa não encontrada.");
    }

    if (!userExists) {
      throw new Error("Usuário não encontrado.");
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
