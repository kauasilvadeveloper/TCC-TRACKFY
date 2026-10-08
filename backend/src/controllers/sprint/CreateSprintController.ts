import { Request, Response } from "express";
import { CreateSprintService } from "../../services/sprint/CreateSprintService";

export class CreateSprintController {
  async handle(req: Request, res: Response) {
    const { tituloSprint, descricaoSprint, prazoSprint } = req.body;

    const creatorRole = req.user_role;

    const createSprintService = new CreateSprintService();

    const sprint = await createSprintService.execute({
      creatorRole,
      tituloSprint,
      descricaoSprint,
      prazoSprint: new Date(prazoSprint),
    });

    return res.status(201).json(sprint);
  }
}
