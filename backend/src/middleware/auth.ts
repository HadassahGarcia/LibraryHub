import { auth } from "../config/firebase.js";
import { FirestoreRepository } from "../repositories/firestoreRepository.js";
import type { AppRequest, AuthUser, Role } from "../types.js";

const usersRepo = new FirestoreRepository<Record<string, unknown>>("users");

export function roleAllowed(userRole: Role | undefined, allowed: Role[] = []) {
  if (!allowed.length) return true;
  return !!userRole && allowed.includes(userRole);
}

export async function attachUser(req: AppRequest) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;

  const token = header.slice("Bearer ".length);
  const decoded = await auth.verifyIdToken(token);
  const profile = await usersRepo.get(decoded.uid);
  const user: AuthUser = {
    id: decoded.uid,
    email: decoded.email || String(profile?.email || ""),
    name: String(profile?.name || decoded.name || decoded.email || "Usuario"),
    role: (profile?.role as Role) || "Usuario",
    status: (profile?.status as "active" | "inactive") || "active",
  };
  req.user = user;
  return user;
}
