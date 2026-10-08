import { Request, Response } from "express";
import { CreateUserService } from "../../services/auth/CreateUserService";

class CreateUserController {
  async handle(req: Request, res: Response) {
    const { user_role } = req;

    const { name, email, password, role } = req.body;

    const createUserService = new CreateUserService();

    const user = createUserService.execute({ name, email, password, role });

    return res.json({ user_role });
  }
}

export { CreateUserController };
