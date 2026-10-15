import { Request, Response, NextFunction } from "express";
import { UpdateSprintService } from "../../services/sprint/UpdateSprintService";

export class UpdateSprintController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      // Aceita o ID via URL param (ex: /sprint/:id) ou via payload body
      const sprintId = Number(req.params.id || req.body.id);
      const { tituloSprint, descricaoSprint, prazoSprint } = req.body;

      const updateSprintService = new UpdateSprintService();

      const sprint = await updateSprintService.execute({
        sprintId,
        tituloSprint,
        descricaoSprint,
        prazoSprint,
      });

      return res.status(200).json(sprint);
    } catch (error) {
      next(error);
    }
  }
}
