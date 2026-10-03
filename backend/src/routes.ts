import { Router, type Request } from "express";
import { AuthUserController } from "./controllers/auth/AuthUserController";

const router = Router();

router.post("/login", new AuthUserController().handle);

export { router };
