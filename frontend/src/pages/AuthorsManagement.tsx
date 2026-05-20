import React, { useEffect, useMemo, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";
import type { Author } from "../types/library";
import { ManagementHeader } from "../components/admin/shared/ManagementHeader";
import { SearchBox } from "../components/admin/shared/SearchBox";

export default function AuthorsManagement() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [editing, setEditing] = useState<Author | null>(null);

  const fetchAuthors = async () => {
    const { data } = await api.get<Author[]>("/authors");
    setAuthors(data);
  };

  useEffect(() => {
    fetchAuthors().catch(() => toast.error("Fallo al obtener autores."));
  }, []);

  const filtered = useMemo(() => authors.filter((author) => author.name.toLowerCase().includes(search.toLowerCase())), [authors, search]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (editing) {
        await api.put(`/authors/${editing.id}`, { name, bio });
        toast.success("Autor actualizado.");
      } else {
        await api.post("/authors", { name, bio });
        toast.success("Autor registrado.");
      }
      setName("");
      setBio("");
      setEditing(null);
      await fetchAuthors();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fallo al guardar autor.");
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("¿Eliminar este autor?")) return;
    await api.delete(`/authors/${id}`);
    setAuthors(authors.filter((author) => author.id !== id));
  };

  return (
    <div className="space-y-6">
      <ManagementHeader title="Autores" description="Administra autores del catálogo" />
      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 space-y-6">
          <SearchBox value={search} onChange={setSearch} placeholder="Buscar autor..." />
          <div className="bg-card border border-border shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead><tr className="border-b border-border bg-muted/50"><th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Autor</th><th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Bio</th><th className="p-4 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Acciones</th></tr></thead>
              <tbody>
                {filtered.map((author) => (
                  <tr key={author.id} className="border-b border-border hover:bg-muted/30">
                    <td className="p-4 font-bold">{author.name}</td>
                    <td className="p-4 font-serif text-muted-foreground">{author.bio}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => { setEditing(author); setName(author.name); setBio(author.bio || ""); }} className="text-muted-foreground hover:text-foreground"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => remove(author.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <form onSubmit={submit} className="bg-card border border-border p-6 shadow-sm space-y-6">
          <h3 className="font-heading font-bold text-xl flex items-center gap-2"><Plus className="w-4 h-4" /> {editing ? "Editar Autor" : "Añadir Autor"}</h3>
          <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Nombre" className="w-full border-b border-border bg-transparent p-2 outline-none focus:border-foreground" />
          <textarea value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Biografía breve" className="w-full border border-border bg-transparent p-3 outline-none focus:border-foreground font-serif text-sm resize-none" rows={4} />
          <button className="w-full bg-foreground text-background font-bold uppercase text-xs tracking-widest py-3 hover:bg-primary transition-colors">Guardar</button>
        </form>
      </div>
    </div>
  );
}
