import { Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

export function UsersTable({ users, loading, onEdit, onDelete, onToggleStatus }) {
  return (
    <div className="bg-card border border-border shadow-sm overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Nombre / Miembro</th>
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground hidden md:table-cell">Contacto</th>
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Rol / Cargo</th>
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Estado</th>
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={5} className="p-8 text-center text-muted-foreground animate-pulse">Cargando registros...</td></tr>
          ) : users.length === 0 ? (
            <tr><td colSpan={5} className="p-8 text-center text-muted-foreground font-serif italic">Ningún registro coincide.</td></tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className={`border-b border-border hover:bg-muted/30 transition-colors ${user.status === "inactive" ? "opacity-60" : ""}`}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center font-serif text-xs text-background">
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold">{user.name}</span>
                  </div>
                </td>
                <td className="p-4 font-serif text-muted-foreground hidden md:table-cell">{user.email}</td>
                <td className="p-4">
                  <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 border ${["Administrador", "Admin"].includes(user.role) ? "border-primary text-primary" : "border-foreground text-foreground"} rounded-full`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 border rounded-full ${user.status === "inactive" ? "border-destructive text-destructive" : "border-green-600 text-green-700"}`}>
                    {user.status === "inactive" ? "Inactivo" : "Activo"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => onToggleStatus(user)} className="text-muted-foreground hover:text-foreground transition-colors p-1" title={user.status === "inactive" ? "Activar" : "Desactivar"}>
                      {user.status === "inactive" ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                    </button>
                    <button onClick={() => onEdit(user)} className="text-muted-foreground hover:text-foreground transition-colors p-1" title="Editar"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(user.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
