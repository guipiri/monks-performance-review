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
      className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-indigo-300 transition duration-150 space-y-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      {/* Card Header: Colaborador Avaliado, Avaliador e Nota Final */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 to-indigo-700 text-white font-bold flex items-center justify-center text-base shadow-xs shrink-0">
            {evaluatedInitials}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-semibold text-neutral-900">
                {evaluation.evaluated?.name ||
                  `Subordinado #${evaluation.evaluated_id}`}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-medium">
                {evaluation.evaluated?.position_name || "Colaborador"}
              </span>
              {isMadeByMe ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
                  Feita por você
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium border border-purple-100">
                  Avaliador: {evaluation.evaluator?.name || "Outro líder"}
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
        <ScoreBadge score={evaluation.final_score} variant="card" />
      </div>

      {/* Comentário / Feedback se houver */}
      {evaluation.comments && (
        <div className="bg-neutral-50 border-l-4 border-indigo-500 p-3 rounded-r-lg text-xs text-neutral-700">
          <p className="font-semibold text-neutral-800 mb-0.5">Comentário</p>
          <p className="italic leading-relaxed whitespace-pre-line">
            "{evaluation.comments}"
          </p>
        </div>
      )}
    </div>
  );
}
