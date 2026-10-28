export interface ProfessorClass {
  id: number;
  anoEncerramento: number;
  name?: string;
  shift?: string;
  _count?: {
    usuarios: number;
  };
}

export interface ClassStudent {
  id?: number;
  nome: string;
  email: string;
  sala: number | string;
  cargoEscola?: string;
}

export interface ProfessorTask {
  id: number;
  tituloTarefa: string;
  descricaoTarefa?: string;
  status: "pendente" | "em andamento" | "concluída" | string;
  stack?: string;
  prazoTarefa: string;
  fkColuna?: number;
  fkSprint?: number;
  classId?: number;
}
