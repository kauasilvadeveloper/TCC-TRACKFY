import request from "supertest";
import { prisma } from "../../../src/prisma";
import { app } from "../../../src/app";
import { authHeader } from "../../helpers/auth";

jest.mock("../../../src/prisma");

describe("CT027 - Controle de Acesso (RBAC): Bloqueio de cadastro por alunos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 403 ao tentar registrar usuário com perfil de aluno", async () => {
    const response = await request(app)
      .post("/user-register")
      .set(authHeader({ role: "aluno", userId: 1 }))
      .send({
        name: "Tentativa Não Autorizada",
        email: "tentativa@aluno.senai.br",
        password: "senha123",
        role: "aluno",
      });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      status: "error",
      message: "Acesso negado: Permissão insuficiente para cadastrar usuários.",
    });
    expect(prisma.usuario.create).not.toHaveBeenCalled();
  });
});

