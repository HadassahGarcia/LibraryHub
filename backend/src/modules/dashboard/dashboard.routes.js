import { staffRoles } from "../shared/roles.js";
import { dashboardSummary } from "./dashboard.controller.js";

export function registerDashboardRoutes(router) {
  router.add("GET", "/api/dashboard/summary", dashboardSummary, { private: true, roles: staffRoles });
}
