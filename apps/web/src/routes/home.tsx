import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { routes } from "../constants/routes";

function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-bg-page p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header do Card Principal */}
        <div className="bg-bg-surface rounded-xl shadow-md border border-border p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text-heading">
                Bem-vindo{user?.name ? `, ${user.name}` : ""}!
              </h1>
              <p className="text-sm text-text-muted mt-1">
                {user?.position_name ? `Cargo: ${user.position_name} • ` : ""}
                Painel de Gestão de Desempenho
              </p>
            </div>
            <button
              onClick={logout}
              className="self-start sm:self-auto px-4 py-2 text-sm font-medium text-error border border-error-border hover:bg-error-subtle rounded-lg transition cursor-pointer"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Seção de Atalhos Rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card: Avaliações */}
          <Link
            to={routes.evaluations.path}
            className="group block bg-bg-surface p-6 rounded-xl border border-border shadow-xs hover:shadow-md hover:border-brand-border transition duration-150"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-brand-subtle text-brand flex items-center justify-center text-xl font-bold border border-brand-border">
                📋
              </div>
              <span className="text-xs font-semibold text-brand group-hover:translate-x-0.5 transition-transform">
                Acessar &rarr;
              </span>
            </div>
            <h2 className="text-lg font-semibold text-text-heading mt-4 group-hover:text-brand transition-colors">
              Avaliações
            </h2>
            <p className="text-sm text-text-muted mt-1">
              Visualize todas as avaliações de desempenho dos seus subordinados
              diretos e indiretos, feitas por você ou por outros líderes.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
