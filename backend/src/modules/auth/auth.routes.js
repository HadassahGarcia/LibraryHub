import { login, logout, me, refresh, register, updatePassword } from "./auth.controller.js";

export function registerAuthRoutes(router) {
  router.add("POST", "/api/auth/register", register);
  router.add("POST", "/api/auth/login", login);
  router.add("POST", "/api/auth/logout", logout, { private: true });
  router.add("GET", "/api/auth/me", me, { private: true });
  router.add("POST", "/api/auth/refresh", refresh);
  router.add("PATCH", "/api/auth/change-password", updatePassword, { private: true });
}
