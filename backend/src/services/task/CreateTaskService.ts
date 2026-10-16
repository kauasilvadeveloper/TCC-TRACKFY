import { prisma } from "../../prisma";

export interface CreateTaskDTO {
  tituloTarefa: string;
  descricaoTarefa?: string;
  status: string;
  stack: string;
  prazoTarefa: string;
  fkColuna: number;
  fkSprint: number;
  usuarioIds?: number[];
}

export class CreateTaskService {
  async execute({
    tituloTarefa,
    descricaoTarefa,
    status,
    stack,
    prazoTarefa,
    fkColuna,
    fkSprint,
    usuarioIds,
  }: CreateTaskDTO) {
    // 1. Sanidade e Fail-Fast de entradas obrigatórias
    if (!tituloTarefa?.trim() || !status?.trim() || !stack?.trim()) {
      throw new Error(
        "Os campos tituloTarefa, status e stack são obrigatórios.",
      );
    }

    const colunaIdNum = Number(fkColuna);
    const sprintIdNum = Number(fkSprint);

    if (isNaN(colunaIdNum) || isNaN(sprintIdNum)) {
      throw new Error("ID de Coluna e ID de Sprint válidos são obrigatórios.");
    }

    // 2. Validação e conversão do prazo
    const parsedPrazo = new Date(prazoTarefa);
    if (isNaN(parsedPrazo.getTime())) {
      throw new Error("A data limite (prazoTarefa) informada é inválida.");
    }

    // 3. Normalização dos IDs dos usuários (garante array numérico válido)
    const validUsuarioIds = Array.isArray(usuarioIds)
      ? usuarioIds.map((id) => Number(id)).filter((id) => !isNaN(id))
      : [];

    // 4. Validação paralela de existência dos recursos (Coluna, Sprint e Usuários)
    const [colunaExists, sprintExists, countUsuarios] = await Promise.all([
      prisma.coluna.findUnique({
        where: { id: colunaIdNum },
        select: { id: true },
      }),
      prisma.sprint.findUnique({
        where: { id: sprintIdNum },
        select: { id: true },
      }),
      validUsuarioIds.length > 0
        ? prisma.usuario.count({
            where: { id: { in: validUsuarioIds } },
          })
        : Promise.resolve(0),
    ]);

    if (!colunaExists) throw new Error("A coluna informada não existe.");
    if (!sprintExists) throw new Error("A sprint informada não existe.");
    if (
      validUsuarioIds.length > 0 &&
      countUsuarios !== validUsuarioIds.length
    ) {
      throw new Error("Um ou mais usuários informados não existem.");
    }

    // 5. Persistence & Nested Write com connect explícito no Prisma
    const task = await prisma.tarefa.create({
      data: {
        tituloTarefa: tituloTarefa.trim(),
        descricaoTarefa: descricaoTarefa?.trim(),
        status: status.trim(),
        stack: stack.trim(),
        prazoTarefa: parsedPrazo,
        fkColuna: colunaIdNum,
        fkSprint: sprintIdNum,
        ...(validUsuarioIds.length > 0 && {
          usuarios: {
            create: validUsuarioIds.map((userId) => ({
              usuario: {
                connect: { id: userId },
              },
            })),
          },
        }),
      },
      select: {
        id: true,
        tituloTarefa: true,
        descricaoTarefa: true,
        status: true,
        stack: true,
        prazoTarefa: true,
        fkColuna: true,
        fkSprint: true,
        usuarios: {
          select: {
            usuario: {
              select: { id: true, nome: true, email: true },
            },
          },
        },
      },
    });

    return task;
  }
}
