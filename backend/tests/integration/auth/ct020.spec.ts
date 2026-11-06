import request from "supertest";
import { prisma } from "../../../src/prisma";
import { app } from "../../../src/app";

jest.mock("../../../src/prisma");

describe("CT020 - Tentativa de login com usuário inexistente", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 401 quando o usuário não for encontrado no banco de dados", async () => {
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await request(app).post("/login").send({
      email: "inexistente@aluno.senai.br",
      password: "qualquerSenha123",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: "error",
      message: "Credenciais inválidas.",
    });
    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { email: "inexistente@aluno.senai.br" },
    });
  });
});

