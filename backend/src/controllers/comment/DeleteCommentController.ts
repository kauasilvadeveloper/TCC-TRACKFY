import { Request, Response, NextFunction } from "express";
import { DeleteCommentService } from "../../services/comment/DeleteCommentService";

export class DeleteCommentController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      // Aceita o ID vindo da rota (/comment/:id) ou do body (fallback)
      const commentId = Number(req.params.id || req.body.commentId);
      const userId = Number(req.user_id);

      const deleteCommentService = new DeleteCommentService();
      await deleteCommentService.execute({ commentId, userId });

      return res.status(200).json({
        message: "Comentário removido com sucesso.",
      });
    } catch (error) {
      next(error);
    }
  }
}
