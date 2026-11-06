import request from "supertest";
import { prisma } from "../../../src/prisma";
import { app } from "../../../src/app";
import { authHeader } from "../../helpers/auth";

jest.mock("../../../src/prisma");

describe("CT030 - Regra de negócio: Prazo da tarefa não pode ultrapassar o prazo da sprint", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve rejeitar criação de tarefa cujo prazo (10/03/2026) excede o prazo limite da sprint (28/02/2026)", async () => {
    const sprintDeadline = new Date("2026-02-28T23:59:59.000Z");
    const taskDeadlineExceeded = "2026-03-10T23:59:59.000Z";

    (prisma.coluna.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
    (prisma.sprint.findUnique as jest.Mock).mockResolvedValue({
      id: 2,
      tituloSprint: "Sprint 1",
      prazoSprint: sprintDeadline,
    });

    const response = await request(app)
      .post("/task")
      .set(authHeader({ role: "aluno", userId: 1 }))
      .send({
        tituloTarefa: "Tarefa com Prazo Inválido",
        descricaoTarefa: "Prazo extrapolando a sprint",
        status: "A Fazer",
        stack: "Backend",
        prazoTarefa: taskDeadlineExceeded,
        fkColuna: 1,
        fkSprint: 2,
      });

    // Conforme a especificação em tests-cases.md, prazos de tarefa além da sprint devem ser barrados com 400
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(
      /prazo.*sprint|ultrapassar.*sprint|excede.*sprint|prazo.*inválido/i,
    );
  });
});
