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

    if (!fkColuna || isNaN(fkColuna) || !fkSprint || isNaN(fkSprint)) {
      throw new Error("ID de Coluna e ID de Sprint válidos são obrigatórios.");
    }

    // 2. Validação e conversão do prazo
    const parsedPrazo = new Date(prazoTarefa);
    if (isNaN(parsedPrazo.getTime())) {
      throw new Error("A data limite (prazoTarefa) informada é inválida.");
    }

    // 3. Validação paralela de existência dos recursos pai (Parallel I/O)
    const [colunaExists, sprintExists] = await Promise.all([
      prisma.coluna.findUnique({
        where: { id: fkColuna },
        select: { id: true },
      }),
      prisma.sprint.findUnique({
        where: { id: fkSprint },
        select: { id: true },
      }),
    ]);

    if (!colunaExists) throw new Error("A coluna informada não existe.");
    if (!sprintExists) throw new Error("A sprint informada não existe.");

    // 4. Persistence & Nested Write na tabela pivô (tarefa_usuario)
    const task = await prisma.tarefa.create({
      data: {
        tituloTarefa: tituloTarefa.trim(),
        descricaoTarefa: descricaoTarefa?.trim(),
        status: status.trim(),
        stack: stack.trim(),
        prazoTarefa: parsedPrazo,
        fkColuna,
        fkSprint,
        ...(usuarioIds &&
          usuarioIds.length > 0 && {
            usuarios: {
              create: usuarioIds.map((fkUsuario) => ({ fkUsuario })),
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
