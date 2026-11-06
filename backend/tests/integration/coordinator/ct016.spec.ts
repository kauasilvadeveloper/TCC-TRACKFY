import request from "supertest";
import { prisma } from "../../../src/prisma";
import { app } from "../../../src/app";
import { authHeader } from "../../helpers/auth";

jest.mock("../../../src/prisma");
jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("$2a$08$MockedHashForTestingUser12345"),
}));

describe("CT016 - Cadastro de novos usuários pelo coordenador", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve cadastrar um novo aluno com status 201 quando autenticado como coordenador", async () => {
    const newUserPayload = {
      name: "Novo Aluno Senai",
      email: "novo.aluno@aluno.senai.br",
      password: "SenhaSegura123",
      role: "aluno",
    };

    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null);

    const mockCreatedUser = {
      id: 20,
      nome: newUserPayload.name,
      email: newUserPayload.email,
      cargoEscola: newUserPayload.role,
    };

    (prisma.usuario.create as jest.Mock).mockResolvedValue(mockCreatedUser);

    const response = await request(app)
      .post("/user-register")
      .set(authHeader({ role: "coordenador", userId: 99 }))
      .send(newUserPayload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: 20,
      nome: newUserPayload.name,
      email: newUserPayload.email,
      cargoEscola: newUserPayload.role,
    });
    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { email: newUserPayload.email },
    });
    expect(prisma.usuario.create).toHaveBeenCalledWith({
      data: {
        nome: newUserPayload.name,
        email: newUserPayload.email,
        senha: "$2a$08$MockedHashForTestingUser12345",
        cargoEscola: newUserPayload.role,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cargoEscola: true,
      },
    });
  });
});
