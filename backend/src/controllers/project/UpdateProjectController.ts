import { Request, Response } from "express";
import { UpdateProjectService } from "../../services/project/UpdateProjectService";

export class UpdateProjectController {
  async handle(req: Request, res: Response) {
    const creatorRole = req.user_role;

    const { projectId, title, description, term, tokenGithub } = req.body;

    const updateProjectService = new UpdateProjectService();

    const project = await updateProjectService.execute({
      creatorRole,
      projectId,
      title,
      description,
      term,
      tokenGithub,
    });

    return res.status(200).json({ project });
  }
}
