import { NextFunction, Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";

interface Payload {
  sub: string;
  role: string;
}

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Receber token
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).end();
  }

  const [, token] = authToken.split(" ");

  const secret = process.env.JWT_SECRET;

  try {
    // Validar esse token.
    const { sub, role } = verify(token, secret) as Payload;

    // Recuperar o id do token e colocar dentro de uma variável user_id dentro do req.
    req.user_id = sub;
    req.user_role = role;

    return next();
  } catch (error) {
    return res.status(401).end();
  }
}
