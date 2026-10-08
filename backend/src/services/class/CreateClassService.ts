import { prisma } from "../../prisma";

export interface CreateClassRequest {
  lastYear: number;
  creatorRole: string;
}

export class CreateClassService {
  async execute(data: CreateClassRequest) {
    const { lastYear, creatorRole } = data;

    const allowedRoles = ["coordenador", "professor"];
    if (!creatorRole || !allowedRoles.includes(creatorRole.toLowerCase())) {
      throw new Error(
        "Acesso negado: Permissão insuficiente para criar salas.",
      );
    }

    const currentYear = new Date().getFullYear();
    if (lastYear < currentYear) {
      throw new Error(
        "O ano de encerramento não pode ser menor que o ano atual.",
      );
    }

    const sala = await prisma.sala.create({
      data: {
        anoEncerramento: lastYear,
      },
    });

    return sala;
  }
}
