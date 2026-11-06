import request from "supertest";
import { prisma } from "../../../src/prisma";
import { app } from "../../../src/app";
import { authHeader } from "../../helpers/auth";

jest.mock("../../../src/prisma");

describe("CT017 - Criação de turma pelo coordenador", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve criar uma turma com status 200 quando autenticado como coordenador", async () => {
    const classPayload = {
      lastYear: 2028,
    };

    const mockCreatedSala = {
      id: 1,
      anoEncerramento: 2028,
    };

    (prisma.sala.create as jest.Mock).mockResolvedValue(mockCreatedSala);

    const response = await request(app)
      .post("/class")
      .set(authHeader({ role: "coordenador", userId: 99 }))
      .send(classPayload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      classroom: mockCreatedSala,
    });
    expect(prisma.sala.create).toHaveBeenCalledWith({
      data: {
        anoEncerramento: classPayload.lastYear,
      },
    });
  });
});
