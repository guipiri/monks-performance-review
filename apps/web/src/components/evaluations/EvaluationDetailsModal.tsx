import type { EvaluationItem } from "../../types/evaluation";
import { CRITERIA_DEFINITIONS } from "../../constants/criteria-metadata";
import { formatDate, type CriteriaField } from "../../utils/evaluation";
import { ScoreBadge } from "./ScoreBadge";

interface EvaluationDetailsModalProps {
  evaluation: EvaluationItem | null;
  onClose: () => void;
}

export function EvaluationDetailsModal({
  evaluation,
  onClose,
}: EvaluationDetailsModalProps) {
  if (!evaluation) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-bg-surface rounded-2xl shadow-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-border-subtle pb-4">
          <div>
            <span className="text-xs font-semibold text-brand uppercase tracking-wider">
              Detalhes da Avaliação
            </span>
            <h3 className="text-xl font-bold text-text-heading mt-1">
              {evaluation.evaluated?.name ||
                `Subordinado #${evaluation.evaluated_id}`}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Cargo: {evaluation.evaluated?.position_name || "Colaborador"}{" "}
              &bull; Data: {formatDate(evaluation.created_at)}
            </p>
            <p className="text-xs text-brand font-medium mt-1">
              Avaliador: {evaluation.evaluator?.name || "Líder"} (
              {evaluation.evaluator?.position_name || "Gestão"})
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-body p-1.5 rounded-lg hover:bg-bg-elevated transition cursor-pointer"
            title="Fechar modal"
          >
            ✕
          </button>
        </div>

        {/* Score Banner */}
        <div className="bg-bg-sunken border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted font-medium">
              Nota Ponderada Final
            </p>
            <p className="text-2xl font-black text-text-heading">
              {evaluation.final_score.toFixed(2)}{" "}
              <span className="text-sm font-normal text-text-muted">
                / 4.00
              </span>
            </p>
          </div>
          <div className="text-right">
            <ScoreBadge score={evaluation.final_score} />
          </div>
        </div>

        {/* Critérios Detalhados */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-text-heading uppercase tracking-wide">
            Pontuação por Critério
          </h4>
          <div className="space-y-3">
            {CRITERIA_DEFINITIONS.map((crit) => {
              const score = evaluation[crit.field as CriteriaField] ?? 0;
              return (
                <div
                  key={crit.key}
                  className="p-3 bg-bg-surface rounded-xl border border-border space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-text-body">
                        {crit.title}
                      </p>
                      <p className="text-xs text-text-muted">
                        Peso no cálculo final: {crit.weight}%
                      </p>
                    </div>
                    <div className="text-right flex items-baseline gap-1">
                      <span className="text-xl font-black text-brand">
                        {score}
                      </span>
                      <span className="text-sm font-semibold text-text-muted">
                        / 4
                      </span>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="w-full bg-bg-elevated h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand transition-all duration-300"
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
          <h4 className="text-sm font-bold text-text-heading uppercase tracking-wide">
            Observações e Feedback Qualitativo
          </h4>
          <div className="p-4 bg-bg-sunken border border-border rounded-xl text-sm text-text-body leading-relaxed whitespace-pre-line">
            {evaluation.comments || (
              <span className="text-text-muted italic">
                Nenhuma observação ou comentário adicional foi registrado para
                esta avaliação.
              </span>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-2 border-t border-border-subtle">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-accent hover:bg-accent-dark text-accent-foreground text-sm font-medium rounded-lg transition cursor-pointer shadow-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
