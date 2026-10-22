import { AppError } from "../../errors/AppError";
import { prisma } from "../../prisma";

export class GetClassesByUserService {
  async execute(userId: number) {
    if (!userId || Number.isNaN(Number(userId)) || userId <= 0) {
      throw new AppError("Identificador do usuário inválido.", 400); // 400 Bad Request
    }

    // 1. Verificação de existência do usuário
    const userExists = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      throw new AppError("Usuário não encontrado.", 404); // 404 Not Found
    }

    // 2. Busca todas as salas/turmas associadas ao usuário através da pivô usuario_sala
    const turmas = await prisma.sala.findMany({
      where: {
        usuarios: {
          some: {
            fkUsuario: userId,
          },
        },
      },
      select: {
        id: true,
        anoEncerramento: true,
        _count: {
          select: {
            usuarios: true, // Retorna o total de membros cadastrados na turma
          },
        },
      },
      orderBy: {
        anoEncerramento: "desc",
      },
    });

    return turmas;
  }
}
