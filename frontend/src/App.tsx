import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { isStaffRole, useAuthStore } from "./store/useAuthStore";
import type { Role } from "./types/library";
import PublicLayout from "./components/layout/PublicLayout";
import AdminLayout from "./components/layout/AdminLayout";
import Catalog from "./pages/Catalog";
import FullCatalog from "./pages/FullCatalog";
import Authors from "./pages/Authors";
import Curiosities from "./pages/Curiosities";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BooksManagement from "./pages/BooksManagement";
import CategoriesManagement from "./pages/CategoriesManagement";
import UsersManagement from "./pages/UsersManagement";
import LoansManagement from "./pages/LoansManagement";
import FinesManagement from "./pages/FinesManagement";
import AuthorsManagement from "./pages/AuthorsManagement";
import Profile from "./pages/Profile";
import AuditLog from "./pages/AuditLog";
import BookDetail from "./pages/BookDetail";

const staffRoles: Role[] = ["Administrador", "Bibliotecario", "Admin", "Librarian"];

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: Role[] }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
};

const DefaultRedirect = () => {
  const { user } = useAuthStore();
  return <Navigate to={user && isStaffRole(user.role) ? "/admin" : "/"} replace />;
};

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => {
    hydrate().catch(() => undefined);
  }, [hydrate]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ className: "font-sans text-sm rounded-none border border-border shadow-sm" }} />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Catalog />} />
          <Route path="/catalog" element={<FullCatalog />} />
          <Route path="/authors" element={<Authors />} />
          <Route path="/curiosities" element={<Curiosities />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Route>

        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={staffRoles}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="books" element={<BooksManagement />} />
          <Route path="authors" element={<AuthorsManagement />} />
          <Route path="categories" element={<CategoriesManagement />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="loans" element={<LoansManagement />} />
          <Route path="fines" element={<FinesManagement />} />
          <Route path="audit" element={<AuditLog />} />
        </Route>

        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
