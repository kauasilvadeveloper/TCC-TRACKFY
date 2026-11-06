import request from "supertest";
import { prisma } from "../../../src/prisma";
import { app } from "../../../src/app";
import { authHeader } from "../../helpers/auth";

jest.mock("../../../src/prisma");

describe("CT010 - Exclusão de projeto", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve excluir o projeto com status 200 quando autenticado como aluno", async () => {
    const projectId = 10;
    const mockDeletedProject = {
      id: projectId,
      tituloProjeto: "Sistema de Gestão Escolar",
      descricao: "Projeto final",
      prazo: new Date("2026-12-15T00:00:00.000Z"),
      tokenGithub: null,
    };

    (prisma.projeto.delete as jest.Mock).mockResolvedValue(mockDeletedProject);

    const response = await request(app)
      .delete(`/project/${projectId}`)
      .set(authHeader({ role: "aluno", userId: 1 }));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      project: expect.objectContaining({
        id: projectId,
        tituloProjeto: mockDeletedProject.tituloProjeto,
      }),
    });
    expect(prisma.projeto.delete).toHaveBeenCalledWith({
      where: { id: projectId },
    });
  });
});

