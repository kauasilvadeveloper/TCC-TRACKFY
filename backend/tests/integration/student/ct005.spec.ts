import request from "supertest";
import { prisma } from "../../../src/prisma";
import { app } from "../../../src/app";
import { authHeader } from "../../helpers/auth";

jest.mock("../../../src/prisma");

describe("CT005 - Criação de tarefa com coluna, sprint e membros", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve criar uma tarefa associada à coluna, sprint e membro com status 201", async () => {
    const taskPayload = {
      tituloTarefa: "Desenvolver tela de Login",
      descricaoTarefa: "Criar layout responsivo e validação dos inputs",
      status: "A Fazer",
      stack: "Frontend",
      prazoTarefa: "2026-03-20T18:00:00.000Z",
      fkColuna: 1,
      fkSprint: 2,
      usuarioIds: [3],
    };

    (prisma.coluna.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
    (prisma.sprint.findUnique as jest.Mock).mockResolvedValue({ id: 2 });
    (prisma.usuario.count as jest.Mock).mockResolvedValue(1);

    const mockCreatedTask = {
      id: 101,
      tituloTarefa: taskPayload.tituloTarefa,
      descricaoTarefa: taskPayload.descricaoTarefa,
      status: taskPayload.status,
      stack: taskPayload.stack,
      prazoTarefa: new Date(taskPayload.prazoTarefa),
      fkColuna: taskPayload.fkColuna,
      fkSprint: taskPayload.fkSprint,
      usuarios: [
        {
          usuario: { id: 3, nome: "Aluno Dev", email: "aluno@aluno.senai.br" },
        },
      ],
    };

    (prisma.tarefa.create as jest.Mock).mockResolvedValue(mockCreatedTask);

    const response = await request(app)
      .post("/task")
      .set(authHeader({ role: "aluno", userId: 3 }))
      .send(taskPayload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: mockCreatedTask.id,
        tituloTarefa: mockCreatedTask.tituloTarefa,
        status: mockCreatedTask.status,
      }),
    );
    expect(prisma.coluna.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: { id: true },
    });
    expect(prisma.sprint.findUnique).toHaveBeenCalledWith({
      where: { id: 2 },
      select: { id: true },
    });
    expect(prisma.tarefa.create).toHaveBeenCalled();
  });
});
