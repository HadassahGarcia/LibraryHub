import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookCopy, Users, CreditCard, Activity, BookOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import api from "../lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    activeLoans: 0,
    pendingFines: 0,
    totalUsers: 0,
    mostBorrowed: [],
    recentLoans: [],
  });

  useEffect(() => {
    api.get("/dashboard/summary")
      .then(({ data }) => setStats(data))
      .catch((e) => console.error("Failed to load dashboard stats", e));
  }, []);

  const borrowedBooks = stats.totalBooks - stats.availableBooks;

  const statCards = [
    { label: "Libros Disponibles", value: stats.availableBooks, total: stats.totalBooks, icon: BookOpen, color: "text-foreground" },
    { label: "Préstamos Activos", value: stats.activeLoans, icon: Activity, color: "text-primary" },
    { label: "Multas Pendientes", value: `$${stats.pendingFines.toFixed(2)}`, icon: CreditCard, color: "text-destructive" },
    { label: "Miembros Totales", value: stats.totalUsers, icon: Users, color: "text-primary" },
  ];

  return (
    <div className="space-y-8">
      <header className="border-b-2 border-foreground pb-4 mb-8 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <div>
          <h2 className="text-5xl font-serif italic leading-none">Resumen</h2>
          <p className="text-xs mt-2 uppercase tracking-widest font-bold opacity-60">
            Resumen diario de las operaciones de la biblioteca
          </p>
        </div>
        <div className="hidden md:flex gap-8 text-right">
          <div className="flex flex-col">
            <span className="text-2xl font-serif">{stats.totalBooks}</span>
            <span className="text-[10px] uppercase font-bold tracking-tighter">Volúmenes Totales</span>
          </div>
          <div className="flex flex-col text-primary">
            <span className="text-2xl font-serif">{borrowedBooks}</span>
            <span className="text-[10px] uppercase font-bold tracking-tighter">Devoluciones Pendientes</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={stat.label}
            className="p-6 bg-secondary/30 border border-border flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <stat.icon className={`w-5 h-5 ${stat.color} opacity-60`} />
              {"total" in stat && stat.total != null && (
                <span className="text-[10px] font-bold opacity-40">/ {stat.total}</span>
              )}
            </div>
            <div className="mt-auto">
              <h3 className="text-3xl font-serif leading-none">{stat.value}</h3>
              <p className="text-[10px] font-bold uppercase tracking-tighter opacity-60 mt-2">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10 mt-8">
        <div className="lg:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-widest flex items-center justify-between border-b border-border pb-2 mb-6">
            Registro Reciente
          </h3>
          <ul className="space-y-6">
            {stats.recentLoans.length === 0 ? (
              <li className="text-muted-foreground font-serif italic text-sm">Sin préstamos recientes.</li>
            ) : (
              stats.recentLoans.map((loan) => (
                <li key={loan.id} className="relative pl-4 group">
                  <div className="absolute left-0 top-1 w-1.5 h-1.5 bg-foreground/20 group-hover:bg-primary rounded-full transition-colors"></div>
                  <p className="text-xs font-bold leading-tight">
                    {loan.userName} pidió prestado{" "}
                    <span className="font-serif italic text-primary">{loan.bookTitle}</span>
                  </p>
                  <p className="text-[10px] opacity-60 mt-0.5 uppercase tracking-wider">
                    {formatDistanceToNow(new Date(loan.borrowDate), { addSuffix: true, locale: es })}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="lg:col-span-1 border-l-0 lg:border-l lg:border-border lg:pl-10">
          <h3 className="text-sm font-bold uppercase tracking-widest border-b border-border pb-2 mb-6">
            Más Prestados
          </h3>
          <div className="space-y-6">
            {stats.mostBorrowed.length === 0 ? (
              <p className="text-muted-foreground font-serif italic text-sm">Sin datos aún.</p>
            ) : (
              stats.mostBorrowed.map((item, i) => (
                <div key={item.bookId} className="flex gap-4 group cursor-pointer">
                  <div className={`w-16 h-24 shrink-0 shadow-sm border border-border overflow-hidden ${i % 2 === 0 ? "bg-secondary" : "bg-foreground"}`}>
                    {item.book?.cover ? (
                      <img src={item.book.cover} alt={item.book.title || ""} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookCopy className="w-6 h-6 opacity-20" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-between py-1">
                    <div>
                      <h4 className="text-sm font-serif font-bold leading-tight underline decoration-primary/20 group-hover:decoration-primary">
                        {item.book?.title || "Libro desconocido"}
                      </h4>
                      <p className="text-[10px] italic opacity-70 mt-1">{item.book?.author || ""}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-2 py-0.5 border w-fit rounded-full uppercase font-bold tracking-tighter ${item.book?.status === "Prestado" ? "border-primary text-primary" : "border-foreground text-foreground"}`}>
                        {item.book?.status || "—"}
                      </span>
                      <span className="text-[9px] opacity-50">{item.count}x</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
