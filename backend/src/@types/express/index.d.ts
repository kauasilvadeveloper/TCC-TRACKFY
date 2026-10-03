import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      user_role?: string; // Defina o tipo desejado (ex: string ou 'ADMIN' | 'USER')
      user_id?: string; // Defina o tipo desejado (ex: string ou 'ADMIN' | 'USER')
    }
  }
}
