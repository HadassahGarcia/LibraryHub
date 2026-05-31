import { audit } from "../../services/audit.js";
import { ok, fail } from "../../utils/response.js";
import { asObject, optionalString, requiredString } from "../../utils/validation.js";
import { repos } from "../shared/repositories.js";
import { deleteAuthorWithRules } from "./authors.service.js";

export async function listAuthors(_req, res) {
  ok(res, await repos.authors.list());
}

export async function createAuthor(req, res) {
  const body = asObject(req.body);
  const created = await repos.authors.create({ name: requiredString(body, "name"), bio: optionalString(body, "bio") });
  await audit(req, "create", "authors", created.id);
  ok(res, created, "Autor creado", 201);
}

export async function updateAuthor(req, res) {
  const body = asObject(req.body);
  const updated = await repos.authors.update(req.params.id, { name: requiredString(body, "name"), bio: optionalString(body, "bio") });
  await audit(req, "update", "authors", req.params.id);
  ok(res, updated, "Autor actualizado");
}

export async function deleteAuthor(req, res) {
  const result = await deleteAuthorWithRules(req.params.id);
  if (result.error) return fail(res, ...result.error);
  await audit(req, "delete", "authors", req.params.id);
  ok(res, null, "Autor eliminado");
}
