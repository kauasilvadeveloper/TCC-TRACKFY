export interface User {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  cargoEscola?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
    role: string;
    cargoEscola?: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  login: {
    token: string;
    user: User;
  };
}
