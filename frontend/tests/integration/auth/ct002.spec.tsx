import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/src/components/auth/LoginForm";

const mockLogin = vi.fn();

vi.mock("@/src/context/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    isAuthenticated: false,
  }),
}));

describe("CT002 - Redirecionamento baseado no perfil/domínio de e-mail ao logar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve solicitar redirecionamento para /professor quando o e-mail for de docente", async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/^e-mail$/i);
    const passwordInput = screen.getByLabelText(/^senha$/i);
    const submitButton = screen.getByRole("button", { name: /entrar/i });

    await userEvent.type(emailInput, "carlos@docente.senai.br");
    await userEvent.type(passwordInput, "senha123");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        { email: "carlos@docente.senai.br", password: "senha123" },
        "/professor",
      );
    });
  });

  it("deve solicitar redirecionamento para /coordination quando o e-mail for de coordenador", async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/^e-mail$/i);
    const passwordInput = screen.getByLabelText(/^senha$/i);
    const submitButton = screen.getByRole("button", { name: /entrar/i });

    await userEvent.type(emailInput, "regina@coordenador.senai.br");
    await userEvent.type(passwordInput, "senha123");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        { email: "regina@coordenador.senai.br", password: "senha123" },
        "/coordination",
      );
    });
  });

  it("deve solicitar redirecionamento padrão (dashboard) quando o e-mail for de aluno", async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/^e-mail$/i);
    const passwordInput = screen.getByLabelText(/^senha$/i);
    const submitButton = screen.getByRole("button", { name: /entrar/i });

    await userEvent.type(emailInput, "joao@aluno.senai.br");
    await userEvent.type(passwordInput, "senha123");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "joao@aluno.senai.br",
        password: "senha123",
      });
    });
  });
});
