import { AppError } from "../../errors/AppError";
import { prisma } from "../../prisma";

export class GetProjectsByUserService {
  async execute(userId: number) {
    const parsedUserId = Number(userId);
    if (!userId || Number.isNaN(parsedUserId) || parsedUserId <= 0) {
      throw new AppError(
        "Identificador do usuário inválido ou não informado.",
        400, // Bad Request
      );
    }

    // 2. Verificação de existência do usuário no banco de dados
    const userExists = await prisma.usuario.findUnique({
      where: { id: parsedUserId },
      select: { id: true }, // Projeção enxuta para otimização de I/O
    });

    if (!userExists) {
      throw new AppError("Usuário não encontrado.", 404); // Not Found
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
