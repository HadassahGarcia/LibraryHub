import { repos } from "./repositories.js";

export async function hasPendingFines(userId) {
  const list = await repos.fines.list();
  return list.some((fine) => fine.userId === userId && fine.status === "Pendiente");
}

export async function activeLoansForBook(bookId) {
  const list = await repos.loans.list();
  return list.filter((loan) => String(loan.bookId) === String(bookId) && loan.status === "Activo");
}

export async function activeLoansForUser(userId) {
  const list = await repos.loans.list();
  return list.filter((loan) => String(loan.userId) === String(userId) && loan.status === "Activo");
}

export async function booksByField(field, value) {
  const list = await repos.books.list();
  return list.filter((book) => String(book[field] || "").toLowerCase() === String(value || "").toLowerCase());
}

export function validFutureDate(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.getTime() > Date.now();
}
