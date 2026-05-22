import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function BookFormModal({ open, book, categories, onClose, onSubmit }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-2xl bg-card border-[2px] border-foreground shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30">
              <h3 className="font-heading font-bold text-2xl">{book ? "Editar Registro" : "Catalogar Nuevo Libro"}</h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Título" name="title" defaultValue={book?.title} required />
                <Field label="Autor" name="author" defaultValue={book?.author} required serif />
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categoría</label>
                  <select name="category" defaultValue={book?.category || categories[0] || "Ficción"} className="w-full border-b border-border bg-transparent p-2 outline-none focus:border-foreground transition-colors">
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <Field label="ISBN" name="isbn" defaultValue={book?.isbn} required mono />
                <div className="md:col-span-2">
                  <Field label="URL de la Portada" name="cover" defaultValue={book?.cover || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80"} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sinopsis</label>
                  <textarea name="description" defaultValue={book?.description} rows={3} className="w-full border border-border bg-transparent p-3 outline-none focus:border-foreground transition-colors font-serif text-sm resize-none" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:bg-primary transition-colors">Guardar Registro</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, name, defaultValue, required, serif, mono }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        className={`w-full border-b border-border bg-transparent p-2 outline-none focus:border-foreground transition-colors ${serif ? "font-serif italic" : ""} ${mono ? "font-mono text-sm" : "font-semibold"}`}
      />
    </div>
  );
}
