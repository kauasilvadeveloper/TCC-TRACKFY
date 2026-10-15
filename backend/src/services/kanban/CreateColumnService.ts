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
    if (!fkKanban || isNaN(fkKanban)) {
      throw new Error(
        "O ID do Kanban (fkKanban) é obrigatório e deve ser numérico.",
      );
    }

    if (!tituloColuna || !tituloColuna.trim()) {
      throw new Error("O título da coluna é obrigatório.");
    }

    // 1. Integridade Referencial: Verifica se o Kanban pai existe
    const kanbanExists = await prisma.kanban.findUnique({
      where: { id: fkKanban },
      select: { id: true },
    });

    if (!kanbanExists) {
      throw new Error("O Kanban especificado não existe.");
    }

    // 2. Cálculo dinâmico da ordem se não for informada
    let columnOrder = ordem;
    if (!columnOrder) {
      const totalColumns = await prisma.coluna.count({
        where: { fkKanban },
      });
      columnOrder = String(totalColumns + 1);
    }

    // 3. Persistência da Coluna
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
