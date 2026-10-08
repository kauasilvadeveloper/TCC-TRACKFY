BEGIN;

-- ============================================================
-- LIMPEZA
-- ============================================================

TRUNCATE TABLE
    "comentario",
    "arquivo",
    "armazenamento",
    "tarefa_usuario",
    "tarefa",
    "coluna",
    "kanban",
    "projeto_sprint",
    "projeto_usuario",
    "sprint",
    "funcao_projeto",
    "usuario_sala",
    "projeto",
    "sala",
    "usuario"
RESTART IDENTITY CASCADE;


-- ============================================================
-- SALAS
-- ============================================================

INSERT INTO "sala" (
    "id",
    "ano_encerramento"
) VALUES
    (1, 2026),
    (2, 2027),
    (3, 2028);


-- ============================================================
-- USUÁRIOS
-- ============================================================

INSERT INTO "usuario" (
    "id_usuario",
    "nome",
    "email",
    "senha",
    "cargo_escola"
) VALUES
    (
        1,
        'Giovani Bossert',
        'giovani@example.com',
        '$2b$10$exampleHashGiovani',
        'Administrador'
    ),
    (
        2,
        'Ana Souza',
        'ana@example.com',
        '$2b$10$exampleHashAna',
        'Professora'
    ),
    (
        3,
        'Carlos Oliveira',
        'carlos@example.com',
        '$2b$10$exampleHashCarlos',
        'Professor'
    ),
    (
        4,
        'Mariana Santos',
        'mariana@example.com',
        '$2b$10$exampleHashMariana',
        'Coordenadora'
    ),
    (
        5,
        'Lucas Almeida',
        'lucas@example.com',
        '$2b$10$exampleHashLucas',
        'Aluno'
    ),
    (
        6,
        'Beatriz Lima',
        'beatriz@example.com',
        '$2b$10$exampleHashBeatriz',
        'Aluna'
    );


-- ============================================================
-- USUÁRIOS NAS SALAS
-- ============================================================

INSERT INTO "usuario_sala" (
    "FK_sala",
    "FK_usuario"
) VALUES
    (1, 1),
    (1, 2),
    (1, 3),
    (1, 5),
    (1, 6),
    (2, 4),
    (2, 5),
    (2, 6),
    (3, 1),
    (3, 4);


-- ============================================================
-- FUNÇÕES DOS PROJETOS
-- ============================================================

INSERT INTO "funcao_projeto" (
    "id_funcao",
    "titulo_funcao_projeto",
    "descricao_funcao_projeto"
) VALUES
    (
        1,
        'Product Owner',
        'Responsável pela definição dos requisitos e prioridades do projeto.'
    ),
    (
        2,
        'Scrum Master',
        'Responsável por facilitar o processo e remover impedimentos.'
    ),
    (
        3,
        'Desenvolvedor',
        'Responsável pelo desenvolvimento e implementação das funcionalidades.'
    ),
    (
        4,
        'Designer',
        'Responsável pela interface, experiência do usuário e identidade visual.'
    ),
    (
        5,
        'Analista',
        'Responsável pela análise de requisitos, processos e documentação.'
    );


-- ============================================================
-- PROJETOS
-- ============================================================

INSERT INTO "projeto" (
    "id_projeto",
    "titulo_projeto",
    "descricao_projeto",
    "prazo",
    "token_github"
) VALUES
    (
        1,
        'Sistema de Gestão Escolar',
        'Plataforma para gerenciamento de projetos, tarefas, alunos e professores.',
        '2026-12-15',
        'github_token_example_123'
    ),
    (
        2,
        'Aplicativo de Biblioteca',
        'Sistema para gerenciamento do acervo e empréstimos da biblioteca escolar.',
        '2027-05-30',
        NULL
    ),
    (
        3,
        'Portal do Aluno',
        'Portal integrado para alunos acompanharem atividades, notas e projetos.',
        '2027-08-20',
        'github_token_example_456'
    );


-- ============================================================
-- USUÁRIOS DOS PROJETOS
-- ============================================================

INSERT INTO "projeto_usuario" (
    "FK_projeto",
    "FK_usuario",
    "FK_funcao_projeto"
) VALUES
    (1, 1, 1),
    (1, 2, 2),
    (1, 3, 3),
    (1, 4, 4),
    (1, 5, 3),
    (2, 4, 1),
    (2, 3, 3),
    (2, 6, 5),
    (3, 1, 1),
    (3, 2, 5),
    (3, 5, 3),
    (3, 6, 4);


-- ============================================================
-- SPRINTS
-- ============================================================

