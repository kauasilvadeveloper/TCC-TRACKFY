-- CreateTable
CREATE TABLE "sala" (
    "id" SERIAL NOT NULL,
    "ano_encerramento" INTEGER NOT NULL,

    CONSTRAINT "sala_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "cargo_escola" TEXT,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "funcao_projeto" (
    "id_funcao" SERIAL NOT NULL,
    "titulo_funcao_projeto" TEXT NOT NULL,
    "descricao_funcao_projeto" TEXT NOT NULL,

    CONSTRAINT "funcao_projeto_pkey" PRIMARY KEY ("id_funcao")
);

-- CreateTable
CREATE TABLE "projeto" (
    "id_projeto" SERIAL NOT NULL,
    "titulo_projeto" TEXT NOT NULL,
    "descricao_projeto" TEXT NOT NULL,
    "prazo" DATE NOT NULL,
    "token_github" TEXT,

    CONSTRAINT "projeto_pkey" PRIMARY KEY ("id_projeto")
);

-- CreateTable
CREATE TABLE "sprint" (
    "id_sprint" SERIAL NOT NULL,
    "titulo_sprint" TEXT NOT NULL,
    "descricao_sprint" TEXT,
    "prazo_sprint" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sprint_pkey" PRIMARY KEY ("id_sprint")
);

-- CreateTable
CREATE TABLE "kanban" (
    "id_kanban" SERIAL NOT NULL,
    "titulo_kanban" TEXT NOT NULL,
    "descricao_kanban" TEXT,
    "FK_projeto" INTEGER NOT NULL,

    CONSTRAINT "kanban_pkey" PRIMARY KEY ("id_kanban")
);

-- CreateTable
CREATE TABLE "coluna" (
    "id_coluna" SERIAL NOT NULL,
    "titulo_coluna" TEXT NOT NULL,
    "descricao_coluna" TEXT,
    "ordem" TEXT NOT NULL,
    "FK_kanban" INTEGER NOT NULL,

    CONSTRAINT "coluna_pkey" PRIMARY KEY ("id_coluna")
);

-- CreateTable
CREATE TABLE "tarefa" (
    "id_tarefa" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "stack" TEXT NOT NULL,
    "titulo_tarefa" TEXT NOT NULL,
    "descricao_tarefa" TEXT,
    "prazo_tarefa" TIMESTAMP(3) NOT NULL,
    "FK_coluna" INTEGER NOT NULL,
    "FK_sprint" INTEGER NOT NULL,

    CONSTRAINT "tarefa_pkey" PRIMARY KEY ("id_tarefa")
);

-- CreateTable
CREATE TABLE "comentario" (
    "id_comentario" SERIAL NOT NULL,
    "conteudo" TEXT NOT NULL,
    "FK_usuario" INTEGER NOT NULL,
    "FK_tarefa" INTEGER NOT NULL,

    CONSTRAINT "comentario_pkey" PRIMARY KEY ("id_comentario")
);

-- CreateTable
CREATE TABLE "armazenamento" (
    "id_armazenamento" SERIAL NOT NULL,
    "titulo_armazenamento" TEXT NOT NULL,
    "FK_projeto" INTEGER NOT NULL,

    CONSTRAINT "armazenamento_pkey" PRIMARY KEY ("id_armazenamento")
);

-- CreateTable
CREATE TABLE "arquivo" (
    "id_arquivo" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "comentario" TEXT,
    "titulo_arquivo" TEXT NOT NULL,
    "FK_armazenamento" INTEGER NOT NULL,

    CONSTRAINT "arquivo_pkey" PRIMARY KEY ("id_arquivo")
);

-- CreateTable
CREATE TABLE "projeto_usuario" (
    "FK_projeto" INTEGER NOT NULL,
    "FK_usuario" INTEGER NOT NULL,
    "FK_funcao_projeto" INTEGER NOT NULL,

    CONSTRAINT "projeto_usuario_pkey" PRIMARY KEY ("FK_projeto","FK_usuario","FK_funcao_projeto")
);

