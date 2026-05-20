import type { FormEvent } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { User } from "../../../types/library";

interface UserFormModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function UserFormModal({ open, user, onClose, onSubmit }: UserFormModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-xl bg-card border-[2px] border-foreground shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30">
              <h3 className="font-heading font-bold text-2xl">{user ? "Editar Registro" : "Inscribir Usuario"}</h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={onSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nombre Completo</label>
                  <input name="name" defaultValue={user?.name} required className="w-full border-b border-border bg-transparent p-2 outline-none focus:border-foreground transition-colors font-semibold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Correo Electrónico</label>
                  <input name="email" type="email" defaultValue={user?.email} required className="w-full border-b border-border bg-transparent p-2 outline-none focus:border-foreground transition-colors font-serif italic" />
                </div>
                {!user && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Contraseña Inicial</label>
                    <input name="password" type="password" minLength={6} defaultValue="LibraryHub123!" className="w-full border-b border-border bg-transparent p-2 outline-none focus:border-foreground transition-colors" />
                  </div>
                )}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cargo / Rol</label>
                  <select name="role" defaultValue={user?.role || "Usuario"} className="w-full border-b border-border bg-transparent p-2 outline-none focus:border-foreground transition-colors">
                    <option value="Administrador">Administrador</option>
                    <option value="Bibliotecario">Bibliotecario</option>
                    <option value="Usuario">Usuario / Lector</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <button type="button" onClick={onClose} className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:bg-primary transition-colors">Guardar Expediente</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
