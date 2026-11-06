export const prisma = {
  usuario: {
    findUnique: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  projeto: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  sprint: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  projetoSprint: {
    create: jest.fn(),
  },
  tarefa: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  kanban: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  coluna: {
    findUnique: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  sala: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  },
  usuarioSala: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  },
  projetoUsuario: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  funcaoProjeto: {
    findUnique: jest.fn(),
  },
  comentario: {
    create: jest.fn(),
  },
  tarefaUsuario: {
    deleteMany: jest.fn(),
    create: jest.fn(),
  },
};
