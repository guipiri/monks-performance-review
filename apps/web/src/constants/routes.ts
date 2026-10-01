import Home from "../routes/home";
import Login from "../routes/login";
import Evaluations from "../routes/evaluations";

export interface Route {
  path: string;
  element: React.ComponentType;
  key: string;
  isPrivate: boolean;
}

export const routes = {
  login: {
    path: "/login",
    element: Login,
    key: "login",
    isPrivate: false,
  },
  home: {
    path: "/",
    element: Home,
    key: "home",
    isPrivate: true,
  },
  evaluations: {
    path: "/evaluations",
    element: Evaluations,
    key: "evaluations",
    isPrivate: true,
  },
  evaluationsGiven: {
    path: "/evaluations/given",
    element: Evaluations,
    key: "evaluationsGiven",
    isPrivate: true,
  },
} as const satisfies Record<string, Route>;


