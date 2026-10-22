import { compare } from "bcryptjs";
import { sign, SignOptions } from "jsonwebtoken";
import { prisma } from "../../prisma";
import { AppError } from "../../errors/AppError";

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthUserResponse {
  user: {
    id: string | number;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

export interface UserPayload {
  id: string | number;
  email: string;
  role: string;
}

export function generateAccessToken(user: UserPayload, secret: string): string {
  const options: SignOptions = {
    subject: String(user.id),
    expiresIn: "1h",
  };

  const payload = {
    email: user.email,
    role: user.role,
  };

  return sign(payload, secret, options);
}

export class AuthUserService {
  async execute({ email, password }: AuthRequest): Promise<AuthUserResponse> {
    const user = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError("Credenciais inválidas.", 401);
    }

    const passwordMatch = await compare(password, user.senha);

    if (!passwordMatch) {
      throw new AppError("Credenciais inválidas.", 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("FATAL: JWT_SECRET environment variable is not defined.");
      throw new AppError("Erro interno no servidor.", 500);
    }

    const token = generateAccessToken(
      {
        id: user.id,
        email: user.email,
        role: user.cargoEscola,
      },
      secret,
    );

    return {
      user: {
        id: user.id,
        name: user.nome,
        email: user.email,
        role: user.cargoEscola,
      },
      token,
    };
  }
}
