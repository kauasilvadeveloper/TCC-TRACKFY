import { Request, Response, NextFunction } from "express";
import { GetClassesByUserService } from "../../services/class/GetClassesByUserService";

export class GetClassesByUserController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      // O ID do usuário vem injetado pelo middleware de autenticação JWT/Sessão (ex: req.user_id)
      const userId = Number(req.user_id);

      const getClassesByUserService = new GetClassesByUserService();
      const turmas = await getClassesByUserService.execute(userId);

      return res.status(200).json(turmas);
    } catch (error) {
      next(error);
    }
  }
}
