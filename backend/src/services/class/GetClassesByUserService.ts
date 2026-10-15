import { prisma } from "../../prisma";

export class GetClassesByUserService {
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
