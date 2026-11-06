import request from "supertest";
import { prisma } from "../../../src/prisma";
import bcrypt from "bcryptjs";
import { app } from "../../../src/app";

jest.mock("../../../src/prisma");
jest.mock("bcryptjs");

describe("CT001 - Teste de login com credenciais válidas", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validUserTypes = [
    {
      role: "aluno",
      email: "aluno@aluno.senai.br",
      password: "aluno123",
      nome: "Aluno Teste",
    },
    {
      role: "professor",
      email: "professor@docente.senai.br",
      password: "docente123",
      nome: "Professor Teste",
    },
    {
      role: "coordenador",
      email: "coordenador@coordenador.senai.br",
      password: "coord123",
      nome: "Coordenador Teste",
    },
  ];

  it.each(validUserTypes)(
    "deve autenticar com sucesso e retornar o payload correto para o perfil $role",
    async ({ role, email, password, nome }) => {
      const mockUser = {
        id: 1,
        nome,
        email,
        senha: "$2a$10$MockHashGeneratedByBcrypt123456",
        cargoEscola: role,
      };

      (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const response = await request(app).post("/login").send({
        email,
        password,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("login");
      expect(response.body.login).toHaveProperty("token");
      expect(response.body.login.user).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          name: mockUser.nome,
          email: mockUser.email,
          role: mockUser.cargoEscola,
        }),
      );
      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.senha);
    },
  );
});
