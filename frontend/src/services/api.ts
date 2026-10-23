import axios, { AxiosError } from "axios";

// Utiliza a variável de ambiente ou assume o fallback padrão de desenvolvimento local
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (!error.response) {
      return Promise.reject(
        new Error(
          `Não foi possível ligar à API em "${baseURL}". Confirme se o serviço backend está ativo e a escutar na porta correta.`,
        ),
      );
    }
    return Promise.reject(error);
  },
);
