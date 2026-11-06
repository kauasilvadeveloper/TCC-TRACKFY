import request from "supertest";
import { prisma } from "../../../src/prisma";
import { app } from "../../../src/app";
import { authHeader } from "../../helpers/auth";

jest.mock("../../../src/prisma");

describe("CT003 - Criação de projeto pelo aluno", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve criar um projeto com sucesso com status 201 quando autenticado como aluno", async () => {
    const projectPayload = {
      title: "Sistema de Gestão Escolar",
      description: "Projeto para controle de tarefas e notas acadêmicas",
      term: "2026-12-15T00:00:00.000Z",
      tokenGithub: "ghp_mockGithubToken123456",
    };

    const mockCreatedProject = {
      id: 10,
      tituloProjeto: projectPayload.title,
      descricao: projectPayload.description,
      prazo: new Date(projectPayload.term),
      tokenGithub: projectPayload.tokenGithub,
    };

    (prisma.projeto.create as jest.Mock).mockResolvedValue(mockCreatedProject);

    const response = await request(app)
      .post("/project")
      .set(authHeader({ role: "aluno", userId: 1 }))
      .send(projectPayload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: mockCreatedProject.id,
        tituloProjeto: mockCreatedProject.tituloProjeto,
        descricao: mockCreatedProject.descricao,
      }),
    );
    expect(prisma.projeto.create).toHaveBeenCalledWith({
      data: {
        tituloProjeto: projectPayload.title,
        descricao: projectPayload.description,
        prazo: new Date(projectPayload.term),
        tokenGithub: projectPayload.tokenGithub,
      },
    });
  });
});

