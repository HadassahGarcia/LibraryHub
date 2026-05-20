import React, { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import type { User } from "../types/library";
import { ManagementHeader } from "../components/admin/shared/ManagementHeader";
import { SearchBox } from "../components/admin/shared/SearchBox";
import { UserFormModal } from "../components/admin/users/UserFormModal";
import { UsersTable } from "../components/admin/users/UsersTable";

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get<User[]>("/users");
      setUsers(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fallo al obtener los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(
    () => users.filter((user) => user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase())),
    [users, search],
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas revocar a este usuario?")) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter((user) => user.id !== id));
      toast.success("Usuario revocado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fallo al eliminar.");
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === "inactive" ? "active" : "inactive";
    const label = newStatus === "inactive" ? "desactivar" : "activar";
    if (!window.confirm(`¿${label.charAt(0).toUpperCase() + label.slice(1)} a ${user.name}?`)) return;
    try {
      await api.patch(`/users/${user.id}/status`, { status: newStatus });
      setUsers(users.map((u) => u.id === user.id ? { ...u, status: newStatus } : u));
      toast.success(`Usuario ${label === "activar" ? "activado" : "desactivado"}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fallo al cambiar estado.");
    }
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const userData = Object.fromEntries(formData.entries());
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, userData);
        toast.success("Registro actualizado.");
      } else {
        await api.post("/users", userData);
        toast.success("Nuevo usuario registrado.");
      }
      await fetchUsers();
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fallo al guardar registro.");
    }
  };

  const openForm = (user: User | null = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 relative">
      <ManagementHeader title="Padrón de Usuarios" description="Gestiona los miembros de la biblioteca" actionLabel="Inscribir Usuario" ActionIcon={Plus} onAction={() => openForm()} />
      <SearchBox value={search} onChange={setSearch} placeholder="Buscar por nombre o correo..." />
      <UsersTable users={filteredUsers} loading={loading} onEdit={openForm} onDelete={handleDelete} onToggleStatus={handleToggleStatus} />
      <UserFormModal open={isModalOpen} user={editingUser} onClose={() => setIsModalOpen(false)} onSubmit={handleSave} />
    </div>
  );
}
