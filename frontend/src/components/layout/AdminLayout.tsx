import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import {
  LayoutDashboard,
  BookCopy,
  Users,
  Tags,
  LogOut,
  Menu,
  CreditCard,
  History,
  PenLine,
  ClipboardList,
} from "lucide-react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cx(...args: (string | undefined | null | false)[]) {
  return twMerge(clsx(...args));
}

export default function AdminLayout() {
  const { logout, user } = useAuthStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { label: "Resumen", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Libros e Inventario", path: "/admin/books", icon: BookCopy },
    { label: "Autores", path: "/admin/authors", icon: PenLine },
    { label: "Categorías", path: "/admin/categories", icon: Tags },
    { label: "Usuarios", path: "/admin/users", icon: Users },
    { label: "Préstamos", path: "/admin/loans", icon: History },
    { label: "Multas", path: "/admin/fines", icon: CreditCard },
    { label: "Auditoría", path: "/admin/audit", icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="bg-foreground text-background flex flex-col shrink-0 overflow-hidden sticky top-0 h-screen"
      >
        <div className="h-24 flex items-center px-8 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2 overflow-hidden truncate"
          >
            {sidebarOpen ? (
              <div>
                <h1 className="text-2xl font-serif font-bold tracking-tighter">
                  Library<span className="text-primary">Hub</span>
                </h1>
                <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">
                  El Archivo Diario
                </p>
              </div>
            ) : (
              <h1 className="text-2xl font-serif font-bold tracking-tighter">
                L<span className="text-primary">H</span>
              </h1>
            )}
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cx(
                  "p-3 rounded flex items-center gap-3 transition-colors cursor-pointer",
                  isActive ? "bg-background/10" : "hover:bg-background/5",
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                {isActive && sidebarOpen && (
                  <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0"></div>
                )}
                <item.icon
                  className={cx(
                    "w-4 h-4 shrink-0",
                    !isActive && "opacity-70",
                    !isActive && !sidebarOpen && "mx-auto",
                  )}
                />
                {sidebarOpen && (
                  <span className={cx("text-sm", !isActive && "opacity-70")}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="p-6 border-t border-background/10 shrink-0">
          <div
            className={cx(
              "flex items-center",
              sidebarOpen ? "justify-between" : "justify-center",
            )}
          >
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-serif text-xs text-background">
                  {user?.name?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold">
                    {user?.name}
                  </p>
                  <p className="text-[10px] opacity-50 uppercase tracking-tighter">
                    {user?.role}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={() => void logout()}
              className="text-background/50 hover:text-background transition-colors p-1"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b border-border flex items-center px-6 justify-between sticky top-0 z-10 box-border">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-heading font-semibold text-lg hidden sm:block">
              {navItems.find((n) => location.pathname.includes(n.path))
                ?.label || "Panel"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Conectado como </span>
              <span className="font-semibold">{user?.email}</span>
            </div>
            <Link
              to="/"
              className="text-xs uppercase tracking-widest hover:text-primary font-semibold border-b border-transparent hover:border-primary transition-colors"
            >
              Ver Catálogo
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
