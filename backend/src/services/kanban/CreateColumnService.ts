import { AppError } from "../../errors/AppError";
import { prisma } from "../../prisma";

interface CreateColumnDTO {
  tituloColuna: string;
  descricaoColuna?: string;
  ordem?: string;
  fkKanban: number;
}

export class CreateColumnService {
  async execute({
    tituloColuna,
    descricaoColuna,
    ordem,
    fkKanban,
  }: CreateColumnDTO) {
    const parsedKanbanId = Number(fkKanban);
    if (!fkKanban || Number.isNaN(parsedKanbanId) || parsedKanbanId <= 0) {
      throw new AppError(
        "O ID do Kanban (fkKanban) é obrigatório e deve ser um número inteiro válido.",
        400, // Bad Request
      );
    }

    if (!tituloColuna || !tituloColuna.trim()) {
      throw new AppError("O título da coluna é obrigatório.", 400); // Bad Request
    }

    const kanbanExists = await prisma.kanban.findUnique({
      where: { id: fkKanban },
      select: { id: true },
    });

    if (!kanbanExists) {
      throw new AppError("O Kanban especificado não existe.", 404); // Not Found
    }

    let columnOrder = ordem;
    if (!columnOrder) {
      const totalColumns = await prisma.coluna.count({
        where: { fkKanban },
      });
      columnOrder = String(totalColumns + 1);
    }

    const coluna = await prisma.coluna.create({
      data: {
        tituloColuna: tituloColuna.trim(),
        descricaoColuna: descricaoColuna?.trim(),
        ordem: columnOrder,
        fkKanban,
      },
      select: {
        id: true,
        tituloColuna: true,
        descricaoColuna: true,
        ordem: true,
        fkKanban: true,
      },
    });

    return coluna;
  }
}
