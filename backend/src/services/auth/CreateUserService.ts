import { hash } from "bcryptjs";
import { prisma } from "../../prisma";

interface UserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}

export class CreateUserService {
  async execute({ name, email, password, role }: UserRequest) {
    const validEmailAddress = ["@aluno.senai.br", "@portalsesisp.org.br"];

    if (!email) {
      throw new Error("Email incorrect");
    }

    // Verificar se esse email já foi cadastrado na plataforma
    const userAlreadyExists = await prisma.usuario.findFirst({
      where: {
        email: email,
      },
    });

    if (userAlreadyExists) {
      throw new Error("User already exists");
    }

    const passwordHash = await hash(password, 8);

    const user = prisma.usuario.create({
      data: {
        nome: name,
        email: email,
        senha: passwordHash,
        cargo_escola: role,
      },
    });
  }
}
