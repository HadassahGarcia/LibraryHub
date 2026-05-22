import { auth } from "../config/firebase.js";
import { FirestoreRepository } from "../repositories/firestoreRepository.js";

const usersRepo = new FirestoreRepository("users");

export function roleAllowed(userRole, allowed = []) {
  if (!allowed.length) return true;
  return !!userRole && allowed.includes(userRole);
}

export async function attachUser(req) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;

  const token = header.slice("Bearer ".length);
  const decoded = await auth.verifyIdToken(token);
  const profile = await usersRepo.get(decoded.uid);
  const user = {
    id: decoded.uid,
    email: decoded.email || String(profile?.email || ""),
    name: String(profile?.name || decoded.name || decoded.email || "Usuario"),
    role: profile?.role || "Usuario",
    status: profile?.status || "active",
  };
  req.user = user;
  return user;
}
