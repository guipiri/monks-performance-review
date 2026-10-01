import { useAuth } from "../hooks/useAuth";

function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md border border-neutral-200 p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900">
            Bem-vindo{user?.name ? `, ${user.name}` : ""}!
          </h1>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition cursor-pointer"
          >
            Sair
          </button>
        </div>
        <p className="text-neutral-600">
          Você está autenticado no sistema.
        </p>
      </div>
    </div>
  );
}

export default Home;
