import { AppError } from "../../errors/AppError";
import { prisma } from "../../prisma";

export class GetKanbanByProjectService {
  async execute(projectId: number) {
    const parsedProjectId = Number(projectId);
    if (!projectId || Number.isNaN(parsedProjectId) || parsedProjectId <= 0) {
      throw new AppError(
        "O ID do projeto deve ser um número inteiro válido.",
        400, // Bad Request
      );
    }

    const projectExists = await prisma.projeto.findUnique({
      where: { id: parsedProjectId },
      select: { id: true }, // Projeção enxuta para otimização de I/O
    });

    if (!projectExists) {
      throw new AppError("Projeto não encontrado.", 404); // Not Found
    }

    const kanban = await prisma.kanban.findFirst({
      where: { fkProjeto: projectId },
      select: {
        id: true,
        tituloKanban: true,
        descricaoKanban: true,
        colunas: {
          orderBy: {
            ordem: "asc",
          },
          select: {
            id: true,
            tituloColuna: true,
            descricaoColuna: true,
            ordem: true,
            tarefas: {
              select: {
                id: true,
                tituloTarefa: true,
                descricaoTarefa: true,
                status: true,
                stack: true,
                prazoTarefa: true,
                comentarios: {
                  select: {
                    usuario: true,
                    conteudo: true,
                  },
                },
                usuarios: {
                  select: {
                    usuario: {
                      select: {
                        id: true,
                        nome: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!kanban) {
      throw new AppError("Nenhum Kanban encontrado para este projeto.", 404); // Not Found
    }
    return kanban;
  }
}
