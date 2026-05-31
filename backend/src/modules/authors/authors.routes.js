import { staffRoles } from "../shared/roles.js";
import { createAuthor, deleteAuthor, listAuthors, updateAuthor } from "./authors.controller.js";

export function registerAuthorRoutes(router) {
  router.add("GET", "/api/authors", listAuthors);
  router.add("POST", "/api/authors", createAuthor, { private: true, roles: staffRoles });
  router.add("PUT", "/api/authors/:id", updateAuthor, { private: true, roles: staffRoles });
  router.add("DELETE", "/api/authors/:id", deleteAuthor, { private: true, roles: staffRoles });
}
