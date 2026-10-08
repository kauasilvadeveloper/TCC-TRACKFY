import { Request, Response } from "express";
import { GetUsersByClassService } from "../../services/class/GetUsersByClassService";

export class GetUsersByClassController {
  async handle(req: Request, res: Response) {
    const { class_id } = req.body;

    const getUsersByClassService = new GetUsersByClassService();

    const users = await getUsersByClassService.execute(class_id);

    return res.status(200).json({ users });
  }
}
