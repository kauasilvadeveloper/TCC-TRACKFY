import request from "supertest";
import { prisma } from "../../../src/prisma";
import { app } from "../../../src/app";
import { authHeader } from "../../helpers/auth";

jest.mock("../../../src/prisma");

describe("CT025 - Validação de campos obrigatórios: tarefa sem título", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 400 ao tentar criar tarefa sem tituloTarefa", async () => {
    const invalidTaskPayload = {
      tituloTarefa: "",
      descricaoTarefa: "Descrição sem título",
      status: "A Fazer",
      stack: "Frontend",
      prazoTarefa: "2026-03-20T18:00:00.000Z",
      fkColuna: 1,
      fkSprint: 2,
    };

    const response = await request(app)
      .post("/task")
      .set(authHeader({ role: "aluno", userId: 1 }))
      .send(invalidTaskPayload);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: "error",
      message: "Os campos tituloTarefa, status e stack são obrigatórios.",
    });
    expect(prisma.tarefa.create).not.toHaveBeenCalled();
  });
});

