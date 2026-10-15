import { Request, Response, NextFunction } from "express";
import { GetGithubMetricsService } from "../../services/project/GetGithubMetricsService";

export class GetGithubMetricsController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      // Suporta o projectId enviado via Query String (?projectId=1) ou Route Param (/project/:id/github/metrics)
      const projectId = Number(
        req.query.projectId || req.params.id || req.body.projectId,
      );

      const getGithubMetricsService = new GetGithubMetricsService();
      const metrics = await getGithubMetricsService.execute({ projectId });

      return res.status(200).json(metrics);
    } catch (error) {
      next(error);
    }
  }
}
