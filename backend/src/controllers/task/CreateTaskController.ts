import { Request, Response, NextFunction } from "express";
import { CreateTaskService } from "../../services/task/CreateTaskService";

export class CreateTaskController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        tituloTarefa,
        descricaoTarefa,
        status,
        stack,
        prazoTarefa,
        fkColuna,
        fkSprint,
        usuarioIds,
      } = req.body;

      const createTaskService = new CreateTaskService();

      const task = await createTaskService.execute({
        tituloTarefa,
        descricaoTarefa,
        status,
        stack,
        prazoTarefa,
        fkColuna: Number(fkColuna),
        fkSprint: Number(fkSprint),
        usuarioIds: Array.isArray(usuarioIds)
          ? usuarioIds.map(Number)
          : undefined,
      });

      return res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }
}
