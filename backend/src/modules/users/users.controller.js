import { audit } from "../../services/audit.js";
import { ok, fail } from "../../utils/response.js";
import { asObject, assertEmail, optionalString, requiredString } from "../../utils/validation.js";
import { repos } from "../shared/repositories.js";
import { normalizeRole } from "../shared/roles.js";
import { deleteUserWithRules } from "./users.service.js";
import { auth } from "../../config/firebase.js";

export async function listUsers(_req, res) {
  ok(res, await repos.users.list());
}

export async function getUser(req, res) {
  const user = await repos.users.get(req.params.id);
  if (!user) return fail(res, 404, "Usuario no encontrado", "USER_NOT_FOUND");
  ok(res, user);
}

export async function createUser(req, res) {
  const body = asObject(req.body);
  const email = requiredString(body, "email");
  const name = requiredString(body, "name");
  assertEmail(email);
  const role = normalizeRole(optionalString(body, "role", "Usuario"));
  const password = requiredString(body, "password");
  const created = await auth.createUser({ email, password, displayName: name });
  const profile = await repos.users.create({ email, name, role, status: "active" }, created.uid);
  await audit(req, "create", "users", created.uid);
  ok(res, profile, "Usuario creado", 201);
}

export async function updateUser(req, res) {
  const body = asObject(req.body);
  const payload = {};
  const name = optionalString(body, "name");
  if (name) payload.name = name;
  const email = optionalString(body, "email");
  if (email) payload.email = email;
  if (body.role !== undefined && body.role !== null && body.role !== "") {
    payload.role = normalizeRole(String(body.role));
  }
  const updated = await repos.users.update(req.params.id, payload);
  await audit(req, "update", "users", req.params.id);
  ok(res, updated, "Usuario actualizado");
}

export async function updateUserStatus(req, res) {
  const body = asObject(req.body);
  const status = requiredString(body, "status");
  const updated = await repos.users.update(req.params.id, { status });
  await audit(req, "status_change", "users", req.params.id, { status });
  ok(res, updated, "Estado actualizado");
}

export async function deleteUser(req, res) {
  const result = await deleteUserWithRules(req.params.id, req.user.id);
  if (result.error) return fail(res, ...result.error);
  await audit(req, "delete", "users", req.params.id);
  ok(res, null, "Usuario eliminado");
}
