import { prisma } from "../../prisma";

export class GetUsersByClassService {
  async execute(classId) {
    const users = prisma.usuarioSala.findMany({
      where: {
        fkSala: classId,
      },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            nome: true,
          },
        },
      },
    });

    return users;
  }
}
