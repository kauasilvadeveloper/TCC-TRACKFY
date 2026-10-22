import { AppError } from "../../errors/AppError";
import { prisma } from "../../prisma";

interface CreateKanbanRequest {
  creatorRole: string;
  tituloKanban: string;
  descricaoKanban?: string;
  fkProjeto: number;
}

export class CreateKanbanService {
  async execute({
    creatorRole,
    tituloKanban,
    descricaoKanban,
    fkProjeto,
  }: CreateKanbanRequest) {
    const allowedRoles = ["aluno", "professor"];

    if (!creatorRole || !allowedRoles.includes(creatorRole.toLowerCase())) {
      throw new AppError(
        "Acesso negado: Permissão insuficiente para criar quadros kanban.",
        403, // Forbidden
      );
    }

    const projetoExists = await prisma.projeto.findUnique({
      where: { id: fkProjeto },
      select: { id: true },
    });

    if (!projetoExists) {
      throw new AppError("Projeto não encontrado.", 404); // Not Found
    }

    const kanban = await prisma.kanban.create({
      data: {
        tituloKanban,
        descricaoKanban,
        fkProjeto,
      },
    });

    return kanban;
  }
}
