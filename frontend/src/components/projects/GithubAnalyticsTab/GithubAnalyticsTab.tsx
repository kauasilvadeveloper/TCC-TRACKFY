"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  FiGitBranch,
  FiGitPullRequest,
  FiGitMerge,
  FiClock,
  FiAlertCircle,
  FiExternalLink,
  FiActivity,
  FiCode,
  FiUsers,
  FiCalendar,
} from "react-icons/fi";
import styles from "./GithubAnalyticsTab.module.scss";
import { authHeaders } from "@/src/utils/academicRole";
import { api } from "@/src/services/api";

interface GithubAnalyticsTabProps {
  projectId: number;
}

interface DeveloperMetrics {
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

interface OpenPrAging {
  number: number;
  title: string;
  author: string;
  isDraft: boolean;
  ageInHours: number;
  requestedReviewers: string[];
  url: string;
}

interface TimelinePoint {
  date: string;
  commits: number;
  prsMerged: number;
}

interface HeatmapPoint {
  dayOfWeek: number;
  hour: number;
  count: number;
}

interface GithubMetricsResponse {
  repository: string;
  selectedBranch: string | null;
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

const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const HOURS_OF_DAY = Array.from({ length: 24 }, (_, i) => i);

const WORK_COLORS = {
  features: "var(--accent-blue)",
  fixes: "var(--accent-red)",
  refactors: "var(--accent-purple)",
  tests: "var(--accent-green)",
  chores: "var(--accent-orange)",
  others: "var(--text-muted)",
};

function formatHours(hours: number | null): string {
  if (hours === null) return "—";
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 24) return `${hours.toFixed(1)} h`;
  const days = Math.floor(hours / 24);
  const remHours = Math.round(hours % 24);
  return remHours > 0 ? `${days}d ${remHours}h` : `${days}d`;
}

function formatShortDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-");
  return `${day}/${month}`;
}

