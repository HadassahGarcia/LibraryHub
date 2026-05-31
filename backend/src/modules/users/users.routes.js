import { adminRoles, staffRoles } from "../shared/roles.js";
import { createUser, deleteUser, getUser, listUsers, updateUser, updateUserStatus } from "./users.controller.js";

export function registerUserRoutes(router) {
  router.add("GET", "/api/users", listUsers, { private: true, roles: staffRoles });
  router.add("GET", "/api/users/:id", getUser, { private: true });
  router.add("POST", "/api/users", createUser, { private: true, roles: adminRoles });
  router.add("PUT", "/api/users/:id", updateUser, { private: true, roles: adminRoles });
  router.add("PATCH", "/api/users/:id/status", updateUserStatus, { private: true, roles: adminRoles });
  router.add("DELETE", "/api/users/:id", deleteUser, { private: true, roles: adminRoles });
}
