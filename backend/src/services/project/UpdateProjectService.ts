import { prisma } from "../../prisma";

interface UpdateProjectRequest {
  id: number; // 👈 Certifique-se de que é number
  tituloProjeto?: string;
  descricao?: string;
  prazo?: string;
  tokenGithub?: string;
}

export class UpdateProjectService {
  async execute({
    id,
    tituloProjeto,
    descricao,
    prazo,
    tokenGithub,
  }: UpdateProjectRequest) {
    const project = await prisma.projeto.update({
      where: {
        id: Number(id), // 👈 Garantia dupla de conversão para o Prisma
      },
      data: {
        tituloProjeto,
        descricao,
        prazo: prazo ? new Date(prazo) : undefined,
        tokenGithub,
      },
    });

    return project;
  }
}
