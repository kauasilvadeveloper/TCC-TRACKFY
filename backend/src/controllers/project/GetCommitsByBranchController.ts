import { Request, Response, NextFunction } from "express";
import { GetCommitsByBranchService } from "../../services/project/GetCommitsByBranchService";

export class GetCommitsByBranchController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const rawBranch = req.params.branch || req.query.branch;

      // Type Narrowing: Garante conversão segura para string simples
      const branch = Array.isArray(rawBranch)
        ? String(rawBranch[0])
        : String(rawBranch ?? "");

      const projectId = Number(req.query.projectId || req.body.projectId);

      const getCommitsByBranchService = new GetCommitsByBranchService();
      const commits = await getCommitsByBranchService.execute({
        projectId,
        branch,
      });

      return res.status(200).json(commits);
    } catch (error) {
      next(error);
    }
  }
}
