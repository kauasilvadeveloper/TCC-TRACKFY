import { Request, Response } from "express";
import { UpdateProjectService } from "../../services/project/UpdateProjectService";

export class UpdateProjectController {
  async handle(req: Request, res: Response) {
    const { id } = req.params; // Lembre-se: req.params.id vem como string ("8")
    const { tituloProjeto, descricao, prazo, tokenGithub } = req.body;

    const updateProjectService = new UpdateProjectService();

    const project = await updateProjectService.execute({
      id: Number(id), // 👈 CONVERTA AQUI PARA NUMBER
      tituloProjeto,
      descricao,
      prazo,
      tokenGithub,
    });

    return res.json(project);
  }
}
