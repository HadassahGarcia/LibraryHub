import { Edit2, Trash2 } from "lucide-react";

const STATUS_COLORS = {
  Disponible: "text-green-700",
  Prestado: "text-yellow-700",
  Mantenimiento: "text-orange-700",
  Baja: "text-destructive",
};

export function BooksTable({ books, loading, onEdit, onDelete, onStatusChange, statuses }) {
  return (
    <div className="bg-card border border-border shadow-sm overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {["Título", "Autor", "Categoría", "ISBN", "Estado", "Acciones"].map((heading) => (
              <th key={heading} className={`p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground ${heading === "Acciones" ? "text-right" : ""}`}>
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6} className="p-8 text-center text-muted-foreground animate-pulse">Cargando archivos...</td></tr>
          ) : books.length === 0 ? (
            <tr><td colSpan={6} className="p-8 text-center text-muted-foreground font-serif italic">Ningún registro coincide con tu búsqueda.</td></tr>
          ) : (
            books.map((book) => (
              <tr key={book.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-4 font-bold">{book.title}</td>
                <td className="p-4 font-serif text-muted-foreground hidden md:table-cell">{book.author}</td>
                <td className="p-4 hidden sm:table-cell"><span className="text-xs uppercase tracking-wider bg-muted px-2 py-1">{book.category}</span></td>
                <td className="p-4 font-mono text-sm text-muted-foreground hidden lg:table-cell">{book.isbn}</td>
                <td className="p-4">
                  {onStatusChange && statuses ? (
                    <select
                      value={book.status}
                      onChange={(e) => onStatusChange(book.id, e.target.value)}
                      className={`text-xs font-bold uppercase tracking-widest bg-transparent border border-border px-2 py-1 cursor-pointer ${STATUS_COLORS[book.status] ?? "text-primary"}`}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`text-xs font-bold uppercase tracking-widest ${STATUS_COLORS[book.status] ?? "text-primary"}`}>{book.status}</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => onEdit(book)} className="text-muted-foreground hover:text-foreground transition-colors p-1" title="Editar"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(book.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
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
