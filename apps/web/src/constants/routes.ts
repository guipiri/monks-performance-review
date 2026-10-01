import Home from "../routes/home";
import Login from "../routes/login";

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
} as const satisfies Record<string, Route>;
