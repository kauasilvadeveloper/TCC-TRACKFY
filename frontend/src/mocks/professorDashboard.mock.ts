import { ClassProject, ProfessorTask } from "@/src/types/professor";

export const initialProfessorTasksMock: ProfessorTask[] = [
  {
    id: 101,
    tituloTarefa: "Projeto Final — Interface Responsiva",
    descricaoTarefa: "Implementação da interface responsiva do portal utilizando Next.js e SCSS Modules.",
    prazoTarefa: "2026-11-15T23:59:59.000Z",
    status: "em andamento",
    stack: "React / Next.js",
    classId: 1,
    projectId: 1,
    projectTitle: "Portal E-commerce Sustentável",
    comentarios: [
      {
        id: 1,
        conteudo: "Excelente estrutura inicial! Lembrem-se de validar o contraste das cores no modo escuro.",
        fkTarefa: 101,
        usuario: { id: 99, nome: "Prof. Ana Lima", email: "prof.ana@escola.edu.br" },
        createdAt: "2026-10-25T14:30:00.000Z",
      },
      {
        id: 2,
        conteudo: "Ajustamos os breakpoints principais para mobile e tablet.",
        fkTarefa: 101,
        usuario: { id: 1, nome: "Lucas Fernandes", email: "lucas.fernandes@escola.edu.br" },
        createdAt: "2026-10-26T10:15:00.000Z",
      },
    ],
  },
  {
    id: 102,
    tituloTarefa: "API REST e Autenticação JWT",
    descricaoTarefa: "Criação de rotas seguras com middlewares de permissão de acesso e refresh token.",
    prazoTarefa: "2026-11-20T23:59:59.000Z",
    status: "em andamento",
    stack: "Node.js / Express",
    classId: 1,
    projectId: 1,
    projectTitle: "Portal E-commerce Sustentável",
    comentarios: [
      {
        id: 3,
        conteudo: "Verifiquem se as senhas estão sendo criptografadas com bcrypt antes de persistir no banco.",
        fkTarefa: 102,
        usuario: { id: 99, nome: "Prof. Ana Lima", email: "prof.ana@escola.edu.br" },
        createdAt: "2026-10-27T09:00:00.000Z",
      },
    ],
  },
  {
    id: 103,
    tituloTarefa: "Modelagem do Banco de Dados Relacional",
    descricaoTarefa: "Definição do diagrama ER e migrações no Prisma com tabelas de usuários, produtos e pedidos.",
    prazoTarefa: "2026-10-20T23:59:59.000Z",
    status: "concluída",
    stack: "PostgreSQL / Prisma",
    classId: 1,
    projectId: 1,
    projectTitle: "Portal E-commerce Sustentável",
    comentarios: [],
  },
  {
    id: 104,
    tituloTarefa: "Módulo de Agendamentos e Calendário",
    descricaoTarefa: "Integração do painel de horários e agendamento de consultas com notificações por email.",
    prazoTarefa: "2026-11-18T23:59:59.000Z",
    status: "em andamento",
    stack: "TypeScript / React",
    classId: 1,
    projectId: 2,
    projectTitle: "Sistema de Gestão Hospitalar",
    comentarios: [
      {
        id: 4,
        conteudo: "Adicionem confirmação prévia antes de cancelar qualquer agendamento.",
        fkTarefa: 104,
        usuario: { id: 99, nome: "Prof. Ana Lima", email: "prof.ana@escola.edu.br" },
        createdAt: "2026-10-28T11:20:00.000Z",
      },
    ],
  },
  {
    id: 105,
    tituloTarefa: "Integração com Gateway de Pagamentos",
    descricaoTarefa: "Configuração dos webhooks de confirmação de pagamento e emissão de comprovantes.",
    prazoTarefa: "2026-11-25T23:59:59.000Z",
    status: "pendente",
    stack: "Node.js / Stripe",
    classId: 2,
    projectId: 3,
    projectTitle: "App Mobile de Entregas Rápidas",
    comentarios: [],
  },
];

