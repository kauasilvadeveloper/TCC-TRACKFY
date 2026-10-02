import express, {
  json,
  type Express,
  type Request,
  type Response,
} from "express";

const app: Express = express();
const port = 3000;

app.use(express.json());

// Rota de Healthcheck
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Servidor backend na porta: ${port}`);
});
