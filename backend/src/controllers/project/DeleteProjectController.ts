import { Request, Response } from "express";
import { DeleteProjectService } from "../../services/project/DeleteProjectService";

export class DeleteProjectController {
  async handle(req: Request, res: Response) {
    const creatorRole = req.user_role;

    // Busca de req.params (URL) ou fallback de req.body
    const rawProjectId =
      req.params.id || req.params.projectId || req.body?.projectId;

    if (!rawProjectId) {
      return res.status(400).json({ message: "ID do projeto não fornecido." });
    }

    const projectId = Number(rawProjectId); // Converte para número inteiro

    const deleteProjectService = new DeleteProjectService();

    const project = await deleteProjectService.execute({
      creatorRole,
      projectId,
    });

    return res.status(200).json({ project });
  }
}
