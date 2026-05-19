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

  const roles = new FirestoreRepository<Record<string, unknown>>("roles");

  router.add("GET", "/api/roles", async (_req, res) => {
    ok(res, await roles.list());
  }, { private: true, roles: adminRoles });
  router.add("POST", "/api/roles", async (req, res) => {
    const body = asObject(req.body);
    const created = await roles.create({ name: requiredString(body, "name"), description: optionalString(body, "description") });
    await audit(req, "create", "roles", created.id);
    ok(res, created, "Rol creado", 201);
  }, { private: true, roles: adminRoles });
  router.add("PUT", "/api/roles/:id", async (req, res) => {
    const body = asObject(req.body);
    const updated = await roles.update(req.params.id, { name: requiredString(body, "name"), description: optionalString(body, "description") });
    await audit(req, "update", "roles", req.params.id);
    ok(res, updated, "Rol actualizado");
  }, { private: true, roles: adminRoles });
  router.add("DELETE", "/api/roles/:id", async (req, res) => {
    await roles.delete(req.params.id);
    await audit(req, "delete", "roles", req.params.id);
    ok(res, null, "Rol eliminado");
  }, { private: true, roles: adminRoles });
  router.add("GET", "/api/permissions", (_req, res) => ok(res, ["books:write", "authors:write", "loans:write", "fines:write", "users:write"]), { private: true, roles: adminRoles });

  router.add("GET", "/api/users", async (_req, res) => ok(res, await users.list()), { private: true, roles: staffRoles });
  router.add("GET", "/api/users/:id", async (req, res) => {
    const user = await users.get(req.params.id);
    if (!user) return fail(res, 404, "Usuario no encontrado", "USER_NOT_FOUND");
    ok(res, user);
  }, { private: true });
  router.add("POST", "/api/users", async (req, res) => {
    const body = asObject(req.body);
    const email = requiredString(body, "email");
    const name = requiredString(body, "name");
    assertEmail(email);
    const role = normalizeRole(optionalString(body, "role", "Usuario"));
    const password = requiredString(body, "password");
    const created = await auth.createUser({ email, password, displayName: name });
    const profile = await users.create({ email, name, role, status: "active" }, created.uid);
    await audit(req, "create", "users", created.uid);
    ok(res, profile, "Usuario creado", 201);
  }, { private: true, roles: adminRoles });
  router.add("PUT", "/api/users/:id", async (req, res) => {
    const body = asObject(req.body);
    const payload: Record<string, unknown> = {};
    const name = optionalString(body, "name");
    if (name) payload.name = name;
    const email = optionalString(body, "email");
    if (email) payload.email = email;
    if (body.role !== undefined && body.role !== null && body.role !== "") {
      payload.role = normalizeRole(String(body.role));
    }
    const updated = await users.update(req.params.id, payload);
    await audit(req, "update", "users", req.params.id);
    ok(res, updated, "Usuario actualizado");
  }, { private: true, roles: adminRoles });
  router.add("PATCH", "/api/users/:id/status", async (req, res) => {
    const body = asObject(req.body);
    const status = requiredString(body, "status");
    const updated = await users.update(req.params.id, { status });
    await audit(req, "status_change", "users", req.params.id, { status });
    ok(res, updated, "Estado actualizado");
  }, { private: true, roles: adminRoles });
  router.add("DELETE", "/api/users/:id", async (req, res) => {
    await users.delete(req.params.id);
    await auth.deleteUser(req.params.id).catch(() => undefined);
    await audit(req, "delete", "users", req.params.id);
    ok(res, null, "Usuario eliminado");
  }, { private: true, roles: adminRoles });

  router.add("GET", "/api/books", async (_req, res) => ok(res, await books.list()));
  router.add("GET", "/api/books/:id", async (req, res) => {
    const book = await books.get(req.params.id);
    if (!book) return fail(res, 404, "Libro no encontrado", "BOOK_NOT_FOUND");
    ok(res, book);
  });
  router.add("POST", "/api/books", async (req, res) => {
    const created = await books.create(bookPayload(asObject(req.body)));
    await audit(req, "create", "books", created.id);
    ok(res, created, "Libro creado", 201);
  }, { private: true, roles: staffRoles });
  router.add("PUT", "/api/books/:id", async (req, res) => {
    const updated = await books.update(req.params.id, bookPayload(asObject(req.body)));
    await audit(req, "update", "books", req.params.id);
    ok(res, updated, "Libro actualizado");
  }, { private: true, roles: staffRoles });
  router.add("PATCH", "/api/books/:id/status", async (req, res) => {
    const body = asObject(req.body);
    const status = requiredString(body, "status");
    const validStatuses = ["Disponible", "Prestado", "Mantenimiento", "Baja"];
    if (!validStatuses.includes(status)) return fail(res, 400, "Estado inválido", "INVALID_STATUS");
    const updated = await books.update(req.params.id, { status });
    await audit(req, "status_change", "books", req.params.id, { status });
    ok(res, updated, "Estado actualizado");
  }, { private: true, roles: staffRoles });
  router.add("DELETE", "/api/books/:id", async (req, res) => {
    await books.delete(req.params.id);
    await audit(req, "delete", "books", req.params.id);
    ok(res, null, "Libro eliminado");
  }, { private: true, roles: staffRoles });

  router.add("GET", "/api/authors", async (_req, res) => ok(res, await authors.list()));
  router.add("POST", "/api/authors", async (req, res) => {
    const body = asObject(req.body);
    const created = await authors.create({ name: requiredString(body, "name"), bio: optionalString(body, "bio") });
    await audit(req, "create", "authors", created.id);
    ok(res, created, "Autor creado", 201);
  }, { private: true, roles: staffRoles });
  router.add("PUT", "/api/authors/:id", async (req, res) => {
    const body = asObject(req.body);
    const updated = await authors.update(req.params.id, { name: requiredString(body, "name"), bio: optionalString(body, "bio") });
    await audit(req, "update", "authors", req.params.id);
    ok(res, updated, "Autor actualizado");
  }, { private: true, roles: staffRoles });
  router.add("DELETE", "/api/authors/:id", async (req, res) => {
    await authors.delete(req.params.id);
    await audit(req, "delete", "authors", req.params.id);
    ok(res, null, "Autor eliminado");
  }, { private: true, roles: staffRoles });

  router.add("GET", "/api/book-categories", async (_req, res) => ok(res, await categories.list()));
  router.add("POST", "/api/book-categories", async (req, res) => {
    const body = asObject(req.body);
    const created = await categories.create({ name: requiredString(body, "name") });
    await audit(req, "create", "book-categories", created.id);
    ok(res, created, "Categoría creada", 201);
  }, { private: true, roles: staffRoles });
  router.add("PUT", "/api/book-categories/:id", async (req, res) => {
    const body = asObject(req.body);
    const updated = await categories.update(req.params.id, { name: requiredString(body, "name") });
    await audit(req, "update", "book-categories", req.params.id);
    ok(res, updated, "Categoría actualizada");
  }, { private: true, roles: staffRoles });
  router.add("DELETE", "/api/book-categories/:id", async (req, res) => {
    await categories.delete(req.params.id);
    await audit(req, "delete", "book-categories", req.params.id);
    ok(res, null, "Categoría eliminada");
  }, { private: true, roles: staffRoles });

  return router;
}
