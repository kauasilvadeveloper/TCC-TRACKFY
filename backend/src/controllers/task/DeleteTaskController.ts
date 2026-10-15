import { Request, Response, NextFunction } from "express";
import { DeleteTaskService } from "../../services/task/DeleteTaskService";

export class DeleteTaskController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      // Padrão RESTful: Captura o ID prioritariamente via URL param (/task/:id) com suporte a body/query
      const taskId = Number(req.params.id || req.body.id || req.query.id);

      const deleteTaskService = new DeleteTaskService();
      await deleteTaskService.execute({ taskId });

      return res
        .status(200)
        .json({ message: "Tarefa excluída com sucesso.", id: taskId });
    } catch (error) {
      next(error);
    }
  }
}
