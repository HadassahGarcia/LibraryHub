import React, { useEffect, useState } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Search, Banknote } from "lucide-react";

export default function FinesManagement() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchFines = async () => {
    try {
      const { data } = await api.get("/fines");
      setFines(data);
    } catch (error) {
      toast.error("Fallo al obtener el registro de multas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const handlePay = async (id) => {
    if (!window.confirm("¿Confirmar recepción del pago por esta infracción?"))
      return;
    try {
      await api.post(`/fines/${id}/pay`);
      toast.success("Infracción saldada.");
      fetchFines();
    } catch (e) {
      toast.error("Fallo al procesar el pago.");
    }
  };

  const filteredFines = fines.filter(
    (f) =>
      f.userName.toLowerCase().includes(search.toLowerCase()) ||
      f.reason.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-foreground pb-4 gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-serif italic leading-none">
            Multas e Infracciones
          </h2>
          <p className="text-xs mt-2 uppercase tracking-widest font-bold opacity-60">
            Libro Mayor de deudas pendientes logradas por demoras y daños
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-1 p-6 bg-secondary/30 border border-border flex justify-between items-center">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">
              Deuda Total Activa
            </p>
            <p className="text-3xl font-serif mt-2">
              $
              {fines
                .filter((f) => f.status === "Pendiente")
                .reduce((acc, curr) => acc + curr.amount, 0)
                .toFixed(2)}
            </p>
          </div>
          <Banknote className="w-10 h-10 text-primary opacity-20" />
        </div>
        <div className="md:col-span-3 flex bg-card border border-border p-2 focus-within:border-foreground transition-colors self-end">
          <Search className="w-5 h-5 text-muted-foreground ml-2 my-auto box-content" />
          <input
            type="text"
            placeholder="Buscar por miembro o motivo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none w-full px-4 py-2 font-serif text-sm"
          />
        </div>
      </div>

      <div className="bg-card border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                ID Oficio
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Deudor
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground hidden sm:table-cell">
                Concepto
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Cargo
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Estado
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-muted-foreground animate-pulse"
                >
                  Consultando el libro mayor...
                </td>
              </tr>
            ) : filteredFines.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-muted-foreground font-serif italic"
                >
                  Ninguna infracción en los registros.
                </td>
              </tr>
            ) : (
              filteredFines.map((fine) => (
                <tr
                  key={fine.id}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4 font-mono text-xs opacity-60">
                    #{fine.id}
                  </td>
                  <td className="p-4 font-bold">{fine.userName}</td>
                  <td className="p-4 font-serif text-muted-foreground hidden sm:table-cell">
                    {fine.reason}
                  </td>
                  <td className="p-4 font-mono font-bold">
                    ${fine.amount.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 border rounded-full
                          ${fine.status === "Pagado" ? "border-foreground text-foreground" : "border-destructive text-destructive"}`}
                    >
                      {fine.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {fine.status === "Pendiente" ? (
                      <button
                        onClick={() => handlePay(fine.id)}
                        className="text-xs uppercase font-bold tracking-wider text-primary border-b border-primary hover:text-foreground hover:border-foreground transition-colors"
                      >
                        Saldar
                      </button>
                    ) : (
                      <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                        Saldada
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
