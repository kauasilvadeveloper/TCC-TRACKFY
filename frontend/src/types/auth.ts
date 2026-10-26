export interface User {
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
  }
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  login: {
    token: string;
    user: User;
  }
}
