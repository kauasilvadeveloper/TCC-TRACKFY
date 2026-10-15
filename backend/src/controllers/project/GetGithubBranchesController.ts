import { Request, Response, NextFunction } from "express";
import { GetGithubBranchesService } from "../../services/project/GetGithubBranchesService";

export class GetGithubBranchesController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      // Suporta extração flexível: Query Param (?projectId=1), Route Param (/project/:id/github/branches) ou Body
      const projectId = Number(
        req.query.projectId || req.params.id || req.body.projectId,
      );

      const getGithubBranchesService = new GetGithubBranchesService();
      const branches = await getGithubBranchesService.execute({ projectId });

      return res.status(200).json(branches);
    } catch (error) {
      next(error);
    }
  }
}
