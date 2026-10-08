import { Request, Response } from "express";
import { DeleteProjectService } from "../../services/project/DeleteProjectService";

export class DeleteProjectController {
  async handle(req: Request, res: Response) {
    const creatorRole = req.user_role;

    const { projectId } = req.body;

    const deleteProjectService = new DeleteProjectService();

    const project = await deleteProjectService.execute({
      creatorRole,
      projectId,
    });

    return res.status(200).json({ project });
  }
}
