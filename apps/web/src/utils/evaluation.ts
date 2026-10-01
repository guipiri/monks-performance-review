import { CRITERIA_DEFINITIONS } from "../constants/criteria-metadata";
import type { EvaluationItem } from "../types/evaluation";
import type { User } from "../types/user";

export type SortBy = "recent" | "oldest" | "highest" | "lowest";
export type EvaluatorFilter = "all" | "by_me" | "by_others";

export type CriteriaField =
  | "delivery_of_results"
  | "execution_and_quality"
  | "learning_and_development"
  | "problem_solving"
  | "collaboration_and_leadership"
  | "strategic_vision";

export interface ScoreBadgeConfig {
  bg: string;
  text: string;
  border: string;
  label: string;
}

export function getScoreBadge(score: number): ScoreBadgeConfig {
  if (score >= 3.5) {
    return {
      bg: "bg-success-subtle",
      text: "text-success-text",
      border: "border-success-border",
      label: "Excelente",
    };
  }
  if (score >= 2.8) {
    return {
      bg: "bg-brand-subtle",
      text: "text-brand-dark",
      border: "border-brand-border",
      label: "Bom",
    };
  }
  if (score >= 2.0) {
    return {
      bg: "bg-warning-subtle",
      text: "text-warning-text",
      border: "border-warning-border",
      label: "Regular",
    };
  }
  return {
    bg: "bg-error-subtle",
    text: "text-error-text",
    border: "border-error-border",
    label: "Abaixo da Média",
  };
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getInitials(name?: string): string {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function calculatePreviewScore(
  scores: Record<CriteriaField, number>,
): number {
  let sum = 0;
  CRITERIA_DEFINITIONS.forEach((crit) => {
    sum += (scores[crit.field as CriteriaField] || 0) * crit.weight;
  });
  return Number((sum / 100).toFixed(2));
}

export function filterAndSortEvaluations(
  evaluations: EvaluationItem[] | undefined,
  evaluatorFilter: EvaluatorFilter,
  searchTerm: string,
  sortBy: SortBy,
  user: User | null,
) {
  if (!evaluations) return [];

  let list = [...evaluations];

  // Filtro por origem do avaliador (feitas por mim vs outros)
  if (evaluatorFilter === "by_me" && user) {
    list = list.filter((item) => item.evaluator_id === user.id);
  } else if (evaluatorFilter === "by_others" && user) {
    list = list.filter((item) => item.evaluator_id !== user.id);
  }

  // Filtro textual
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    list = list.filter((item) => {
      const evaluatedName = item.evaluated?.name?.toLowerCase() || "";
      const evaluatedEmail = item.evaluated?.email?.toLowerCase() || "";
      const evaluatedPosition =
        item.evaluated?.position_name?.toLowerCase() || "";
      const evaluatorName = item.evaluator?.name?.toLowerCase() || "";
      const evaluatorPosition =
        item.evaluator?.position_name?.toLowerCase() || "";
      const comments = item.comments?.toLowerCase() || "";
      return (
        evaluatedName.includes(term) ||
        evaluatedEmail.includes(term) ||
        evaluatedPosition.includes(term) ||
        evaluatorName.includes(term) ||
        evaluatorPosition.includes(term) ||
        comments.includes(term)
      );
    });
  }

  list.sort((a, b) => {
    if (sortBy === "recent") {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    if (sortBy === "oldest") {
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }
    if (sortBy === "highest") {
      return b.final_score - a.final_score;
    }
    if (sortBy === "lowest") {
      return a.final_score - b.final_score;
    }
    return 0;
  });

  return list;
}

export function calculateMetrics(
  evaluations: EvaluationItem[] | undefined,
  user: User | null,
) {
  if (!evaluations || evaluations.length === 0) {
    return {
      total: 0,
      averageScore: 0,
      uniqueEvaluated: 0,
      highestScore: 0,
      byMeCount: 0,
      byOthersCount: 0,
    };
  }

  const total = evaluations.length;
  const sum = evaluations.reduce((acc, curr) => acc + curr.final_score, 0);
  const averageScore = Number((sum / total).toFixed(2));
  const uniqueEvaluated = new Set(evaluations.map((e) => e.evaluated_id)).size;
  const highestScore = Math.max(...evaluations.map((e) => e.final_score));
  const byMeCount = user
    ? evaluations.filter((e) => e.evaluator_id === user.id).length
    : 0;
  const byOthersCount = total - byMeCount;

  return {
    total,
    averageScore,
    uniqueEvaluated,
    highestScore,
    byMeCount,
    byOthersCount,
  };
}
