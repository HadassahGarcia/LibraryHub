import { audit } from "../../services/audit.js";
import { ok, fail } from "../../utils/response.js";
import { asObject, assertEmail, requiredString } from "../../utils/validation.js";
import { checkRateLimit } from "../../middleware/rateLimit.js";
import { repos } from "../shared/repositories.js";
import { changePassword, loginWithFirebase, refreshFirebaseToken, registerUser, revokeUserSession } from "./auth.service.js";

export async function register(req, res) {
  if (!checkRateLimit(`register:${req.ipKey}`)) return fail(res, 429, "Demasiados intentos", "RATE_LIMITED");
  const body = asObject(req.body);
  const email = requiredString(body, "email");
  const password = requiredString(body, "password");
  const name = requiredString(body, "name");
  assertEmail(email);

  const profile = await registerUser({ email, password, name });
  await audit(req, "register", "users", profile.id);
  ok(res, profile, "Usuario registrado", 201);
}

export async function login(req, res) {
  if (!checkRateLimit(`login:${req.ipKey}`)) return fail(res, 429, "Demasiados intentos", "RATE_LIMITED");
  const body = asObject(req.body);
  const email = requiredString(body, "email");
  const password = requiredString(body, "password");
  const session = await loginWithFirebase(email, password);
  const profile = await repos.users.get(session.localId);
  await audit(req, "login", "users", session.localId);
  ok(res, { token: session.idToken, refreshToken: session.refreshToken, expiresIn: session.expiresIn, user: profile });
}

export async function logout(req, res) {
  await revokeUserSession(req.user?.id);
  await audit(req, "logout", "auth");
  ok(res, null, "Sesión cerrada");
}

export async function me(req, res) {
  ok(res, req.user);
}

export async function refresh(req, res) {
  const body = asObject(req.body);
  const refreshToken = requiredString(body, "refreshToken");
  ok(res, await refreshFirebaseToken(refreshToken), "Token renovado");
}

export async function updatePassword(req, res) {
  const body = asObject(req.body);
  const password = requiredString(body, "password");
  await changePassword(req.user.id, password);
  await audit(req, "change_password", "users", req.user.id);
  ok(res, null, "Contraseña actualizada");
}
