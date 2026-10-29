import { Request, Response, NextFunction } from "express";
import { GetGithubCommitsService } from "../../services/project/GetGithubCommitsService";

export class GetGithubCommitsController {
    async handle(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { projectId, branchName } = req.params;

            const getGithubCommitsService = new GetGithubCommitsService();

            const commits = await getGithubCommitsService.execute({
                projectId: Number(projectId),
                branchName: String(branchName),
            });

            return res.status(200).json(commits);
        } catch (error) {
            next(error);
        }
    }
}