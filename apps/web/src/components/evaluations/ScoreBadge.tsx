import { getScoreBadge } from "../../utils/evaluation";

interface ScoreBadgeProps {
  score: number;
  variant?: "pill" | "card";
  className?: string;
}

export function ScoreBadge({
  score,
  variant = "pill",
  className = "",
}: ScoreBadgeProps) {
  const badge = getScoreBadge(score);

  if (variant === "card") {
    return (
      <div className={`flex items-center sm:flex-col sm:items-end gap-2 shrink-0 ${className}`}>
        <div
          className={`px-3 py-1.5 rounded-lg border ${badge.bg} ${badge.border} ${badge.text} flex items-baseline gap-1`}
        >
          <span className="text-xs font-semibold uppercase tracking-wider">
            Nota Final:
          </span>
          <span className="text-lg font-bold">{score.toFixed(2)}</span>
          <span className="text-xs opacity-75">/ 4.0</span>
        </div>
        <span className="text-xs text-text-muted font-medium">
          Classificação: <strong className={badge.text}>{badge.label}</strong>
        </span>
      </div>
    );
  }

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${badge.bg} ${badge.border} ${badge.text} ${className}`}
    >
      {badge.label}
    </span>
  );
}
