import { Request, Response, NextFunction } from "express";
import { MoveTaskService } from "../../services/task/MoveTaskService";

export class MoveTaskController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      // Suporta ID na URL (/task/:id/move) ou no Payload (/task/move)
      const taskId = Number(req.params.id || req.body.taskId || req.body.id);
      const targetColumnId = Number(
        req.body.targetColumnId || req.body.fkColuna,
      );
      const { newStatus } = req.body;

      const moveTaskService = new MoveTaskService();

      const task = await moveTaskService.execute({
        taskId,
        targetColumnId,
        newStatus,
      });

      return res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  }
}
