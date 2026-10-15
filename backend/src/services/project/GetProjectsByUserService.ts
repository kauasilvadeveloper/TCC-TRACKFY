import { prisma } from "../../prisma";

export class GetProjectsByUserService {
  async execute(userId: number) {
    if (!userId || isNaN(userId) || userId <= 0) {
      throw new Error("Identificador do usuário inválido ou não autenticado.");
    }

    // 1. Verificação de existência do usuário
    const userExists = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      throw new Error("Usuário não encontrado.");
    }

    // 2. Busca os projetos onde o usuário possui vínculo na tabela pivô projeto_usuario
    const projetos = await prisma.projeto.findMany({
      where: {
        usuarios: {
          some: {
            fkUsuario: userId,
          },
        },
      },
      select: {
        id: true,
        tituloProjeto: true,
        descricao: true,
        prazo: true,
        tokenGithub: true,
        usuarios: {
          select: {
            funcaoProjeto: {
              select: {
                id: true,
                tituloFuncaoProjeto: true,
              },
            },
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        prazo: "asc",
      },
    });

    return projetos;
  }
}
