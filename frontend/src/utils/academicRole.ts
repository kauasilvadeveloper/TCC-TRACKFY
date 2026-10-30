import Cookies from "js-cookie";

export function getAuthToken(): string {
  return (
    Cookies.get("trackfy_token") ||
    localStorage.getItem("trackfy_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("@token") ||
    ""
  );
}

export function authHeaders(): { Authorization: string } | Record<string, never> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getSessionUser(): Record<string, any> | null {
  const raw = Cookies.get("trackfy_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getSessionUserId(): number | null {
  const user = getSessionUser();
  if (!user) return null;
  const id = user.id ?? user.usuarioId ?? user.fkUsuario ?? user.user?.id;
  const parsed = Number(id);
  return Number.isNaN(parsed) || parsed <= 0 ? null : parsed;
}

export function getSessionDisplayName(): string {
  const user = getSessionUser();
  if (!user) return "";
  return user.name || user.nome || user.user?.name || "";
}

export function normalizeCargo(user: any): string {
  if (!user) return "";
  const data = user.usuario || user;
  return String(
    data.cargoEscola ||
      data.cargo_escola ||
      data.cargo ||
      data.role ||
      "",
  )
    .toLowerCase()
    .trim();
}

export function userEmail(user: any): string {
  const data = user?.usuario || user;
  return String(data?.email || "").toLowerCase();
}

export function isCoordinatorUser(user: any): boolean {
  const cargo = normalizeCargo(user);
  const email = userEmail(user);
  return cargo.includes("coord") || email.endsWith("@coordenador.senai.br");
}

export function isTeacherUser(user: any): boolean {
  if (isCoordinatorUser(user)) return false;
  const cargo = normalizeCargo(user);
  const email = userEmail(user);
  return (
    cargo.includes("prof") ||
    cargo.includes("docen") ||
    cargo.includes("teach") ||
    email.endsWith("@docente.senai.br")
  );
}

export function isStudentUser(user: any): boolean {
  if (isTeacherUser(user) || isCoordinatorUser(user)) return false;
  const cargo = normalizeCargo(user);
  const email = userEmail(user);
  if (email.endsWith("@aluno.senai.br")) return true;
  return !cargo || cargo === "aluno" || cargo === "student";
}

export function isProfessorRole(role: string): boolean {
  const normalized = (role || "").toLowerCase().trim();
  return normalized === "professor" || normalized === "docente";
}
