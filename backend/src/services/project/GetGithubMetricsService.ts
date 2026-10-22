import { Octokit } from "@octokit/rest";
import { prisma } from "../../prisma";
import { AppError } from "../../errors/AppError";

export interface GetGithubMetricsDTO {
  projectId: number;
}

export interface GithubMetricsResponse {
  repository: string;
  branchesCount: number;
  pullRequests: {
    total: number;
    open: number;
    closed: number;
  };
  recentCommitsCount: number;
}

export class GetGithubMetricsService {
  async execute({
    projectId,
  }: GetGithubMetricsDTO): Promise<GithubMetricsResponse> {
    if (!projectId || Number.isNaN(projectId) || projectId <= 0) {
      throw new Error(
        "O ID do projeto é obrigatório e deve ser um número inteiro válido.",
      );
    }

    // 1. Projeção estrita no banco resgatando apenas os campos estritamente necessários
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

    // 2. Extração segura de owner/repo do campo persistido
    const repoInfo = this.extractOwnerAndRepo(project.tokenGithub);
    if (!repoInfo) {
      throw new Error(
        "O vínculo do GitHub armazenado não é uma URL ou repositório válido (ex: 'owner/repo').",
      );
    }

    const { owner, repo } = repoInfo;

    // 3. Instanciação do Octokit utilizando Token autenticado (previne Rate Limit anônimo)
    const octokit = new Octokit({
      auth: process.env.GITHUB_GLOBAL_TOKEN,
    });

    try {
      // 4. Execução concorrente via SDK Oficial do Octokit
      const [branchesRes, pullsRes, commitsRes] = await Promise.all([
        octokit.rest.repos.listBranches({ owner, repo, per_page: 100 }),
        octokit.rest.pulls.list({ owner, repo, state: "all", per_page: 100 }),
        octokit.rest.repos.listCommits({ owner, repo, per_page: 100 }),
      ]);

      const openPRs = pullsRes.data.filter((pr) => pr.state === "open").length;
      const closedPRs = pullsRes.data.filter(
        (pr) => pr.state === "closed",
      ).length;

      return {
        repository: `${owner}/${repo}`,
        branchesCount: branchesRes.data.length,
        pullRequests: {
          total: pullsRes.data.length,
          open: openPRs,
          closed: closedPRs,
        },
        recentCommitsCount: commitsRes.data.length,
      };
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "status" in error) {
        const githubError = error as { status: number; message?: string };

        if (githubError.status === 404) {
          throw new AppError(
            "Repositório do GitHub não encontrado ou sem permissão de acesso.",
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

      // Preserva exceções de domínio já lançadas internamente
      if (error instanceof AppError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Falha de comunicação com a API do GitHub.";

      // Retorna 502 Bad Gateway para indisponibilidades ou erros não mapeados da API do GitHub
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
