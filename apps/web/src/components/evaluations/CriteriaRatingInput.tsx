interface CriteriaRatingInputProps {
  title: string;
  weight: number;
  score: number;
  onChange: (value: number) => void;
}

export function CriteriaRatingInput({
  title,
  weight,
  score,
  onChange,
}: CriteriaRatingInputProps) {
  return (
    <div className="p-4 bg-white rounded-xl border border-neutral-200 space-y-3 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-neutral-900">{title}</p>
          <p className="text-xs text-neutral-500">
            Peso no cálculo final: {weight}%
          </p>
        </div>

        {/* Botões de Seleção de Nota 1 a 4 */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {[1, 2, 3, 4].map((scoreOption) => {
            const isSelected = score === scoreOption;
            return (
              <button
                key={scoreOption}
                type="button"
                onClick={() => onChange(scoreOption)}
                className={`w-9 h-9 text-sm font-bold rounded-lg transition cursor-pointer flex items-center justify-center ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-600 ring-offset-1"
                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                }`}
                title={`Nota ${scoreOption}`}
              >
                {scoreOption}
              </button>
            );
          })}
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${(score / 4) * 100}%` }}
        />
      </div>
    </div>
  );
}
