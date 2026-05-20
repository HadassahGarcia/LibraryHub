import React from "react";
import { Link, Outlet } from "react-router-dom";
import { isStaffRole, useAuthStore } from "../../store/useAuthStore";
import { User as UserIcon } from "lucide-react";

export default function PublicLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20 selection:text-foreground">
      <div className="border-b border-border text-xs uppercase tracking-widest text-muted-foreground py-2 px-6 flex justify-between items-center hide-print">
        <span>
          {new Date().toLocaleDateString("es-MX", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
        <div className="flex gap-4">
          <Link to="/" className="hover:text-primary transition-colors">Vol. 1, Edición 1</Link>
          <span>Est. 2026</span>
        </div>
      </div>

      <header className="border-b-[3px] border-foreground px-6 py-8 flex flex-col items-center relative">
        <Link to="/" className="text-5xl md:text-7xl font-serif font-bold tracking-tighter text-foreground hover:opacity-90 transition-opacity flex items-center gap-2">
          Library<span className="text-primary">Hub</span>
        </Link>
        <p className="font-serif italic text-muted-foreground mt-4 text-lg">"Una curaduría premium de conocimiento e historia."</p>

        <div className="absolute right-6 top-8 flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4 text-sm font-medium">
              <span className="hidden sm:inline-block">Bienvenido, {user?.name}</span>
              <Link to="/profile" className="hover:text-primary transition-colors">Perfil</Link>
              {isStaffRole(user?.role) && <Link to="/admin" className="text-primary hover:underline underline-offset-4">Panel</Link>}
              <button onClick={() => void logout()} className="hover:text-primary transition-colors">Salir</button>
            </div>
          ) : (
            <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Entrar
            </Link>
          )}
        </div>
      </header>

      <nav className="border-b border-border px-6 py-3 flex justify-center gap-8 overflow-x-auto text-sm font-semibold uppercase tracking-wider">
        <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
        <Link to="/catalog" className="hover:text-primary transition-colors">Ver Catálogo Completo</Link>
        <Link to="/authors" className="hover:text-primary transition-colors">Autores</Link>
        <Link to="/curiosities" className="hover:text-primary transition-colors">Curiosidades</Link>
      </nav>

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border mt-12 py-12 px-6 flex flex-col items-center text-center">
        <h2 className="text-3xl font-serif font-bold tracking-tighter mb-4">Library<span className="text-primary">Hub</span></h2>
        <p className="max-w-md text-muted-foreground text-sm font-serif italic mb-8">
          Dedicados a proveer la mejor experiencia de lectura digital. Preservando historias, curando hechos y empoderando mentes.
        </p>
        <div className="flex gap-6 text-sm uppercase tracking-wide">
          <Link to="#" className="hover:text-primary">Sobre Nosotros</Link>
          <Link to="#" className="hover:text-primary">Términos de Servicio</Link>
          <Link to="#" className="hover:text-primary">Política de Privacidad</Link>
          <Link to="#" className="hover:text-primary">Contactar Editores</Link>
        </div>
        <p className="mt-8 text-xs text-muted-foreground uppercase tracking-widest">
          &copy; {new Date().getFullYear()} LibraryHub Digital. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
