import { AppError } from "../../errors/AppError";
import { prisma } from "../../prisma";

interface UpdateProjectRequest {
  creatorRole: string;
  projectId: number;
  title?: string;
  description?: string;
  term?: Date;
  tokenGithub?: string;
}

export class UpdateProjectService {
  async execute(data: UpdateProjectRequest) {
    const { creatorRole } = data;
    const { projectId, title, description, term, tokenGithub } = data;

    const allowedRoles = ["aluno", "professor"];

    if (!creatorRole || !allowedRoles.includes(creatorRole.toLowerCase())) {
      throw new AppError(
        "Acesso negado: Permissão insuficiente para alterar projetos.",
        403, // Forbidden
      );
    }

    const project = await prisma.projeto.update({
      where: {
        id: projectId,
      },
      data: {
        tituloProjeto: title,
        descricao: description,
        prazo: term,
        tokenGithub: tokenGithub,
      },
    });

    return project;
  }
}
