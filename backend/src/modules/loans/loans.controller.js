import { audit } from "../../services/audit.js";
import { ok, fail } from "../../utils/response.js";
import { asObject, requiredString } from "../../utils/validation.js";
import { repos } from "../shared/repositories.js";
import { createSelfLoan, createStaffLoan, returnLoan } from "./loans.service.js";

export async function listLoans(_req, res) {
  ok(res, await repos.loans.list());
}

export async function listUserLoans(req, res) {
  ok(res, (await repos.loans.list()).filter((loan) => loan.userId === req.params.id));
}

export async function createLoan(req, res) {
  const body = asObject(req.body);
  const payload = {
    ...body,
    bookId: requiredString(body, "bookId"),
    userId: requiredString(body, "userId"),
    dueDate: requiredString(body, "dueDate"),
  };
  const result = await createStaffLoan(payload);
  if (result.error) return fail(res, ...result.error);
  await audit(req, "create", "loans", result.loan.id, { bookId: payload.bookId, userId: payload.userId });
  ok(res, result.loan, "Préstamo creado", 201);
}

export async function requestLoan(req, res) {
  const body = asObject(req.body);
  const bookId = requiredString(body, "bookId");
  const result = await createSelfLoan(bookId, req.user);
  if (result.error) return fail(res, ...result.error);
  await audit(req, "create", "loans", result.loan.id, { bookId, userId: req.user.id, source: "self" });
  ok(res, result.loan, "Préstamo solicitado", 201);
}

export async function closeLoan(req, res) {
  const result = await returnLoan(req.params.id);
  if (result.error) return fail(res, ...result.error);
  await audit(req, "loan_return", "loans", req.params.id, { lateDays: result.lateDays });
  ok(res, result.loan, "Préstamo cerrado");
}
