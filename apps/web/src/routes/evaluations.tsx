import { useState, useMemo } from "react";
import { useEvaluations, useSubordinates } from "../hooks/useEvaluations";
import { useAuth } from "../hooks/useAuth";
import type { EvaluationItem } from "../types/evaluation";
import {
  type SortBy,
  type EvaluatorFilter,
  filterAndSortEvaluations,
  calculateMetrics,
} from "../utils/evaluation";
import {
  EvaluationsHeader,
  EvaluationMetricsCards,
  EvaluationFilters,
  EvaluationSkeleton,
  EvaluationEmptyState,
  EvaluationCard,
  CreateEvaluationModal,
  EvaluationDetailsModal,
  type EvaluationMetrics,
} from "../components/evaluations";
import EvaluationError from "../components/evaluations/EvaluationError";

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

  const filteredAndSortedEvaluations = useMemo(() => {
    return filterAndSortEvaluations(
      evaluations || [],
      evaluatorFilter,
      searchTerm,
      sortBy,
      user,
    );
  }, [evaluations, evaluatorFilter, user, searchTerm, sortBy]);

  const metrics: EvaluationMetrics = useMemo(() => {
    return calculateMetrics(evaluations, user);
  }, [evaluations, user]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedSubordinateId("all");
    setEvaluatorFilter("all");
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    selectedSubordinateId !== "all" ||
    evaluatorFilter !== "all";

  const hasNoEvaluations =
    !isLoading && !isError && filteredAndSortedEvaluations.length === 0;
  const hasEvaluations =
    !isLoading && !isError && filteredAndSortedEvaluations.length > 0;

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header & Breadcrumb */}
        <EvaluationsHeader
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />

        {/* Métricas */}
        <EvaluationMetricsCards metrics={metrics} />

        {/* Filtros e Barra de Busca */}
        <EvaluationFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedSubordinateId={selectedSubordinateId}
          onSubordinateChange={setSelectedSubordinateId}
          subordinates={subordinates}
          evaluatorFilter={evaluatorFilter}
          onEvaluatorFilterChange={setEvaluatorFilter}
          byMeCount={metrics.byMeCount}
          byOthersCount={metrics.byOthersCount}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          filteredCount={filteredAndSortedEvaluations.length}
          totalCount={evaluations?.length || 0}
          onClearFilters={handleClearFilters}
        />

        {/* Loading State */}
        {isLoading && <EvaluationSkeleton />}

        {/* Error State */}
        {isError && <EvaluationError refetch={refetch} />}

        {/* Empty State */}
        {hasNoEvaluations && (
          <EvaluationEmptyState
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
          />
        )}

        {/* Lista de Avaliações */}
        {hasEvaluations && (
          <div className="space-y-4">
            {filteredAndSortedEvaluations.map((evaluation) => (
              <EvaluationCard
                key={evaluation.id}
                evaluation={evaluation}
                currentUserId={user?.id}
                onClick={() => setActiveModalEvaluation(evaluation)}
              />
            ))}
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
        <EvaluationDetailsModal
          evaluation={activeModalEvaluation}
          onClose={() => setActiveModalEvaluation(null)}
        />
      )}
    </div>
  );
}
