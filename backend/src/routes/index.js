import { ok } from "../utils/response.js";
import { Router } from "./router.js";
import { registerAuditRoutes } from "../modules/audit/audit.routes.js";
import { registerAuthRoutes } from "../modules/auth/auth.routes.js";
import { registerAuthorRoutes } from "../modules/authors/authors.routes.js";
import { registerBookRoutes } from "../modules/books/books.routes.js";
import { registerCategoryRoutes } from "../modules/categories/categories.routes.js";
import { registerDashboardRoutes } from "../modules/dashboard/dashboard.routes.js";
import { registerFineRoutes } from "../modules/fines/fines.routes.js";
import { registerLoanRoutes } from "../modules/loans/loans.routes.js";
import { registerRoleRoutes } from "../modules/roles/roles.routes.js";
import { registerUserRoutes } from "../modules/users/users.routes.js";

export function createRouter() {
  const router = new Router();

  router.add("GET", "/api/health", (_req, res) => ok(res, { status: "ok", service: "LibraryHub API" }));

  registerAuthRoutes(router);
  registerRoleRoutes(router);
  registerUserRoutes(router);
  registerBookRoutes(router);
  registerAuthorRoutes(router);
  registerCategoryRoutes(router);
  registerLoanRoutes(router);
  registerFineRoutes(router);
  registerDashboardRoutes(router);
  registerAuditRoutes(router);

  return router;
}
