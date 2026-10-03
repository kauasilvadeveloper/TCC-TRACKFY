import type { Request, Response } from "express";
import { AuthUserService } from "../../services/auth/AuthUserService";

class AuthUserController {
  async handle(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email) {
      return res.json({ message: "Insira um e-mail válido" }).status(400);
    }

    const authUserService = new AuthUserService();

    const login = await authUserService.execute({ email, password });

    return res.json({ login }).status(200);
  }
}

export { AuthUserController };
