import { Request, Response, NextFunction } from "express";
import { ReopenSprintService } from "../../services/sprint/ReopenSprintService";

export class ReopenSprintController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const userRole = req.user_role;
      const { sprintId, justificativa, novoPrazo } = req.body;

      const reopenSprintService = new ReopenSprintService();

      const sprint = await reopenSprintService.execute({
        userRole,
        sprintId: Number(sprintId),
        justificativa,
        novoPrazo,
      });

      return res.status(200).json(sprint);
    } catch (error) {
      next(error);
    }
  }
}
