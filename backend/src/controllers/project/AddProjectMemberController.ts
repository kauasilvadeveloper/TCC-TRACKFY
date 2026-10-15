import { Request, Response, NextFunction } from "express";
import { AddProjectMemberService } from "../../services/project/AddProjectMemberService";

export class AddProjectMemberController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, targetUserId, usuarioId, funcaoId } = req.body;

      const addProjectMemberService = new AddProjectMemberService();

      const member = await addProjectMemberService.execute({
        projectId: Number(projectId),
        targetUserId: Number(targetUserId || usuarioId),
        funcaoId: Number(funcaoId),
      });

      return res.status(201).json({
        message: "Membro adicionado ao projeto com sucesso.",
        data: member,
      });
    } catch (error) {
      next(error);
    }
  }
}
