import { AppError } from "../../errors/AppError";
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
      throw new AppError(
        "Acesso negado: Permissão insuficiente para criar salas.",
        403, // Forbidden
      );
    }

    const currentYear = new Date().getFullYear();
    if (lastYear < currentYear) {
      throw new AppError(
        "O ano de encerramento não pode ser menor que o ano atual.",
        400, // Bad Request (ou 422 Unprocessable Entity)
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
