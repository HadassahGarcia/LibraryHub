import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Calendar, Tag, User, AlertCircle } from "lucide-react";
import api from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";
import type { Book } from "../types/library";
import toast from "react-hot-toast";

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data } = await api.get(`/books/${id}`);
        setBook(data);
      } catch {
        toast.error("No se pudo cargar el libro.");
        navigate("/catalog");
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id, navigate]);

  const handleLoanRequest = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setRequesting(true);
    try {
      await api.post("/loans/request", { bookId: id });
      toast.success("Préstamo solicitado correctamente.");
      setBook((prev) => prev ? { ...prev, status: "Prestado" } : prev);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "No se pudo solicitar el préstamo.");
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 animate-pulse">
        <div className="md:w-1/3 aspect-[2/3] bg-muted border border-border" />
        <div className="flex-1 flex flex-col gap-4 pt-4">
          <div className="h-4 w-1/4 bg-muted" />
          <div className="h-10 w-3/4 bg-muted" />
          <div className="h-4 w-1/3 bg-muted" />
          <div className="h-32 w-full bg-muted mt-4" />
        </div>
      </div>
    );
  }

  if (!book) return null;

  const available = book.status === "Disponible";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto"
    >
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-10"
      >
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Cover */}
        <div className="md:w-1/3 shrink-0">
          <div className="aspect-[2/3] w-full overflow-hidden border border-border bg-muted relative">
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-full object-cover mix-blend-multiply"
            />
            {!available && (
              <div className="absolute top-3 right-3 bg-foreground text-background text-[10px] uppercase font-bold tracking-widest px-2 py-1">
                En Préstamo
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col gap-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary block mb-3">
              {book.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-4">
              {book.title}
            </h1>

            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground font-serif mb-6">
              <span className="inline-flex items-center gap-2">
                <User className="w-4 h-4" /> {book.author}
              </span>
              {book.publishedYear && (
                <span className="inline-flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> {book.publishedYear}
                </span>
              )}
              {book.isbn && (
                <span className="inline-flex items-center gap-2">
                  <Tag className="w-4 h-4" /> ISBN: {book.isbn}
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-3">Sinopsis</h2>
            <p className="font-serif text-muted-foreground leading-relaxed text-base">
              {book.description || "Sin descripción disponible."}
            </p>
          </div>

          <div className="border-t border-border pt-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5" />
              <span className="font-bold text-sm uppercase tracking-wider">
                Estado:{" "}
                <span className={available ? "text-green-600" : "text-muted-foreground"}>
                  {book.status}
                </span>
              </span>
            </div>

            {available ? (
              <button
                onClick={handleLoanRequest}
                disabled={requesting}
                className="w-fit px-8 py-3 bg-foreground text-background font-bold uppercase tracking-wider text-sm hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {requesting ? "Solicitando..." : isAuthenticated ? "Solicitar Préstamo" : "Iniciar Sesión para Pedir"}
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground font-serif italic border border-border px-4 py-3 w-fit">
                <AlertCircle className="w-4 h-4" />
                Este libro no está disponible actualmente.
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