export const initialProfessorProjectsMock: ClassProject[] = [
  {
    id: 1,
    tituloProjeto: "Portal E-commerce Sustentável",
    descricao: "Plataforma web para comércio de produtos artesanais e recicláveis com foco em sustentabilidade e rastreabilidade da cadeia produtiva.",
    prazo: "2026-12-10T23:59:59.000Z",
    tokenGithub: "github.com/turma-a/ecommerce-sustentavel",
    classId: 1,
    usuarios: [
      {
        usuario: { id: 1, nome: "Lucas Fernandes", email: "lucas.fernandes@escola.edu.br" },
        funcaoProjeto: { id: 1, tituloFuncaoProjeto: "Tech Lead" },
      },
      {
        usuario: { id: 2, nome: "Beatriz Ribeiro", email: "beatriz.ribeiro@escola.edu.br" },
        funcaoProjeto: { id: 2, tituloFuncaoProjeto: "Frontend Developer" },
      },
    ],
    sprints: [
      {
        id: 1,
        tituloSprint: "Sprint 1 — Arquitetura e Autenticação",
        descricaoSprint: "Setup inicial do repositório, configuração de rotas e autenticação de usuários.",
        prazoSprint: "2026-11-10T23:59:59.000Z",
        tarefasCount: 2,
        tarefasConcluidasCount: 1,
      },
      {
        id: 2,
        tituloSprint: "Sprint 2 — Catálogo e Carrinho",
        descricaoSprint: "Desenvolvimento do fluxo de compras e integração com o banco de dados.",
        prazoSprint: "2026-11-25T23:59:59.000Z",
        tarefasCount: 3,
        tarefasConcluidasCount: 0,
      },
    ],
    tarefas: [
      initialProfessorTasksMock[0],
      initialProfessorTasksMock[1],
      initialProfessorTasksMock[2],
    ],
  },
  {
    id: 2,
    tituloProjeto: "Sistema de Gestão Hospitalar",
    descricao: "Software de triagem médica, prontuário eletrônico e controle de leitos hospitalares em tempo real.",
    prazo: "2026-12-15T23:59:59.000Z",
    tokenGithub: "github.com/turma-a/gestao-hospitalar",
    classId: 1,
    usuarios: [
      {
        usuario: { id: 3, nome: "Gabriel Martins", email: "gabriel.martins@escola.edu.br" },
        funcaoProjeto: { id: 1, tituloFuncaoProjeto: "Full Stack Developer" },
      },
      {
        usuario: { id: 4, nome: "Juliana Costa", email: "juliana.costa@escola.edu.br" },
        funcaoProjeto: { id: 3, tituloFuncaoProjeto: "UI/UX Designer" },
      },
    ],
    sprints: [
      {
        id: 3,
        tituloSprint: "Sprint 1 — Cadastro de Pacientes",
        descricaoSprint: "Fluxo de registro e busca rápida de históricos de pacientes.",
        prazoSprint: "2026-11-12T23:59:59.000Z",
        tarefasCount: 2,
        tarefasConcluidasCount: 1,
      },
      {
        id: 4,
        tituloSprint: "Sprint 2 — Painel de Agendamentos",
        descricaoSprint: "Calendário interativo para médicos e atendentes.",
        prazoSprint: "2026-11-28T23:59:59.000Z",
        tarefasCount: 2,
        tarefasConcluidasCount: 0,
      },
    ],
    tarefas: [
      initialProfessorTasksMock[3],
    ],
  },
  {
    id: 3,
    tituloProjeto: "App Mobile de Entregas Rápidas",
    descricao: "Aplicativo corporativo de logística reversa e rastreamento de entregas urbanas com mapa ao vivo.",
    prazo: "2026-12-20T23:59:59.000Z",
    tokenGithub: "github.com/turma-b/entregas-rapidas",
    classId: 2,
    usuarios: [
      {
        usuario: { id: 5, nome: "Rodrigo Silveira", email: "rodrigo.silveira@escola.edu.br" },
        funcaoProjeto: { id: 1, tituloFuncaoProjeto: "Mobile Developer" },
      },
    ],
    sprints: [
      {
        id: 5,
        tituloSprint: "Sprint 1 — Rastreamento GPS",
        descricaoSprint: "Mapeamento em tempo real da posição do entregador.",
        prazoSprint: "2026-11-15T23:59:59.000Z",
        tarefasCount: 1,
        tarefasConcluidasCount: 0,
      },
    ],
    tarefas: [
      initialProfessorTasksMock[4],
    ],
  },
];
