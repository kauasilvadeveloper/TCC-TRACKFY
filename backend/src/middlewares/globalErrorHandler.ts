import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  // Log interno para erros não mapeados (Infra/Crash)
  console.error("Unhandled Error:", err);

  return res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
}
