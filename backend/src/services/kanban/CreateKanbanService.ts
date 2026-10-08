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
      throw new Error(
        "Acesso negado: Permissão insuficiente para criar quadros kanban.",
      );
    }

    const projeto = await prisma.projeto.findUnique({
      where: {
        id: fkProjeto,
      },
    });

    if (!projeto) {
      throw new Error("Projeto não encontrado");
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
