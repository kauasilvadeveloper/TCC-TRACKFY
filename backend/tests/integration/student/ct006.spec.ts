import request from "supertest";
import { prisma } from "../../../src/prisma";
import { app } from "../../../src/app";
import { authHeader } from "../../helpers/auth";

jest.mock("../../../src/prisma");

describe("CT006 - Criação e consulta de quadro Kanban", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve criar um quadro kanban para o projeto com status 201", async () => {
    const kanbanPayload = {
      tituloKanban: "Quadro Principal do Projeto",
      descricaoKanban: "Gerenciamento de fluxo de trabalho do TCC",
      fkProjeto: 10,
    };

    (prisma.projeto.findUnique as jest.Mock).mockResolvedValue({ id: 10 });

    const mockCreatedKanban = {
      id: 1,
      tituloKanban: kanbanPayload.tituloKanban,
      descricaoKanban: kanbanPayload.descricaoKanban,
      fkProjeto: kanbanPayload.fkProjeto,
    };

    (prisma.kanban.create as jest.Mock).mockResolvedValue(mockCreatedKanban);

    const response = await request(app)
      .post("/kanban")
      .set(authHeader({ role: "aluno", userId: 1 }))
      .send(kanbanPayload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: mockCreatedKanban.id,
        tituloKanban: mockCreatedKanban.tituloKanban,
      }),
    );
    expect(prisma.projeto.findUnique).toHaveBeenCalledWith({
      where: { id: 10 },
      select: { id: true },
    });
    expect(prisma.kanban.create).toHaveBeenCalledWith({
      data: {
        tituloKanban: kanbanPayload.tituloKanban,
        descricaoKanban: kanbanPayload.descricaoKanban,
        fkProjeto: kanbanPayload.fkProjeto,
      },
    });
  });

  it("deve consultar o quadro kanban de um projeto com status 200", async () => {
    (prisma.projeto.findUnique as jest.Mock).mockResolvedValue({ id: 10 });
    (prisma.kanban.findFirst as jest.Mock).mockResolvedValue({
      id: 1,
      tituloKanban: "Quadro Principal do Projeto",
      colunas: [],
    });

    const response = await request(app)
      .get("/kanban/10")
      .set(authHeader({ role: "aluno", userId: 1 }));

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", 1);
  });
});

