function EvaluationError({ refetch }: { refetch: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3">
      <p className="text-red-700 font-medium">
        Não foi possível carregar as avaliações no momento.
      </p>
      <button
        onClick={() => refetch()}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition cursor-pointer"
      >
        Tentar novamente
      </button>
    </div>
  );
}

export default EvaluationError;
