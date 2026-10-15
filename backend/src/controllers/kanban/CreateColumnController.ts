import { Request, Response, NextFunction } from "express";
import { CreateColumnService } from "../../services/kanban/CreateColumnService";

export class CreateColumnController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { tituloColuna, descricaoColuna, ordem, fkKanban } = req.body;

      const createColumnService = new CreateColumnService();

      const coluna = await createColumnService.execute({
        tituloColuna,
        descricaoColuna,
        ordem,
        fkKanban: Number(fkKanban),
      });

      return res.status(201).json(coluna);
    } catch (error) {
      next(error);
    }
  }
}
