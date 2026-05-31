import { audit } from "../../services/audit.js";
import { ok } from "../../utils/response.js";
import { asObject, optionalString, requiredString } from "../../utils/validation.js";
import { repos } from "../shared/repositories.js";

export async function listRoles(_req, res) {
  ok(res, await repos.roles.list());
}

export async function createRole(req, res) {
  const body = asObject(req.body);
  const created = await repos.roles.create({ name: requiredString(body, "name"), description: optionalString(body, "description") });
  await audit(req, "create", "roles", created.id);
  ok(res, created, "Rol creado", 201);
}

export async function updateRole(req, res) {
  const body = asObject(req.body);
  const updated = await repos.roles.update(req.params.id, { name: requiredString(body, "name"), description: optionalString(body, "description") });
  await audit(req, "update", "roles", req.params.id);
  ok(res, updated, "Rol actualizado");
}

export async function deleteRole(req, res) {
  await repos.roles.delete(req.params.id);
  await audit(req, "delete", "roles", req.params.id);
  ok(res, null, "Rol eliminado");
}

export function listPermissions(_req, res) {
  ok(res, ["books:write", "authors:write", "loans:write", "fines:write", "users:write"]);
}
