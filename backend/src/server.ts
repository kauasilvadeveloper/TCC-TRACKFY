import { app } from "./app";

const port = 8000;

if (process.env.NODE_ENV !== "test") {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Servidor backend na porta: ${port}`);
  });
}

export { app };
