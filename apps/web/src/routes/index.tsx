import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { routes } from "../constants/routes";

function PrivateRoute({ element }: { element: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) return <Navigate to={routes.login.path} replace />;

  return element;
}

function AppRoutes() {
  const mappedRoutes = Object.values(routes).map(
    ({ element: Element, key, path, isPrivate }) => (
      <Route
        key={key}
        path={path}
        element={
          isPrivate ? <PrivateRoute element={<Element />} /> : <Element />
        }
      />
    ),
  );

  return (
    <BrowserRouter>
      <Routes>{mappedRoutes}</Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
