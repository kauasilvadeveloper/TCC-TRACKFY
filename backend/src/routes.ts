import { Router } from "express";
import { isAuthenticated } from "./middlewares/isAuthenticated";

// Auth Controllers
import { AuthUserController } from "./controllers/auth/AuthUserController";
import { CreateUserController } from "./controllers/auth/CreateUserController";

// Class Controllers
import { CreateClassController } from "./controllers/class/CreateClassController";
import { GetUsersByClassController } from "./controllers/class/GetUsersByClassController";
import { GetClassesByUserController } from "./controllers/class/GetClassesByUserController";
import { JoinClassController } from "./controllers/class/JoinClassController";

// Project Controllers
import { GetProjectsByUserController } from "./controllers/project/GetProjectsByUserController";
import { CreateProjectController } from "./controllers/project/CreateProjectController";
import { UpdateProjectController } from "./controllers/project/UpdateProjectController";
import { DeleteProjectController } from "./controllers/project/DeleteProjectController";
import { AddProjectMemberController } from "./controllers/project/AddProjectMemberController";
import { GetProjectByIdController } from "./controllers/project/GetProjectByIdController";

// GitHub Controllers
import { LinkGithubRepositoryController } from "./controllers/project/LinkGithubRepositoryController";
import { GetGithubMetricsController } from "./controllers/project/GetGithubMetricsController";
import { GetGithubBranchesController } from "./controllers/project/GetGithubBranchesController";

// Kanban & Column Controllers
import { CreateKanbanController } from "./controllers/kanban/CreateKanbanController";
import { GetKanbanByProjectController } from "./controllers/kanban/GetKanbanByProjectController";
import { CreateColumnController } from "./controllers/kanban/CreateColumnController";

// Task & Comment Controllers
import { CreateTaskController } from "./controllers/task/CreateTaskController";
import { UpdateTaskController } from "./controllers/task/UpdateTaskController";
import { MoveTaskController } from "./controllers/task/MoveTaskController";
import { DeleteTaskController } from "./controllers/task/DeleteTaskController";
import { CreateCommentController } from "./controllers/comment/CreateCommentController";
import { DeleteCommentController } from "./controllers/comment/DeleteCommentController";

// Sprint Controllers
import { CreateSprintController } from "./controllers/sprint/CreateSprintController";
import { GetTasksBySprintController } from "./controllers/sprint/GetTasksBySprintController";
import { ReopenSprintController } from "./controllers/sprint/ReopenSprintController";
import { UpdateSprintController } from "./controllers/sprint/UpdateSprintController";
import { GetGithubCommitsController } from "./controllers/project/GetGithubCommitsController";
import { GetAllUsersController } from "./controllers/auth/GetAllUsersController";
import { GetSprintsByProjectController } from "./controllers/sprint/GetSprintByProjectController";
// import { GetSprintsByProjectController } from "./controllers/sprint/GetSprintByProjectController";

const router = Router();

// ================= AUTH =================
router.post("/login", new AuthUserController().handle);
router.post(
  "/user-register",
  isAuthenticated,
  new CreateUserController().handle,
);
router.get("/users", isAuthenticated, new GetAllUsersController().handle);

// ================= SALA / TURMA =================
router.post("/class", isAuthenticated, new CreateClassController().handle);
router.get(
  "/class/:id/users",
  isAuthenticated,
  new GetUsersByClassController().handle,
); // [AJUSTADA] Parâmetro na URL
router.get(
  "/classes",
  isAuthenticated,
  new GetClassesByUserController().handle,
);
router.post("/class/join", isAuthenticated, new JoinClassController().handle);

// ================= PROJETO =================
router.get(
  "/project",
  isAuthenticated,
  new GetProjectsByUserController().handle,
);
router.post("/project", isAuthenticated, new CreateProjectController().handle);
router.get(
  "/project/:id",
  isAuthenticated,
  new GetProjectByIdController().handle,
);
router.patch(
  "/project/:id",
  isAuthenticated,
  new UpdateProjectController().handle,
); // [AJUSTADA] Parâmetro na URL
router.delete(
  "/project/:id",
  isAuthenticated,
  new DeleteProjectController().handle,
); // [AJUSTADA] Parâmetro na URL
router.post(
  "/project/member",
  isAuthenticated,
  new AddProjectMemberController().handle,
);

// ================= GITHUB =================
router.post(
  "/project/github",
  isAuthenticated,
  new LinkGithubRepositoryController().handle,
);
router.get(
  "/project/github/metrics",
  isAuthenticated,
  new GetGithubMetricsController().handle,
);
router.get(
  "/project/github/branches",
  isAuthenticated,
  new GetGithubBranchesController().handle,
);

router.get(
  "/project/:projectId/:branchName/commits",
  isAuthenticated,
  new GetGithubCommitsController().handle,
);

// ================= KANBAN & COLUNAS =================
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

// ================= TAREFAS =================
router.post("/task", isAuthenticated, new CreateTaskController().handle);
router.patch("/task/:id", isAuthenticated, new UpdateTaskController().handle); // [CORRIGIDO BUG] Apontava para UpdateSprintController
router.patch(
  "/task/:id/move",
  isAuthenticated,
  new MoveTaskController().handle,
);
router.delete("/task/:id", isAuthenticated, new DeleteTaskController().handle); // [AJUSTADA] Parâmetro na URL

// ================= COMENTÁRIOS DE TAREFAS =================
router.post(
  "/task/:taskId/comment",
  isAuthenticated,
  new CreateCommentController().handle,
); // [ADICIONADA] Comentário na tarefa
router.delete(
  "/comment/:id",
  isAuthenticated,
  new DeleteCommentController().handle,
); // [ADICIONADA] Exclusão de comentário

// ================= SPRINT =================
router.post("/sprint", isAuthenticated, new CreateSprintController().handle);
router.get(
  "/sprint/:id/tasks",
  isAuthenticated,
  new GetTasksBySprintController().handle,
);
router.get(
  "/sprint/project/:projectId",
  isAuthenticated,
  new GetSprintsByProjectController().handle,
);
router.patch(
  "/sprint/reopen",
  isAuthenticated,
  new ReopenSprintController().handle,
);
router.patch(
  "/sprint/:id",
  isAuthenticated,
  new UpdateSprintController().handle,
);

export { router };
