import React, { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Edit2, Search, Trash2 } from "lucide-react";

export default function CategoriesManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [editing, setEditing] = useState(null);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/book-categories");
      setCategories(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fallo al obtener las categorías.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.name.toLowerCase().includes(search.toLowerCase())),
    [categories, search],
  );

  const handleSave = async (event) => {
    event.preventDefault();
    if (!newCategory.trim()) return;
    try {
      if (editing) {
        await api.put(`/book-categories/${editing.id}`, { name: newCategory });
        toast.success("Categoría actualizada.");
      } else {
        await api.post("/book-categories", { name: newCategory });
        toast.success("Nueva categoría catalogada.");
      }
      setNewCategory("");
      setEditing(null);
      await fetchCategories();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fallo al guardar categoría.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta categoría?")) return;
    await api.delete(`/book-categories/${id}`);
    setCategories(categories.filter((category) => category.id !== id));
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-foreground pb-4 gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-serif italic leading-none">Gestión de Categorías</h2>
          <p className="text-xs mt-2 uppercase tracking-widest font-bold opacity-60">Organiza las taxonomías de la biblioteca</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 space-y-6">
          <div className="flex bg-card border border-border p-2 focus-within:border-foreground transition-colors">
            <Search className="w-5 h-5 text-muted-foreground ml-2 my-auto box-content" />
            <input type="text" placeholder="Buscar categoría..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none w-full px-4 py-2 font-serif text-sm" />
          </div>

          <div className="bg-card border border-border shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">ID. Rev</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Denominación</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="p-8 text-center text-muted-foreground animate-pulse">Cargando índices...</td></tr>
                ) : filteredCategories.length === 0 ? (
                  <tr><td colSpan={3} className="p-8 text-center text-muted-foreground font-serif italic">Ninguna categoría coincide con tu búsqueda.</td></tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr key={category.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-mono text-xs text-muted-foreground">{category.id}</td>
                      <td className="p-4 font-bold">{category.name}</td>
                      <td className="p-4">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => { setEditing(category); setNewCategory(category.name); }} className="text-muted-foreground hover:text-foreground"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(category.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card border border-border p-6 shadow-sm">
          <h3 className="font-heading font-bold text-xl mb-6">{editing ? "Editar Categoría" : "Añadir Categoría"}</h3>
          <form onSubmit={handleSave} className="space-y-6">
            <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} required placeholder="Nombre" className="w-full border-b border-border bg-transparent p-2 outline-none focus:border-foreground transition-colors font-semibold" />
            <button type="submit" className="w-full bg-foreground text-background font-bold uppercase text-xs tracking-widest py-3 hover:bg-primary transition-colors">Guardar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
