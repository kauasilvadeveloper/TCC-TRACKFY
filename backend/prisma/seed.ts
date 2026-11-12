import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper para gerar datas relativas a hoje (mantém sprints e tarefas sempre atuais)
function addDays(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function main() {
  console.log("🌱 Iniciando seed do banco de dados Trackfy...");

  // 1. Limpeza segura respeitando a ordem de dependências
  await prisma.comentario.deleteMany();
  await prisma.arquivo.deleteMany();
  await prisma.armazenamento.deleteMany();
  await prisma.tarefaUsuario.deleteMany();
  await prisma.tarefa.deleteMany();
  await prisma.coluna.deleteMany();
  await prisma.kanban.deleteMany();
  await prisma.projetoSprint.deleteMany();
  await prisma.sprint.deleteMany();
  await prisma.projetoUsuario.deleteMany();
  await prisma.projeto.deleteMany();
  await prisma.funcaoProjeto.deleteMany();
  await prisma.usuarioSala.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.sala.deleteMany();

  // 2. Criação das Salas (Turmas)
  const sala2026 = await prisma.sala.create({
    data: { anoEncerramento: 2026 },
  });

  const sala2027 = await prisma.sala.create({
    data: { anoEncerramento: 2027 },
  });

  // 3. Criação dos Usuários com os domínios institucionais
  // Senha padrão para login nos testes: "Senha@123"
  const senhaHash = await bcrypt.hash("Senha@123", 10);

  const coordenador = await prisma.usuario.create({
    data: {
      nome: "Roberto Almeida",
      email: "roberto.almeida@coordenador.senai.br",
      senha: senhaHash,
      cargoEscola: "Coordenador",
    },
  });

  const docente1 = await prisma.usuario.create({
    data: {
      nome: "Camila Ferreira",
      email: "camila.ferreira@docente.senai.br",
      senha: senhaHash,
      cargoEscola: "Professor",
    },
  });

  const docente2 = await prisma.usuario.create({
    data: {
      nome: "Marcos Vinícius Silva",
      email: "marcos.silva@docente.senai.br",
      senha: senhaHash,
      cargoEscola: "Professor",
    },
  });

  const aluno1 = await prisma.usuario.create({
    data: {
      nome: "Lucas Santos",
      email: "lucas.santos@aluno.senai.br",
      senha: senhaHash,
      cargoEscola: "Aluno",
    },
  });

  const aluno2 = await prisma.usuario.create({
    data: {
      nome: "Mariana Costa",
      email: "mariana.costa@aluno.senai.br",
      senha: senhaHash,
      cargoEscola: "Aluno",
    },
  });

  const aluno3 = await prisma.usuario.create({
    data: {
      nome: "Gabriel Oliveira",
      email: "gabriel.oliveira@aluno.senai.br",
      senha: senhaHash,
      cargoEscola: "Aluno",
    },
  });

  const alunoSesi1 = await prisma.usuario.create({
    data: {
      nome: "Juliana Mendes",
      email: "juliana.mendes@portalsesisp.org.br",
      senha: senhaHash,
      cargoEscola: "Aluno",
    },
  });

  const alunoSesi2 = await prisma.usuario.create({
    data: {
      nome: "Rafael Souza",
      email: "rafael.souza@portalsesisp.org.br",
      senha: senhaHash,
      cargoEscola: "Aluno",
    },
  });

  // 4. Vínculo Usuário <-> Sala
  await prisma.usuarioSala.createMany({
    data: [
      { fkSala: sala2026.id, fkUsuario: coordenador.id },
      { fkSala: sala2026.id, fkUsuario: docente1.id },
      { fkSala: sala2026.id, fkUsuario: aluno1.id },
      { fkSala: sala2026.id, fkUsuario: aluno2.id },
      { fkSala: sala2026.id, fkUsuario: aluno3.id },
      { fkSala: sala2026.id, fkUsuario: alunoSesi1.id },
      { fkSala: sala2027.id, fkUsuario: docente2.id },
      { fkSala: sala2027.id, fkUsuario: alunoSesi2.id },
    ],
  });

  // 5. Funções de Projeto
  const funcLider = await prisma.funcaoProjeto.create({
    data: {
      tituloFuncaoProjeto: "Líder Técnico / Scrum Master",
      descricaoFuncaoProjeto:
        "Responsável pela organização das sprints, revisão de PRs e arquitetura.",
    },
  });

  const funcFullStack = await prisma.funcaoProjeto.create({
    data: {
      tituloFuncaoProjeto: "Desenvolvedor Full Stack",
      descricaoFuncaoProjeto:
        "Atua no desenvolvimento de interfaces React/Next.js e APIs Node.js.",
    },
  });

  const funcBackend = await prisma.funcaoProjeto.create({
    data: {
      tituloFuncaoProjeto: "Desenvolvedor Back-end",
      descricaoFuncaoProjeto:
        "Responsável pela modelagem de banco de dados, regras de negócio e integrações.",
    },
  });

  const funcOrientador = await prisma.funcaoProjeto.create({
    data: {
      tituloFuncaoProjeto: "Orientador Docente",
      descricaoFuncaoProjeto:
        "Acompanha as entregas, valida prazos e avalia o desempenho da equipe.",
    },
  });

  // 6. Criação dos Projetos
  const projetoTrackfy = await prisma.projeto.create({
    data: {
      tituloProjeto: "Trackfy - Gestão Ágil & Métricas GitHub",
      descricao:
        "Plataforma acadêmica para gestão de projetos com Kanban, Sprints e análise de produtividade via API do GitHub.",
      prazo: addDays(45),
      tokenGithub: "facebook/react", // Repositório público válido para testar os gráficos imediatamente
    },
  });

  const projetoIot = await prisma.projeto.create({
    data: {
      tituloProjeto: "SmartLab SENAI - Monitoramento IoT",
      descricao:
        "Sistema de telemetria e controle energético para laboratórios de manufatura avançada.",
      prazo: addDays(60),
      tokenGithub: "vercel/next.js",
    },
  });

  // 7. Vínculo Projeto <-> Usuário <-> Função
  await prisma.projetoUsuario.createMany({
    data: [
      {
        fkProjeto: projetoTrackfy.id,
        fkUsuario: docente1.id,
        fkFuncaoProjeto: funcOrientador.id,
      },
      {
        fkProjeto: projetoTrackfy.id,
        fkUsuario: coordenador.id,
        fkFuncaoProjeto: funcOrientador.id,
      },
      {
        fkProjeto: projetoTrackfy.id,
        fkUsuario: aluno1.id,
        fkFuncaoProjeto: funcLider.id,
      },
      {
        fkProjeto: projetoTrackfy.id,
        fkUsuario: aluno2.id,
        fkFuncaoProjeto: funcFullStack.id,
      },
      {
        fkProjeto: projetoTrackfy.id,
        fkUsuario: aluno3.id,
        fkFuncaoProjeto: funcBackend.id,
      },
      {
        fkProjeto: projetoTrackfy.id,
        fkUsuario: alunoSesi1.id,
        fkFuncaoProjeto: funcFullStack.id,
      },
      {
        fkProjeto: projetoIot.id,
        fkUsuario: docente2.id,
        fkFuncaoProjeto: funcOrientador.id,
      },
      {
        fkProjeto: projetoIot.id,
        fkUsuario: alunoSesi2.id,
        fkFuncaoProjeto: funcLider.id,
      },
    ],
  });

  // 8. Sprints & Vínculo com Projeto
  const sprint1 = await prisma.sprint.create({
    data: {
      tituloSprint: "Sprint 1 - Modelagem e Autenticação",
      descricaoSprint:
        "Levantamento de requisitos, schema Prisma e fluxo de autenticação JWT.",
      prazoSprint: addDays(-7), // Sprint encerrada
    },
  });

  const sprint2 = await prisma.sprint.create({
    data: {
      tituloSprint: "Sprint 2 - Kanban e Integração GitHub",
      descricaoSprint:
        "Implementação do quadro Kanban drag-and-drop e dashboard analítico do Octokit.",
      prazoSprint: addDays(10), // Sprint ativa
    },
  });

  const sprint3 = await prisma.sprint.create({
    data: {
      tituloSprint: "Sprint 3 - Relatórios e Entrega Final",
      descricaoSprint:
        "Refinamento de UI, testes automatizados e preparação para banca.",
      prazoSprint: addDays(28),
    },
  });

  await prisma.projetoSprint.createMany({
    data: [
      { fkProjeto: projetoTrackfy.id, fkSprint: sprint1.id },
      { fkProjeto: projetoTrackfy.id, fkSprint: sprint2.id },
      { fkProjeto: projetoTrackfy.id, fkSprint: sprint3.id },
      { fkProjeto: projetoIot.id, fkSprint: sprint2.id },
    ],
  });

  // 9. Kanbans e Colunas
  const kanbanPrincipal = await prisma.kanban.create({
    data: {
      tituloKanban: "Quadro Principal - Desenvolvimento",
      descricaoKanban: "Fluxo contínuo de tarefas da equipe de engenharia.",
      fkProjeto: projetoTrackfy.id,
    },
  });

  const colAFazer = await prisma.coluna.create({
    data: {
      tituloColuna: "A Fazer",
      descricaoColuna: "Tarefas priorizadas para a sprint atual",
      ordem: "1",
      fkKanban: kanbanPrincipal.id,
    },
  });

  const colEmAndamento = await prisma.coluna.create({
    data: {
      tituloColuna: "Em Andamento",
      descricaoColuna: "Atividades em desenvolvimento ativo",
      ordem: "2",
      fkKanban: kanbanPrincipal.id,
    },
  });

  const colConcluido = await prisma.coluna.create({
    data: {
      tituloColuna: "Concluído",
      descricaoColuna: "Entregas finalizadas e revisadas",
      ordem: "3",
      fkKanban: kanbanPrincipal.id,
    },
  });

  // 10. Tarefas
  const tarefa1 = await prisma.tarefa.create({
    data: {
      tituloTarefa: "Configurar schema Prisma e autenticação JWT",
      descricaoTarefa:
        "Criar modelos relacionais no PostgreSQL e middleware de validação de token.",
      status: "Concluído",
      stack: "Node.js / Prisma",
      prazoTarefa: addDays(-8),
      fkColuna: colConcluido.id,
      fkSprint: sprint1.id,
    },
  });

  const tarefa2 = await prisma.tarefa.create({
    data: {
      tituloTarefa: "Desenvolver endpoint de métricas com Octokit",
      descricaoTarefa:
        "Agrupar commits semânticos, lead time de PRs e atividade por desenvolvedor.",
      status: "Concluído",
      stack: "Node.js / Prisma",
      prazoTarefa: addDays(2),
      fkColuna: colConcluido.id,
      fkSprint: sprint2.id,
    },
  });

  const tarefa3 = await prisma.tarefa.create({
    data: {
      tituloTarefa: "Construir gráficos analíticos com Recharts",
      descricaoTarefa:
        "Implementar área de cadência, rosca por branch e heatmap de horários.",
      status: "Em Andamento",
      stack: "React / Next.js",
      prazoTarefa: addDays(6),
      fkColuna: colEmAndamento.id,
      fkSprint: sprint2.id,
    },
  });

  const tarefa4 = await prisma.tarefa.create({
    data: {
      tituloTarefa: "Implementar filtro de branches no dashboard",
      descricaoTarefa:
        "Permitir alternar a distribuição de trabalho conforme a branch selecionada.",
      status: "Em Andamento",
      stack: "React / Next.js",
      prazoTarefa: addDays(8),
      fkColuna: colEmAndamento.id,
      fkSprint: sprint2.id,
    },
  });

  const tarefa5 = await prisma.tarefa.create({
    data: {
      tituloTarefa: "Adicionar exportação de relatório em PDF para docentes",
      descricaoTarefa:
        "Gerar resumo executivo da sprint para avaliação do professor orientador.",
      status: "A Fazer",
      stack: "Full Stack",
      prazoTarefa: addDays(20),
      fkColuna: colAFazer.id,
      fkSprint: sprint3.id,
    },
  });

  // 11. Atribuição de Usuários às Tarefas
  await prisma.tarefaUsuario.createMany({
    data: [
      { fkTarefa: tarefa1.id, fkUsuario: aluno3.id },
      { fkTarefa: tarefa2.id, fkUsuario: aluno1.id },
      { fkTarefa: tarefa2.id, fkUsuario: aluno3.id },
      { fkTarefa: tarefa3.id, fkUsuario: aluno2.id },
      { fkTarefa: tarefa4.id, fkUsuario: alunoSesi1.id },
      { fkTarefa: tarefa5.id, fkUsuario: aluno1.id },
      { fkTarefa: tarefa5.id, fkUsuario: aluno2.id },
    ],
  });

  // 12. Comentários nas Tarefas
  await prisma.comentario.createMany({
    data: [
      {
        conteudo:
          "Excelente estruturação das métricas por desenvolvedor! Lembrem de testar também com repositórios privados usando Fine-Grained Token.",
        fkUsuario: docente1.id,
        fkTarefa: tarefa2.id,
      },
      {
        conteudo:
          "Suporte a token privado e filtro por branch já validados e integrados na branch main.",
        fkUsuario: aluno1.id,
        fkTarefa: tarefa2.id,
      },
      {
        conteudo:
          "Ajustei as cores do Recharts para responderem automaticamente ao tema dark/light.",
        fkUsuario: aluno2.id,
        fkTarefa: tarefa3.id,
      },
    ],
  });

  // 13. Armazenamento e Arquivos do Projeto
  const armazenamentoDocs = await prisma.armazenamento.create({
    data: {
      tituloArmazenamento: "Documentação Técnica & Entregáveis TCC",
      fkProjeto: projetoTrackfy.id,
    },
  });

  await prisma.arquivo.createMany({
    data: [
      {
        tituloArquivo: "MER_Banco_De_Dados_Trackfy.pdf",
        comentario: "Modelo Entidade-Relacionamento aprovado na Sprint 1.",
        data: addDays(-10),
        fkArmazenamento: armazenamentoDocs.id,
      },
      {
        tituloArquivo: "Arquitetura_API_GitHub_Octokit.pdf",
        comentario: "Especificação dos endpoints e payloads analíticos.",
        data: addDays(-2),
        fkArmazenamento: armazenamentoDocs.id,
      },
    ],
  });

  console.log("✅ Seed concluído com sucesso!");
  console.log("🔑 Senha padrão de todos os usuários: Senha@123");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
