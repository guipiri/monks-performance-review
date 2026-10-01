export interface EvaluationMetrics {
  total: number;
  averageScore: number;
  uniqueEvaluated: number;
  highestScore: number;
  byMeCount: number;
  byOthersCount: number;
}

interface EvaluationMetricsCardsProps {
  metrics: EvaluationMetrics;
}

export function EvaluationMetricsCards({
  metrics,
}: EvaluationMetricsCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {/* Total Avaliações */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
          Total Avaliações
        </p>
        <p className="text-2xl font-bold text-neutral-900 mt-1">
          {metrics.total}
        </p>
      </div>

      {/* Média Geral */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
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

      {/* Subordinados Avaliados */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
          Subordinados Avaliados
        </p>
        <p className="text-2xl font-bold text-neutral-900 mt-1">
          {metrics.uniqueEvaluated}
        </p>
      </div>

      {/* Maior Nota */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
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
  );
}
