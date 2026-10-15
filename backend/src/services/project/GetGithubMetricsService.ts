import { prisma } from "../../prisma";

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

interface GithubPullRequest {
  state: "open" | "closed";
}

export class GetGithubMetricsService {
  async execute({
    projectId,
  }: GetGithubMetricsDTO): Promise<GithubMetricsResponse> {
    if (!projectId || isNaN(projectId) || projectId <= 0) {
      throw new Error(
        "O ID do projeto é obrigatório e deve ser um número inteiro válido.",
      );
    }

    // 1. Consulta ao banco para resgatar o repositório/token salvo no projeto
    const project = await prisma.projeto.findUnique({
      where: { id: projectId },
      select: { id: true, tokenGithub: true, tituloProjeto: true },
    });

    if (!project) {
      throw new Error("Projeto não encontrado.");
    }

    if (!project.tokenGithub) {
      throw new Error(
        "Este projeto não possui um repositório do GitHub vinculado.",
      );
    }

    // 2. Parser utilitário para extrair 'owner' e 'repo' do campo salvo (URL ou owner/repo)
    const repoInfo = this.extractOwnerAndRepo(project.tokenGithub);
    if (!repoInfo) {
      throw new Error(
        "O vínculo do GitHub armazenado não é uma URL ou repositório válido (ex: 'usuario/repositorio').",
      );
    }

    const { owner, repo } = repoInfo;

    try {
      const headers: Record<string, string> = {
        "User-Agent": "TCC-Kanban-App",
        Accept: "application/vnd.github.v3+json",
      };

      // 3. Chamadas concorrentes à API do GitHub via Native Fetch (Node.js 18+)
      const [branchesRes, prsRes, commitsRes] = await Promise.all([
        fetch(`https://api.github.com/repos/${owner}/${repo}/branches`, {
          headers,
        }),
        fetch(
          `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=100`,
          { headers },
        ),
        fetch(
          `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`,
          { headers },
        ),
      ]);

      if (!branchesRes.ok || !prsRes.ok || !commitsRes.ok) {
        throw new Error(
          "Não foi possível consultar os dados na API do GitHub. Verifique a visibilidade e permissões do repositório.",
        );
      }

      const branches = (await branchesRes.json()) as unknown[];
      const pulls = (await prsRes.json()) as GithubPullRequest[];
      const commits = (await commitsRes.json()) as unknown[];

      const openPRs = pulls.filter((pr) => pr.state === "open").length;
      const closedPRs = pulls.filter((pr) => pr.state === "closed").length;

      return {
        repository: `${owner}/${repo}`,
        branchesCount: branches.length,
        pullRequests: {
          total: pulls.length,
          open: openPRs,
          closed: closedPRs,
        },
        recentCommitsCount: commits.length,
      };
    } catch (error) {
      if (error instanceof Error && error.message) {
        throw new Error(error.message);
      }
      throw new Error("Falha de comunicação com a API do GitHub.");
    }
  }

  private extractOwnerAndRepo(
    input: string,
  ): { owner: string; repo: string } | null {
    const cleanInput = input.replace(/\.git$/, "").trim();
    const urlMatch = cleanInput.match(/github\.com\/([^/]+)\/([^/]+)/);

    if (urlMatch && urlMatch[1] && urlMatch[2]) {
      return { owner: urlMatch[1], repo: urlMatch[2] };
    }

    const parts = cleanInput.split("/");
    if (parts.length === 2 && parts[0] && parts[1]) {
      return { owner: parts[0], repo: parts[1] };
    }

    return null;
  }
}