INSERT INTO "sprint" (
    "id_sprint",
    "titulo_sprint",
    "descricao_sprint",
    "prazo_sprint"
) VALUES
    (
        1,
        'Sprint 01 - Planejamento',
        'Levantamento de requisitos e definição da arquitetura inicial.',
        '2026-10-20 23:59:59'
    ),
    (
        2,
        'Sprint 02 - Desenvolvimento',
        'Desenvolvimento das principais funcionalidades do sistema.',
        '2026-11-10 23:59:59'
    ),
    (
        3,
        'Sprint 03 - Interface',
        'Desenvolvimento e refinamento das interfaces.',
        '2026-11-30 23:59:59'
    ),
    (
        4,
        'Sprint 04 - Testes',
        'Testes, correções e validação do sistema.',
        '2026-12-10 23:59:59'
    ),
    (
        5,
        'Sprint Biblioteca',
        'Desenvolvimento do sistema de biblioteca.',
        '2027-04-30 23:59:59'
    );


-- ============================================================
-- PROJETOS <-> SPRINTS
-- ============================================================

INSERT INTO "projeto_sprint" (
    "FK_projeto",
    "FK_sprint"
) VALUES
    (1, 1),
    (1, 2),
    (1, 3),
    (1, 4),
    (2, 5);


-- ============================================================
-- KANBANS
-- ============================================================

INSERT INTO "kanban" (
    "id_kanban",
    "titulo_kanban",
    "descricao_kanban",
    "FK_projeto"
) VALUES
    (
        1,
        'Kanban Principal',
        'Quadro principal de desenvolvimento do Sistema de Gestão Escolar.',
        1
    ),
    (
        2,
        'Kanban Biblioteca',
        'Quadro de desenvolvimento do aplicativo de biblioteca.',
        2
    ),
    (
        3,
        'Kanban Portal',
        'Quadro de desenvolvimento do Portal do Aluno.',
        3
    );


-- ============================================================
-- COLUNAS DO KANBAN
-- ============================================================

INSERT INTO "coluna" (
    "id_coluna",
    "titulo_coluna",
    "descricao_coluna",
    "ordem",
    "FK_kanban"
) VALUES
    (
        1,
        'Backlog',
        'Tarefas que ainda precisam ser iniciadas.',
        '1',
        1
    ),
    (
        2,
        'A Fazer',
        'Tarefas planejadas para desenvolvimento.',
        '2',
        1
    ),
    (
        3,
        'Em Desenvolvimento',
        'Tarefas atualmente em desenvolvimento.',
        '3',
        1
    ),
    (
        4,
        'Em Revisão',
        'Tarefas aguardando revisão.',
        '4',
        1
    ),
    (
        5,
        'Concluído',
        'Tarefas finalizadas.',
        '5',
        1
    ),
    (
        6,
        'Backlog',
        'Tarefas pendentes da biblioteca.',
        '1',
        2
    ),
    (
        7,
        'Desenvolvimento',
        'Tarefas em desenvolvimento.',
        '2',
        2
    ),
    (
        8,
        'Concluído',
        'Tarefas concluídas.',
        '3',
        2
    ),
    (
        9,
        'Backlog',
        'Tarefas pendentes do portal.',
        '1',
        3
    ),
    (
        10,
        'Em Desenvolvimento',
        'Tarefas em desenvolvimento.',
        '2',
        3
    ),
    (
        11,
        'Concluído',
        'Tarefas finalizadas.',
        '3',
        3
    );


-- ============================================================
-- TAREFAS
-- ============================================================

INSERT INTO "tarefa" (
    "id_tarefa",
    "status",
    "stack",
    "titulo_tarefa",
    "descricao_tarefa",
    "prazo_tarefa",
    "FK_coluna",
    "FK_sprint"
) VALUES

    (
        1,
        'PENDENTE',
        'Backend',
        'Criar API de autenticação',
        'Implementar login, logout e autenticação dos usuários.',
        '2026-10-15 23:59:59',
        2,
        1
    ),

    (
        2,
        'EM_ANDAMENTO',
        'Backend',
        'Criar API de projetos',
        'Implementar endpoints para criação, edição e consulta de projetos.',
        '2026-10-25 23:59:59',
        3,
        2
    ),

    (
        3,
        'EM_ANDAMENTO',
        'Frontend',
        'Criar dashboard',
        'Desenvolver dashboard principal para gerenciamento dos projetos.',
        '2026-11-05 23:59:59',
        3,
        2
    ),

    (
        4,
        'PENDENTE',
        'Frontend',
        'Tela de gerenciamento de tarefas',
        'Criar interface para visualizar e editar tarefas.',
        '2026-11-15 23:59:59',
        2,
        3
    ),

    (
        5,
        'EM_REVISAO',
        'UI/UX',
        'Revisar identidade visual',
        'Revisar componentes e identidade visual do sistema.',
        '2026-11-20 23:59:59',
        4,
        3
    ),

    (
        6,
        'CONCLUIDO',
        'Database',
        'Modelar banco de dados',
        'Criar estrutura inicial do banco de dados.',
        '2026-10-05 23:59:59',
        5,
        1
    ),

    (
        7,
        'CONCLUIDO',
        'Backend',
        'Configurar Prisma',
        'Configurar Prisma ORM e conexão com PostgreSQL.',
        '2026-10-07 23:59:59',
        5,
        1
    ),

    (
        8,
        'PENDENTE',
        'Backend',
        'Criar API de livros',
        'Criar endpoints para cadastro e consulta de livros.',
        '2027-04-10 23:59:59',
        6,
        5
    ),

    (
        9,
        'EM_ANDAMENTO',
        'Frontend',
        'Tela de empréstimos',
        'Criar interface para controle de empréstimos.',
        '2027-04-20 23:59:59',
        7,
        5
    ),

    (
        10,
        'CONCLUIDO',
        'Database',
        'Criar banco da biblioteca',
        'Estruturar banco de dados do aplicativo.',
        '2027-03-20 23:59:59',
        8,
        5
    ),

    (
        11,
        'PENDENTE',
        'Frontend',
        'Tela inicial do aluno',
        'Criar dashboard inicial do Portal do Aluno.',
        '2027-07-15 23:59:59',
        9,
        3
    );


