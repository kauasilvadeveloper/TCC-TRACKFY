import { AppError } from "../../errors/AppError";
import { prisma } from "../../prisma";

interface DeleteProjectRequest {
  creatorRole: string;
  projectId: number;
}

export class DeleteProjectService {
  async execute(data: DeleteProjectRequest) {
    const { creatorRole, projectId } = data;

    const allowedRoles = ["aluno", "professor"];
    if (!creatorRole || !allowedRoles.includes(creatorRole.toLowerCase())) {
      throw new AppError(
        "Acesso negado: Permissão insuficiente para deletar projetos.",
        403, // Forbidden
      );
    }

    const project = await prisma.projeto.delete({
      where: {
        id: projectId,
      },
    });

    return project;
  }
}
