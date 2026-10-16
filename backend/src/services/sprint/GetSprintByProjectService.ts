import { prisma } from "../../prisma";

export class GetSprintsByProjectService {
  async execute(projectId: number | string) {
    // 1. Converte e valida o ID recebido (evita erro de tipo de req.params)
    const id = Number(projectId);

    if (isNaN(id)) {
      const error = new Error("ID do projeto inválido.");
      (error as any).status = 400;
      throw error;
    }

    // 2. Valida a existência do projeto
    const projectExists = await prisma.projeto.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!projectExists) {
      const error = new Error("Projeto não encontrado.");
      (error as any).status = 404;
      throw error;
    }

    // 3. Busca as Sprints vinculadas ao Projeto na tabela pivô (ProjetoSprint)
    return await prisma.sprint.findMany({
      where: {
        projetos: {
          // Garanta que no schema.prisma, no modelo Sprint,
          // o campo relacional com ProjetoSprint se chama 'projetos'
          // (se for 'projetoSprint' ou outro nome, ajuste aqui)
          some: {
            fkProjeto: id,
          },
        },
      },
      select: {
        id: true,
        tituloSprint: true,
        descricaoSprint: true,
        prazoSprint: true,
        _count: {
          select: { tarefas: true },
        },
      },
      orderBy: {
        prazoSprint: "asc",
      },
    });
  }
}
