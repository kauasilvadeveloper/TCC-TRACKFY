import { prisma } from "../../prisma";

export class GetKanbanByProjectService {
  async execute(projectId: number) {
    if (!projectId || isNaN(projectId) || projectId <= 0) {
      throw new Error("O ID do projeto deve ser um número inteiro válido.");
    }

    // 1. Verificação de existência do Projeto
    const projectExists = await prisma.projeto.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!projectExists) {
      throw new Error("Projeto não encontrado.");
    }

    // 2. Busca o Kanban vinculado ao Projeto com Colunas e Tarefas
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
      throw new Error("Nenhum Kanban encontrado para este projeto.");
    }

    return kanban;
  }
}
