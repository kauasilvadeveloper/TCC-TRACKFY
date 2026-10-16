import { prisma } from "../../prisma";

export interface DeleteCommentDTO {
  commentId: number;
  userId: number;
}

export class DeleteCommentService {
  async execute({ commentId, userId }: DeleteCommentDTO) {
    if (!commentId || isNaN(commentId) || commentId <= 0) {
      throw new Error(
        "O ID do comentário é obrigatório e deve ser um número inteiro válido.",
      );
    }

    if (!userId || isNaN(userId) || userId <= 0) {
      throw new Error("Identificador do usuário não autenticado ou inválido.");
    }

    // 1. Busca o comentário para validar existência e verificar propriedade (Ownership)
    const comment = await prisma.comentario.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        fkUsuario: true,
      },
    });

    if (!comment) {
      throw new Error("Comentário não encontrado.");
    }

    // 2. Regra de Autorização: Impede que um usuário remova o comentário de outro
    if (comment.fkUsuario !== userId) {
      throw new Error(
        "Ação não autorizada. Apenas o autor do comentário pode removê-lo.",
      );
    }

    // 3. Exclusão física do registro no banco
    await prisma.comentario.delete({
      where: { id: commentId },
    });

    return { id: commentId };
  }
}
