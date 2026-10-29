import express, {
  json,
  type Express,
  type Request,
  type Response,
} from "express";
import { router } from "./routes";
import cors from "cors";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

const app: Express = express();
const port = 8000;

app.use(
  cors({
    origin: (origin, callback) => {
      // Aceita localhost e conexões do bloco de rede local
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

app.use(globalErrorHandler);

app.use(express.json());
app.use(router);

// Rota de Healthcheck
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Servidor backend na porta: ${port}`);
});
