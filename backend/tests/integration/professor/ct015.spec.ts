import request from "supertest";
import { prisma } from "../../../src/prisma";
import { app } from "../../../src/app";
import { authHeader } from "../../helpers/auth";

jest.mock("../../../src/prisma");

describe("CT015 - Atualização de prazo de sprint e tarefa com data futura válida", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve atualizar o prazo da sprint com status 200", async () => {
    const sprintId = 5;
    const futureSprint = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 dias no futuro
    const newFutureDeadline = new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString(); // 45 dias no futuro

    (prisma.sprint.findUnique as jest.Mock).mockResolvedValue({
      id: sprintId,
      tituloSprint: "Sprint 1",
      descricaoSprint: "Setup inicial",
      prazoSprint: futureSprint,
    });

    const mockUpdatedSprint = {
      id: sprintId,
      tituloSprint: "Sprint 1",
      descricaoSprint: "Setup inicial",
      prazoSprint: new Date(newFutureDeadline),
    };

    (prisma.sprint.update as jest.Mock).mockResolvedValue(mockUpdatedSprint);

    const response = await request(app)
      .patch(`/sprint/${sprintId}`)
      .set(authHeader({ role: "professor", userId: 5 }))
      .send({
        prazoSprint: newFutureDeadline,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: sprintId,
      }),
    );
    expect(prisma.sprint.update).toHaveBeenCalledWith({
      where: { id: sprintId },
      data: {
        prazoSprint: new Date(newFutureDeadline),
      },
    });
  });

  it("deve atualizar o prazo da tarefa com status 200", async () => {
    const taskId = 101;
    const futureDeadline = "2026-03-10T23:59:59.000Z";

    (prisma.tarefa.findUnique as jest.Mock).mockResolvedValue({
      id: taskId,
    });

    const mockUpdatedTask = {
      id: taskId,
      tituloTarefa: "Desenvolver tela de login",
      descricaoTarefa: "Criar layout",
      status: "Em Andamento",
      stack: "Frontend",
      prazoTarefa: new Date(futureDeadline),
      fkColuna: 2,
      fkSprint: 5,
      usuarios: [],
    };

    (prisma.tarefa.update as jest.Mock).mockResolvedValue(mockUpdatedTask);

    const response = await request(app)
      .patch(`/task/${taskId}`)
      .set(authHeader({ role: "professor", userId: 5 }))
      .send({
        prazoTarefa: futureDeadline,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: taskId,
      }),
    );
    expect(prisma.tarefa.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: taskId },
        data: expect.objectContaining({
          prazoTarefa: new Date(futureDeadline),
        }),
      }),
    );
  });
});
