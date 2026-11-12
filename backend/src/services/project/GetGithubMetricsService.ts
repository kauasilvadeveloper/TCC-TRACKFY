import { Octokit } from "@octokit/rest";
import { prisma } from "../../prisma";
import { AppError } from "../../errors/AppError";

export interface GetGithubMetricsDTO {
  projectId: number;
  branch?: string; // Opcional: se omitido, analisa a branch padrão do repositório
  days?: number; // Opcional: se omitido, analisa o histórico recente sem corte de data
}

export interface DeveloperMetrics {
  username: string;
  avatarUrl: string | null;
  commitsCount: number;
  prsMerged: number;
  prsOpen: number;
  prsDraft: number;
  prsClosedWithoutMerge: number;
  avgMergeTimeHours: number | null;
  pendingReviewsCount: number;
}

export interface OpenPrAging {
  number: number;
  title: string;
  author: string;
  isDraft: boolean;
  ageInHours: number;
  requestedReviewers: string[];
  url: string;
}

export interface TimelinePoint {
  date: string; // YYYY-MM-DD
  commits: number;
  prsMerged: number;
}

export interface HeatmapPoint {
  dayOfWeek: number; // 0 (Domingo) a 6 (Sábado)
  hour: number; // 0 a 23 (UTC)
  count: number;
}

export interface GithubMetricsResponse {
  repository: string;
  selectedBranch: string | null; // null indica que foi utilizada a branch padrão
  periodDays: number | null;
  summary: {
    branchesCount: number;
    orphanBranchesCount: number;
    totalPRs: number;
    mergedPRs: number;
    openPRs: number;
    closedWithoutMergePRs: number;
    avgRepoMergeTimeHours: number | null;
  };
  workDistribution: {
    features: number;
    fixes: number;
    refactors: number;
    tests: number;
    chores: number;
    others: number;
  };
  timeline: TimelinePoint[];
  activityHeatmap: HeatmapPoint[];
  openPrsAging: OpenPrAging[];
  developers: DeveloperMetrics[];
}

const PROTECTED_BRANCHES = new Set([
  "main",
  "master",
  "develop",
  "development",
  "staging",
]);

const SEMANTIC_PREFIX_REGEX =
  /^(?:[^\w\s]+\s*|:[a-z0-9_+-]+:\s*)?(feat|feature|fix|bugfix|refactor|perf|test|chore|docs|style|build|ci|revert)(?:\([^)]+\))?!?:\s*/i;

const MAX_PAGES_WITHOUT_DATE_FILTER = 3;

export class GetGithubMetricsService {
  async execute({
    projectId,
    branch,
    days,
  }: GetGithubMetricsDTO): Promise<GithubMetricsResponse> {
    if (!projectId || Number.isNaN(projectId) || projectId <= 0) {
      throw new AppError(
        "O ID do projeto é obrigatório e deve ser um número inteiro válido.",
        400,
      );
    }

    const cleanBranch = branch?.trim() || undefined;

    const hasDateFilter =
      typeof days === "number" && !Number.isNaN(days) && days > 0;
    const safeDays = hasDateFilter ? Math.min(days, 365) : null;

    const sinceDate = new Date();
    if (safeDays !== null) {
      sinceDate.setDate(sinceDate.getDate() - safeDays);
    }
    const sinceISO = safeDays !== null ? sinceDate.toISOString() : undefined;

    // 1. Projeção estrita no banco resgatando apenas os campos necessários
    const project = await prisma.projeto.findUnique({
      where: { id: projectId },
      select: { id: true, tokenGithub: true },
    });

    if (!project) {
      throw new AppError("Projeto não encontrado.", 404);
    }

    if (!project.tokenGithub) {
      throw new AppError(
        "Este projeto não possui um repositório do GitHub vinculado.",
        400,
      );
    }

    // 2. Extração segura de owner/repo do campo persistido
    const repoInfo = this.extractOwnerAndRepo(project.tokenGithub);
    if (!repoInfo) {
      throw new AppError(
        "O vínculo do GitHub armazenado não é uma URL ou repositório válido (ex: 'owner/repo').",
        400,
      );
    }

    const { owner, repo } = repoInfo;

    // 3. Instanciação do Octokit utilizando Token autenticado
    const octokit = new Octokit({
      auth: process.env.GITHUB_GLOBAL_TOKEN,
    });

    try {
      let pullPagesFetched = 0;
      let commitPagesFetched = 0;

      // 4. Execução concorrente; listCommits usa `sha: cleanBranch` quando uma branch é selecionada
      const [branches, allPulls, commits] = await Promise.all([
        octokit.paginate(octokit.rest.repos.listBranches, {
          owner,
          repo,
          per_page: 100,
        }),
        octokit.paginate(
          octokit.rest.pulls.list,
          {
            owner,
            repo,
            state: "all",
            sort: "updated",
            direction: "desc",
            per_page: 100,
          },
          (response, done) => {
            pullPagesFetched += 1;

            if (hasDateFilter) {
              const lastPr = response.data[response.data.length - 1];
              if (lastPr && new Date(lastPr.updated_at) < sinceDate) {
                done();
              }
            } else if (pullPagesFetched >= MAX_PAGES_WITHOUT_DATE_FILTER) {
              done();
            }

            return response.data;
          },
        ),
        octokit.paginate(
          octokit.rest.repos.listCommits,
          {
            owner,
            repo,
            ...(cleanBranch ? { sha: cleanBranch } : {}),
            ...(sinceISO ? { since: sinceISO } : {}),
            per_page: 100,
          },
          (response, done) => {
            commitPagesFetched += 1;

            if (
              !hasDateFilter &&
              commitPagesFetched >= MAX_PAGES_WITHOUT_DATE_FILTER
            ) {
              done();
            }

            return response.data;
          },
        ),
      ]);

      const pulls = hasDateFilter
        ? allPulls.filter(
            (pr) =>
              pr.state === "open" ||
              new Date(pr.created_at) >= sinceDate ||
              (pr.closed_at && new Date(pr.closed_at) >= sinceDate),
          )
        : allPulls;

      return this.buildAnalyticsPayload(
        `${owner}/${repo}`,
        cleanBranch ?? null,
        safeDays,
        branches,
        pulls,
        commits,
      );
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "status" in error) {
        const githubError = error as { status: number; message?: string };

        if (githubError.status === 404) {
          throw new AppError(
            "Repositório do GitHub não encontrado ou sem permissão de acesso.",
            404,
          );
        }

        if (githubError.status === 401) {
          throw new AppError(
            "Token de autenticação do GitHub inválido ou expirado.",
            401,
          );
        }

        // O GitHub retorna 422 quando o parâmetro `sha` (nome da branch) não existe
        if (githubError.status === 422 && cleanBranch) {
          throw new AppError(
            `A branch '${cleanBranch}' não foi encontrada no repositório.`,
            404,
          );
        }
      }

      if (error instanceof AppError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Falha de comunicação com a API do GitHub.";

      throw new AppError(errorMessage, 502);
    }
  }

