import { staffRoles } from "../shared/roles.js";
import { closeLoan, createLoan, listLoans, listUserLoans, requestLoan } from "./loans.controller.js";

export function registerLoanRoutes(router) {
  router.add("GET", "/api/loans", listLoans, { private: true, roles: staffRoles });
  router.add("GET", "/api/users/:id/loans", listUserLoans, { private: true });
  router.add("POST", "/api/loans", createLoan, { private: true, roles: staffRoles });
  router.add("POST", "/api/loans/request", requestLoan, { private: true });
  router.add("POST", "/api/loans/:id/return", closeLoan, { private: true, roles: staffRoles });
}
