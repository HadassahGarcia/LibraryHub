import { FirestoreRepository } from "../../repositories/firestoreRepository.js";

export const repos = {
  audit: new FirestoreRepository("audit"),
  authors: new FirestoreRepository("authors"),
  books: new FirestoreRepository("books"),
  categories: new FirestoreRepository("book-categories"),
  fines: new FirestoreRepository("fines"),
  loans: new FirestoreRepository("loans"),
  roles: new FirestoreRepository("roles"),
  users: new FirestoreRepository("users"),
};
