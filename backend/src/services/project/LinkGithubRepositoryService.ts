import { Octokit } from "@octokit/rest";
import { prisma } from "../../prisma";

export interface LinkGithubRepositoryDTO {
  projectId: number;
  owner: string;
  repo: string;
  githubToken?: string;
}

export class LinkGithubRepositoryService {
  async execute({
    projectId,
    owner,
    repo,
    githubToken,
  }: LinkGithubRepositoryDTO) {
    if (!projectId || isNaN(projectId) || projectId <= 0) {
      throw new Error(
        "O ID do projeto é obrigatório e deve ser um número inteiro válido.",
      );
    }

    if (!owner || !repo) {
      throw new Error(
        "Proprietário (owner) e nome do repositório (repo) são obrigatórios.",
      );
    }

    // 1. Instancia o Octokit com Token informado ou Token Global de Servidor
    const octokit = new Octokit({
      auth: githubToken || process.env.GITHUB_GLOBAL_TOKEN,
    });

    // 2. Validação Fail-Fast via SDK Octokit
    try {
      await octokit.rest.repos.get({
        owner,
        repo,
      });
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error(
          "Repositório não encontrado no GitHub ou sem permissão de acesso.",
        );
      }
      if (error.status === 401) {
        throw new Error(
          "Token de autenticação do GitHub inválido ou expirado.",
        );
      }
      throw new Error("Falha ao comunicar com a API do GitHub via Octokit.");
    }

    // 3. Checa existência do projeto no banco
    const projectExists = await prisma.projeto.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!projectExists) {
      throw new Error("Projeto não encontrado.");
    }

    // 4. Salva o caminho padronizado "owner/repo" no banco de dados
    const repoPath = `${owner}/${repo}`;

    const updatedProject = await prisma.projeto.update({
      where: { id: projectId },
      data: {
        tokenGithub: repoPath,
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
