import { Request, Response, NextFunction } from "express";
import { GetProjectsByUserService } from "../../services/project/GetProjectsByUserService";

export class GetProjectsByUserController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      // ID extraído com segurança via Middleware de Autenticação JWT (req.user_id)
      const userId = Number(req.user_id);

      const getProjectsByUserService = new GetProjectsByUserService();
      const projetos = await getProjectsByUserService.execute(userId);

      return res.status(200).json(projetos);
    } catch (error) {
      next(error);
    }
  }
}
