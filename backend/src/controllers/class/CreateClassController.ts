import { Request, Response } from "express";
import { CreateClassService } from "../../services/class/CreateClassService";

export class CreateClassController {
  async handle(req: Request, res: Response) {
    const creatorRole = req.user_role;

    const lastYear = req.body.lastYear;

    const createClassService = new CreateClassService();
    const classroom = await createClassService.execute({
      lastYear,
      creatorRole,
    });

    return res.json({
      classroom,
    });
  }
}
