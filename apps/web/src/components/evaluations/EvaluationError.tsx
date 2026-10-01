function EvaluationError({ refetch }: { refetch: () => void }) {
  return (
    <div className="bg-error-subtle border border-error-border rounded-xl p-6 text-center space-y-3">
      <p className="text-error-text font-medium">
        Não foi possível carregar as avaliações no momento.
      </p>
      <button
        onClick={() => refetch()}
        className="px-4 py-2 bg-error hover:bg-error-default/90 text-white text-sm font-medium rounded-lg transition cursor-pointer shadow-xs"
      >
        Tentar novamente
      </button>
    </div>
  );
}

export default EvaluationError;
