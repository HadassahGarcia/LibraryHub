import { repos } from "../shared/repositories.js";
import { booksByField } from "../shared/libraryRules.js";

export async function deleteCategoryWithRules(categoryId) {
  const category = await repos.categories.get(categoryId);
  if (!category) return { error: [404, "Categoría no encontrada", "CATEGORY_NOT_FOUND"] };
  if ((await booksByField("category", category.name)).length > 0) {
    return { error: [409, "No se puede eliminar una categoría con libros registrados", "CATEGORY_HAS_BOOKS"] };
  }

  await repos.categories.delete(categoryId);
  return { ok: true };
}
