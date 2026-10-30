import { prisma } from "../../prisma";

export class GetAllUsersService {
  async execute() {
    const users = prisma.usuario.findMany();

    return users;
  }
}
