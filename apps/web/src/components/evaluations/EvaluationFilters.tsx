import type { SubordinateItem } from "../../types/evaluation";
import type { EvaluatorFilter, SortBy } from "../../utils/evaluation";

interface EvaluationFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedSubordinateId: string;
  onSubordinateChange: (value: string) => void;
  subordinates?: SubordinateItem[];
  evaluatorFilter: EvaluatorFilter;
  onEvaluatorFilterChange: (value: EvaluatorFilter) => void;
  byMeCount: number;
  byOthersCount: number;
  sortBy: SortBy;
  onSortByChange: (value: SortBy) => void;
  filteredCount: number;
  totalCount: number;
  onClearFilters: () => void;
}

export function EvaluationFilters({
  searchTerm,
  onSearchChange,
  selectedSubordinateId,
  onSubordinateChange,
  subordinates,
  evaluatorFilter,
  onEvaluatorFilterChange,
  byMeCount,
  byOthersCount,
  sortBy,
  onSortByChange,
  filteredCount,
  totalCount,
  onClearFilters,
}: EvaluationFiltersProps) {
  const hasActiveFilters =
    Boolean(searchTerm) ||
    selectedSubordinateId !== "all" ||
    evaluatorFilter !== "all";

  return (
    <div className="bg-bg-surface p-4 rounded-xl border border-border shadow-xs space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Input de Busca */}
        <div className="md:col-span-1 relative">
          <input
            type="text"
            placeholder="Buscar por colaborador, avaliador ou cargo..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-3 pr-8 py-2 border border-border bg-bg-surface rounded-lg text-sm text-text-body placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-text-body cursor-pointer"
              title="Limpar busca"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown de Subordinado */}
        <div>
          <select
            value={selectedSubordinateId}
            onChange={(e) => onSubordinateChange(e.target.value)}
            className="w-full px-3 py-2 border border-border bg-bg-surface text-text-body rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition cursor-pointer"
          >
            <option value="all">Todos os subordinados</option>
            {subordinates?.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} ({sub.position_name}){" "}
                {sub.is_direct ? "• Direto" : "• Indireto"}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Avaliador (Feitas por mim vs Outros) */}
        <div>
          <select
            value={evaluatorFilter}
            onChange={(e) =>
              onEvaluatorFilterChange(e.target.value as EvaluatorFilter)
            }
            className="w-full px-3 py-2 border border-border bg-bg-surface text-text-body rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition cursor-pointer"
          >
            <option value="all">Todos os avaliadores</option>
            <option value="by_me">Feitas por mim ({byMeCount})</option>
            <option value="by_others">
              Feitas por outros líderes ({byOthersCount})
            </option>
          </select>
        </div>

        {/* Ordenação */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as SortBy)}
            className="w-full px-3 py-2 border border-border bg-bg-surface text-text-body rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition cursor-pointer"
          >
            <option value="recent">Mais recentes</option>
            <option value="oldest">Mais antigas</option>
            <option value="highest">Maior nota</option>
            <option value="lowest">Menor nota</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border-subtle">
          <span>
            Exibindo <strong>{filteredCount}</strong> de{" "}
            <strong>{totalCount}</strong> avaliações
          </span>
          <button
            type="button"
            onClick={onClearFilters}
            className="text-brand hover:text-brand-dark font-medium cursor-pointer"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
}
