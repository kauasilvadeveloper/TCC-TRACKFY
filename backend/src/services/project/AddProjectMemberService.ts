import { prisma } from "../../prisma";

export interface AddProjectMemberDTO {
  projectId: number;
  targetUserId: number;
  funcaoId: number;
}

export class AddProjectMemberService {
  async execute({ projectId, targetUserId, funcaoId }: AddProjectMemberDTO) {
    if (!projectId || isNaN(projectId) || projectId <= 0) {
      throw new Error("O ID do projeto é obrigatório e deve ser numérico.");
    }

    if (!targetUserId || isNaN(targetUserId) || targetUserId <= 0) {
      throw new Error("O ID do usuário a ser adicionado é obrigatório.");
    }

    if (!funcaoId || isNaN(funcaoId) || funcaoId <= 0) {
      throw new Error("O ID da função no projeto é obrigatório.");
    }

    // 1. Validação concorrente de existência das entidades (Parallel I/O)
    const [projectExists, userExists, functionExists] = await Promise.all([
      prisma.projeto.findUnique({
        where: { id: projectId },
        select: { id: true },
      }),
      prisma.usuario.findUnique({
        where: { id: targetUserId },
        select: { id: true },
      }),
      prisma.funcaoProjeto.findUnique({
        where: { id: funcaoId },
        select: { id: true },
      }),
    ]);

    if (!projectExists) throw new Error("Projeto não encontrado.");
    if (!userExists) throw new Error("Usuário não encontrado.");
    if (!functionExists)
      throw new Error("A função informada não existe no sistema.");

    // 2. Checagem de existência do membro com a mesma função via chave primária composta
    const existingRelation = await prisma.projetoUsuario.findUnique({
      where: {
        fkProjeto_fkUsuario_fkFuncaoProjeto: {
          fkProjeto: projectId,
          fkUsuario: targetUserId,
          fkFuncaoProjeto: funcaoId,
        },
      },
    });

    if (existingRelation) {
      throw new Error(
        "O aluno já está cadastrado neste projeto com esta mesma função.",
      );
    }

    // 3. Inserção na tabela pivô projeto_usuario
    const newMember = await prisma.projetoUsuario.create({
      data: {
        fkProjeto: projectId,
        fkUsuario: targetUserId,
        fkFuncaoProjeto: funcaoId,
      },
      select: {
        fkProjeto: true,
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        funcaoProjeto: {
          select: {
            id: true,
            tituloFuncaoProjeto: true,
          },
        },
      },
    });

    return newMember;
  }
}
