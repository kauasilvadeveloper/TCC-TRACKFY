import request from "supertest";
import { prisma } from "../../../src/prisma";
import { app } from "../../../src/app";
import { authHeader } from "../../helpers/auth";

jest.mock("../../../src/prisma");

describe("CT029 - Regra de negócio: Prazo da sprint não pode ultrapassar o prazo do projeto", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve rejeitar criação de sprint cujo prazo ultrapassa o prazo final do projeto (30/06/2026)", async () => {
    const projectDeadline = new Date("2026-06-30T23:59:59.000Z");
    const sprintDeadlineExceeded = "2026-07-15T23:59:59.000Z";

    (prisma.projeto.findUnique as jest.Mock).mockResolvedValue({
      id: 10,
      tituloProjeto: "Projeto TCC",
      prazo: projectDeadline,
    });

    const response = await request(app)
      .post("/sprint")
      .set(authHeader({ role: "aluno", userId: 1 }))
      .send({
        tituloSprint: "Sprint Extrapolada",
        descricaoSprint: "Sprint com prazo após o término do projeto",
        prazoSprint: sprintDeadlineExceeded,
        projetoId: 10,
      });

    // Conforme a especificação em tests-cases.md, prazos de sprint além do projeto devem ser barrados com 400
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(
      /prazo.*projeto|ultrapassar.*projeto|excede.*projeto|prazo.*inválido/i,
    );
  });
});
