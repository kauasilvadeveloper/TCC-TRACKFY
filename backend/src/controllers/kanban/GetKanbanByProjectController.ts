import { Request, Response, NextFunction } from "express";
import { GetKanbanByProjectService } from "../../services/kanban/GetKanbanByProjectService";

export class GetKanbanByProjectController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;

      const parsedProjectId = Number(projectId);

      const getKanbanByProjectService = new GetKanbanByProjectService();
      const kanban = await getKanbanByProjectService.execute(parsedProjectId);

      return res.status(200).json(kanban);
    } catch (error) {
      next(error);
    }
  }
}
