import { staffRoles } from "../shared/roles.js";
import { createCategory, deleteCategory, listCategories, updateCategory } from "./categories.controller.js";

export function registerCategoryRoutes(router) {
  router.add("GET", "/api/book-categories", listCategories);
  router.add("POST", "/api/book-categories", createCategory, { private: true, roles: staffRoles });
  router.add("PUT", "/api/book-categories/:id", updateCategory, { private: true, roles: staffRoles });
  router.add("DELETE", "/api/book-categories/:id", deleteCategory, { private: true, roles: staffRoles });
}
