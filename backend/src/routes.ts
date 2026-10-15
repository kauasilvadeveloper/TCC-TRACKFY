import { Response, Router, type Request } from "express";
import { AuthUserController } from "./controllers/auth/AuthUserController";
import { isAuthenticated } from "./middlewares/isAuthenticated";
import { CreateUserController } from "./controllers/auth/CreateUserController";
import { CreateClassController } from "./controllers/class/CreateClassController";
import { CreateProjectController } from "./controllers/project/CreateProjectController";
import { UpdateProjectController } from "./controllers/project/UpdateProjectController";
import { DeleteProjectController } from "./controllers/project/DeleteProjectController";
import { GetUsersByClassController } from "./controllers/class/GetUsersByClassController";
import { CreateKanbanController } from "./controllers/kanban/CreateKanbanController";
import { CreateSprintController } from "./controllers/sprint/CreateSprintController";
import { GetTasksBySprintService } from "./services/sprint/GetTasksBySprintService";
import { GetTasksBySprintController } from "./controllers/sprint/GetTasksBySprintController";
import { ReopenSprintController } from "./controllers/sprint/ReopenSprintController";
import { UpdateSprintController } from "./controllers/sprint/UpdateSprintController";
import { GetKanbanByProjectController } from "./controllers/kanban/GetKanbanByProjectController";
import { CreateColumnController } from "./controllers/kanban/CreateColumnController";
import { CreateTaskController } from "./controllers/task/CreateTaskController";
import { MoveTaskController } from "./controllers/task/MoveTaskController";
import { DeleteTaskController } from "./controllers/task/DeleteTaskController";
import { GetClassesByUserController } from "./controllers/class/GetClassesByUserController";
import { JoinClassController } from "./controllers/class/JoinClassController";

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
router.get(
  "/classes",
  isAuthenticated,
  new GetClassesByUserController().handle,
);
router.post("/class/join", isAuthenticated, new JoinClassController().handle);

//ROTAS PROJETO
router.post("/project", isAuthenticated, new CreateProjectController().handle);
router.patch("/project", isAuthenticated, new UpdateProjectController().handle);
router.delete(
  "/project",
  isAuthenticated,
  new DeleteProjectController().handle,
);

//ROTAS KANBAN
router.post("/kanban", isAuthenticated, new CreateKanbanController().handle);
router.get(
  "/kanban/:projectId",
  isAuthenticated,
  new GetKanbanByProjectController().handle,
);
router.post(
  "/kanban/column",
  isAuthenticated,
  new CreateColumnController().handle,
);
router.post("/task", isAuthenticated, new CreateTaskController().handle);
router.patch("/task", isAuthenticated, new UpdateSprintController().handle);
router.patch("/task/move", isAuthenticated, new MoveTaskController().handle);
router.delete("/task", isAuthenticated, new DeleteTaskController().handle);

//ROTAS SPRINT
router.post("/sprint", isAuthenticated, new CreateSprintController().handle);
router.get("/sprint", isAuthenticated, new GetTasksBySprintController().handle);
router.get(
  "/sprint/project/:projectId",
  isAuthenticated,
  new GetTasksBySprintController().handle,
);
router.patch(
  "/sprint/reopen",
  isAuthenticated,
  new ReopenSprintController().handle,
);
router.patch("/sprint", isAuthenticated, new UpdateSprintController().handle);

export { router };
