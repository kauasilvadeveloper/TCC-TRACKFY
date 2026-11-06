import request from "supertest";
import { prisma } from "../../../src/prisma";
import { app } from "../../../src/app";

jest.mock("../../../src/prisma");

describe("CT023 - Bloqueio de login com domínio de e-mail não institucional", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve bloquear tentativa de login com e-mail de domínio comercial (@gmail.com)", async () => {
    const response = await request(app).post("/login").send({
      email: "usuario@gmail.com",
      password: "senhaValida123",
    });

    // Conforme a especificação de regras institucionais, e-mails fora dos domínios acadêmicos devem ser rejeitados
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(
      /domínio acadêmico|domínio institucional|e-mail institucional|inválido/i,
    );
  });
});

