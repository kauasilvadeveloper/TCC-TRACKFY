import request from "supertest";
import { prisma } from "../../../src/prisma";
import { app } from "../../../src/app";
import { authHeader } from "../../helpers/auth";

jest.mock("../../../src/prisma");

describe("CT028 - Validação de integridade: criação de tarefa sem vínculo com sprint", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 400 ao tentar criar uma tarefa sem informar fkSprint válido", async () => {
    const invalidTaskPayload = {
      tituloTarefa: "Tarefa sem Sprint",
      descricaoTarefa: "Falta o identificador da sprint",
      status: "A Fazer",
      stack: "Backend",
      prazoTarefa: "2026-03-20T18:00:00.000Z",
      fkColuna: 1,
      // fkSprint ausente / indefinido
    };

    const response = await request(app)
      .post("/task")
      .set(authHeader({ role: "aluno", userId: 1 }))
      .send(invalidTaskPayload);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: "error",
      message: "ID de Coluna e ID de Sprint válidos são obrigatórios.",
    });
    expect(prisma.tarefa.create).not.toHaveBeenCalled();
  });
});

