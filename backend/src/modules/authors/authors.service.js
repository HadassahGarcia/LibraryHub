import { repos } from "../shared/repositories.js";
import { booksByField } from "../shared/libraryRules.js";

export async function deleteAuthorWithRules(authorId) {
  const author = await repos.authors.get(authorId);
  if (!author) return { error: [404, "Autor no encontrado", "AUTHOR_NOT_FOUND"] };
  if ((await booksByField("author", author.name)).length > 0) {
    return { error: [409, "No se puede eliminar un autor con libros registrados", "AUTHOR_HAS_BOOKS"] };
  }

  await repos.authors.delete(authorId);
  return { ok: true };
}
