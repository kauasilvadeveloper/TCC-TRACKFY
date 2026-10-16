import { Octokit } from "@octokit/rest";
import { prisma } from "../../prisma";

export interface GetCommitsByBranchDTO {
  projectId: number;
  branch: string;
  perPage?: number;
}

export interface CommitResponse {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
    avatarUrl?: string;
  };
  htmlUrl: string;
}

export class GetCommitsByBranchService {
  async execute({
    projectId,
    branch,
    perPage = 50,
  }: GetCommitsByBranchDTO): Promise<CommitResponse[]> {
    if (!projectId || Number.isNaN(projectId) || projectId <= 0) {
      throw new Error(
        "O ID do projeto é obrigatório e deve ser um número inteiro válido.",
      );
    }

    if (!branch || !branch.trim()) {
      throw new Error(
        "O nome da branch é obrigatório para realizar a consulta.",
      );
    }

    const cleanBranch = branch.trim();

    // 1. Busca os dados de integração do projeto
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

    // 2. Extrai owner e repo do campo persistido
    const repoInfo = this.extractOwnerAndRepo(project.tokenGithub);
    if (!repoInfo) {
      throw new Error(
        "O vínculo do GitHub armazenado não é uma URL ou repositório válido (ex: 'owner/repo').",
      );
    }

    const { owner, repo } = repoInfo;

    // 3. Instância do Octokit com Token de Serviço
    const octokit = new Octokit({
      auth: process.env.GITHUB_GLOBAL_TOKEN,
    });

    try {
      // 4. Busca os commits filtrados pela branch de destino (param sha no Octokit)
      const { data } = await octokit.rest.repos.listCommits({
        owner,
        repo,
        sha: cleanBranch,
        per_page: perPage,
      });

      // 5. Sanitização do payload retornado para a interface do Front-end
      return data.map((item) => ({
        sha: item.sha,
        message: item.commit.message,
        author: {
          name: item.commit.author?.name || "Autor Desconhecido",
          email: item.commit.author?.email || "",
          date: item.commit.author?.date || new Date().toISOString(),
          avatarUrl: item.author?.avatar_url,
        },
        htmlUrl: item.html_url,
      }));
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "status" in error) {
        const githubError = error as { status: number };
        if (githubError.status === 404) {
          throw new Error(
            `A branch '${cleanBranch}' ou o repositório não foram encontrados no GitHub.`,
          );
        }
        if (githubError.status === 401) {
          throw new Error(
            "Token de autenticação do GitHub inválido ou expirado.",
          );
        }
      }

      if (error instanceof Error) {
        throw new Error(error.message);
      }

      throw new Error(
        "Falha de comunicação com a API do GitHub ao consultar histórico de commits.",
      );
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
