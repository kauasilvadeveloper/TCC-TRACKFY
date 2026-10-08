import { Request, Response, NextFunction } from "express";
import { CreateProjectService } from "../../services/project/CreateProjectService";

export class CreateProjectController {
  async handle(req: Request, res: Response, next: NextFunction) {
    const { title, description, term, tokenGithub } = req.body;

    const creatorRole = req.user_role;

    const createProjectService = new CreateProjectService();

    const project = await createProjectService.execute({
      creatorRole,
      title,
      description,
      term: new Date(term),
      tokenGithub,
    });

    return res.status(201).json(project);
  }
}
