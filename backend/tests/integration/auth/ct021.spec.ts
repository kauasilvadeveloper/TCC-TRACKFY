import request from "supertest";
import { prisma } from "../../../src/prisma";
import bcrypt from "bcryptjs";
import { app } from "../../../src/app";

jest.mock("../../../src/prisma");
jest.mock("bcryptjs");

describe("CT021 - Tentativa de login com senha incorreta", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 401 quando o compare do bcrypt retornar falso", async () => {
    const mockUser = {
      id: 2,
      nome: "Aluno Teste",
      email: "aluno@aluno.senai.br",
      senha: "$2a$10$HashRealDoBanco123456",
      cargoEscola: "aluno",
    };

    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const response = await request(app).post("/login").send({
      email: "aluno@aluno.senai.br",
      password: "senhaErrada",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: "error",
      message: "Credenciais inválidas.",
    });
    expect(bcrypt.compare).toHaveBeenCalledWith("senhaErrada", mockUser.senha);
  });
});
