import request from "supertest";
import { prisma } from "../../../src/prisma";
import { app } from "../../../src/app";
import { authHeader } from "../../helpers/auth";

jest.mock("../../../src/prisma");

describe("CT011 - Visualização de tarefas da sprint", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar as tarefas de uma sprint com status 200", async () => {
    const sprintId = 5;

    (prisma.sprint.findUnique as jest.Mock).mockResolvedValue({
      id: sprintId,
      tituloSprint: "Sprint 1 - Setup e Autenticação",
      descricaoSprint: "Implementação da arquitetura inicial e login",
      prazoSprint: new Date("2026-03-31T23:59:59.000Z"),
    });

    const mockTasks = [
      {
        id: 101,
        tituloTarefa: "Configurar banco de dados",
        descricaoTarefa: "Executar migrations iniciais",
        status: "Concluído",
        stack: "Backend",
        prazoTarefa: new Date("2026-03-15T23:59:59.000Z"),
        fkColuna: 3,
        fkSprint: sprintId,
      },
      {
        id: 102,
        tituloTarefa: "Desenvolver tela de login",
        descricaoTarefa: "Criar componentes e validação",
        status: "Em Andamento",
        stack: "Frontend",
        prazoTarefa: new Date("2026-03-25T23:59:59.000Z"),
        fkColuna: 2,
        fkSprint: sprintId,
      },
    ];

    (prisma.tarefa.findMany as jest.Mock).mockResolvedValue(mockTasks);

    const response = await request(app)
      .get(`/sprint/${sprintId}/tasks`)
      .set(authHeader({ role: "aluno", userId: 1 }));

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toEqual(
      expect.objectContaining({
        id: 101,
        tituloTarefa: "Configurar banco de dados",
        status: "Concluído",
      }),
    );
    expect(prisma.sprint.findUnique).toHaveBeenCalledWith({
      where: { id: sprintId },
    });
    expect(prisma.tarefa.findMany).toHaveBeenCalledWith({
      where: { fkSprint: sprintId },
    });
  });
});
