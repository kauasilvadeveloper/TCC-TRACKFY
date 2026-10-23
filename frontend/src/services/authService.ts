import { api } from "./api";
import { AuthResponse, LoginCredentials } from "@/src/types/auth";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/login", credentials);
    return data;
  },
};
