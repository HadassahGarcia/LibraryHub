import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import api from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";

export default function Profile() {
  const { user, changePassword } = useAuthStore();
  const [loans, setLoans] = useState([]);
  const [booksLookup, setBooksLookup] = useState({});
  const [password, setPassword] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      api.get(`/users/${user.id}/loans`),
      api.get("/books"),
    ]).then(([loansRes, booksRes]) => {
      setLoans(loansRes.data);
      const lookup = {};
      booksRes.data.forEach((b) => (lookup[b.id] = b));
      setBooksLookup(lookup);
    }).catch(() => setLoans([]));
  }, [user?.id]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setSavingPw(true);
    try {
      await changePassword(password);
      toast.success("Contraseña actualizada.");
      setPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cambiar contraseña.");
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b-[3px] border-foreground pb-6">
        <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-tighter mb-4">Perfil</h1>
        <p className="font-serif italic text-muted-foreground text-lg">Tu tarjeta de biblioteca y tu historial de préstamos.</p>
      </div>

      <section className="grid md:grid-cols-3 gap-6">
        <div className="p-6 bg-card border border-border">
          <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Nombre</p>
          <p className="text-2xl font-serif mt-2">{user?.name}</p>
        </div>
        <div className="p-6 bg-card border border-border">
          <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Correo</p>
          <p className="text-lg font-serif mt-2">{user?.email}</p>
        </div>
        <div className="p-6 bg-card border border-border">
          <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Rol</p>
          <p className="text-2xl font-serif mt-2">{user?.role}</p>
        </div>
      </section>

      <section className="bg-card border border-border p-6 space-y-4">
        <h2 className="text-lg font-bold uppercase tracking-widest">Cambiar Contraseña</h2>
        <form onSubmit={handleChangePassword} className="flex gap-4 items-end max-w-md">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nueva contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              className="w-full border-b border-border bg-transparent p-2 outline-none focus:border-foreground transition-colors"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <button
            type="submit"
            disabled={savingPw}
            className="px-6 py-2 bg-foreground text-background font-bold uppercase text-xs tracking-widest hover:bg-primary transition-colors disabled:opacity-50"
          >
            {savingPw ? "Guardando..." : "Actualizar"}
          </button>
        </form>
      </section>

      <section className="bg-card border border-border overflow-x-auto">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-bold uppercase tracking-widest">Historial de Préstamos</h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-4 text-xs uppercase tracking-widest text-muted-foreground">Libro</th>
              <th className="p-4 text-xs uppercase tracking-widest text-muted-foreground">Fecha Límite</th>
              <th className="p-4 text-xs uppercase tracking-widest text-muted-foreground">Estado</th>
            </tr>
          </thead>
          <tbody>
            {loans.length === 0 ? (
              <tr><td colSpan={3} className="p-8 text-center font-serif italic text-muted-foreground">Sin préstamos registrados.</td></tr>
            ) : loans.map((loan) => {
              const book = booksLookup[loan.bookId];
              const isOverdue = loan.status === "Activo" && new Date(loan.dueDate) < new Date();
              return (
                <tr key={loan.id} className={`border-b border-border ${isOverdue ? "bg-destructive/5" : ""}`}>
                  <td className="p-4">
                    <p className="font-bold">{book?.title || loan.bookId}</p>
                    {book?.author && <p className="text-xs font-serif italic text-muted-foreground">{book.author}</p>}
                  </td>
                  <td className={`p-4 font-mono text-xs ${isOverdue ? "text-destructive font-bold" : ""}`}>
                    {format(new Date(loan.dueDate), "dd MMM yyyy")}
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2 py-0.5 border rounded-full uppercase font-bold tracking-widest ${
                      loan.status === "Devuelto" ? "border-foreground text-foreground" :
                      isOverdue ? "border-destructive text-destructive" :
                      "border-primary text-primary"
                    }`}>
                      {isOverdue ? "Atrasado" : loan.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
