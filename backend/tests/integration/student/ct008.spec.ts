import request from "supertest";
import { prisma } from "../../../src/prisma";
import { app } from "../../../src/app";
import { authHeader } from "../../helpers/auth";

jest.mock("../../../src/prisma");

describe("CT008 - Adição de membro na equipe do projeto", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve vincular um membro ao projeto com status 201", async () => {
    const memberPayload = {
      projectId: 10,
      targetUserId: 2,
      funcaoId: 1,
    };

    (prisma.projeto.findUnique as jest.Mock).mockResolvedValue({ id: 10 });
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({ id: 2 });
    (prisma.funcaoProjeto.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
    (prisma.projetoUsuario.findUnique as jest.Mock).mockResolvedValue(null);

    const mockCreatedMember = {
      fkProjeto: 10,
      usuario: {
        id: 2,
        nome: "Aluno Colaborador",
        email: "colaborador@aluno.senai.br",
      },
      funcaoProjeto: {
        id: 1,
        tituloFuncaoProjeto: "Desenvolvedor Frontend",
      },
    };

    (prisma.projetoUsuario.create as jest.Mock).mockResolvedValue(
      mockCreatedMember,
    );

    const response = await request(app)
      .post("/project/member")
      .set(authHeader({ role: "aluno", userId: 1 }))
      .send(memberPayload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: "Membro adicionado ao projeto com sucesso.",
      data: mockCreatedMember,
    });
    expect(prisma.projeto.findUnique).toHaveBeenCalledWith({
      where: { id: 10 },
      select: { id: true },
    });
    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { id: 2 },
      select: { id: true },
    });
    expect(prisma.funcaoProjeto.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: { id: true },
    });
    expect(prisma.projetoUsuario.create).toHaveBeenCalledWith({
      data: {
        fkProjeto: 10,
        fkUsuario: 2,
        fkFuncaoProjeto: 1,
      },
      select: expect.any(Object),
    });
  });
});
