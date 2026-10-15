import { Request, Response, NextFunction } from "express";
import { UpdateTaskService } from "../../services/task/UpdateTaskService";

export class UpdateTaskController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      // Padrão RESTful: Aceita o ID via URL param (/task/:id) com fallback para o Body (/task)
      const taskId = Number(req.params.id || req.body.id);
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

      const updateTaskService = new UpdateTaskService();

      const task = await updateTaskService.execute({
        taskId,
        tituloTarefa,
        descricaoTarefa,
        status,
        stack,
        prazoTarefa,
        fkColuna: fkColuna ? Number(fkColuna) : undefined,
        fkSprint: fkSprint ? Number(fkSprint) : undefined,
        usuarioIds: Array.isArray(usuarioIds)
          ? usuarioIds.map(Number)
          : undefined,
      });

      return res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  }
}
