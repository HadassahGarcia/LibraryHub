import { env } from "../../config/env.js";
import { optionalString } from "../../utils/validation.js";
import { hasPendingFines, validFutureDate } from "../shared/libraryRules.js";
import { repos } from "../shared/repositories.js";

export async function createStaffLoan(body) {
  const { bookId, userId, dueDate } = body;
  if (!validFutureDate(dueDate)) return { error: [400, "La fecha límite debe ser futura", "INVALID_DUE_DATE"] };
  if (await hasPendingFines(userId)) return { error: [409, "El usuario tiene multas pendientes", "LOAN_USER_HAS_FINES"] };

  const book = await repos.books.get(bookId);
  if (!book) return { error: [404, "Libro no encontrado", "BOOK_NOT_FOUND"] };
  if (book.status !== "Disponible") return { error: [409, "El libro no está disponible", "BOOK_UNAVAILABLE"] };

  const profile = await repos.users.get(userId);
  if (!profile) return { error: [404, "Usuario no encontrado", "USER_NOT_FOUND"] };
  if (profile.status === "inactive") return { error: [409, "El usuario está inactivo", "USER_INACTIVE"] };

  const created = await repos.loans.create({
    bookId,
    userId,
    userName: optionalString(body, "userName", String(profile?.name || "")),
    borrowDate: optionalString(body, "borrowDate", new Date().toISOString()),
    dueDate,
    returnDate: null,
    status: "Activo",
  });
  await repos.books.update(bookId, { status: "Prestado" });
  return { loan: created };
}

export async function createSelfLoan(bookId, user) {
  if (await hasPendingFines(user.id)) return { error: [409, "Tienes multas pendientes", "LOAN_USER_HAS_FINES"] };
  const book = await repos.books.get(bookId);
  if (!book) return { error: [404, "Libro no encontrado", "BOOK_NOT_FOUND"] };
  if (book.status !== "Disponible") return { error: [409, "El libro no está disponible", "BOOK_UNAVAILABLE"] };

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);
  const created = await repos.loans.create({
    bookId,
    userId: user.id,
    userName: user.name,
    borrowDate: new Date().toISOString(),
    dueDate: dueDate.toISOString(),
    returnDate: null,
    status: "Activo",
  });
  await repos.books.update(bookId, { status: "Prestado" });
  return { loan: created };
}

export async function returnLoan(loanId) {
  const loan = await repos.loans.get(loanId);
  if (!loan) return { error: [404, "Préstamo no encontrado", "LOAN_NOT_FOUND"] };
  if (loan.status !== "Activo") return { error: [409, "El préstamo ya fue cerrado", "LOAN_ALREADY_CLOSED"] };

  const returnDate = new Date();
  const dueDate = new Date(String(loan.dueDate));
  const lateDays = Math.max(0, Math.ceil((returnDate.getTime() - dueDate.getTime()) / 86400000));
  const updated = await repos.loans.update(loanId, { status: "Devuelto", returnDate: returnDate.toISOString() });
  await repos.books.update(String(loan.bookId), { status: "Disponible" });

  if (lateDays > 0) {
    await repos.fines.create({
      userId: loan.userId,
      userName: loan.userName,
      amount: lateDays * env.finePerDay,
      reason: `Retraso en devolución (${lateDays} días)`,
      status: "Pendiente",
      loanId,
    });
  }

  return { loan: updated, lateDays };
}
