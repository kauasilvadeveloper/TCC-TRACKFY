import { Request, Response, NextFunction } from "express";
import { CreateUserService } from "../../services/auth/CreateUserService";

export class CreateUserController {
  async handle(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      // Extraído do middleware de autenticação JWT/Sessão
      const creatorRole = req.user_role;
      const { name, email, password, role } = req.body;

      const createUserService = new CreateUserService();

      const user = await createUserService.execute({
        creatorRole,
        name,
        email,
        password,
        role,
      });

      return res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }
}
