import { Request, Response, NextFunction } from "express";
import { LinkGithubRepositoryService } from "../../services/project/LinkGithubRepositoryService";

export class LinkGithubRepositoryController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, id, tokenGithub, githubUrl } = req.body;

      const targetProjectId = Number(projectId || id);
      const targetToken = tokenGithub || githubUrl;

      const linkGithubRepositoryService = new LinkGithubRepositoryService();

      const project = await linkGithubRepositoryService.execute({
        projectId: targetProjectId,
        tokenGithub: targetToken,
      });

      return res.status(200).json({
        message: "Repositório do GitHub vinculado ao projeto com sucesso.",
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }
}
