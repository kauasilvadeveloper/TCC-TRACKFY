import { Request, Response, NextFunction } from "express";
import { GetProjectByIdService } from "../../services/project/GetProjectByIdService";

export class GetProjectByIdController {
  async handle(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const projectId = Number(id);

    const getProjectByIdService = new GetProjectByIdService();
    const project = await getProjectByIdService.execute(projectId);

    return res.status(200).json(project);
  }
}
