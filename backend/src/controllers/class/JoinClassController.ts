import { Request, Response, NextFunction } from "express";
import { JoinClassService } from "../../services/class/JoinClassService";

export class JoinClassController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      // ID do aluno autenticado injetado pelo middleware JWT (req.user_id)
      const userId = Number(req.user_id);

      // Aceita 'code' ou 'salaId' no corpo da requisição
      const { code, salaId } = req.body;
      const targetSalaId = Number(code || salaId);

      const joinClassService = new JoinClassService();
      const enrollment = await joinClassService.execute({
        userId,
        salaId: targetSalaId,
      });

      return res.status(201).json({
        message: "Entrada na turma realizada com sucesso.",
        data: enrollment,
      });
    } catch (error) {
      next(error);
    }
  }
}
