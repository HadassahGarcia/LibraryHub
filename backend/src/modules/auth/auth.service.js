import { auth } from "../../config/firebase.js";
import { env } from "../../config/env.js";
import { repos } from "../shared/repositories.js";

export async function loginWithFirebase(email, password) {
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

export async function refreshFirebaseToken(refreshToken) {
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

export async function registerUser({ email, password, name }) {
  const created = await auth.createUser({ email, password, displayName: name });
  return repos.users.create({ name, email, role: "Usuario", status: "active" }, created.uid);
}

export async function revokeUserSession(userId) {
  if (userId) await auth.revokeRefreshTokens(userId).catch(() => undefined);
}

export async function changePassword(userId, password) {
  await auth.updateUser(userId, { password });
}
