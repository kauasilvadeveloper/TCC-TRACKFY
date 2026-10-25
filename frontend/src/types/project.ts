// src/types/project.ts

export interface ApiProjetoUsuario {
  usuario: {
    id: number;
    nome: string;
    email: string;
  };
  funcaoProjeto: {
    id: number;
    tituloFuncaoProjeto: string;
  };
}

export interface ApiProjeto {
  id: number;
  tituloProjeto: string;
  descricao: string;
  prazo: string;
  tokenGithub: string | null;
  usuarios: ApiProjetoUsuario[];
}
