import request from "supertest";
import { prisma } from "../../../src/prisma";
import { app } from "../../../src/app";
import { authHeader } from "../../helpers/auth";

jest.mock("../../../src/prisma");

describe("CT012 - Visualização de tarefas e comentários no Kanban", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar o Kanban com colunas, tarefas e comentários associados com status 200", async () => {
    const projectId = 10;

    (prisma.projeto.findUnique as jest.Mock).mockResolvedValue({ id: projectId });

    const mockKanban = {
      id: 1,
      tituloKanban: "Quadro Geral do Projeto",
      descricaoKanban: "Fluxo de trabalho",
      colunas: [
        {
          id: 1,
          tituloColuna: "Em Andamento",
          descricaoColuna: "Tarefas em desenvolvimento",
          ordem: "1",
          tarefas: [
            {
              id: 101,
              tituloTarefa: "Desenvolver tela de Login",
              descricaoTarefa: "Criar layout responsivo e validação dos inputs",
              status: "Em Andamento",
              stack: "Frontend",
              prazoTarefa: new Date("2026-03-20T18:00:00.000Z"),
              comentarios: [
                {
                  conteudo: "Adicionar validação de e-mail institucional",
                  usuario: {
                    id: 3,
                    nome: "Professor Revisor",
                    email: "professor@docente.senai.br",
                  },
                },
              ],
              usuarios: [
                {
                  usuario: {
                    id: 1,
                    nome: "Aluno Dev",
                    email: "aluno@aluno.senai.br",
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    (prisma.kanban.findFirst as jest.Mock).mockResolvedValue(mockKanban);

    const response = await request(app)
      .get(`/kanban/${projectId}`)
      .set(authHeader({ role: "aluno", userId: 1 }));

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: 1,
        tituloKanban: "Quadro Geral do Projeto",
      }),
    );
    expect(response.body.colunas).toHaveLength(1);
    expect(response.body.colunas[0].tarefas[0]).toEqual(
      expect.objectContaining({
        id: 101,
        tituloTarefa: "Desenvolver tela de Login",
        descricaoTarefa: "Criar layout responsivo e validação dos inputs",
      }),
    );
    expect(response.body.colunas[0].tarefas[0].comentarios).toHaveLength(1);
    expect(
      response.body.colunas[0].tarefas[0].comentarios[0].conteudo,
    ).toBe("Adicionar validação de e-mail institucional");

    expect(prisma.projeto.findUnique).toHaveBeenCalledWith({
      where: { id: projectId },
      select: { id: true },
    });
    expect(prisma.kanban.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { fkProjeto: projectId },
      }),
    );
  });
});

