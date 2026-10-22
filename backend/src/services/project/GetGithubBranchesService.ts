import { Octokit } from "@octokit/rest";
import { prisma } from "../../prisma";
import { AppError } from "../../errors/AppError";

export interface GetGithubBranchesDTO {
  projectId: number;
}

export interface GithubBranchResponse {
  name: string;
  protected: boolean;
  commitSha: string;
}

export class GetGithubBranchesService {
  async execute({
    projectId,
  }: GetGithubBranchesDTO): Promise<GithubBranchResponse[]> {
    if (!projectId || Number.isNaN(projectId) || projectId <= 0) {
      throw new Error(
        "O ID do projeto é obrigatório e deve ser um número inteiro válido.",
      );
    }

    // 1. Busca dados do repositório no projeto
    const project = await prisma.projeto.findUnique({
      where: { id: projectId },
      select: { id: true, tokenGithub: true },
    });

    if (!project) {
      throw new Error("Projeto não encontrado.");
    }

    if (!project.tokenGithub) {
      throw new Error(
        "Este projeto não possui um repositório do GitHub vinculado.",
      );
    }

    // 2. Extrai 'owner' e 'repo' do campo armazenado
    const repoInfo = this.extractOwnerAndRepo(project.tokenGithub);
    if (!repoInfo) {
      throw new Error(
        "O vínculo do GitHub armazenado não é uma URL ou repositório válido (ex: 'owner/repo').",
      );
    }

    const { owner, repo } = repoInfo;

    // 3. Instância do Octokit utilizando Token Global autenticado
    const octokit = new Octokit({
      auth: process.env.GITHUB_GLOBAL_TOKEN,
    });

    try {
      // 4. Consulta as branches via SDK Oficial
      const { data } = await octokit.rest.repos.listBranches({
        owner,
        repo,
        per_page: 100,
      });

      // 5. Projeção DTO para sanitização de dados no payload final
      return data.map((branch) => ({
        name: branch.name,
        protected: branch.protected,
        commitSha: branch.commit.sha,
      }));
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "status" in error) {
        const githubError = error as { status: number; message?: string };

        if (githubError.status === 404) {
          throw new AppError(
            "Repositório não encontrado no GitHub ou sem permissão de acesso.",
            404, // Not Found
          );
        }

        if (githubError.status === 401) {
          throw new AppError(
            "Token de autenticação do GitHub inválido ou expirado.",
            401, // Unauthorized
          );
        }
      }

      if (error instanceof AppError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Falha de comunicação com a API do GitHub ao listar branches.";

      // Status 502 (Bad Gateway) indica que um serviço upstream/terceiro falhou
      throw new AppError(errorMessage, 502);
    }
  }

  private extractOwnerAndRepo(
    input: string,
  ): { owner: string; repo: string } | null {
    const cleanInput = input.replace(/\.git$/, "").trim();
    const urlMatch = cleanInput.match(/github\.com\/([^/]+)\/([^/]+)/);

    if (urlMatch?.[1] && urlMatch?.[2]) {
      return { owner: urlMatch[1], repo: urlMatch[2] };
    }

    const parts = cleanInput.split("/");
    if (parts.length === 2 && parts[0] && parts[1]) {
      return { owner: parts[0], repo: parts[1] };
    }

    return null;
  }
}
