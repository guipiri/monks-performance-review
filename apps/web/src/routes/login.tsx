import { useState } from "react";
import { useNavigate, Navigate } from "react-router";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useLoginMutation } from "../hooks/useAuthMutations";
import { routes } from "../constants/routes";

function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLoginMutation();

  if (isAuthenticated) {
    return <Navigate to={routes.home.path} replace />;
  }

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: async (data) => {
          await login(data.access_token);
          navigate(routes.home.path);
        },
      },
    );
  };

  const getErrorMessage = () => {
    if (!loginMutation.error) return null;
    const err = loginMutation.error;

    if (axios.isAxiosError(err)) {
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") return detail;
      if (Array.isArray(detail) && detail.length > 0) {
        return detail[0].msg || "Dados inválidos";
      }
      if (err.response?.data?.message) return err.response.data.message;
      return "Falha ao fazer login. Verifique suas credenciais.";
    }

    return "Erro inesperado ao tentar entrar. Tente novamente.";
  };

  const errorMessage = getErrorMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-neutral-200 p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Entrar na conta
          </h1>
          <p className="text-sm text-neutral-600">
            Digite seu e-mail e senha para acessar sua conta
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-700"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              disabled={loginMutation.isPending}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-700"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              disabled={loginMutation.isPending}
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loginMutation.isPending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
