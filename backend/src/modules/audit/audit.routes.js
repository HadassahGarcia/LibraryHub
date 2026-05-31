import { adminRoles } from "../shared/roles.js";
import { listAudit } from "./audit.controller.js";

export function registerAuditRoutes(router) {
  router.add("GET", "/api/audit", listAudit, { private: true, roles: adminRoles });
}
