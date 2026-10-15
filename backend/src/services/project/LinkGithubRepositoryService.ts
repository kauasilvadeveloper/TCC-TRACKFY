import { prisma } from "../../prisma";

export interface LinkGithubRepositoryDTO {
  projectId: number;
  tokenGithub: string;
}

export class LinkGithubRepositoryService {
  async execute({ projectId, tokenGithub }: LinkGithubRepositoryDTO) {
    if (!projectId || isNaN(projectId) || projectId <= 0) {
      throw new Error(
        "O ID do projeto é obrigatório e deve ser um número inteiro válido.",
      );
    }

    if (!tokenGithub || !tokenGithub.trim()) {
      throw new Error("O link ou token do repositório GitHub é obrigatório.");
    }

    const trimmedToken = tokenGithub.trim();

    // 1. Verificação prévia de existência do projeto (Fail-Fast)
    const existingProject = await prisma.projeto.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!existingProject) {
      throw new Error("Projeto não encontrado.");
    }

    // 2. Atualização atômica do campo tokenGithub na model Projeto
    const updatedProject = await prisma.projeto.update({
      where: { id: projectId },
      data: {
        tokenGithub: trimmedToken,
      },
      select: {
        id: true,
        tituloProjeto: true,
        tokenGithub: true,
      },
    });

    return updatedProject;
  }
}
