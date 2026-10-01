import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";
import { AuthContext, type AuthContextType } from "../contexts/auth-context";
import type { User } from "../types/user";
import { STORAGE_KEYS } from "../constants/storage-keys";
import { getMe } from "../services/auth";

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  });

  const [user, setUserState] = useState<User | null>(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser) as User;
    } catch {
      localStorage.removeItem(STORAGE_KEYS.USER);
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return Boolean(localStorage.getItem(STORAGE_KEYS.TOKEN));
  });

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setToken(null);
    setUserState(null);
  }, []);

  const setUser = useCallback((newUser: User | null) => {
    if (newUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    setUserState(newUser);
  }, []);

  const login = useCallback(
    async (newToken: string, newUser?: User) => {
      localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
      setToken(newToken);

      if (newUser) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
        setUserState(newUser);
        return;
      }

      try {
        const fetchedUser = await getMe();
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(fetchedUser));
        setUserState(fetchedUser);
      } catch (error) {
        console.error("Erro ao carregar dados do usuário no login:", error);
      }
    },
    [],
  );

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getMe();
        setUserState(currentUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
      } catch (error) {
        console.error("Falha ao validar sessão do usuário:", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [logout]);

  const isAuthenticated = Boolean(token);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated,
      isLoading,
      login,
      logout,
      setUser,
    }),
    [user, token, isAuthenticated, isLoading, login, logout, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

