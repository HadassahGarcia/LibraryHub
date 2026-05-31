import { audit } from "../../services/audit.js";
import { ok, fail } from "../../utils/response.js";
import { asObject, requiredString } from "../../utils/validation.js";
import { repos } from "../shared/repositories.js";
import { bookPayload, deleteBookWithRules } from "./books.service.js";

const validStatuses = ["Disponible", "Prestado", "Mantenimiento", "Baja"];

export async function listBooks(_req, res) {
  ok(res, await repos.books.list());
}

export async function getBook(req, res) {
  const book = await repos.books.get(req.params.id);
  if (!book) return fail(res, 404, "Libro no encontrado", "BOOK_NOT_FOUND");
  ok(res, book);
}

export async function createBook(req, res) {
  const created = await repos.books.create(bookPayload(asObject(req.body)));
  await audit(req, "create", "books", created.id);
  ok(res, created, "Libro creado", 201);
}

export async function updateBook(req, res) {
  const updated = await repos.books.update(req.params.id, bookPayload(asObject(req.body)));
  await audit(req, "update", "books", req.params.id);
  ok(res, updated, "Libro actualizado");
}

export async function updateBookStatus(req, res) {
  const body = asObject(req.body);
  const status = requiredString(body, "status");
  if (!validStatuses.includes(status)) return fail(res, 400, "Estado inválido", "INVALID_STATUS");
  const updated = await repos.books.update(req.params.id, { status });
  await audit(req, "status_change", "books", req.params.id, { status });
  ok(res, updated, "Estado actualizado");
}

export async function deleteBook(req, res) {
  const result = await deleteBookWithRules(req.params.id);
  if (result.error) return fail(res, ...result.error);
  await audit(req, "delete", "books", req.params.id);
  ok(res, null, "Libro eliminado");
}
