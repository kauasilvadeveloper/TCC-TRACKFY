import { Response, Router, type Request } from "express";
import { AuthUserController } from "./controllers/auth/AuthUserController";
import { isAuthenticated } from "./middlewares/isAuthenticated";
import { CreateUserController } from "./controllers/auth/CreateUserController";
import { CreateClassController } from "./controllers/class/CreateClassController";
import { CreateProjectController } from "./controllers/project/CreateProjectController";
import { UpdateProjectController } from "./controllers/project/UpdateProjectController";
import { DeleteProjectController } from "./controllers/project/DeleteProjectController";
import { GetUsersByClassController } from "./controllers/class/GetUsersByClassController";

const router = Router();

router.post("/login", new AuthUserController().handle);
router.post(
  "/user-register",
  isAuthenticated,
  new CreateUserController().handle,
);

//ROTAS SALA
router.post("/class", isAuthenticated, new CreateClassController().handle);
router.get("/class", isAuthenticated, new GetUsersByClassController().handle);

//ROTAS PROJETO
router.post("/project", isAuthenticated, new CreateProjectController().handle);
router.patch("/project", isAuthenticated, new UpdateProjectController().handle);
router.delete(
  "/project",
  isAuthenticated,
  new DeleteProjectController().handle,
);

export { router };
