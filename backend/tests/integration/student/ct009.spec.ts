import request from "supertest";
import { prisma } from "../../../src/prisma";
import { app } from "../../../src/app";
import { authHeader } from "../../helpers/auth";

jest.mock("../../../src/prisma");

describe("CT009 - Edição dos dados do projeto", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve atualizar os dados do projeto com sucesso e retornar status 200", async () => {
    const projectId = 10;
    const updatePayload = {
      tituloProjeto: "Sistema de Gestão Escolar - Atualizado",
      descricao: "Nova descrição atualizada para o sistema acadêmico",
      prazo: "2026-12-20T00:00:00.000Z",
    };

    const mockUpdatedProject = {
      id: projectId,
      tituloProjeto: updatePayload.tituloProjeto,
      descricao: updatePayload.descricao,
      prazo: new Date(updatePayload.prazo),
      tokenGithub: null,
    };

    (prisma.projeto.update as jest.Mock).mockResolvedValue(mockUpdatedProject);

    const response = await request(app)
      .patch(`/project/${projectId}`)
      .set(authHeader({ role: "aluno", userId: 1 }))
      .send(updatePayload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: projectId,
        tituloProjeto: updatePayload.tituloProjeto,
        descricao: updatePayload.descricao,
      }),
    );
    expect(prisma.projeto.update).toHaveBeenCalledWith({
      where: { id: projectId },
      data: {
        tituloProjeto: updatePayload.tituloProjeto,
        descricao: updatePayload.descricao,
        prazo: new Date(updatePayload.prazo),
        tokenGithub: undefined,
      },
    });
  });
});

