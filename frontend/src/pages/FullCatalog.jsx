import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, BookOpen } from "lucide-react";
import api from "../lib/api";

export default function FullCatalog() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data } = await api.get("/books");
        setBooks(data);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || book.category === filter;
    return matchesSearch && matchesFilter;
  });

  const categories = Array.from(new Set(books.map((b) => b.category)));

  return (
    <div className="flex flex-col gap-8">
      <div className="border-b-[3px] border-foreground pb-6 mb-8 text-center flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-tighter mb-4">
          El Catálogo
        </h1>
        <p className="font-serif italic text-muted-foreground max-w-2xl text-lg">
          Explora nuestra colección completa de obras físicas y digitales
          curadas meticulosamente por nuestros bibliotecarios.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-8 bg-muted/20 p-4 border border-border">
        <div className="flex bg-card border border-border focus-within:border-primary transition-colors flex-1 max-w-md">
          <Search className="w-5 h-5 text-muted-foreground ml-3 my-auto" />
          <input
            type="text"
            placeholder="Buscar títulos, autores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none outline-none px-3 py-3 font-serif text-sm"
          />
        </div>

        <div className="flex gap-2 font-serif text-sm flex-wrap justify-center">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 border border-border transition-colors ${
              filter === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card hover:bg-muted"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 border border-border transition-colors ${
                filter === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card hover:bg-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="aspect-[2/3] bg-muted animate-pulse border border-border"></div>
                <div className="h-4 w-1/3 bg-muted animate-pulse"></div>
                <div className="h-6 w-3/4 bg-muted animate-pulse"></div>
                <div className="h-4 w-1/2 bg-muted animate-pulse"></div>
              </div>
            ))}
        </div>
      ) : filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
          {filteredBooks.map((book, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={book.id}
              className="group cursor-pointer flex flex-col"
              onClick={() => navigate(`/books/${book.id}`)}
            >
              <div className="aspect-[2/3] w-full overflow-hidden border border-border bg-muted mb-4 relative">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                />
                {book.status !== "Disponible" && (
                  <div className="absolute top-2 right-2 bg-foreground text-background text-[10px] uppercase font-bold tracking-widest px-2 py-1">
                    En Préstamo
                  </div>
                )}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">
                {book.category}
              </span>
              <h3 className="font-serif font-bold text-xl leading-snug mb-1 group-hover:text-primary transition-colors">
                {book.title}
              </h3>
              <p className="font-serif italic text-muted-foreground text-sm">
                {book.author}
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border border-border border-dashed">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
          <h3 className="font-serif text-2xl font-bold mb-2">
            No se encontraron volúmenes
          </h3>
          <p className="text-muted-foreground italic font-serif">
            Intenta con otros términos de búsqueda o filtros.
          </p>
        </div>
      )}
    </div>
  );
}
