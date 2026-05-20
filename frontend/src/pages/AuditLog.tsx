import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Search } from "lucide-react";
import api from "../lib/api";
import toast from "react-hot-toast";

interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  userId?: string;
  userEmail?: string;
  ip?: string;
  metadata?: Record<string, unknown>;
  at: string;
}

export default function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get<AuditEntry[]>("/audit")
      .then(({ data }) => setEntries(data.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())))
      .catch(() => toast.error("Fallo al obtener el registro de auditoría."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = entries.filter(
    (e) =>
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.entity.toLowerCase().includes(search.toLowerCase()) ||
      (e.userEmail || "").toLowerCase().includes(search.toLowerCase()),
  );

  const actionColor: Record<string, string> = {
    login: "border-primary text-primary",
    logout: "border-muted-foreground text-muted-foreground",
    register: "border-green-600 text-green-700",
    create: "border-green-600 text-green-700",
    update: "border-primary text-primary",
    delete: "border-destructive text-destructive",
    status_change: "border-primary text-primary",
    loan_return: "border-foreground text-foreground",
    fine_payment: "border-foreground text-foreground",
    change_password: "border-primary text-primary",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-foreground pb-4 gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-serif italic leading-none">Registro de Auditoría</h2>
          <p className="text-xs mt-2 uppercase tracking-widest font-bold opacity-60">Historial completo de acciones del sistema</p>
        </div>
      </div>

      <div className="flex bg-card border border-border p-2 max-w-md focus-within:border-foreground transition-colors">
        <Search className="w-5 h-5 text-muted-foreground ml-2 my-auto box-content" />
        <input
          type="text"
          placeholder="Buscar por acción, recurso, usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none w-full px-4 py-2 font-serif text-sm"
        />
      </div>

      <div className="bg-card border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Fecha</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Acción</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Recurso</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground hidden md:table-cell">Usuario</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">IP</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground animate-pulse">Cargando bitácora...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground font-serif italic">Sin entradas en el registro.</td></tr>
            ) : (
              filtered.map((entry) => (
                <tr key={entry.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-mono text-xs text-muted-foreground">
                    {entry.at ? format(new Date(entry.at), "dd/MM/yy HH:mm") : "—"}
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 border rounded-full ${actionColor[entry.action] || "border-foreground text-foreground"}`}>
                      {entry.action}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-mono font-bold">{entry.entity}</span>
                    {entry.entityId && <span className="text-[10px] text-muted-foreground ml-2">#{entry.entityId.slice(0, 8)}</span>}
                  </td>
                  <td className="p-4 font-serif text-sm text-muted-foreground hidden md:table-cell">{entry.userEmail || "—"}</td>
                  <td className="p-4 font-mono text-xs text-muted-foreground hidden lg:table-cell">{entry.ip || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
