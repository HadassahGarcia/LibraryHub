import { audit } from "../../services/audit.js";
import { ok, fail } from "../../utils/response.js";
import { asObject, requiredString } from "../../utils/validation.js";
import { repos } from "../shared/repositories.js";
import { deleteCategoryWithRules } from "./categories.service.js";

export async function listCategories(_req, res) {
  ok(res, await repos.categories.list());
}

export async function createCategory(req, res) {
  const body = asObject(req.body);
  const created = await repos.categories.create({ name: requiredString(body, "name") });
  await audit(req, "create", "book-categories", created.id);
  ok(res, created, "Categoría creada", 201);
}

export async function updateCategory(req, res) {
  const body = asObject(req.body);
  const updated = await repos.categories.update(req.params.id, { name: requiredString(body, "name") });
  await audit(req, "update", "book-categories", req.params.id);
  ok(res, updated, "Categoría actualizada");
}

export async function deleteCategory(req, res) {
  const result = await deleteCategoryWithRules(req.params.id);
  if (result.error) return fail(res, ...result.error);
  await audit(req, "delete", "book-categories", req.params.id);
  ok(res, null, "Categoría eliminada");
}
