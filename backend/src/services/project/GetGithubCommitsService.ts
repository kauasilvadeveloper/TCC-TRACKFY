import { Octokit } from "@octokit/rest";
import { prisma } from "../../prisma";
import { AppError } from "../../errors/AppError";

export interface GetGithubCommitsDTO {
    projectId: number;
    branchName: string;
}

export interface GithubCommitResponse {
    sha: string;
    message: string;
    authorName: string;
    authorEmail: string;
    date: string;
    avatarUrl?: string;
    htmlUrl: string;
}

export class GetGithubCommitsService {
    async execute({
        projectId,
        branchName,
    }: GetGithubCommitsDTO): Promise<GithubCommitResponse[]> {
        if (!projectId || Number.isNaN(projectId) || projectId <= 0) {
            throw new Error(
                "O ID do projeto é obrigatório e deve ser um número inteiro válido.",
            );
        }

        if (!branchName || typeof branchName !== "string" || !branchName.trim()) {
            throw new Error("O nome da branch é obrigatório.");
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
            // 4. Consulta os commits da branch informada (o parâmetro 'sha' aceita o nome da branch)
            const { data } = await octokit.rest.repos.listCommits({
                owner,
                repo,
                sha: branchName.trim(),
                per_page: 100,
            });

            // 5. Projeção DTO para sanitização de dados no payload final
            return data.map((commit) => ({
                sha: commit.sha,
                message: commit.commit.message,
                authorName: commit.commit.author?.name || "Autor Desconhecido",
                authorEmail: commit.commit.author?.email || "",
                date: commit.commit.author?.date || "",
                avatarUrl: commit.author?.avatar_url,
                htmlUrl: commit.html_url,
            }));
        } catch (error: unknown) {
            if (typeof error === "object" && error !== null && "status" in error) {
                const githubError = error as { status: number; message?: string };

                if (githubError.status === 404) {
                    throw new AppError(
                        "Repositório ou branch não encontrada no GitHub.",
                        404,
                    );
                }

                if (githubError.status === 401) {
                    throw new AppError(
                        "Token de autenticação do GitHub inválido ou expirado.",
                        401,
                    );
                }
            }

            if (error instanceof AppError) {
                throw error;
            }

            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Falha de comunicação com a API do GitHub ao listar commits.";

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