  private buildAnalyticsPayload(
    repository: string,
    selectedBranch: string | null,
    periodDays: number | null,
    branches: Array<{ name: string }>,
    pulls: any[],
    commits: any[],
  ): GithubMetricsResponse {
    const now = new Date();

    const devMap = new Map<
      string,
      DeveloperMetrics & { _mergeDurationsHours: number[] }
    >();
    const timelineMap = new Map<
      string,
      { commits: number; prsMerged: number }
    >();
    const heatmapMap = new Map<string, number>();

    const workDistribution = {
      features: 0,
      fixes: 0,
      refactors: 0,
      tests: 0,
      chores: 0,
      others: 0,
    };

    const getOrCreateDev = (
      username: string,
      avatarUrl: string | null = null,
    ) => {
      if (!devMap.has(username)) {
        devMap.set(username, {
          username,
          avatarUrl,
          commitsCount: 0,
          prsMerged: 0,
          prsOpen: 0,
          prsDraft: 0,
          prsClosedWithoutMerge: 0,
          avgMergeTimeHours: null,
          pendingReviewsCount: 0,
          _mergeDurationsHours: [],
        });
      }
      const dev = devMap.get(username)!;
      if (!dev.avatarUrl && avatarUrl) {
        dev.avatarUrl = avatarUrl;
      }
      return dev;
    };

    const registerTimelineEvent = (
      isoDate: string,
      type: "commit" | "merge",
    ) => {
      const dayKey = isoDate.slice(0, 10);
      const current = timelineMap.get(dayKey) || { commits: 0, prsMerged: 0 };
      if (type === "commit") current.commits += 1;
      if (type === "merge") current.prsMerged += 1;
      timelineMap.set(dayKey, current);
    };

    const classifySemanticText = (rawText: string) => {
      const cleanText = rawText.trim();
      const match = cleanText.match(SEMANTIC_PREFIX_REGEX);
      const prefix = match?.[1]?.toLowerCase();

      switch (prefix) {
        case "feat":
        case "feature":
          workDistribution.features += 1;
          break;
        case "fix":
        case "bugfix":
          workDistribution.fixes += 1;
          break;
        case "refactor":
        case "perf":
          workDistribution.refactors += 1;
          break;
        case "test":
          workDistribution.tests += 1;
          break;
        case "chore":
        case "docs":
        case "style":
        case "build":
        case "ci":
        case "revert":
          workDistribution.chores += 1;
          break;
        default:
          workDistribution.others += 1;
      }
    };

    // --- 1. Processamento de Commits (da branch selecionada ou padrão) ---
    let nonMergeCommitsCount = 0;

    for (const item of commits) {
      const username =
        item.author?.login || item.commit?.author?.name || "desconhecido";
      const avatarUrl = item.author?.avatar_url || null;
      const commitDateStr = item.commit?.author?.date;
      const message: string = (item.commit?.message || "").trim();

      const dev = getOrCreateDev(username, avatarUrl);
      dev.commitsCount += 1;

      if (message && !message.startsWith("Merge ")) {
        const subjectLine = message.split("\n")[0];
        classifySemanticText(subjectLine);
        nonMergeCommitsCount += 1;
      }

      if (commitDateStr) {
        registerTimelineEvent(commitDateStr, "commit");

        const dateObj = new Date(commitDateStr);
        const dayOfWeek = dateObj.getUTCDay();
        const hour = dateObj.getUTCHours();
        const heatKey = `${dayOfWeek}-${hour}`;
        heatmapMap.set(heatKey, (heatmapMap.get(heatKey) || 0) + 1);
      }
    }

    // Fallback: se só houver commits de merge, classifica pelos títulos dos PRs vinculados à branch
    if (nonMergeCommitsCount === 0 && pulls.length > 0) {
      const relevantPulls = selectedBranch
        ? pulls.filter(
            (pr) =>
              pr.head?.ref === selectedBranch ||
              pr.base?.ref === selectedBranch,
          )
        : pulls;

      for (const pr of relevantPulls) {
        if (pr.title) {
          classifySemanticText(pr.title);
        }
      }
    }

    // --- 2. Processamento de Pull Requests ---
    let mergedPRs = 0;
    let openPRs = 0;
    let closedWithoutMergePRs = 0;
    const allMergeDurationsHours: number[] = [];
    const activePrBranches = new Set<string>();
    const openPrsAging: OpenPrAging[] = [];

    for (const pr of pulls) {
      const authorLogin = pr.user?.login || "desconhecido";
      const authorAvatar = pr.user?.avatar_url || null;
      const dev = getOrCreateDev(authorLogin, authorAvatar);

      if (pr.state === "open") {
        openPRs += 1;
        if (pr.head?.ref) {
          activePrBranches.add(pr.head.ref);
        }

        if (pr.draft) {
          dev.prsDraft += 1;
        } else {
          dev.prsOpen += 1;
        }

        const reviewers: string[] = (pr.requested_reviewers || []).map(
          (r: any) => r.login,
        );
        for (const reviewerLogin of reviewers) {
          const reviewerDev = getOrCreateDev(reviewerLogin);
          reviewerDev.pendingReviewsCount += 1;
        }

        const ageMs = now.getTime() - new Date(pr.created_at).getTime();
        openPrsAging.push({
          number: pr.number,
          title: pr.title,
          author: authorLogin,
          isDraft: Boolean(pr.draft),
          ageInHours: Number((ageMs / (1000 * 60 * 60)).toFixed(1)),
          requestedReviewers: reviewers,
          url: pr.html_url,
        });
      } else if (pr.merged_at) {
        mergedPRs += 1;
        dev.prsMerged += 1;

        const createdMs = new Date(pr.created_at).getTime();
        const mergedMs = new Date(pr.merged_at).getTime();
        const durationHours = (mergedMs - createdMs) / (1000 * 60 * 60);

        if (durationHours >= 0) {
          dev._mergeDurationsHours.push(durationHours);
          allMergeDurationsHours.push(durationHours);
        }

        registerTimelineEvent(pr.merged_at, "merge");
      } else {
        closedWithoutMergePRs += 1;
        dev.prsClosedWithoutMerge += 1;
      }
    }

    // --- 3. Cálculo de Higiene de Branches ---
    const orphanBranchesCount = branches.filter(
      (b) => !PROTECTED_BRANCHES.has(b.name) && !activePrBranches.has(b.name),
    ).length;

    // --- 4. Formatação e Ordenação Final ---
    const developers: DeveloperMetrics[] = Array.from(devMap.values())
      .map(({ _mergeDurationsHours, ...devMetrics }) => ({
        ...devMetrics,
        avgMergeTimeHours: this.calculateAverage(_mergeDurationsHours),
      }))
      .sort(
        (a, b) => b.prsMerged + b.commitsCount - (a.prsMerged + a.commitsCount),
      );

    const timeline: TimelinePoint[] = Array.from(timelineMap.entries())
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const activityHeatmap: HeatmapPoint[] = Array.from(
      heatmapMap.entries(),
    ).map(([key, count]) => {
      const [dayOfWeek, hour] = key.split("-").map(Number);
      return { dayOfWeek, hour, count };
    });

    openPrsAging.sort((a, b) => b.ageInHours - a.ageInHours);

    return {
      repository,
      selectedBranch,
      periodDays,
      summary: {
        branchesCount: branches.length,
        orphanBranchesCount,
        totalPRs: pulls.length,
        mergedPRs,
        openPRs,
        closedWithoutMergePRs,
        avgRepoMergeTimeHours: this.calculateAverage(allMergeDurationsHours),
      },
      workDistribution,
      timeline,
      activityHeatmap,
      openPrsAging,
      developers,
    };
  }

  private calculateAverage(values: number[]): number | null {
    if (values.length === 0) return null;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return Number((sum / values.length).toFixed(1));
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
