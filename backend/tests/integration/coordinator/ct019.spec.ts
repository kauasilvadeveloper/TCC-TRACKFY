import request from "supertest";
import { prisma } from "../../../src/prisma";
import { app } from "../../../src/app";
import { authHeader } from "../../helpers/auth";

jest.mock("../../../src/prisma");

describe("CT019 - Vinculação de docente à turma", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve vincular um docente a uma turma válida com status 201", async () => {
    const teacherId = 5;
    const salaId = 1;

    (prisma.sala.findUnique as jest.Mock).mockResolvedValue({
      id: salaId,
      anoEncerramento: 2028,
    });

    (prisma.usuarioSala.findUnique as jest.Mock).mockResolvedValue(null);

    const mockEnrollment = {
      fkSala: salaId,
      fkUsuario: teacherId,
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
        targetUser: teacherId,
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
          fkUsuario: teacherId,
        },
      },
    });
    expect(prisma.usuarioSala.create).toHaveBeenCalledWith({
      data: {
        fkSala: salaId,
        fkUsuario: teacherId,
      },
      select: expect.any(Object),
    });
  });
});
