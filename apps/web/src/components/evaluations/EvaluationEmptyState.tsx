interface EvaluationEmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function EvaluationEmptyState({
  hasActiveFilters,
  onClearFilters,
}: EvaluationEmptyStateProps) {
  return (
    <div className="bg-bg-surface border border-border rounded-xl p-12 text-center space-y-3 shadow-xs">
      <div className="w-12 h-12 mx-auto bg-bg-elevated rounded-full flex items-center justify-center text-text-muted text-xl font-bold">
        📝
      </div>
      <h3 className="text-lg font-semibold text-text-heading">
        Nenhuma avaliação encontrada
      </h3>
      <p className="text-sm text-text-muted max-w-md mx-auto">
        {hasActiveFilters
          ? "Nenhuma avaliação corresponde aos filtros e termos de busca informados."
          : "Ainda não existem avaliações registradas para os seus subordinados."}
      </p>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-2 px-4 py-2 text-sm font-medium text-brand bg-brand-subtle hover:bg-brand-100 rounded-lg transition cursor-pointer border border-brand-border"
        >
          Limpar filtros de busca
        </button>
      )}
    </div>
  );
}
