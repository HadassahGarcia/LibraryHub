export type Role = "Administrador" | "Bibliotecario" | "Usuario" | "Admin" | "Librarian" | "User";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status?: "active" | "inactive";
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  status: "Disponible" | "Prestado" | string;
  cover: string;
  description: string;
  publishedYear?: number;
}

export interface Author {
  id: string;
  name: string;
  bio?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Loan {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: string;
}

export interface Fine {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  reason: string;
  status: string;
}
