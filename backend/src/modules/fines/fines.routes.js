import { staffRoles } from "../shared/roles.js";
import { listFines, payFine } from "./fines.controller.js";

export function registerFineRoutes(router) {
  router.add("GET", "/api/fines", listFines, { private: true });
  router.add("POST", "/api/fines/:id/pay", payFine, { private: true, roles: staffRoles });
}
