import { Request, Response, NextFunction } from "express";
import { GetGithubMetricsService } from "../../services/project/GetGithubMetricsService";

export class GetGithubMetricsController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      // Suporta o projectId enviado via Query String (?projectId=1), Route Param ou Body
      const projectId = Number(
        req.query.projectId || req.params.id || req.body?.projectId,
      );

      // Captura a branch opcional (?branch=develop)
      const rawBranch = req.query.branch ?? req.body?.branch;
      const branch =
        typeof rawBranch === "string" && rawBranch.trim().length > 0
          ? rawBranch.trim()
          : undefined;

      // Captura período opcional em dias (?days=30)
      const rawDays = req.query.days ?? req.body?.days;
      const days = rawDays !== undefined ? Number(rawDays) : undefined;

      const getGithubMetricsService = new GetGithubMetricsService();
      const metrics = await getGithubMetricsService.execute({
        projectId,
        branch,
        days,
      });

      return res.status(200).json(metrics);
    } catch (error) {
      next(error);
    }
  }
}
