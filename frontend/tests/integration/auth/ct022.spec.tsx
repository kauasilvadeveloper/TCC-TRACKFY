import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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

describe("CT022 - Validação de formato de e-mail no formulário de login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve recusar formato de e-mail sem @ através de input[type=email] (ex: aluno.senai.br)", async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/^e-mail$/i) as HTMLInputElement;
    const form = emailInput.closest("form") as HTMLFormElement;

    await userEvent.type(emailInput, "aluno.senai.br");

    expect(emailInput.type).toBe("email");
    expect(emailInput.validity.typeMismatch).toBe(true);
    expect(emailInput.checkValidity()).toBe(false);
    expect(form.checkValidity()).toBe(false);
  });
});
