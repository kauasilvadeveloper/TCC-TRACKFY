import { Octokit } from "@octokit/rest";
import { prisma } from "../../prisma";
import { AppError } from "../../errors/AppError";

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
    const parsedProjectId = Number(projectId);
    if (!projectId || Number.isNaN(parsedProjectId) || parsedProjectId <= 0) {
      throw new AppError(
        "O ID do projeto é obrigatório e deve ser um número inteiro válido.",
        400, // Bad Request
      );
    }

    if (!owner?.trim() || !repo?.trim()) {
      throw new AppError(
        "Proprietário (owner) e nome do repositório (repo) são obrigatórios.",
        400, // Bad Request
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
      throw new AppError("Projeto não encontrado.", 404); // Not Found
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
