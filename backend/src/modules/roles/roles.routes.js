import { adminRoles } from "../shared/roles.js";
import { createRole, deleteRole, listPermissions, listRoles, updateRole } from "./roles.controller.js";

export function registerRoleRoutes(router) {
  router.add("GET", "/api/roles", listRoles, { private: true, roles: adminRoles });
  router.add("POST", "/api/roles", createRole, { private: true, roles: adminRoles });
  router.add("PUT", "/api/roles/:id", updateRole, { private: true, roles: adminRoles });
  router.add("DELETE", "/api/roles/:id", deleteRole, { private: true, roles: adminRoles });
  router.add("GET", "/api/permissions", listPermissions, { private: true, roles: adminRoles });
}
