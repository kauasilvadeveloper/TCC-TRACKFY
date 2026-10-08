import { Request, Response } from "express";
import { GetTasksBySprintService } from "../../services/sprint/GetTasksBySprintService";

export class GetTasksBySprintController {
  async handle(req: Request, res: Response) {
    const { fkSprint } = req.params;

    const creatorRole = req.user_role;

    const getTasksByService = new GetTasksBySprintService();

    const tarefas = await getTasksByService.execute(
      Number(fkSprint),
      creatorRole,
    );

    return res.status(200).json(tarefas);
  }
}