-- ============================================================
-- USUÁRIOS DAS TAREFAS
-- ============================================================

INSERT INTO "tarefa_usuario" (
    "FK_tarefa",
    "FK_usuario"
) VALUES
    (1, 3),
    (1, 5),
    (2, 3),
    (3, 5),
    (3, 6),
    (4, 5),
    (5, 6),
    (6, 3),
    (7, 3),
    (8, 3),
    (9, 6),
    (10, 3),
    (11, 5),
    (11, 6);


-- ============================================================
-- COMENTÁRIOS
-- ============================================================

INSERT INTO "comentario" (
    "id_comentario",
    "conteudo",
    "FK_usuario",
    "FK_tarefa"
) VALUES
    (
        1,
        'A API de autenticação já possui a estrutura inicial.',
        3,
        1
    ),
    (
        2,
        'Precisamos validar o fluxo de recuperação de senha.',
        1,
        1
    ),
    (
        3,
        'O endpoint de criação de projetos está funcionando.',
        5,
        2
    ),
    (
        4,
        'Adicionar filtros por status no dashboard.',
        2,
        3
    ),
    (
        5,
        'A interface precisa de alguns ajustes de responsividade.',
        6,
        5
    ),
    (
        6,
        'Banco de dados validado e pronto para integração.',
        3,
        6
    );


-- ============================================================
-- ARMAZENAMENTOS
-- ============================================================

INSERT INTO "armazenamento" (
    "id_armazenamento",
    "titulo_armazenamento",
    "FK_projeto"
) VALUES
    (
        1,
        'Documentação',
        1
    ),
    (
        2,
        'Arquivos do Projeto',
        1
    ),
    (
        3,
        'Documentação Biblioteca',
        2
    ),
    (
        4,
        'Documentação Portal',
        3
    );


-- ============================================================
-- ARQUIVOS
-- ============================================================

INSERT INTO "arquivo" (
    "id_arquivo",
    "data",
    "comentario",
    "titulo_arquivo",
    "FK_armazenamento"
) VALUES
    (
        1,
        '2026-10-01 10:00:00',
        'Documento inicial de requisitos.',
        'Requisitos.pdf',
        1
    ),
    (
        2,
        '2026-10-03 14:30:00',
        'Diagrama da arquitetura do sistema.',
        'Arquitetura.png',
        1
    ),
    (
        3,
        '2026-10-05 09:15:00',
        'Documentação da API.',
        'API.md',
        2
    ),
    (
        4,
        '2027-03-15 11:00:00',
        'Levantamento inicial do acervo.',
        'Acervo.xlsx',
        3
    ),
    (
        5,
        '2027-06-01 16:00:00',
        'Protótipo inicial do portal.',
        'Prototipo.fig',
        4
    );



SELECT setval(
    pg_get_serial_sequence('sala', 'id'),
    COALESCE((SELECT MAX(id) FROM sala), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('usuario', 'id_usuario'),
    COALESCE((SELECT MAX(id_usuario) FROM usuario), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('funcao_projeto', 'id_funcao'),
    COALESCE((SELECT MAX(id_funcao) FROM funcao_projeto), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('projeto', 'id_projeto'),
    COALESCE((SELECT MAX(id_projeto) FROM projeto), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('sprint', 'id_sprint'),
    COALESCE((SELECT MAX(id_sprint) FROM sprint), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('kanban', 'id_kanban'),
    COALESCE((SELECT MAX(id_kanban) FROM kanban), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('coluna', 'id_coluna'),
    COALESCE((SELECT MAX(id_coluna) FROM coluna), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('tarefa', 'id_tarefa'),
    COALESCE((SELECT MAX(id_tarefa) FROM tarefa), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('comentario', 'id_comentario'),
    COALESCE((SELECT MAX(id_comentario) FROM comentario), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('armazenamento', 'id_armazenamento'),
    COALESCE((SELECT MAX(id_armazenamento) FROM armazenamento), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('arquivo', 'id_arquivo'),
    COALESCE((SELECT MAX(id_arquivo) FROM arquivo), 1),
    true
);


COMMIT;