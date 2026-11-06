import request from "supertest";
import { prisma } from "../../../src/prisma";
import { app } from "../../../src/app";
import { authHeader } from "../../helpers/auth";

jest.mock("../../../src/prisma");

describe("CT004 - Criação de sprint vinculada a um projeto", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve criar uma sprint vinculada ao projeto com status 201", async () => {
    const sprintPayload = {
      tituloSprint: "Sprint 1 - Setup e Autenticação",
      descricaoSprint: "Implementação da arquitetura inicial e login",
      prazoSprint: "2026-03-31T23:59:59.000Z",
      projetoId: 10,
    };

    const mockCreatedSprint = {
      id: 5,
      tituloSprint: sprintPayload.tituloSprint,
      descricaoSprint: sprintPayload.descricaoSprint,
      prazoSprint: new Date(sprintPayload.prazoSprint),
    };

    (prisma.sprint.create as jest.Mock).mockResolvedValue(mockCreatedSprint);
    (prisma.projetoSprint.create as jest.Mock).mockResolvedValue({
      fkProjeto: sprintPayload.projetoId,
      fkSprint: mockCreatedSprint.id,
    });

    const response = await request(app)
      .post("/sprint")
      .set(authHeader({ role: "aluno", userId: 1 }))
      .send(sprintPayload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: mockCreatedSprint.id,
        tituloSprint: mockCreatedSprint.tituloSprint,
      }),
    );
    expect(prisma.sprint.create).toHaveBeenCalledWith({
      data: {
        tituloSprint: sprintPayload.tituloSprint,
        descricaoSprint: sprintPayload.descricaoSprint,
        prazoSprint: new Date(sprintPayload.prazoSprint),
      },
    });
    expect(prisma.projetoSprint.create).toHaveBeenCalledWith({
      data: {
        fkProjeto: sprintPayload.projetoId,
        fkSprint: mockCreatedSprint.id,
      },
    });
  });
});

