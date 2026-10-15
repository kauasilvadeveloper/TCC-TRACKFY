import { prisma } from "../../prisma";

export interface GetGithubBranchesDTO {
  projectId: number;
}

export interface GithubBranchResponse {
  name: string;
  protected: boolean;
  commitSha: string;
}

interface RawGithubBranch {
  name: string;
  protected: boolean;
  commit: {
    sha: string;
  };
}

export class GetGithubBranchesService {
  async execute({
    projectId,
  }: GetGithubBranchesDTO): Promise<GithubBranchResponse[]> {
    if (!projectId || isNaN(projectId) || projectId <= 0) {
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
        "O vínculo do GitHub armazenado não é uma URL ou repositório válido (ex: 'usuario/repositorio').",
      );
    }

    const { owner, repo } = repoInfo;

    try {
      // 3. Consulta as branches do repositório via Native Fetch API
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`,
        {
          headers: {
            "User-Agent": "TCC-Kanban-App",
            Accept: "application/vnd.github.v3+json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Não foi possível consultar as branches na API do GitHub. Verifique a visibilidade e permissões do repositório.",
        );
      }

      const branches = (await response.json()) as RawGithubBranch[];

      // 4. Mapeia apenas os dados relevantes para a interface do sistema
      return branches.map((branch) => ({
        name: branch.name,
        protected: branch.protected,
        commitSha: branch.commit.sha,
      }));
    } catch (error) {
      if (error instanceof Error && error.message) {
        throw new Error(error.message);
      }
      throw new Error(
        "Falha de comunicação com a API do GitHub ao listar branches.",
      );
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
