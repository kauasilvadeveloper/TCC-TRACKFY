import { Request, Response, NextFunction } from "express";
import { CreateCommentService } from "../../services/comment/CreateCommentService";

export class CreateCommentController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      // Extrai o ID da tarefa da URL ou do Body (fallback)
      const taskId = Number(req.params.taskId || req.body.taskId);

      // ID do autor injetado pelo middleware de autenticação JWT
      const userId = Number(req.user_id);

      // Aceita 'conteudo' ou 'texto' no payload
      const { conteudo, texto } = req.body;
      const commentText = conteudo || texto;

      const createCommentService = new CreateCommentService();

      const comment = await createCommentService.execute({
        taskId,
        userId,
        conteudo: commentText,
      });

      return res.status(201).json({
        message: "Comentário adicionado com sucesso.",
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }
}
