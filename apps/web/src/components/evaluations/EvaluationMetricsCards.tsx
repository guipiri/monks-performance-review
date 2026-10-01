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
      <div className="bg-bg-surface p-4 rounded-xl border border-border shadow-xs">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
          Total Avaliações
        </p>
        <p className="text-2xl font-bold text-text-heading mt-1">
          {metrics.total}
        </p>
      </div>

      {/* Média Geral */}
      <div className="bg-bg-surface p-4 rounded-xl border border-border shadow-xs">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
          Média Geral
        </p>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-bold text-brand">
            {metrics.averageScore.toFixed(2)}
          </span>
          <span className="text-xs text-text-muted">/ 4.00</span>
        </div>
      </div>

      {/* Subordinados Avaliados */}
      <div className="bg-bg-surface p-4 rounded-xl border border-border shadow-xs">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
          Subordinados Avaliados
        </p>
        <p className="text-2xl font-bold text-text-heading mt-1">
          {metrics.uniqueEvaluated}
        </p>
      </div>

      {/* Maior Nota */}
      <div className="bg-bg-surface p-4 rounded-xl border border-border shadow-xs">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
          Maior Nota
        </p>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-bold text-success">
            {metrics.highestScore > 0
              ? metrics.highestScore.toFixed(2)
              : "--"}
          </span>
          <span className="text-xs text-text-muted">/ 4.00</span>
        </div>
      </div>
    </div>
  );
}
