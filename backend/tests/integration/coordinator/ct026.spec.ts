import request from "supertest";
import { prisma } from "../../../src/prisma";
import { app } from "../../../src/app";
import { authHeader } from "../../helpers/auth";

jest.mock("../../../src/prisma");

describe("CT026 - Bloqueio de cadastro de usuário com e-mail duplicado", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 409 ao tentar cadastrar um usuário com e-mail já existente", async () => {
    const existingEmail = "aluno.existente@aluno.senai.br";

    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      nome: "Aluno Já Cadastrado",
      email: existingEmail,
    });

    const response = await request(app)
      .post("/user-register")
      .set(authHeader({ role: "coordenador", userId: 99 }))
      .send({
        name: "Outro Aluno",
        email: existingEmail,
        password: "SenhaQualquer123",
        role: "aluno",
      });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      status: "error",
      message: "O e-mail informado já está cadastrado no sistema.",
    });
    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { email: existingEmail },
    });
    expect(prisma.usuario.create).not.toHaveBeenCalled();
  });
});

