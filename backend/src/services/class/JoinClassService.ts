import { AppError } from "../../errors/AppError";
import { prisma } from "../../prisma";

export interface JoinClassDTO {
  userId: number;
  salaId: number;
}

export class JoinClassService {
  async execute({ userId, salaId }: JoinClassDTO) {
    if (!userId || Number.isNaN(Number(userId)) || userId <= 0) {
      throw new AppError("Identificador do usuário inválido.", 400); // Bad Request
    }

    if (!salaId || Number.isNaN(Number(salaId)) || salaId <= 0) {
      throw new AppError(
        "O código da turma é obrigatório e deve ser um número inteiro válido.",
        400, // Bad Request
      );
    }

    // 1. Validação de existência da Sala
    const sala = await prisma.sala.findUnique({
      where: { id: salaId },
    });

    if (!sala) {
      throw new AppError("Turma não encontrada com o código fornecido.", 404); // Not Found
    }

    const currentYear = new Date().getFullYear();
    if (sala.anoEncerramento < currentYear) {
      throw new AppError(
        "Operação negada: Esta turma já se encontra encerrada.",
        400, // Bad Request (ou 422 Unprocessable Entity)
      );
    }

    // 3. Checagem de vínculo existente na tabela pivô
    const alreadyEnrolled = await prisma.usuarioSala.findUnique({
      where: {
        fkSala_fkUsuario: {
          fkSala: salaId,
          fkUsuario: userId,
        },
      },
    });

    if (alreadyEnrolled) {
      throw new Error("O usuário já faz parte desta turma.");
    }

    // 4. Criação da relação na tabela pivô (usuario_sala)
    const enrollment = await prisma.usuarioSala.create({
      data: {
        fkSala: salaId,
        fkUsuario: userId,
      },
      select: {
        fkSala: true,
        fkUsuario: true,
        sala: {
          select: {
            id: true,
            anoEncerramento: true,
          },
        },
      },
    });

    return enrollment;
  }
}
