import type { EvaluationItem } from "../../types/evaluation";
import { formatDate, getInitials } from "../../utils/evaluation";
import { ScoreBadge } from "./ScoreBadge";

interface EvaluationCardProps {
  evaluation: EvaluationItem;
  currentUserId?: number;
  onClick: () => void;
}

export function EvaluationCard({
  evaluation,
  currentUserId,
  onClick,
}: EvaluationCardProps) {
  const isMadeByMe = currentUserId === evaluation.evaluator_id;
  const evaluatedInitials = getInitials(evaluation.evaluated?.name);

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      className="bg-bg-surface rounded-xl border border-border p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-brand-border transition duration-150 space-y-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand"
    >
      {/* Card Header: Colaborador Avaliado, Avaliador e Nota Final */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-brand to-brand-dark text-brand-foreground font-bold flex items-center justify-center text-base shadow-xs shrink-0">
            {evaluatedInitials}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-semibold text-text-heading">
                {evaluation.evaluated?.name ||
                  `Subordinado #${evaluation.evaluated_id}`}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-bg-elevated text-text-body font-medium">
                {evaluation.evaluated?.position_name || "Colaborador"}
              </span>
              {isMadeByMe ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-subtle text-brand-dark font-medium border border-brand-border">
                  Feita por você
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent-subtle text-accent-dark font-medium border border-accent-border">
                  Avaliador: {evaluation.evaluator?.name || "Outro líder"}
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              {evaluation.evaluated?.email} &bull; Avaliado em{" "}
              {formatDate(evaluation.created_at)}
            </p>
          </div>
        </div>

        {/* Score Final Badge */}
        <ScoreBadge score={evaluation.final_score} variant="card" />
      </div>

      {/* Comentário / Feedback se houver */}
      {evaluation.comments && (
        <div className="bg-bg-sunken border-l-4 border-brand p-3 rounded-r-lg text-xs text-text-body">
          <p className="font-semibold text-text-heading mb-0.5">Comentário</p>
          <p className="italic leading-relaxed whitespace-pre-line">
            "{evaluation.comments}"
          </p>
        </div>
      )}
    </div>
  );
}
