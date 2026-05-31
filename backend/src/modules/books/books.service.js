import { optionalNumber, optionalString, requiredString } from "../../utils/validation.js";
import { repos } from "../shared/repositories.js";
import { activeLoansForBook } from "../shared/libraryRules.js";

export function bookPayload(body) {
  return {
    title: requiredString(body, "title"),
    author: requiredString(body, "author"),
    category: requiredString(body, "category"),
    isbn: requiredString(body, "isbn"),
    status: optionalString(body, "status", "Disponible"),
    cover: optionalString(body, "cover"),
    description: optionalString(body, "description"),
    publishedYear: optionalNumber(body, "publishedYear", new Date().getFullYear()),
  };
}

export async function deleteBookWithRules(bookId) {
  const book = await repos.books.get(bookId);
  if (!book) return { error: [404, "Libro no encontrado", "BOOK_NOT_FOUND"] };
  if (book.status === "Prestado" || (await activeLoansForBook(bookId)).length > 0) {
    return { error: [409, "No se puede eliminar un libro con préstamos activos", "BOOK_HAS_ACTIVE_LOANS"] };
  }

  await repos.books.delete(bookId);
  return { ok: true };
}
