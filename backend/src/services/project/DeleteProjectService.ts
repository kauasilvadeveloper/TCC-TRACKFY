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
      throw new Error("Acesso negado: Permissão para deletar projetos.");
    }

    const project = await prisma.projeto.delete({
      where: {
        id: projectId,
      },
    });

    return project;
  }
}
