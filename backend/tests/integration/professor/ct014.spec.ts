import request from "supertest";
import { prisma } from "../../../src/prisma";
import { app } from "../../../src/app";
import { authHeader } from "../../helpers/auth";

jest.mock("../../../src/prisma");

describe("CT014 - Professor adiciona comentário em tarefa", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve criar um comentário na tarefa com status 201", async () => {
    const taskId = 101;
    const professorId = 5;
    const commentPayload = {
      conteudo:
        "Excelente progresso! Lembre-se de cobrir os cenários de erro nos testes unitários.",
    };

    (prisma.tarefa.findUnique as jest.Mock).mockResolvedValue({ id: taskId });
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({
      id: professorId,
    });

    const mockCreatedComment = {
      id: 1,
      conteudo: commentPayload.conteudo,
      usuario: {
        id: professorId,
        nome: "Prof. Ana Lima",
        email: "professor@docente.senai.br",
      },
    };

    (prisma.comentario.create as jest.Mock).mockResolvedValue(
      mockCreatedComment,
    );

    const response = await request(app)
      .post(`/task/${taskId}/comment`)
      .set(
        authHeader({
          role: "professor",
          userId: professorId,
          email: "professor@docente.senai.br",
        }),
      )
      .send(commentPayload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: "Comentário adicionado com sucesso.",
      data: mockCreatedComment,
    });
    expect(prisma.tarefa.findUnique).toHaveBeenCalledWith({
      where: { id: taskId },
      select: { id: true },
    });
    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { id: professorId },
      select: { id: true },
    });
    expect(prisma.comentario.create).toHaveBeenCalledWith({
      data: {
        conteudo: commentPayload.conteudo,
        fkTarefa: taskId,
        fkUsuario: professorId,
      },
      select: expect.any(Object),
    });
  });
});
