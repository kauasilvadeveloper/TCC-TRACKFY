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

export interface TaskComment {
  id: number;
  conteudo: string;
  fkTarefa?: number;
  fkUsuario?: number;
  usuario?: {
    id: number;
    nome: string;
    email?: string;
  };
  createdAt?: string;
}

export interface ProfessorSprint {
  id: number;
  tituloSprint: string;
  descricaoSprint?: string | null;
  prazoSprint: string;
  tarefasCount?: number;
  tarefasConcluidasCount?: number;
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
  projectId?: number;
  projectTitle?: string;
  comentarios?: TaskComment[];
  usuarios?: {
    usuario: {
      id: number;
      nome: string;
      email?: string;
    };
  }[];
}

export interface ClassProject {
  id: number;
  tituloProjeto: string;
  descricao: string;
  prazo: string;
  tokenGithub?: string | null;
  classId?: number;
  usuarios?: {
    fkUsuario?: number;
    usuario?: {
      id: number;
      nome: string;
      email?: string;
    };
    funcaoProjeto?: {
      id: number;
      tituloFuncaoProjeto: string;
    };
  }[];
  sprints?: ProfessorSprint[];
  tarefas?: ProfessorTask[];
}

export interface RawClassResponse {
  id: number;
  anoEncerramento: number;
  _count?: {
    usuarios: number;
  };
}

export interface RawUserItem {
  fkSala?: number;
  fkUsuario?: number;
  usuario?: {
    id: number;
    nome?: string;
    name?: string;
    email?: string;
    cargoEscola?: string;
    cargo_escola?: string;
  };
  id?: number;
  nome?: string;
  name?: string;
  email?: string;
  cargoEscola?: string;
  cargo_escola?: string;
}

export interface RawProjectItem {
  id: number;
  tituloProjeto: string;
  descricao: string;
  prazo: string;
  tokenGithub?: string | null;
  usuarios?: {
    fkUsuario?: number;
    usuario?: {
      id: number;
      nome: string;
      email?: string;
    };
    funcaoProjeto?: {
      id: number;
      tituloFuncaoProjeto: string;
    };
  }[];
}

export interface RawSprintItem {
  id: number;
  tituloSprint: string;
  descricaoSprint?: string | null;
  prazoSprint: string;
}

export interface RawCommentItem {
  id: number;
  conteudo: string;
  usuario?: {
    id: number;
    nome: string;
    email?: string;
  };
  createdAt?: string;
}

export interface RawTaskItem {
  id: number;
  tituloTarefa: string;
  descricaoTarefa?: string;
  status: string;
  stack: string;
  prazoTarefa: string;
  comentarios?: RawCommentItem[];
}

export interface RawColumnItem {
  id: number;
  tituloColuna: string;
  tarefas?: RawTaskItem[];
}
