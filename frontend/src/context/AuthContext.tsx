"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { api } from "@/src/services/api";
import { User, LoginCredentials } from "@/src/types/auth";
import { authService } from "@/src/services/authService";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials, redirectTo?: string) => Promise<void>;
  logout: (redirectTo?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("trackfy_token");
    if (token) {
      setIsAuthenticated(true);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  const login = async (
    credentials: LoginCredentials,
    redirectTo: string = "/dashboard",
  ): Promise<void> => {
    try {
      const response = await authService.login(credentials);
      const { token, user: userData } = response.login;

      console.log(token, "|", userData);


      Cookies.set("trackfy_token", token, {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);

      // Redirecionamento programático após autenticação com sucesso
      router.push(redirectTo);
    } catch (error: unknown) {
      console.error("[AuthService] Falha na autenticação:", error);
      throw error;
    }
  };

  const logout = (redirectTo: string = "/login") => {
    Cookies.remove("trackfy_token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);

    // Redirecionamento programático após encerramento da sessão
    router.push(redirectTo);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth tem de ser utilizado dentro de um AuthProvider.");
  }
  return context;
};
