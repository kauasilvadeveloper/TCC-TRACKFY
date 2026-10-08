import { Response, Router, type Request } from "express";
import { AuthUserController } from "./controllers/auth/AuthUserController";
import { isAuthenticated } from "./middlewares/isAuthenticated";
import { CreateUserController } from "./controllers/auth/CreateUserController";
import { CreateClassController } from "./controllers/class/CreateClassController";

const router = Router();

router.post("/login", new AuthUserController().handle);
router.post(
  "/user-register",
  isAuthenticated,
  new CreateUserController().handle,
);

//ROTAS SALA
router.post("/class", isAuthenticated, new CreateClassController().handle);
router.get(
  "/class?class_id",
  isAuthenticated,
  new GetUsersByClassController().handle,
);

export { router };
