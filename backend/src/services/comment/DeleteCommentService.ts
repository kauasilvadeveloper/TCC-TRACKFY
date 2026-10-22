import { AppError } from "../../errors/AppError";
import { prisma } from "../../prisma";

export interface DeleteCommentDTO {
  commentId: number;
  userId: number;
}

export class DeleteCommentService {
  async execute({ commentId, userId }: DeleteCommentDTO) {
    const parsedCommentId = Number(commentId);
    if (!commentId || Number.isNaN(parsedCommentId) || parsedCommentId <= 0) {
      throw new AppError(
        "O ID do comentário é obrigatório e deve ser um número inteiro válido.",
        400, // Bad Request
      );
    }

    const parsedUserId = Number(userId);
    if (!userId || Number.isNaN(parsedUserId) || parsedUserId <= 0) {
      throw new AppError("Identificador do usuário inválido.", 400); // Bad Request
    }

    const comment = await prisma.comentario.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        fkUsuario: true,
      },
    });

    if (!comment) {
      throw new AppError("Comentário não encontrado.", 404); // Not Found
    }

    if (comment.fkUsuario !== parsedUserId) {
      throw new AppError(
        "Acesso negado: Apenas o autor do comentário tem permissão para removê-lo.",
        403, // Forbidden
      );
    }

    await prisma.comentario.delete({
      where: { id: commentId },
    });

    return { id: commentId };
  }
}
