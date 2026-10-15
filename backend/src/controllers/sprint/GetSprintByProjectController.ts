import { Request, Response, NextFunction } from "express";
import { GetSprintsByProjectService } from "../../services/sprint/GetSprintByProjectService";

export class GetSprintsByProjectController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;

      const parsedProjectId = Number(projectId);

      if (isNaN(parsedProjectId) || parsedProjectId <= 0) {
        return res.status(400).json({
          error: "O ID do projeto deve ser um número inteiro válido.",
        });
      }

      const getSprintByProjectService = new GetSprintsByProjectService();
      const sprints = await getSprintByProjectService.execute(parsedProjectId);

      return res.status(200).json(sprints);
    } catch (error) {
      next(error);
    }
  }
}
