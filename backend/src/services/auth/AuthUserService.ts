import { compare } from "bcryptjs";
import { sign, SignOptions } from "jsonwebtoken";
import { prisma } from "../../prisma";

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

export class UnauthorizedException extends Error {
  constructor(message: string = "User/password incorrect") {
    super(message);
    this.name = "UnauthorizedException";
  }
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
      throw new UnauthorizedException();
    }

    const passwordMatch = await compare(password, user.senha);

    if (!passwordMatch) {
      throw new UnauthorizedException();
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("FATAL: JWT_SECRET environment variable is not defined.");
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
