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
    <div className="min-h-screen flex items-center justify-center bg-bg-page px-4 py-12">
      <div className="w-full max-w-md bg-bg-surface rounded-xl shadow-md border border-border p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-text-heading tracking-tight">
            Entrar na conta
          </h1>
          <p className="text-sm text-text-muted">
            Digite seu e-mail e senha para acessar sua conta
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-error-subtle border border-error-border text-error-text text-sm rounded-lg">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-text-body"
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
              className="w-full px-3 py-2 border border-border bg-bg-surface rounded-lg text-sm text-text-body placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition"
              disabled={loginMutation.isPending}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text-body"
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
              className="w-full px-3 py-2 border border-border bg-bg-surface rounded-lg text-sm text-text-body placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition"
              disabled={loginMutation.isPending}
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-2.5 px-4 bg-brand hover:bg-brand-dark text-brand-foreground text-sm font-medium rounded-lg transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
          >
            {loginMutation.isPending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
