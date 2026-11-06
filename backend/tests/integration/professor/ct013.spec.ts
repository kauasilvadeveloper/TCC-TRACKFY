import request from "supertest";
import { prisma } from "../../../src/prisma";
import { app } from "../../../src/app";
import { authHeader } from "../../helpers/auth";

jest.mock("../../../src/prisma");

describe("CT013 - Acompanhamento docente: projetos e alunos da turma", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar projetos vinculados ao professor autenticado com status 200", async () => {
    const professorId = 5;

    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({
      id: professorId,
    });

    const mockProjects = [
      {
        id: 10,
        tituloProjeto: "Projeto Integrador 2026",
        descricao: "Plataforma de monitoramento",
        prazo: new Date("2026-11-30T00:00:00.000Z"),
        tokenGithub: null,
        usuarios: [
          {
            usuario: {
              id: professorId,
              nome: "Prof. Ana Lima",
              email: "professor@docente.senai.br",
            },
            funcaoProjeto: {
              id: 3,
              tituloFuncaoProjeto: "Orientador",
            },
          },
        ],
      },
    ];

    (prisma.projeto.findMany as jest.Mock).mockResolvedValue(mockProjects);

    const response = await request(app)
      .get("/project")
      .set(
        authHeader({
          role: "professor",
          userId: professorId,
          email: "professor@docente.senai.br",
        }),
      );

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toEqual(
      expect.objectContaining({
        id: 10,
        tituloProjeto: "Projeto Integrador 2026",
      }),
    );
    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { id: professorId },
      select: { id: true },
    });
    expect(prisma.projeto.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          usuarios: {
            some: {
              fkUsuario: professorId,
            },
          },
        },
      }),
    );
  });

  it("deve consultar os alunos vinculados à turma com status 200", async () => {
    const classId = 1;

    const mockClassUsers = [
      {
        fkSala: classId,
        fkUsuario: 10,
        usuario: {
          id: 10,
          nome: "Lucas Fernandes",
          email: "lucas.fernandes@aluno.senai.br",
          cargoEscola: "aluno",
        },
      },
      {
        fkSala: classId,
        fkUsuario: 11,
        usuario: {
          id: 11,
          nome: "Beatriz Ribeiro",
          email: "beatriz.ribeiro@aluno.senai.br",
          cargoEscola: "aluno",
        },
      },
    ];

    (prisma.usuarioSala.findMany as jest.Mock).mockResolvedValue(mockClassUsers);

    const response = await request(app)
      .get(`/class/${classId}/users`)
      .set(authHeader({ role: "professor", userId: 5 }));

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("users");
    expect(response.body.users).toHaveLength(2);
    expect(prisma.usuarioSala.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { fkSala: classId },
      }),
    );
  });
});