-- CreateTable
CREATE TABLE "tarefa_usuario" (
    "FK_tarefa" INTEGER NOT NULL,
    "FK_usuario" INTEGER NOT NULL,

    CONSTRAINT "tarefa_usuario_pkey" PRIMARY KEY ("FK_tarefa","FK_usuario")
);

-- CreateTable
CREATE TABLE "projeto_sprint" (
    "FK_projeto" INTEGER NOT NULL,
    "FK_sprint" INTEGER NOT NULL,

    CONSTRAINT "projeto_sprint_pkey" PRIMARY KEY ("FK_projeto","FK_sprint")
);

-- CreateTable
CREATE TABLE "usuario_sala" (
    "FK_sala" INTEGER NOT NULL,
    "FK_usuario" INTEGER NOT NULL,

    CONSTRAINT "usuario_sala_pkey" PRIMARY KEY ("FK_sala","FK_usuario")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "funcao_projeto_titulo_funcao_projeto_descricao_funcao_proje_key" ON "funcao_projeto"("titulo_funcao_projeto", "descricao_funcao_projeto");

-- AddForeignKey
ALTER TABLE "kanban" ADD CONSTRAINT "kanban_FK_projeto_fkey" FOREIGN KEY ("FK_projeto") REFERENCES "projeto"("id_projeto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coluna" ADD CONSTRAINT "coluna_FK_kanban_fkey" FOREIGN KEY ("FK_kanban") REFERENCES "kanban"("id_kanban") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefa" ADD CONSTRAINT "tarefa_FK_coluna_fkey" FOREIGN KEY ("FK_coluna") REFERENCES "coluna"("id_coluna") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefa" ADD CONSTRAINT "tarefa_FK_sprint_fkey" FOREIGN KEY ("FK_sprint") REFERENCES "sprint"("id_sprint") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentario" ADD CONSTRAINT "comentario_FK_usuario_fkey" FOREIGN KEY ("FK_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentario" ADD CONSTRAINT "comentario_FK_tarefa_fkey" FOREIGN KEY ("FK_tarefa") REFERENCES "tarefa"("id_tarefa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "armazenamento" ADD CONSTRAINT "armazenamento_FK_projeto_fkey" FOREIGN KEY ("FK_projeto") REFERENCES "projeto"("id_projeto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arquivo" ADD CONSTRAINT "arquivo_FK_armazenamento_fkey" FOREIGN KEY ("FK_armazenamento") REFERENCES "armazenamento"("id_armazenamento") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projeto_usuario" ADD CONSTRAINT "projeto_usuario_FK_projeto_fkey" FOREIGN KEY ("FK_projeto") REFERENCES "projeto"("id_projeto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projeto_usuario" ADD CONSTRAINT "projeto_usuario_FK_usuario_fkey" FOREIGN KEY ("FK_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projeto_usuario" ADD CONSTRAINT "projeto_usuario_FK_funcao_projeto_fkey" FOREIGN KEY ("FK_funcao_projeto") REFERENCES "funcao_projeto"("id_funcao") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefa_usuario" ADD CONSTRAINT "tarefa_usuario_FK_tarefa_fkey" FOREIGN KEY ("FK_tarefa") REFERENCES "tarefa"("id_tarefa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefa_usuario" ADD CONSTRAINT "tarefa_usuario_FK_usuario_fkey" FOREIGN KEY ("FK_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projeto_sprint" ADD CONSTRAINT "projeto_sprint_FK_projeto_fkey" FOREIGN KEY ("FK_projeto") REFERENCES "projeto"("id_projeto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projeto_sprint" ADD CONSTRAINT "projeto_sprint_FK_sprint_fkey" FOREIGN KEY ("FK_sprint") REFERENCES "sprint"("id_sprint") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_sala" ADD CONSTRAINT "usuario_sala_FK_sala_fkey" FOREIGN KEY ("FK_sala") REFERENCES "sala"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_sala" ADD CONSTRAINT "usuario_sala_FK_usuario_fkey" FOREIGN KEY ("FK_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;
