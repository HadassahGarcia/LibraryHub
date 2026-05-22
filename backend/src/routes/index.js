import { auth } from "../config/firebase.js";
import { env } from "../config/env.js";
import { FirestoreRepository } from "../repositories/firestoreRepository.js";
import { audit } from "../services/audit.js";
import { ok, fail } from "../utils/response.js";
import { asObject, assertEmail, optionalNumber, optionalString, requiredString } from "../utils/validation.js";
import { checkRateLimit } from "../middleware/rateLimit.js";
import { Router } from "./router.js";

const books = new FirestoreRepository("books");
const authors = new FirestoreRepository("authors");
const categories = new FirestoreRepository("book-categories");
const users = new FirestoreRepository("users");
const loans = new FirestoreRepository("loans");
const fines = new FirestoreRepository("fines");
const auditRepo = new FirestoreRepository("audit");

const staffRoles = ["Administrador", "Bibliotecario"];
const adminRoles = ["Administrador"];
const validRoles = ["Administrador", "Bibliotecario", "Usuario"];

function normalizeRole(role) {
  return validRoles.includes(role) ? role : "Usuario";
}

function bookPayload(body) {
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

async function loginWithFirebase(email, password) {
  if (!env.firebaseWebApiKey) {
    throw new Error("FIREBASE_WEB_API_KEY no está configurada.");
  }
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${env.firebaseWebApiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message || "Credenciales inválidas.");
  return payload;
}

async function refreshFirebaseToken(refreshToken) {
  if (!env.firebaseWebApiKey) {
    throw new Error("FIREBASE_WEB_API_KEY no está configurada.");
  }
  const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${env.firebaseWebApiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message || "No se pudo refrescar la sesión.");
  return payload;
}

async function hasPendingFines(userId) {
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
    const role = "Usuario";
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
    await auth.updateUser(req.user.id, { password });
    await audit(req, "change_password", "users", req.user.id);
    ok(res, null, "Contraseña actualizada");
  }, { private: true });

  const roles = new FirestoreRepository("roles");

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
    const payload = {};
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

  router.add("GET", "/api/loans", async (_req, res) => ok(res, await loans.list()), { private: true, roles: staffRoles });
  router.add("GET", "/api/users/:id/loans", async (req, res) => {
    ok(res, (await loans.list()).filter((loan) => loan.userId === req.params.id));
  }, { private: true });
  router.add("POST", "/api/loans", async (req, res) => {
    const body = asObject(req.body);
    const bookId = requiredString(body, "bookId");
    const userId = requiredString(body, "userId");
    if (await hasPendingFines(userId)) return fail(res, 409, "El usuario tiene multas pendientes", "LOAN_USER_HAS_FINES");
    const book = await books.get(bookId);
    if (!book) return fail(res, 404, "Libro no encontrado", "BOOK_NOT_FOUND");
    if (book.status !== "Disponible") return fail(res, 409, "El libro no está disponible", "BOOK_UNAVAILABLE");
    const profile = await users.get(userId);
    const created = await loans.create({
      bookId,
      userId,
      userName: optionalString(body, "userName", String(profile?.name || "")),
      borrowDate: optionalString(body, "borrowDate", new Date().toISOString()),
      dueDate: requiredString(body, "dueDate"),
      returnDate: null,
      status: "Activo",
    });
    await books.update(bookId, { status: "Prestado" });
    await audit(req, "create", "loans", created.id, { bookId, userId });
    ok(res, created, "Préstamo creado", 201);
  }, { private: true, roles: staffRoles });
  router.add("POST", "/api/loans/request", async (req, res) => {
    const body = asObject(req.body);
    const bookId = requiredString(body, "bookId");
    const userId = req.user.id;
    if (await hasPendingFines(userId)) return fail(res, 409, "Tienes multas pendientes", "LOAN_USER_HAS_FINES");
    const book = await books.get(bookId);
    if (!book) return fail(res, 404, "Libro no encontrado", "BOOK_NOT_FOUND");
    if (book.status !== "Disponible") return fail(res, 409, "El libro no está disponible", "BOOK_UNAVAILABLE");
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    const created = await loans.create({
      bookId,
      userId,
      userName: req.user.name,
      borrowDate: new Date().toISOString(),
      dueDate: dueDate.toISOString(),
      returnDate: null,
      status: "Activo",
    });
    await books.update(bookId, { status: "Prestado" });
    await audit(req, "create", "loans", created.id, { bookId, userId, source: "self" });
    ok(res, created, "Préstamo solicitado", 201);
  }, { private: true });

  router.add("POST", "/api/loans/:id/return", async (req, res) => {
    const loan = await loans.get(req.params.id);
    if (!loan) return fail(res, 404, "Préstamo no encontrado", "LOAN_NOT_FOUND");
    if (loan.status !== "Activo") return fail(res, 409, "El préstamo ya fue cerrado", "LOAN_ALREADY_CLOSED");
    const returnDate = new Date();
    const dueDate = new Date(String(loan.dueDate));
    const lateDays = Math.max(0, Math.ceil((returnDate.getTime() - dueDate.getTime()) / 86400000));
    const updated = await loans.update(req.params.id, { status: "Devuelto", returnDate: returnDate.toISOString() });
    await books.update(String(loan.bookId), { status: "Disponible" });
    if (lateDays > 0) {
      await fines.create({
        userId: loan.userId,
        userName: loan.userName,
        amount: lateDays * env.finePerDay,
        reason: `Retraso en devolución (${lateDays} días)`,
        status: "Pendiente",
        loanId: req.params.id,
      });
    }
    await audit(req, "loan_return", "loans", req.params.id, { lateDays });
    ok(res, updated, "Préstamo cerrado");
  }, { private: true, roles: staffRoles });

  router.add("GET", "/api/fines", async (_req, res) => ok(res, await fines.list()), { private: true });
  router.add("POST", "/api/fines/:id/pay", async (req, res) => {
    const updated = await fines.update(req.params.id, { status: "Pagado", paidAt: new Date().toISOString() });
    await audit(req, "fine_payment", "fines", req.params.id);
    ok(res, updated, "Multa pagada");
  }, { private: true, roles: staffRoles });

  router.add("GET", "/api/dashboard/summary", async (_req, res) => {
    const [bookList, loanList, fineList, userList] = await Promise.all([books.list(), loans.list(), fines.list(), users.list()]);
    const bookMap = Object.fromEntries(bookList.map((b) => [b.id, b]));
    const mostBorrowedCounts = loanList.reduce((acc, loan) => {
      acc[String(loan.bookId)] = (acc[String(loan.bookId)] || 0) + 1;
      return acc;
    }, {});
    const mostBorrowed = Object.entries(mostBorrowedCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([bookId, count]) => ({ bookId, count, book: bookMap[bookId] || null }));
    const recentLoans = loanList
      .filter((l) => l.borrowDate)
      .sort((a, b) => new Date(String(b.borrowDate)).getTime() - new Date(String(a.borrowDate)).getTime())
      .slice(0, 5)
      .map((l) => ({ ...l, bookTitle: String(bookMap[String(l.bookId)]?.title || "Libro desconocido") }));
    ok(res, {
      totalBooks: bookList.length,
      availableBooks: bookList.filter((book) => book.status === "Disponible").length,
      activeLoans: loanList.filter((loan) => loan.status === "Activo").length,
      pendingFines: fineList.filter((fine) => fine.status === "Pendiente").reduce((acc, fine) => acc + Number(fine.amount || 0), 0),
      totalUsers: userList.length,
      mostBorrowed,
      recentLoans,
    });
  }, { private: true, roles: staffRoles });
  router.add("GET", "/api/audit", async (_req, res) => ok(res, await auditRepo.list()), { private: true, roles: adminRoles });

  return router;
}
