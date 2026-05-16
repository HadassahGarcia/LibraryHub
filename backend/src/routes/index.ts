import { auth } from "../config/firebase.js";
import { env } from "../config/env.js";
import { FirestoreRepository } from "../repositories/firestoreRepository.js";
import { audit } from "../services/audit.js";
import type { AppRequest, Role } from "../types.js";
import { ok, fail } from "../utils/response.js";
import { asObject, assertEmail, optionalNumber, optionalString, requiredString } from "../utils/validation.js";
import { checkRateLimit } from "../middleware/rateLimit.js";
import { Router } from "./router.js";

const books = new FirestoreRepository<Record<string, unknown>>("books");
const authors = new FirestoreRepository<Record<string, unknown>>("authors");
const categories = new FirestoreRepository<Record<string, unknown>>("book-categories");
const users = new FirestoreRepository<Record<string, unknown>>("users");
const loans = new FirestoreRepository<Record<string, unknown>>("loans");
const fines = new FirestoreRepository<Record<string, unknown>>("fines");
const auditRepo = new FirestoreRepository<Record<string, unknown>>("audit");

const staffRoles: Role[] = ["Administrador", "Bibliotecario"];
const adminRoles: Role[] = ["Administrador"];
const validRoles: Role[] = ["Administrador", "Bibliotecario", "Usuario"];

function normalizeRole(role: string): Role {
  return (validRoles as string[]).includes(role) ? (role as Role) : "Usuario";
}

function bookPayload(body: Record<string, unknown>) {
  return {
    title: requiredString(body, "title"),
    author: requiredString(body, "author"),
    category: requiredString(body, "category"),
    isbn: requiredString(body, "isbn"),
    status: optionalString(body, "status", "Disponible"),
    cover: optionalString(body, "cover"),
    description: optionalString(body, "description"),
    publishedYear: optionalNumber(body, "publishedYear", new Date().getFullYear()),
  };
}

async function loginWithFirebase(email: string, password: string) {
  if (!env.firebaseWebApiKey) {
    throw new Error("FIREBASE_WEB_API_KEY no está configurada.");
  }
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${env.firebaseWebApiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const payload = await response.json() as { error?: { message?: string } };
  if (!response.ok) throw new Error(payload?.error?.message || "Credenciales inválidas.");
  return payload as { idToken: string; refreshToken: string; localId: string; email: string; expiresIn: string };
}

async function refreshFirebaseToken(refreshToken: string) {
  if (!env.firebaseWebApiKey) {
    throw new Error("FIREBASE_WEB_API_KEY no está configurada.");
  }
  const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${env.firebaseWebApiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
  });
  const payload = await response.json() as { error?: { message?: string } };
  if (!response.ok) throw new Error(payload?.error?.message || "No se pudo refrescar la sesión.");
  return payload;
}

async function hasPendingFines(userId: string) {
  const list = await fines.list();
  return list.some((fine) => fine.userId === userId && fine.status === "Pendiente");
}

export function createRouter() {
  const router = new Router();

  router.add("GET", "/api/health", (_req, res) => ok(res, { status: "ok", service: "LibraryHub API" }));

  router.add("POST", "/api/auth/register", async (req, res) => {
    if (!checkRateLimit(`register:${req.ipKey}`)) return fail(res, 429, "Demasiados intentos", "RATE_LIMITED");
    const body = asObject(req.body);
    const email = requiredString(body, "email");
    const password = requiredString(body, "password");
    const name = requiredString(body, "name");
    assertEmail(email);
    const role: Role = "Usuario";
    const created = await auth.createUser({ email, password, displayName: name });
    const profile = await users.create({ name, email, role, status: "active" }, created.uid);
    await audit(req, "register", "users", created.uid);
    ok(res, profile, "Usuario registrado", 201);
  });

  router.add("POST", "/api/auth/login", async (req, res) => {
    if (!checkRateLimit(`login:${req.ipKey}`)) return fail(res, 429, "Demasiados intentos", "RATE_LIMITED");
    const body = asObject(req.body);
    const email = requiredString(body, "email");
    const password = requiredString(body, "password");
    const session = await loginWithFirebase(email, password);
    const profile = await users.get(session.localId);
    await audit(req, "login", "users", session.localId);
    ok(res, { token: session.idToken, refreshToken: session.refreshToken, expiresIn: session.expiresIn, user: profile });
  });

  router.add("POST", "/api/auth/logout", async (req, res) => {
    if (req.user?.id) await auth.revokeRefreshTokens(req.user.id).catch(() => undefined);
    await audit(req, "logout", "auth");
    ok(res, null, "Sesión cerrada");
  }, { private: true });

  router.add("GET", "/api/auth/me", async (req, res) => ok(res, req.user), { private: true });

  router.add("POST", "/api/auth/refresh", async (req, res) => {
    const body = asObject(req.body);
    const refreshToken = requiredString(body, "refreshToken");
    ok(res, await refreshFirebaseToken(refreshToken), "Token renovado");
  });

  router.add("PATCH", "/api/auth/change-password", async (req, res) => {
    const body = asObject(req.body);
    const password = requiredString(body, "password");
    await auth.updateUser(req.user!.id, { password });
    await audit(req, "change_password", "users", req.user!.id);
    ok(res, null, "Contraseña actualizada");
  }, { private: true });

  return router;
}
