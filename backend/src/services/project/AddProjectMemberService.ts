import { AppError } from "../../errors/AppError";
import { prisma } from "../../prisma";

export interface AddProjectMemberDTO {
  projectId: number;
  targetUserId: number;
  funcaoId: number;
}

export class AddProjectMemberService {
  async execute({ projectId, targetUserId, funcaoId }: AddProjectMemberDTO) {
    const parsedProjectId = Number(projectId);
    if (!projectId || Number.isNaN(parsedProjectId) || parsedProjectId <= 0) {
      throw new AppError(
        "O ID do projeto é obrigatório e deve ser um número válido.",
        400,
      ); // 400 Bad Request
    }

    const parsedTargetUserId = Number(targetUserId);
    if (
      !targetUserId ||
      Number.isNaN(parsedTargetUserId) ||
      parsedTargetUserId <= 0
    ) {
      throw new AppError(
        "O ID do usuário a ser adicionado é obrigatório e deve ser um número válido.",
        400,
      ); // 400 Bad Request
    }

    const parsedFuncaoId = Number(funcaoId);
    if (!funcaoId || Number.isNaN(parsedFuncaoId) || parsedFuncaoId <= 0) {
      throw new AppError(
        "O ID da função no projeto é obrigatório e deve ser um número válido.",
        400,
      ); // 400 Bad Request
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

    if (!projectExists) {
      throw new AppError("Projeto não encontrado.", 404); // 404 Not Found
    }

    if (!userExists) {
      throw new AppError("Usuário não encontrado.", 404); // 404 Not Found
    }

    if (!functionExists) {
      throw new AppError("A função informada não existe no sistema.", 404); // 404 Not Found
    }

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
      throw new AppError(
        "O aluno já está cadastrado neste projeto com esta mesma função.",
        409, // 409 Conflict
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
