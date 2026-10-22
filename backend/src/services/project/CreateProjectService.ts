import { AppError } from "../../errors/AppError";
import { prisma } from "../../prisma";

interface CreateProjectRequest {
  creatorRole: string;
  title: string;
  description: string;
  term: Date;
  tokenGithub: string;
}

export class CreateProjectService {
  async execute(data: CreateProjectRequest) {
    const { creatorRole } = data;
    const { title, description, term, tokenGithub } = data;

    const allowedRoles = ["aluno", "professor"];
    if (!creatorRole || !allowedRoles.includes(creatorRole.toLowerCase())) {
      throw new AppError(
        "Acesso negado: Permissão insuficiente para criar projetos.",
        403, // Forbidden
      );
    }

    const project = await prisma.projeto.create({
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
