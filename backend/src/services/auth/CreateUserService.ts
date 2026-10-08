import { hash } from "bcryptjs";
import { prisma } from "../../prisma";

interface CreateUserDTO {
  creatorRole?: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

export class CreateUserService {
  async execute({ creatorRole, name, email, password, role }: CreateUserDTO) {
    // 1. Controle de Acesso (RBAC)
    const allowedRoles = ["coordenador", "professor"];
    if (!creatorRole || !allowedRoles.includes(creatorRole.toLowerCase())) {
      throw new Error(
        "Acesso negado: Permissão insuficiente para cadastrar usuários.",
      );
    }

    // 2. Validação de Email e Domínio Acadêmico
    if (!email) {
      throw new Error("Email incorreto.");
    }

    const validDomains = ["@aluno.senai.br", "@portalsesisp.org.br"];
    const hasValidDomain = validDomains.some((domain) =>
      email.endsWith(domain),
    );
    if (!hasValidDomain) {
      throw new Error("Domínio de e-mail não permitido para cadastro.");
    }

    // 3. Verificação de Duplicidade
    const userAlreadyExists = await prisma.usuario.findUnique({
      where: { email },
    });

    if (userAlreadyExists) {
      throw new Error("Usuário já cadastrado.");
    }

    // 4. Hash da Senha e Persistência
    const passwordHash = await hash(password, 8);

    const user = await prisma.usuario.create({
      data: {
        nome: name,
        email: email,
        senha: passwordHash,
        cargoEscola: role, // Nome da propriedade no schema Prisma em camelCase
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cargoEscola: true,
      },
    });

    return user;
  }
}
