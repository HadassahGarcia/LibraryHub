import { repos } from "../shared/repositories.js";

export async function buildDashboardSummary() {
  const [bookList, loanList, fineList, userList] = await Promise.all([
    repos.books.list(),
    repos.loans.list(),
    repos.fines.list(),
    repos.users.list(),
  ]);

  const bookMap = Object.fromEntries(bookList.map((book) => [book.id, book]));
  const mostBorrowedCounts = loanList.reduce((acc, loan) => {
    acc[String(loan.bookId)] = (acc[String(loan.bookId)] || 0) + 1;
    return acc;
  }, {});
  const mostBorrowed = Object.entries(mostBorrowedCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([bookId, count]) => ({ bookId, count, book: bookMap[bookId] || null }));
  const recentLoans = loanList
    .filter((loan) => loan.borrowDate)
    .sort((a, b) => new Date(String(b.borrowDate)).getTime() - new Date(String(a.borrowDate)).getTime())
    .slice(0, 5)
    .map((loan) => ({ ...loan, bookTitle: String(bookMap[String(loan.bookId)]?.title || "Libro desconocido") }));

  return {
    totalBooks: bookList.length,
    availableBooks: bookList.filter((book) => book.status === "Disponible").length,
    activeLoans: loanList.filter((loan) => loan.status === "Activo").length,
    pendingFines: fineList.filter((fine) => fine.status === "Pendiente").reduce((acc, fine) => acc + Number(fine.amount || 0), 0),
    totalUsers: userList.length,
    mostBorrowed,
    recentLoans,
  };
}
