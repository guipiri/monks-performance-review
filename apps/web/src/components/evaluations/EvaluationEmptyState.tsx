interface EvaluationEmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function EvaluationEmptyState({
  hasActiveFilters,
  onClearFilters,
}: EvaluationEmptyStateProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center space-y-3 shadow-xs">
      <div className="w-12 h-12 mx-auto bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400 text-xl font-bold">
        📝
      </div>
      <h3 className="text-lg font-semibold text-neutral-800">
        Nenhuma avaliação encontrada
      </h3>
      <p className="text-sm text-neutral-500 max-w-md mx-auto">
        {hasActiveFilters
          ? "Nenhuma avaliação corresponde aos filtros e termos de busca informados."
          : "Ainda não existem avaliações registradas para os seus subordinados."}
      </p>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition cursor-pointer"
        >
          Limpar filtros de busca
        </button>
      )}
    </div>
  );
}
