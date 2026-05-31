import { staffRoles } from "../shared/roles.js";
import { createBook, deleteBook, getBook, listBooks, updateBook, updateBookStatus } from "./books.controller.js";

export function registerBookRoutes(router) {
  router.add("GET", "/api/books", listBooks);
  router.add("GET", "/api/books/:id", getBook);
  router.add("POST", "/api/books", createBook, { private: true, roles: staffRoles });
  router.add("PUT", "/api/books/:id", updateBook, { private: true, roles: staffRoles });
  router.add("PATCH", "/api/books/:id/status", updateBookStatus, { private: true, roles: staffRoles });
  router.add("DELETE", "/api/books/:id", deleteBook, { private: true, roles: staffRoles });
}
