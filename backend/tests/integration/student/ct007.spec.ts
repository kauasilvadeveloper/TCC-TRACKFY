import request from "supertest";
import { prisma } from "../../../src/prisma";
import { app } from "../../../src/app";
import { authHeader } from "../../helpers/auth";

jest.mock("../../../src/prisma");

describe("CT007 - Movimentação de tarefa entre colunas no Kanban", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve mover uma tarefa para a coluna de destino com status 200", async () => {
    const taskId = 101;
    const targetColumnId = 2;
    const newStatus = "Em Andamento";

    (prisma.tarefa.findUnique as jest.Mock).mockResolvedValue({
      id: taskId,
      fkColuna: 1,
    });

    (prisma.coluna.findUnique as jest.Mock).mockResolvedValue({
      id: targetColumnId,
      tituloColuna: newStatus,
    });

    const mockUpdatedTask = {
      id: taskId,
      tituloTarefa: "Desenvolver tela de Login",
      status: newStatus,
      fkColuna: targetColumnId,
      coluna: {
        id: targetColumnId,
        tituloColuna: newStatus,
        ordem: "2",
      },
    };

    (prisma.tarefa.update as jest.Mock).mockResolvedValue(mockUpdatedTask);

    const response = await request(app)
      .patch(`/task/${taskId}/move`)
      .set(authHeader({ role: "aluno", userId: 1 }))
      .send({
        targetColumnId,
        newStatus,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: taskId,
        status: newStatus,
        fkColuna: targetColumnId,
      }),
    );
    expect(prisma.tarefa.findUnique).toHaveBeenCalledWith({
      where: { id: taskId },
      select: { id: true, fkColuna: true },
    });
    expect(prisma.coluna.findUnique).toHaveBeenCalledWith({
      where: { id: targetColumnId },
      select: { id: true, tituloColuna: true },
    });
    expect(prisma.tarefa.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: taskId },
        data: {
          fkColuna: targetColumnId,
          status: newStatus,
        },
      }),
    );
  });
});
