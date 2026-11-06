import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LoginForm } from "@/src/components/auth/LoginForm";

const mockLogin = vi.fn();

vi.mock("@/src/context/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    isAuthenticated: false,
  }),
}));

describe("CT024 - Campos obrigatórios (required) no formulário de login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve possuir o atributo required em e-mail e senha e impedir envio com campos vazios", async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/^e-mail$/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/^senha$/i) as HTMLInputElement;
    const form = emailInput.closest("form") as HTMLFormElement;

    expect(emailInput.required).toBe(true);
    expect(passwordInput.required).toBe(true);
    expect(emailInput.validity.valueMissing).toBe(true);
    expect(passwordInput.validity.valueMissing).toBe(true);
    expect(form.checkValidity()).toBe(false);

    // Tentativa de submissão do formulário com campos vazios
    const submitBtn = screen.getByRole("button", { name: /entrar/i });
    fireEvent.click(submitBtn);

    expect(mockLogin).not.toHaveBeenCalled();
  });
});

