import request from "supertest";
import { prisma } from "../../../src/prisma";
import { app } from "../../../src/app";
import { authHeader } from "../../helpers/auth";

jest.mock("../../../src/prisma");

describe("CT018 - Vinculação de aluno à turma", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve vincular um aluno a uma turma válida com status 201", async () => {
    const studentId = 15;
    const salaId = 1;

    (prisma.sala.findUnique as jest.Mock).mockResolvedValue({
      id: salaId,
      anoEncerramento: 2028,
    });

    (prisma.usuarioSala.findUnique as jest.Mock).mockResolvedValue(null);

    const mockEnrollment = {
      fkSala: salaId,
      fkUsuario: studentId,
      sala: {
        id: salaId,
        anoEncerramento: 2028,
      },
    };

    (prisma.usuarioSala.create as jest.Mock).mockResolvedValue(mockEnrollment);

    const response = await request(app)
      .post("/class/join")
      .set(authHeader({ role: "coordenador", userId: 99 }))
      .send({
        salaId,
        targetUser: studentId,
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: "Entrada na turma realizada com sucesso.",
      data: mockEnrollment,
    });
    expect(prisma.sala.findUnique).toHaveBeenCalledWith({
      where: { id: salaId },
    });
    expect(prisma.usuarioSala.findUnique).toHaveBeenCalledWith({
      where: {
        fkSala_fkUsuario: {
          fkSala: salaId,
          fkUsuario: studentId,
        },
      },
    });
    expect(prisma.usuarioSala.create).toHaveBeenCalledWith({
      data: {
        fkSala: salaId,
        fkUsuario: studentId,
      },
      select: expect.any(Object),
    });
  });
});