export const GithubAnalyticsTab: React.FC<GithubAnalyticsTabProps> = ({
  projectId,
}) => {
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<string>("");

  const [metrics, setMetrics] = useState<GithubMetricsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingBranch, setLoadingBranch] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Carrega a lista de branches do projeto
  useEffect(() => {
    if (!projectId) return;

    const fetchBranches = async () => {
      try {
        const response = await api.get("/project/github/branches", {
          params: { projectId: String(projectId) },
          headers: authHeaders(),
        });

        const data = response.data;
        const rawList = Array.isArray(data)
          ? data
          : Array.isArray(data?.branches)
            ? data.branches
            : [];

        const branchNames: string[] = rawList
          .map((item: any) => (typeof item === "string" ? item : item?.name))
          .filter(Boolean);

        setBranches(branchNames);
      } catch {
        // Falha silenciosa nas branches; o select manterá a opção "Branch Padrão"
      }
    };

    fetchBranches();
  }, [projectId]);

  // 2. Carrega as métricas sempre que projectId, branch ou período mudarem
  useEffect(() => {
    if (!projectId) return;

    const fetchMetrics = async () => {
      if (metrics) {
        setLoadingBranch(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const params: Record<string, string> = {
          projectId: String(projectId),
        };
        if (selectedBranch) params.branch = selectedBranch;
        if (selectedDays) params.days = selectedDays;

        const response = await api.get("/project/github/metrics", {
          params,
          headers: authHeaders(),
        });

        setMetrics(response.data);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Não foi possível carregar as métricas do GitHub.";
        setError(msg);
      } finally {
        setLoading(false);
        setLoadingBranch(false);
      }
    };

    fetchMetrics();
  }, [projectId, selectedBranch, selectedDays]);

  // Dados formatados para o gráfico de Rosca (workDistribution)
  const workChartData = useMemo(() => {
    if (!metrics) return [];
    const wd = metrics.workDistribution;
    return [
      {
        name: "Features (feat)",
        value: wd.features,
        color: WORK_COLORS.features,
      },
      { name: "Correções (fix)", value: wd.fixes, color: WORK_COLORS.fixes },
      {
        name: "Refatoração",
        value: wd.refactors,
        color: WORK_COLORS.refactors,
      },
      { name: "Testes", value: wd.tests, color: WORK_COLORS.tests },
      { name: "Manutenção/Docs", value: wd.chores, color: WORK_COLORS.chores },
      { name: "Outros", value: wd.others, color: WORK_COLORS.others },
    ].filter((item) => item.value > 0);
  }, [metrics]);

  // Mapa rápido para o Heatmap (dia-hora -> count)
  const { heatmapLookup, maxHeatmapCount } = useMemo(() => {
    const map = new Map<string, number>();
    let max = 0;
    if (metrics?.activityHeatmap) {
      for (const point of metrics.activityHeatmap) {
        map.set(`${point.dayOfWeek}-${point.hour}`, point.count);
        if (point.count > max) max = point.count;
      }
    }
    return { heatmapLookup: map, maxHeatmapCount: max || 1 };
  }, [metrics]);

  if (loading) {
    return (
      <div className={styles.stateBox}>
        <div className={styles.spinner} />
        <p>Analisando commits, branches e pull requests no GitHub...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.stateBox}>
        <FiAlertCircle size={36} color="var(--accent-orange)" />
        <h4>Métricas indisponíveis</h4>
        <p>{error}</p>
      </div>
    );
  }

  if (!metrics) return null;

  const mergeRate =
    metrics.summary.totalPRs > 0
      ? Math.round((metrics.summary.mergedPRs / metrics.summary.totalPRs) * 100)
      : 0;

  return (
    <div className={styles.analyticsContainer}>
      {/* ── Cabeçalho & Filtros ────────────────────────────────────────────── */}
      <div className={styles.headerBar}>
        <div className={styles.repoIdentity}>
          <span className={styles.repoBadge}>
            <FiGitBranch size={14} /> {metrics.repository}
          </span>
          {loadingBranch && (
            <span className={styles.updatingTag}>Atualizando branch...</span>
          )}
        </div>

        <div className={styles.filtersGroup}>
          <div className={styles.filterControl}>
            <label htmlFor="branch-select">
              <FiGitBranch size={13} /> Branch
            </label>
            <select
              id="branch-select"
              className={styles.selectInput}
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="">Branch Padrão (main/master)</option>
              {branches.map((branchName) => (
                <option key={branchName} value={branchName}>
                  {branchName}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterControl}>
            <label htmlFor="period-select">
              <FiCalendar size={13} /> Período
            </label>
            <select
              id="period-select"
              className={styles.selectInput}
              value={selectedDays}
              onChange={(e) => setSelectedDays(e.target.value)}
            >
              <option value="">Histórico Recente</option>
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── KPIs Principais ────────────────────────────────────────────────── */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span>PRs Mergeados</span>
            <FiGitMerge size={18} color="var(--accent-green)" />
          </div>
          <div className={styles.kpiValue}>{metrics.summary.mergedPRs}</div>
          <div className={styles.kpiSubtext}>
            {mergeRate}% de aproveitamento ({metrics.summary.totalPRs} PRs)
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span>Lead Time Médio (Merge)</span>
            <FiClock size={18} color="var(--accent-blue)" />
          </div>
          <div className={styles.kpiValue}>
            {formatHours(metrics.summary.avgRepoMergeTimeHours)}
          </div>
          <div className={styles.kpiSubtext}>Da abertura ao merge</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span>PRs Abertos</span>
            <FiGitPullRequest size={18} color="var(--accent-purple)" />
          </div>
          <div className={styles.kpiValue}>{metrics.summary.openPRs}</div>
          <div className={styles.kpiSubtext}>
            {metrics.summary.closedWithoutMergePRs} descartados sem merge
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span>Higiene de Branches</span>
            <FiGitBranch size={18} color="var(--accent-orange)" />
          </div>
          <div className={styles.kpiValue}>{metrics.summary.branchesCount}</div>
          <div className={styles.kpiSubtext}>
            {metrics.summary.orphanBranchesCount} sem PR ativo
          </div>
        </div>
      </div>

      {/* ── Linha 1: Cadência de Entregas + Distribuição de Esforço ────────── */}
      <div className={styles.chartsTwoCols}>
        {/* Gráfico 1: Timeline de Commits vs Merges */}
        <div className={styles.chartCard}>
          <div className={styles.chartCardHeader}>
            <div>
              <h4>
                <FiActivity size={16} color="var(--accent-blue)" /> Cadência de
                Entregas
              </h4>
              <p>Commits diários vs. Pull Requests integrados</p>
            </div>
          </div>

          <div className={styles.chartBody}>
            {metrics.timeline.length === 0 ? (
              <div className={styles.emptyChart}>
                Sem atividade registrada neste filtro.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={270}>
                <AreaChart
                  data={metrics.timeline}
                  margin={{ top: 10, right: 12, left: -18, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="gradCommits"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--accent-blue)"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--accent-blue)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient id="gradMerges" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--accent-green)"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--accent-green)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-color)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatShortDate}
                    stroke="var(--text-muted)"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={12}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-card)",
                      borderColor: "var(--border-subtle)",
                      borderRadius: "10px",
                      color: "var(--text-primary)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Area
                    type="monotone"
                    dataKey="commits"
                    name="Commits"
                    stroke="var(--accent-blue)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradCommits)"
                  />
                  <Area
                    type="monotone"
                    dataKey="prsMerged"
                    name="PRs Mergeados"
                    stroke="var(--accent-green)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradMerges)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Gráfico 2: Natureza do Esforço Técnico (Reage ao select de Branch) */}
        <div className={styles.chartCard}>
          <div className={styles.chartCardHeader}>
            <div>
              <h4>
                <FiCode size={16} color="var(--accent-purple)" /> Natureza do
                Esforço
              </h4>
              <p>
                Classificação semântica na branch{" "}
                <strong>{metrics.selectedBranch || "padrão"}</strong>
              </p>
            </div>
          </div>

          <div className={styles.chartBody}>
            {workChartData.length === 0 ? (
              <div className={styles.emptyChart}>
                Nenhum commit semântico encontrado nesta branch.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={270}>
                <PieChart>
                  <Pie
                    data={workChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={92}
                    paddingAngle={3}
                  >
                    {workChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-card)",
                      borderColor: "var(--border-subtle)",
                      borderRadius: "10px",
                      color: "var(--text-primary)",
                    }}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Linha 2: Desempenho por Desenvolvedor ──────────────────────────── */}
      <div className={styles.chartCard}>
        <div className={styles.chartCardHeader}>
          <div>
            <h4>
              <FiUsers size={16} color="var(--accent-green)" /> Contribuição e
              Fluxo por Desenvolvedor
            </h4>
            <p>Volume de commits, PRs integrados e pendências por membro</p>
          </div>
        </div>

        <div className={styles.devSectionGrid}>
          {/* Gráfico de Barras Comparativo */}
          <div className={styles.chartBody}>
            {metrics.developers.length === 0 ? (
              <div className={styles.emptyChart}>
                Nenhum contribuidor identificado no período.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={metrics.developers}
                  margin={{ top: 10, right: 16, left: -18, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-color)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="username"
                    stroke="var(--text-muted)"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={12}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-card)",
                      borderColor: "var(--border-subtle)",
                      borderRadius: "10px",
                      color: "var(--text-primary)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar
                    dataKey="commitsCount"
                    name="Commits"
                    fill="var(--accent-blue)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="prsMerged"
                    name="PRs Mergeados"
                    fill="var(--accent-green)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="prsOpen"
                    name="PRs Abertos"
                    fill="var(--accent-orange)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Tabela Resumo de Eficiência Individual */}
          <div className={styles.devTableWrapper}>
            <table className={styles.devTable}>
              <thead>
                <tr>
                  <th>Desenvolvedor</th>
                  <th>Merge Médio</th>
                  <th>Reviews Pendentes</th>
                  <th>Descartados</th>
                </tr>
              </thead>
              <tbody>
                {metrics.developers.map((dev) => (
                  <tr key={dev.username}>
                    <td className={styles.devIdentityCell}>
                      {dev.avatarUrl ? (
                        <img
                          src={dev.avatarUrl}
                          alt={dev.username}
                          className={styles.devAvatar}
                        />
                      ) : (
                        <div className={styles.devAvatarFallback}>
                          {dev.username.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span>{dev.username}</span>
                    </td>
                    <td>{formatHours(dev.avgMergeTimeHours)}</td>
                    <td>
                      <span
                        className={
                          dev.pendingReviewsCount > 2
                            ? styles.badgeWarning
                            : styles.badgeNeutral
                        }
                      >
                        {dev.pendingReviewsCount}
                      </span>
                    </td>
                    <td>{dev.prsClosedWithoutMerge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Linha 3: Heatmap de Horários + Radar de PRs Abertos ────────────── */}
      <div className={styles.chartsTwoCols}>
        {/* Heatmap Dia x Hora */}
        <div className={styles.chartCard}>
          <div className={styles.chartCardHeader}>
            <div>
              <h4>Mapa de Calor de Atividade (UTC)</h4>
              <p>Distribuição de commits por dia da semana e horário</p>
            </div>
          </div>

          <div className={styles.heatmapWrapper}>
            <div className={styles.heatmapHoursHeader}>
              <span />
              {HOURS_OF_DAY.filter((h) => h % 3 === 0).map((h) => (
                <span key={h}>{String(h).padStart(2, "0")}h</span>
              ))}
            </div>

            {DAYS_OF_WEEK.map((dayLabel, dayIndex) => (
              <div key={dayLabel} className={styles.heatmapRow}>
                <span className={styles.heatmapDayLabel}>{dayLabel}</span>
                <div className={styles.heatmapCells}>
                  {HOURS_OF_DAY.map((hour) => {
                    const count = heatmapLookup.get(`${dayIndex}-${hour}`) || 0;
                    const intensity =
                      count === 0
                        ? 0.06
                        : Math.min(0.25 + (count / maxHeatmapCount) * 0.75, 1);

                    return (
                      <div
                        key={hour}
                        className={styles.heatmapCell}
                        style={{
                          backgroundColor:
                            count === 0
                              ? "var(--bg-muted)"
                              : `rgba(59, 130, 246, ${intensity.toFixed(2)})`,
                        }}
                        title={`${dayLabel} às ${String(hour).padStart(2, "0")}:00 UTC — ${count} commit(s)`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lista de Aging de PRs Abertos */}
        <div className={styles.chartCard}>
          <div className={styles.chartCardHeader}>
            <div>
              <h4>Radar de Gargalos (PRs Abertos)</h4>
              <p>Ordenados pelo maior tempo aguardando revisão</p>
            </div>
          </div>

          {metrics.openPrsAging.length === 0 ? (
            <div className={styles.emptyChart}>
              Nenhum Pull Request aberto no momento.
            </div>
          ) : (
            <div className={styles.agingList}>
              {metrics.openPrsAging.map((pr) => {
                const isStale = pr.ageInHours >= 48 && !pr.isDraft;
                return (
                  <a
                    key={pr.number}
                    href={pr.url}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.agingItem}
                  >
                    <div className={styles.agingMain}>
                      <div className={styles.agingTitleRow}>
                        <span className={styles.prNumber}>#{pr.number}</span>
                        <span className={styles.prTitle}>{pr.title}</span>
                        {pr.isDraft && (
                          <span className={styles.draftBadge}>Draft</span>
                        )}
                      </div>
                      <div className={styles.agingMeta}>
                        <span>por {pr.author}</span>
                        {pr.requestedReviewers.length > 0 && (
                          <span>
                            • Revisores: {pr.requestedReviewers.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={styles.agingRight}>
                      <span
                        className={
                          isStale ? styles.ageBadgeAlert : styles.ageBadgeOk
                        }
                      >
                        {formatHours(pr.ageInHours)}
                      </span>
                      <FiExternalLink size={14} color="var(--text-muted)" />
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
