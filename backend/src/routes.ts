import { Response, Router, type Request } from "express";
import { AuthUserController } from "./controllers/auth/AuthUserController";
import { isAuthenticated } from "./middlewares/isAuthenticated";

const router = Router();

router.post("/login", new AuthUserController().handle);
router.get("/auth-test", isAuthenticated, (req: Request, res: Response) => {
  console.log(req.user_role);

  res.json(req.body);
});

export { router };
