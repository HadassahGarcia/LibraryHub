import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ChevronRight, BookOpen } from "lucide-react";
import api from "../lib/api";

export default function Catalog() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

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

  return (
    <div className="flex flex-col md:flex-row gap-12">
      <div className="md:w-2/3 flex flex-col">
        <div className="flex items-center justify-between border-b-2 border-foreground pb-2 mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">
            Lectura Destacada
          </h2>
          <span className="text-[11px] font-serif italic text-primary">
            Disponible para consulta
          </span>
        </div>

        {loading ? (
          <div className="w-full h-[500px] bg-muted animate-pulse border border-border"></div>
        ) : books.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="aspect-[16/9] w-full overflow-hidden bg-muted group relative">
              <img
                src={books[0].cover}
                alt={books[0].title}
                className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAiLz4KPGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4xIi8+Cjwvc3ZnPg==')] opacity-30 mix-blend-overlay"></div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                <span>{books[0].category}</span>
                <span className="w-1 h-1 bg-primary rounded-full"></span>
                <span>Por {books[0].author}</span>
              </div>
              <h3
                onClick={() => navigate(`/books/${books[0].id}`)}
                className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-4 underline decoration-primary/20 hover:decoration-primary transition-colors cursor-pointer w-fit"
              >
                {books[0].title}
              </h3>
              <p className="text-lg text-muted-foreground font-serif leading-relaxed mb-6">
                {books[0].description}
              </p>
              <button
                onClick={() => navigate(`/books/${books[0].id}`)}
                className="inline-flex items-center gap-2 border-b-2 border-foreground pb-1 font-bold uppercase tracking-wider text-sm hover:text-primary hover:border-primary transition-colors"
              >
                Leer Resumen <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <p className="font-serif italic text-muted-foreground">
            No hay lecturas destacadas disponibles.
          </p>
        )}
      </div>

      <div className="md:w-1/3 flex flex-col border-l-0 md:border-l border-border md:pl-12">
        <div className="border-b-2 border-foreground pb-2 mb-6 flex justify-between items-center">
          <h2 className="text-sm font-bold uppercase tracking-widest">
            Adiciones Recientes
          </h2>
          <Link
            to="/catalog"
            className="text-[11px] font-serif italic text-primary cursor-pointer hover:underline"
          >
            Ver Catálogo Completo &rarr;
          </Link>
        </div>

        <div className="flex flex-col gap-8">
          {loading
            ? Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-24 h-32 bg-muted animate-pulse"></div>
                    <div className="flex-1 flex flex-col gap-2 p-2">
                      <div className="h-4 w-1/2 bg-muted animate-pulse"></div>
                      <div className="h-6 w-full bg-muted animate-pulse"></div>
                    </div>
                  </div>
                ))
            : books.slice(1, 4).map((book, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={book.id}
                  className="flex gap-6 group cursor-pointer"
                  onClick={() => navigate(`/books/${book.id}`)}
                >
                  <div className="w-24 shrink-0 aspect-[2/3] overflow-hidden border border-border/50">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                      {book.category}
                    </span>
                    <h4 className="font-serif font-bold text-lg leading-tight mb-2 underline decoration-primary/20 group-hover:decoration-primary transition-colors">
                      {book.title}
                    </h4>
                    <span className="text-sm font-serif italic text-muted-foreground">
                      {book.author}
                    </span>
                  </div>
                </motion.div>
              ))}
        </div>

        <div className="mt-12 bg-muted/30 p-8 border border-border text-center flex flex-col items-center">
          <BookOpen className="w-8 h-8 mb-4 text-primary" />
          <h3 className="font-heading font-bold text-xl mb-2">Los Archivos</h3>
          <p className="text-sm font-serif text-muted-foreground mb-6">
            Busca por título o autor dentro del inventario registrado.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`); }}
            className="relative w-full"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, autor..."
              className="w-full border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary transition-colors pr-10"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
              <Search className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
