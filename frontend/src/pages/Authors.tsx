import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users, Search } from "lucide-react";
import api from "../lib/api";
import type { Author } from "../types/library";

export default function Authors() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const { data } = await api.get<Author[]>("/authors");
        setAuthors(data);
      } catch (error) {
        console.error("Error fetching authors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuthors();
  }, []);

  const filteredAuthors = useMemo(
    () => authors.filter((author) => author.name.toLowerCase().includes(search.toLowerCase())),
    [authors, search],
  );

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="border-b-[3px] border-foreground pb-6 mb-8 text-center flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-tighter mb-4">Autores Destacados</h1>
        <p className="font-serif italic text-muted-foreground max-w-2xl text-lg">
          Nuestra extensa colección está forjada por las mentes brillantes de estos escritores, historiadores y visionarios.
        </p>
      </div>

      <div className="flex bg-card border border-border p-2 focus-within:border-primary transition-colors max-w-md mx-auto w-full mb-8">
        <Search className="w-5 h-5 text-muted-foreground ml-2 my-auto box-content" />
        <input type="text" placeholder="Buscar un autor..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none w-full px-4 py-2 font-serif text-sm" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse border border-border" />)}
        </div>
      ) : filteredAuthors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-10">
          {filteredAuthors.map((author, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={author.id}
              className="group cursor-pointer flex flex-col items-center text-center p-6 border border-border hover:border-primary hover:bg-muted/30 transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center font-serif text-2xl font-bold mb-4 group-hover:bg-primary transition-colors">
                {author.name.charAt(0)}
              </div>
              <h3 className="font-serif font-bold text-lg mb-1">{author.name}</h3>
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Obras en catálogo</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-border">
          <Users className="w-10 h-10 mx-auto text-muted-foreground opacity-50 mb-4" />
          <p className="font-serif italic text-muted-foreground">No se encontró al autor.</p>
        </div>
      )}
    </div>
  );
}
