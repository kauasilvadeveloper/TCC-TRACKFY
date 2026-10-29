import { ProfessorTask } from "@/src/types/professor";

export const initialProfessorTasksMock: ProfessorTask[] = [
  {
    id: 101,
    tituloTarefa: "Projeto Final — Interface Responsiva",
    descricaoTarefa: "Implementação da interface responsiva do portal utilizando Next.js e SCSS Modules.",
    prazoTarefa: "2026-10-05T23:59:59.000Z",
    status: "em andamento",
    stack: "React / Next.js",
    classId: 1,
  },
  {
    id: 102,
    tituloTarefa: "Exercício — Flexbox e Grid",
    descricaoTarefa: "Criação de layouts dinâmicos aplicando display flex e grid moderno.",
    prazoTarefa: "2026-09-28T23:59:59.000Z",
    status: "em andamento",
    stack: "CSS / SCSS",
    classId: 1,
  },
  {
    id: 103,
    tituloTarefa: "Quiz — Fundamentos de CSS",
    descricaoTarefa: "Avaliação conceitual sobre especificidade, cascata e modelo de caixas.",
    prazoTarefa: "2026-09-15T23:59:59.000Z",
    status: "concluída",
    stack: "HTML / CSS",
    classId: 1,
  },
];

