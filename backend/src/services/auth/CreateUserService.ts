import { hash } from "bcryptjs";
import { prisma } from "../../prisma";
import { AppError } from "../../errors/AppError";

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
      throw new AppError(
        "Acesso negado: Permissão insuficiente para cadastrar usuários.",
        403,
      );
    }

    if (!email) {
      throw new AppError("O e-mail é obrigatório para prosseguir.", 400);
    }

    const validDomains = [
      "@aluno.senai.br",
      "@docente.senai.br",
      "@coordenador.senai.br",
      "@portalsesisp.org.br",
    ];

    const hasValidDomain = validDomains.some((domain) =>
      email.endsWith(domain),
    );

    if (!hasValidDomain) {
      throw new AppError(
        `Acesso permitido apenas para e-mails do domínio acadêmico.`,
        400,
      );
    }

    // 3. Verificação de Duplicidade
    const userAlreadyExists = await prisma.usuario.findUnique({
      where: { email },
    });

    if (userAlreadyExists) {
      throw new AppError(
        "O e-mail informado já está cadastrado no sistema.",
        409,
      );
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
