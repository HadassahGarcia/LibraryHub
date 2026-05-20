import React, { useEffect, useState } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Search, CheckCircle2, Plus, X } from "lucide-react";
import { format, addDays } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

interface Loan {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  status: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function LoansManagement() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [booksLookup, setBooksLookup] = useState<Record<string, Book>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ bookId: "", userId: "", dueDate: format(addDays(new Date(), 14), "yyyy-MM-dd") });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [loansRes, booksRes] = await Promise.all([api.get("/loans"), api.get("/books")]);
      setLoans(loansRes.data);
      const lookup: Record<string, Book> = {};
      booksRes.data.forEach((b: Book) => (lookup[b.id] = b));
      setBooksLookup(lookup);
      setAllBooks(booksRes.data);
    } catch {
      toast.error("Fallo al obtener el registro de préstamos.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get<User[]>("/users");
      setAllUsers(data);
    } catch {
      toast.error("Fallo al obtener usuarios.");
    }
  };

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  const openModal = () => {
    setForm({ bookId: "", userId: "", dueDate: format(addDays(new Date(), 14), "yyyy-MM-dd") });
    setModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bookId || !form.userId) {
      toast.error("Selecciona libro y usuario.");
      return;
    }
    setSaving(true);
    try {
      const user = allUsers.find((u) => u.id === form.userId);
      await api.post("/loans", {
        bookId: form.bookId,
        userId: form.userId,
        userName: user?.name || "",
        dueDate: new Date(form.dueDate).toISOString(),
      });
      toast.success("Préstamo registrado.");
      setModalOpen(false);
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fallo al crear préstamo.");
    } finally {
      setSaving(false);
    }
  };

  const handleReturn = async (id: string) => {
    if (!window.confirm("¿Confirmar devolución de este tomo?")) return;
    try {
      await api.post(`/loans/${id}/return`);
      toast.success("Tomo devuelto exitosamente.");
      fetchData();
    } catch {
      toast.error("Fallo al registrar la devolución.");
    }
  };

  const filteredLoans = loans.filter(
    (l) =>
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      (booksLookup[l.bookId]?.title.toLowerCase() || "").includes(search.toLowerCase()),
  );

  const availableBooks = allBooks.filter((b) => b.status === "Disponible");

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-foreground pb-4 gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-serif italic leading-none">Registro de Préstamos</h2>
          <p className="text-xs mt-2 uppercase tracking-widest font-bold opacity-60">Control de tomos en circulación</p>
        </div>
        <button
          onClick={openModal}
          className="bg-foreground text-background font-bold uppercase text-xs tracking-widest px-6 py-3 hover:bg-primary transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nuevo Préstamo
        </button>
      </div>

      <div className="flex bg-card border border-border p-2 max-w-md focus-within:border-foreground transition-colors">
        <Search className="w-5 h-5 text-muted-foreground ml-2 my-auto box-content" />
        <input
          type="text"
          placeholder="Buscar por prestatario o título..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none w-full px-4 py-2 font-serif text-sm"
        />
      </div>

      <div className="bg-card border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Tomo</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Prestatario</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground hidden sm:table-cell">Fecha Salida</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground hidden md:table-cell">Fecha Límite</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Estado</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground animate-pulse">Cargando registros...</td></tr>
            ) : filteredLoans.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground font-serif italic">Ningún registro coincide.</td></tr>
            ) : (
              filteredLoans.map((loan) => {
                const book = booksLookup[loan.bookId];
                const isOverdue = loan.status === "Activo" && new Date(loan.dueDate) < new Date();
                return (
                  <tr key={loan.id} className={`border-b border-border hover:bg-muted/30 transition-colors ${isOverdue ? "bg-destructive/5" : ""}`}>
                    <td className="p-4">
                      <p className="font-bold">{book?.title || "Tomo Desconocido"}</p>
                      <p className="text-xs font-serif italic text-muted-foreground">{book?.author}</p>
                    </td>
                    <td className="p-4"><span className="font-medium">{loan.userName}</span></td>
                    <td className="p-4 hidden sm:table-cell font-mono text-xs">{format(new Date(loan.borrowDate), "dd MMM, yyyy")}</td>
                    <td className={`p-4 hidden md:table-cell font-mono text-xs ${isOverdue ? "text-destructive font-bold" : ""}`}>
                      {format(new Date(loan.dueDate), "dd MMM, yyyy")}
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 border rounded-full ${
                        loan.status === "Devuelto" ? "border-foreground text-foreground" :
                        isOverdue ? "border-destructive text-destructive" :
                        "border-primary text-primary"
                      }`}>
                        {isOverdue ? "Atrasado" : loan.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {loan.status === "Activo" && (
                        <button onClick={() => handleReturn(loan.id)} className="text-xs uppercase font-bold tracking-wider text-primary border-b border-primary hover:text-foreground hover:border-foreground transition-colors">
                          Cerrar Préstamo
                        </button>
                      )}
                      {loan.status === "Devuelto" && (
                        <CheckCircle2 className="w-5 h-5 text-muted-foreground ml-auto opacity-50" />
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl bg-card border-[2px] border-foreground shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30">
                <h3 className="font-heading font-bold text-2xl">Registrar Préstamo</h3>
                <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Libro (disponibles)</label>
                  <select
                    value={form.bookId}
                    onChange={(e) => setForm({ ...form, bookId: e.target.value })}
                    required
                    className="w-full border-b border-border bg-transparent p-2 outline-none focus:border-foreground transition-colors"
                  >
                    <option value="">— Seleccionar libro —</option>
                    {availableBooks.map((b) => (
                      <option key={b.id} value={b.id}>{b.title} — {b.author}</option>
                    ))}
                  </select>
                  {availableBooks.length === 0 && (
                    <p className="text-xs text-destructive">No hay libros disponibles.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Usuario / Prestatario</label>
                  <select
                    value={form.userId}
                    onChange={(e) => setForm({ ...form, userId: e.target.value })}
                    required
                    className="w-full border-b border-border bg-transparent p-2 outline-none focus:border-foreground transition-colors"
                  >
                    <option value="">— Seleccionar usuario —</option>
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fecha Límite de Devolución</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    required
                    min={format(new Date(), "yyyy-MM-dd")}
                    className="w-full border-b border-border bg-transparent p-2 outline-none focus:border-foreground transition-colors font-mono"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">Cancelar</button>
                  <button type="submit" disabled={saving || availableBooks.length === 0} className="px-6 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:bg-primary transition-colors disabled:opacity-50">
                    {saving ? "Registrando..." : "Registrar Préstamo"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
