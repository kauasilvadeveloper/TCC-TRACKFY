import { Request, Response } from "express";
import { CreateKanbanService } from "../../services/kanban/CreateKanbanService";

export class CreateKanbanController {
  async handle(req: Request, res: Response) {
    const { tituloKanban, descricaoKanban, fkProjeto } = req.body;

    const creatorRole = req.user_role;

    const createKanbanService = new CreateKanbanService();

    const kanban = await createKanbanService.execute({
      creatorRole,
      tituloKanban,
      descricaoKanban,
      fkProjeto,
    });

    return res.status(201).json(kanban);
  }
}
