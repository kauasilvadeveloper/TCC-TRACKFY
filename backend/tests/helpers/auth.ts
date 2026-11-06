import { sign } from "jsonwebtoken";

interface AuthHeaderOptions {
  role?: string;
  userId?: number;
  email?: string;
}

export function signAuthToken({
  role = "aluno",
  userId = 1,
  email = "aluno@aluno.senai.br",
}: AuthHeaderOptions = {}) {
  const secret = process.env.JWT_SECRET as string;

  return sign({ email, role }, secret, {
    subject: String(userId),
    expiresIn: "1h",
  });
}

export function authHeader(options: AuthHeaderOptions = {}) {
  return {
    Authorization: `Bearer ${signAuthToken(options)}`,
  };
}
