<div align="center">
  
# TrackFy
  
### *Plataforma Integrada de Gestão de Projetos Acadêmicos para o SENAI*

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)
![Sass](https://img.shields.io/badge/Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white)

---

</div>

## 📌 Sobre o Projeto

O **TrackFy** é um Trabalho de Conclusão de Curso (TCC) desenvolvido para o curso **Técnico em Desenvolvimento de Sistemas do SENAI**. 

O projeto nasce da necessidade de resolver os gargalos recorrentes no planejamento, organização e acompanhamento de trabalhos em equipe realizados pelos alunos. A plataforma oferece um ecossistema completo de gestão com quadros interativos, compartilhamento de arquivos e monitoramento do progresso em tempo real para os professores.

---

## Principais Funcionalidades

-  **Quadro Kanban**: Organização visual de tarefas por colunas (A Fazer, Em Andamento, Concluído) com níveis de prioridade e responsáveis.
-  **Gestão e Compartilhamento de Arquivos**: Centralização de documentos e anexos dentro de cada projeto.
-  **Gestão de Equipes e Permissões**: Controle de acesso por papéis (Alunos, Professores e Administradores).
-  **Acompanhamento Docente**: Visão dedicada para professores visualizarem o progresso das equipes e turmas.
-  **Suporte a Temas Visuais**: Alternância entre Modo Claro (Light) e Escuro (Dark) com foco em acessibilidade (WCAG).

## Equipe de Desenvolvimento

| Integrante | Função no Projeto | GitHub / Contato |
| :--- | :--- | :--- |
| **Pedro Onofre**     | Líder de Projeto                  | [@PedroHOnofre](https://github.com/PedroHOnofre) |
| **Kauã Silva**       | Product Owner / Backend Developer | [@kauasilvadeveloper](https://github.com/kauasilvadeveloper) |
| **Henrique Inácio**  | Frontend Developer                | [@henriqueilima](https://github.com/henriqueilima) |
| **Giovanni Bossert** | UX/UI Designer                    | [@giovanibossert04](https://github.com/giovanibossert04) |
| **Lucas Geraldi**    | Database Developer / DBA          | [@geraldilucas](http://github.com/geraldilucas) |

##  Tecnologias e Arquitetura

O projeto adota uma arquitetura desacoplada, separando as responsabilidades entre **Front-End** e **Back-End** para garantir alta manutenibilidade, performance e segurança.

### 🖥️ Front-End

- **Next.js (App Router)**
  - *Definição:* Framework React para desenvolvimento web completo com suporte a SSR (Server-Side Rendering) e SSG.
  - *Justificativa:* Garante renderização ultra-rápida do dashboard e do Kanban (atendendo aos requisitos RNF11 e RNF12). O roteamento baseado em arquivos simplifica a navegação e a estrutura da aplicação.
- **TypeScript (TS)**
  - *Definição:* Superset do JavaScript aplicado à camada visual de interface.
  - *Justificativa:* Garante consistência nos dados consumidos da API REST, evitando erros de renderização em tempo de execução por propriedades indefinidas ao manipular estados do Kanban e dos usuários.
- **SCSS (SASS)**
  - *Definição:* Pré-processador CSS que adiciona variáveis, aninhamento, mixins e funções.
  - *Justificativa:* Permite estilização modular e facilita a implementação do suporte a Temas Visuais (Light/Dark Mode - RNF16), além do controle rigoroso de contraste e acessibilidade (WCAG - RNF14) via variáveis organizadas.
- **Bun**
  - *Definição:* Gerenciador de pacotes e executor de tarefas moderno do client-side.
  - *Justificativa:* Acelera a instalação de dependências e a execução de builds, mantendo total paridade com o ambiente de execução do servidor.

---

### ⚙️ Back-End

- **Bun**
  - *Definição:* Runtime e gerenciador de pacotes JavaScript/TypeScript ultra-rápido.
  - *Justificativa:* Substitui executores como `ts-node`, reduz o tempo de inicialização da API e otimiza radicalmente o consumo de recursos no desenvolvimento em equipe.
- **TypeScript (TS)**
  - *Definição:* Linguagem tipada que adiciona tipagem estática opcional ao JavaScript.
  - *Justificativa:* Fornece detecção de erros em tempo de compilação, autocompletar avançado (IntelliSense) e maior segurança no desenvolvimento colaborativo da API.
- **Express.js**
  - *Definição:* Framework minimalista para Node.js/Bun focado na construção de APIs RESTful.
  - *Justificativa:* Leveza, alta performance e arquitetura baseada em *middlewares*, facilitando o controle de autenticação (JWT), validações de dados e tratamento global de exceções.
- **PostgreSQL**
  - *Definição:* Sistema de Gerenciamento de Banco de Dados Relacional (SGBD) focado em conformidade ACID.
  - *Justificativa:* Garante a integridade referencial rigorosa (projetos, tarefas, turmas e usuários) por meio de chaves estrangeiras, oferecendo suporte nativo a JSONB e excelente performance em consultas complexas.
- **Prisma (ORM)**
  - *Definição:* Object-Relational Mapping (ORM) moderno para TypeScript.
  - *Justificativa:* Elimina a necessidade de SQL manual suscetível a falhas, garantindo *type-safety* do banco de dados ao código visual, além de simplificar o versionamento do banco via Prisma Migrate.

---
