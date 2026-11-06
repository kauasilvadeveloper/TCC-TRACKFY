import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import { router } from "./routes";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

const app: Express = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedPattern =
        /^http:\/\/(localhost|127\.0\.0\.1|10\.106\.\d+\.\d+|192\.168\.\d+\.\d+)(:\d+)?$/;

      if (!origin || allowedPattern.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Bloqueado pelas políticas de CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(router);

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(globalErrorHandler);

export { app };
