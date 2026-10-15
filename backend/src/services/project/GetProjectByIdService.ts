import { prisma } from "../../prisma";

export class GetProjectByIdService {
  async execute(projectId: number) {
    if (!projectId || isNaN(projectId) || projectId <= 0) {
      throw new Error(
        "O ID do projeto é obrigatório e deve ser um número inteiro válido.",
      );
    }

    const project = await prisma.projeto.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        tituloProjeto: true,
        descricao: true,
        prazo: true,
        tokenGithub: true,
        sprints: {
          select: {
            sprint: {
              select: {
                id: true,
                tituloSprint: true,
                descricaoSprint: true,
                prazoSprint: true,
              },
            },
          },
          orderBy: {
            sprint: {
              prazoSprint: "asc",
            },
          },
        },
        kanbans: {
          select: {
            id: true,
            tituloKanban: true,
            descricaoKanban: true,
          },
        },
        usuarios: {
          select: {
            funcaoProjeto: {
              select: {
                id: true,
                tituloFuncaoProjeto: true,
              },
            },
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
    });

    if (!project) {
      throw new Error("Projeto não encontrado.");
    }

    // Mapeamento para desacoplar a estrutura interna da pivô e entregar um contrato JSON limpo
    return {
      ...project,
      sprints: project.sprints.map((item) => item.sprint),
    };
  }
}
