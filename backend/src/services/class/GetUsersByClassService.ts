import { prisma } from "../../prisma";

export class GetUsersByClassService {
  async execute(classId) {
    const users = prisma.usuarioSala.findMany({
      where: {
        fkSala: classId,
      },
    });

    return users;
  }
}
