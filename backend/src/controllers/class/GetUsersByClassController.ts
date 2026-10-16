import { Request, Response } from "express";
import { GetUsersByClassService } from "../../services/class/GetUsersByClassService";

export class GetUsersByClassController {
  async handle(req: Request, res: Response) {
    const id = Number(req.params.id);

    const getUsersByClassService = new GetUsersByClassService();

    const users = await getUsersByClassService.execute(id);

    return res.status(200).json({ users });
  }
}
