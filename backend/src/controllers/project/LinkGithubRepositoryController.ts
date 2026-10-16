import { Request, Response, NextFunction } from "express";
import { LinkGithubRepositoryService } from "../../services/project/LinkGithubRepositoryService";

export class LinkGithubRepositoryController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, id, owner, repo, githubUrl, githubToken } = req.body;

      let parsedOwner = owner;
      let parsedRepo = repo;

      // Sanitização: Aceita URL completa (ex: https://github.com/owner/repo) ou parâmetros isolados
      if (githubUrl && (!parsedOwner || !parsedRepo)) {
        const match = githubUrl
          .replace(/\.git$/, "")
          .match(/github\.com\/([^/]+)\/([^/]+)/);
        if (match) {
          parsedOwner = match[1];
          parsedRepo = match[2];
        }
      }

      const linkGithubRepositoryService = new LinkGithubRepositoryService();
      const project = await linkGithubRepositoryService.execute({
        projectId: Number(projectId || id),
        owner: parsedOwner,
        repo: parsedRepo,
        githubToken,
      });

      return res.status(200).json({
        message: "Repositório do GitHub verificado e vinculado com sucesso.",
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }
}
