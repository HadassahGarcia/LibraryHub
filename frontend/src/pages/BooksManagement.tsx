import React, { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import type { Book, Category } from "../types/library";
import { ManagementHeader } from "../components/admin/shared/ManagementHeader";
import { SearchBox } from "../components/admin/shared/SearchBox";
import { BookFormModal } from "../components/admin/books/BookFormModal";
import { BooksTable } from "../components/admin/books/BooksTable";

const BOOK_STATUSES = ["Disponible", "Prestado", "Mantenimiento", "Baja"] as const;
type BookStatus = typeof BOOK_STATUSES[number];

export default function BooksManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const fetchBooks = async () => {
    try {
      const [{ data: booksData }, { data: categoriesData }] = await Promise.all([
        api.get<Book[]>("/books"),
        api.get<Category[]>("/book-categories"),
      ]);
      setBooks(booksData);
      setCategories(categoriesData.map((category) => category.name));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fallo al obtener los registros.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const filteredBooks = useMemo(
    () => books.filter((book) => book.title.toLowerCase().includes(search.toLowerCase()) || book.author.toLowerCase().includes(search.toLowerCase())),
    [books, search],
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este registro?")) return;
    try {
      await api.delete(`/books/${id}`);
      setBooks(books.filter((book) => book.id !== id));
      toast.success("Registro purgado de los archivos.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fallo al eliminar.");
    }
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const bookData = Object.fromEntries(formData.entries());

    try {
      if (editingBook) {
        await api.put(`/books/${editingBook.id}`, { ...editingBook, ...bookData });
        toast.success("Registro actualizado.");
      } else {
        await api.post("/books", { ...bookData, status: "Disponible" });
        toast.success("Nuevo registro catalogado.");
      }
      await fetchBooks();
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fallo al guardar registro.");
    }
  };

  const handleStatusChange = async (id: string, status: BookStatus) => {
    try {
      await api.patch(`/books/${id}/status`, { status });
      setBooks(books.map((b) => (b.id === id ? { ...b, status } : b)));
      toast.success(`Estado actualizado: ${status}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fallo al cambiar estado.");
    }
  };

  const openForm = (book: Book | null = null) => {
    setEditingBook(book);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 relative">
      <ManagementHeader title="Gestión del Catálogo" description="Gestiona la colección principal de la biblioteca" actionLabel="Añadir Registro" ActionIcon={Plus} onAction={() => openForm()} />
      <SearchBox value={search} onChange={setSearch} placeholder="Buscar por título o autor..." />
      <BooksTable books={filteredBooks} loading={loading} onEdit={openForm} onDelete={handleDelete} onStatusChange={handleStatusChange} statuses={BOOK_STATUSES} />
      <BookFormModal open={isModalOpen} book={editingBook} categories={categories} onClose={() => setIsModalOpen(false)} onSubmit={handleSave} />
    </div>
  );
}
