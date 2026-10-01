import Home from "../routes/home";
import Login from "../routes/login";
import EvaluationsGiven from "../routes/evaluations-given";

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
  evaluationsGiven: {
    path: "/evaluations/given",
    element: EvaluationsGiven,
    key: "evaluationsGiven",
    isPrivate: true,
  },
} as const satisfies Record<string, Route>;

