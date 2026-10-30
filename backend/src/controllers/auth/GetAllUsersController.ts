import { Request, Response, NextFunction } from "express";
import { GetAllUsersService } from "../../services/auth/GetAllUsersService";

export class GetAllUsersController {
  async handle(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const getAllUsersService = new GetAllUsersService();

      const user = await getAllUsersService.execute();

      return res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }
}
