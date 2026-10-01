import { useState, useMemo } from "react";
import { Link } from "react-router";
import axios from "axios";
import {
  useEvaluations,
  useSubordinates,
  useCreateEvaluation,
} from "../hooks/useEvaluations";
import { useAuth } from "../hooks/useAuth";
import { routes } from "../constants/routes";
import type { EvaluationItem, SubordinateItem } from "../types/evaluation";
import { CRITERIA_DEFINITIONS } from "../constants/creteria-metadata";

function getScoreBadge(score: number) {
  if (score >= 3.5) {
    return {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      label: "Excelente",
    };
  }
  if (score >= 2.8) {
    return {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
      label: "Bom",
    };
  }
  if (score >= 2.0) {
    return {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      label: "Regular",
    };
  }
  return {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    label: "Abaixo da Média",
  };
}

function formatDate(dateString: string) {
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

function getInitials(name?: string) {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type SortBy = "recent" | "oldest" | "highest" | "lowest";
type EvaluatorFilter = "all" | "by_me" | "by_others";

type CriteriaField =
  | "delivery_of_results"
  | "execution_and_quality"
  | "learning_and_development"
  | "problem_solving"
  | "collaboration_and_leadership"
  | "strategic_vision";

interface CreateEvaluationModalProps {
  subordinates: SubordinateItem[];
  onClose: () => void;
}

function CreateEvaluationModal({
  subordinates,
  onClose,
}: CreateEvaluationModalProps) {
  const createMutation = useCreateEvaluation();
  const [selectedSubordinateId, setSelectedSubordinateId] =
    useState<string>("");
  const [scores, setScores] = useState<Record<CriteriaField, number>>({
    delivery_of_results: 3,
    execution_and_quality: 3,
    learning_and_development: 3,
    problem_solving: 3,
    collaboration_and_leadership: 3,
    strategic_vision: 3,
  });
  const [comments, setComments] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedSubordinate = useMemo(() => {
    if (!selectedSubordinateId) return null;
    return (
      subordinates.find((s) => s.id === Number(selectedSubordinateId)) || null
    );
  }, [subordinates, selectedSubordinateId]);

  const previewScore = useMemo(() => {
    let sum = 0;
    CRITERIA_DEFINITIONS.forEach((crit) => {
      sum += scores[crit.field] * crit.weight;
    });
    return Number((sum / 100).toFixed(2));
  }, [scores]);

  const previewBadge = getScoreBadge(previewScore);

  const handleScoreChange = (field: CriteriaField, value: number) => {
    setScores((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubordinateId) {
      setErrorMessage("Por favor, selecione um subordinado para avaliar.");
      return;
    }

    if (selectedSubordinate?.already_evaluated_this_week) {
      setErrorMessage(
        "Este colaborador já possui avaliação realizada nesta semana.",
      );
      return;
    }

    setErrorMessage(null);

    try {
      await createMutation.mutateAsync({
        evaluated_id: Number(selectedSubordinateId),
        delivery_of_results: scores.delivery_of_results,
        execution_and_quality: scores.execution_and_quality,
        learning_and_development: scores.learning_and_development,
        problem_solving: scores.problem_solving,
        collaboration_and_leadership: scores.collaboration_and_leadership,
        strategic_vision: scores.strategic_vision,
        comments: comments.trim() ? comments.trim() : null,
      });
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setErrorMessage(err.response.data.detail);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(
          "Ocorreu um erro ao registrar a avaliação. Tente novamente.",
        );
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-neutral-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Nova Avaliação
            </span>
            <h3 className="text-xl font-bold text-neutral-900 mt-1">
              Avaliar Desempenho
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Preencha os critérios de 1 a 4 e forneça o feedback qualitativo.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1.5 rounded-lg hover:bg-neutral-100 transition cursor-pointer"
            title="Fechar modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mensagem de Erro se houver */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2">
              <span className="font-bold">⚠️</span>
              <p className="leading-snug">{errorMessage}</p>
            </div>
          )}

          {/* Seleção do Subordinado */}
          <div className="space-y-2">
            <label
              htmlFor="subordinate-select"
              className="block text-sm font-bold text-neutral-900 uppercase tracking-wide"
            >
              Colaborador Avaliado <span className="text-red-500">*</span>
            </label>
            <select
              id="subordinate-select"
              value={selectedSubordinateId}
              onChange={(e) => {
                setSelectedSubordinateId(e.target.value);
                setErrorMessage(null);
              }}
              required
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition cursor-pointer shadow-xs"
            >
              <option value="">Selecione um colaborador...</option>
              {subordinates.map((sub) => (
                <option
                  key={sub.id}
                  value={sub.id}
                  disabled={sub.already_evaluated_this_week}
                >
                  {sub.name} ({sub.position_name}) •{" "}
                  {sub.is_direct ? "Direto" : "Indireto"}
                  {sub.already_evaluated_this_week
                    ? " — [Já avaliado esta semana]"
                    : ""}
                </option>
              ))}
            </select>

            {selectedSubordinate &&
              selectedSubordinate.already_evaluated_this_week && (
                <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200 mt-2">
                  ℹ️ Este colaborador já possui avaliação registrada nesta
                  semana. A política permite uma avaliação semanal por par
                  líder-liderado.
                </p>
              )}
          </div>

          {/* Score Banner (Prévia em Tempo Real) */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-500 font-medium">
                Nota Ponderada Prevista
              </p>
              <p className="text-2xl font-black text-neutral-900">
                {previewScore.toFixed(2)}{" "}
                <span className="text-sm font-normal text-neutral-500">
                  / 4.00
                </span>
              </p>
            </div>
            <div className="text-right">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${previewBadge.bg} ${previewBadge.border} ${previewBadge.text}`}
              >
                {previewBadge.label}
              </span>
            </div>
          </div>

          {/* Critérios de Avaliação */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
              Critérios de Desempenho
            </h4>
            <div className="space-y-3">
              {CRITERIA_DEFINITIONS.map((crit) => {
                const currentScore = scores[crit.field];
                return (
                  <div
                    key={crit.key}
                    className="p-4 bg-white rounded-xl border border-neutral-200 space-y-3 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {crit.title}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Peso no cálculo final: {crit.weight}%
                        </p>
                      </div>

                      {/* Botões de Seleção de Nota 1 a 4 */}
                      <div className="flex items-center gap-1.5 self-start sm:self-auto">
                        {[1, 2, 3, 4].map((scoreOption) => {
                          const isSelected = currentScore === scoreOption;
                          return (
                            <button
                              key={scoreOption}
                              type="button"
                              onClick={() =>
                                handleScoreChange(crit.field, scoreOption)
                              }
                              className={`w-9 h-9 text-sm font-bold rounded-lg transition cursor-pointer flex items-center justify-center ${
                                isSelected
                                  ? "bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-600 ring-offset-1"
                                  : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                              }`}
                              title={`Nota ${scoreOption}`}
                            >
                              {scoreOption}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 transition-all duration-300"
                        style={{ width: `${(currentScore / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comentários e Feedback */}
          <div className="space-y-2">
            <label
              htmlFor="comments"
              className="block text-sm font-bold text-neutral-900 uppercase tracking-wide"
            >
              Observações e Feedback Qualitativo (Opcional)
            </label>
            <textarea
              id="comments"
              rows={3}
              maxLength={2000}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Adicione observações sobre o desempenho, entregas de destaque e pontos de melhoria..."
              className="w-full p-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition leading-relaxed resize-y"
            />
            <div className="flex justify-end text-xs text-neutral-400">
              {comments.length} / 2000 caracteres
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg transition shadow-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                createMutation.isPending ||
                !selectedSubordinateId ||
                selectedSubordinate?.already_evaluated_this_week
              }
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition shadow-xs cursor-pointer flex items-center gap-2"
            >
              {createMutation.isPending ? "Salvando..." : "Salvar Avaliação"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Evaluations() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubordinateId, setSelectedSubordinateId] =
    useState<string>("all");
  const [evaluatorFilter, setEvaluatorFilter] =
    useState<EvaluatorFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [activeModalEvaluation, setActiveModalEvaluation] =
    useState<EvaluationItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filterEvaluatedId =
    selectedSubordinateId === "all" ? undefined : Number(selectedSubordinateId);

  const {
    data: evaluations,
    isLoading,
    isError,
    refetch,
  } = useEvaluations({
    evaluatedId: filterEvaluatedId,
  });

  const { data: subordinates } = useSubordinates();

  // Filtragem e ordenação no cliente
  const filteredAndSortedEvaluations = useMemo(() => {
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
  }, [evaluations, evaluatorFilter, user, searchTerm, sortBy]);

  // Métricas
  const metrics = useMemo(() => {
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
    const uniqueEvaluated = new Set(evaluations.map((e) => e.evaluated_id))
      .size;
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
  }, [evaluations, user]);

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                to={routes.home.path}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
              >
                <span>&larr;</span> Início
              </Link>
              <span className="text-neutral-400">/</span>
              <span className="text-sm text-neutral-600">Avaliações</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              Avaliações
            </h1>
            <p className="text-sm text-neutral-600 mt-1">
              Consulte e acompanhe todas as avaliações de desempenho realizadas
              para seus subordinados diretos e indiretos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span className="text-base font-bold leading-none">+</span>
              <span>Nova avaliação</span>
            </button>
          </div>
        </div>

        {/* Métricas / Cards de Resumo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Total Avaliações
            </p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">
              {metrics.total}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Média Geral
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-indigo-600">
                {metrics.averageScore.toFixed(2)}
              </span>
              <span className="text-xs text-neutral-500">/ 4.00</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Subordinados Avaliados
            </p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">
              {metrics.uniqueEvaluated}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Maior Nota
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-emerald-600">
                {metrics.highestScore > 0
                  ? metrics.highestScore.toFixed(2)
                  : "--"}
              </span>
              <span className="text-xs text-neutral-500">/ 4.00</span>
            </div>
          </div>
        </div>

        {/* Filtros e Barra de Busca */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Input de Busca */}
            <div className="md:col-span-1 relative">
              <input
                type="text"
                placeholder="Buscar por colaborador, avaliador ou cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-3 pr-8 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown de Subordinado */}
            <div>
              <select
                value={selectedSubordinateId}
                onChange={(e) => setSelectedSubordinateId(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition cursor-pointer"
              >
                <option value="all">Todos os subordinados</option>
                {subordinates?.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.position_name}){" "}
                    {sub.is_direct ? "• Direto" : "• Indireto"}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Avaliador (Feitas por mim vs Outros) */}
            <div>
              <select
                value={evaluatorFilter}
                onChange={(e) =>
                  setEvaluatorFilter(e.target.value as EvaluatorFilter)
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition cursor-pointer"
              >
                <option value="all">Todos os avaliadores</option>
                <option value="by_me">
                  Feitas por mim ({metrics.byMeCount})
                </option>
                <option value="by_others">
                  Feitas por outros líderes ({metrics.byOthersCount})
                </option>
              </select>
            </div>

            {/* Ordenação */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition cursor-pointer"
              >
                <option value="recent">Mais recentes</option>
                <option value="oldest">Mais antigas</option>
                <option value="highest">Maior nota</option>
                <option value="lowest">Menor nota</option>
              </select>
            </div>
          </div>

          {(searchTerm ||
            selectedSubordinateId !== "all" ||
            evaluatorFilter !== "all") && (
            <div className="flex items-center justify-between text-xs text-neutral-600 pt-2 border-t border-neutral-100">
              <span>
                Exibindo <strong>{filteredAndSortedEvaluations.length}</strong>{" "}
                de <strong>{evaluations?.length || 0}</strong> avaliações
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSubordinateId("all");
                  setEvaluatorFilter("all");
                }}
                className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm animate-pulse space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-full bg-neutral-200" />
                    <div className="space-y-2">
                      <div className="w-40 h-4 bg-neutral-200 rounded" />
                      <div className="w-24 h-3 bg-neutral-200 rounded" />
                    </div>
                  </div>
                  <div className="w-20 h-8 bg-neutral-200 rounded-lg" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                  <div className="h-4 bg-neutral-100 rounded" />
                  <div className="h-4 bg-neutral-100 rounded" />
                  <div className="h-4 bg-neutral-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3">
            <p className="text-red-700 font-medium">
              Não foi possível carregar as avaliações no momento.
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading &&
          !isError &&
          filteredAndSortedEvaluations.length === 0 && (
            <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 mx-auto bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400 text-xl font-bold">
                📝
              </div>
              <h3 className="text-lg font-semibold text-neutral-800">
                Nenhuma avaliação encontrada
              </h3>
              <p className="text-sm text-neutral-500 max-w-md mx-auto">
                {searchTerm ||
                selectedSubordinateId !== "all" ||
                evaluatorFilter !== "all"
                  ? "Nenhuma avaliação corresponde aos filtros e termos de busca informados."
                  : "Ainda não existem avaliações registradas para os seus subordinados."}
              </p>
              {(searchTerm ||
                selectedSubordinateId !== "all" ||
                evaluatorFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedSubordinateId("all");
                    setEvaluatorFilter("all");
                  }}
                  className="mt-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                >
                  Limpar filtros de busca
                </button>
              )}
            </div>
          )}

        {/* Lista de Avaliações */}
        {!isLoading && !isError && filteredAndSortedEvaluations.length > 0 && (
          <div className="space-y-4">
            {filteredAndSortedEvaluations.map((evaluation) => {
              const badge = getScoreBadge(evaluation.final_score);
              const evaluatedInitials = getInitials(evaluation.evaluated?.name);
              const isMadeByMe = user?.id === evaluation.evaluator_id;

              return (
                <div
                  key={evaluation.id}
                  onClick={() => setActiveModalEvaluation(evaluation)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveModalEvaluation(evaluation);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition duration-150 space-y-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {/* Card Header: Colaborador Avaliado, Avaliador e Nota Final */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 to-indigo-700 text-white font-bold flex items-center justify-center text-base shadow-sm shrink-0">
                        {evaluatedInitials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-base sm:text-lg font-semibold text-neutral-900">
                            {evaluation.evaluated?.name ||
                              `Subordinado #${evaluation.evaluated_id}`}
                          </h2>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-medium">
                            {evaluation.evaluated?.position_name ||
                              "Colaborador"}
                          </span>
                          {isMadeByMe ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
                              Feita por você
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium border border-purple-100">
                              Avaliador:{" "}
                              {evaluation.evaluator?.name || "Outro líder"}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {evaluation.evaluated?.email} &bull; Avaliado em{" "}
                          {formatDate(evaluation.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Score Final Badge */}
                    <div className="flex items-center sm:flex-col sm:items-end gap-2 shrink-0">
                      <div
                        className={`px-3 py-1.5 rounded-lg border ${badge.bg} ${badge.border} ${badge.text} flex items-baseline gap-1`}
                      >
                        <span className="text-xs font-semibold uppercase tracking-wider">
                          Nota Final:
                        </span>
                        <span className="text-lg font-bold">
                          {evaluation.final_score.toFixed(2)}
                        </span>
                        <span className="text-xs opacity-75">/ 4.0</span>
                      </div>
                      <span className="text-xs text-neutral-500 font-medium">
                        Classificação:{" "}
                        <strong className={badge.text}>{badge.label}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Comentário / Feedback se houver */}
                  {evaluation.comments && (
                    <div className="bg-neutral-50 border-l-4 border-indigo-500 p-3 rounded-r-lg text-xs text-neutral-700">
                      <p className="font-semibold text-neutral-800 mb-0.5">
                        Comentário
                      </p>
                      <p className="italic leading-relaxed whitespace-pre-line">
                        "{evaluation.comments}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Criação de Avaliação */}
      {isCreateModalOpen && (
        <CreateEvaluationModal
          subordinates={subordinates || []}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {/* Modal de Detalhes da Avaliação */}
      {activeModalEvaluation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity"
          onClick={() => setActiveModalEvaluation(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl border border-neutral-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  Detalhes da Avaliação
                </span>
                <h3 className="text-xl font-bold text-neutral-900 mt-1">
                  {activeModalEvaluation.evaluated?.name ||
                    `Subordinado #${activeModalEvaluation.evaluated_id}`}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Cargo:{" "}
                  {activeModalEvaluation.evaluated?.position_name ||
                    "Colaborador"}{" "}
                  &bull; Data: {formatDate(activeModalEvaluation.created_at)}
                </p>
                <p className="text-xs text-indigo-600 font-medium mt-1">
                  Avaliador: {activeModalEvaluation.evaluator?.name || "Líder"}{" "}
                  ({activeModalEvaluation.evaluator?.position_name || "Gestão"})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalEvaluation(null)}
                className="text-neutral-400 hover:text-neutral-600 p-1.5 rounded-lg hover:bg-neutral-100 transition cursor-pointer"
                title="Fechar modal"
              >
                ✕
              </button>
            </div>

            {/* Score Banner */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-500 font-medium">
                  Nota Ponderada Final
                </p>
                <p className="text-2xl font-black text-neutral-900">
                  {activeModalEvaluation.final_score.toFixed(2)}{" "}
                  <span className="text-sm font-normal text-neutral-500">
                    / 4.00
                  </span>
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getScoreBadge(activeModalEvaluation.final_score).bg} ${getScoreBadge(activeModalEvaluation.final_score).border} ${getScoreBadge(activeModalEvaluation.final_score).text}`}
                >
                  {getScoreBadge(activeModalEvaluation.final_score).label}
                </span>
              </div>
            </div>

            {/* Critérios Detalhados */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
                Pontuação por Critério
              </h4>
              <div className="space-y-3">
                {CRITERIA_DEFINITIONS.map((crit) => {
                  const score = activeModalEvaluation[crit.field];
                  return (
                    <div
                      key={crit.key}
                      className="p-3 bg-white rounded-xl border border-neutral-200 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-neutral-800">
                            {crit.title}
                          </p>
                          <p className="text-xs text-neutral-500">
                            Peso no cálculo final: {crit.weight}%
                          </p>
                        </div>
                        <div className="text-right flex items-baseline gap-1">
                          <span className="text-xl font-black text-indigo-600">
                            {score}
                          </span>
                          <span className="text-sm font-semibold text-neutral-400">
                            / 4
                          </span>
                        </div>
                      </div>

                      {/* Barra de Progresso Azul */}
                      <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 transition-all duration-300"
                          style={{ width: `${(score / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Comentários e Feedback */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
                Observações e Feedback Qualitativo
              </h4>
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                {activeModalEvaluation.comments || (
                  <span className="text-neutral-400 italic">
                    Nenhuma observação ou comentário adicional foi registrado
                    para esta avaliação.
                  </span>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setActiveModalEvaluation(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-900 text-white text-sm font-medium rounded-lg transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
