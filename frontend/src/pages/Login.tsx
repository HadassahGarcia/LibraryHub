import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, isStaffRole } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("admin@library.com");
  const [password, setPassword] = useState("LibraryHub123!");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success("Autenticado con éxito.");
      navigate(isStaffRole(user.role) ? "/admin" : "/profile");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "La autenticación falló.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-foreground selection:bg-primary/20 selection:text-foreground">
      <div className="hidden lg:flex w-1/2 bg-muted relative overflow-hidden items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1521587760-49b2512a9e52?q=80&w=2000&auto=format&fit=crop"
          alt="Library"
          className="absolute inset-0 w-full h-full object-cover grayscale opacity-70"
        />
        <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px]"></div>
        <div className="relative z-10 px-12 text-center max-w-lg">
          <h1 className="text-6xl font-serif font-bold text-foreground mb-6 drop-shadow-md tracking-tighter">
            Library<span className="text-primary">Hub</span>
          </h1>
          <p className="font-serif text-2xl italic text-foreground/90 font-medium drop-shadow-md">
            "El conocimiento es gratis en la biblioteca. Solo necesitas traer tu propio envase."
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative">
        <div className="absolute top-8 left-8 lg:hidden">
          <h1 className="text-3xl font-serif font-bold tracking-tighter">
            Library<span className="text-primary">Hub</span>
          </h1>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-5xl font-serif italic leading-none mb-4">Iniciar Sesión</h2>
            <p className="text-xs uppercase tracking-widest font-bold opacity-60">
              Ingresa tus credenciales para acceder a los archivos
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b-[2px] border-border bg-transparent px-0 py-3 text-lg outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50"
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b-[2px] border-border bg-transparent px-0 py-3 text-lg outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background font-bold uppercase tracking-widest py-4 hover:bg-primary transition-colors disabled:opacity-50 mt-8"
            >
              {loading ? "Autenticando..." : "Acceder a la Cuenta"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
