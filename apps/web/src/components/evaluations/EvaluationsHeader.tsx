import { Link } from "react-router";
import { routes } from "../../constants/routes";

interface EvaluationsHeaderProps {
  onOpenCreateModal: () => void;
}

export function EvaluationsHeader({
  onOpenCreateModal,
}: EvaluationsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link
            to={routes.home.path}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
          >
            <span>&larr;</span> Início
          </Link>
          <span className="text-neutral-400">/</span>
          <span className="text-sm text-neutral-600">Avaliações</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
          Avaliações
        </h1>
        <p className="text-sm text-neutral-600 mt-1">
          Consulte e acompanhe todas as avaliações de desempenho realizadas para
          seus subordinados diretos e indiretos.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <span className="text-base font-bold leading-none">+</span>
          <span>Nova avaliação</span>
        </button>
      </div>
    </div>
  );
}
