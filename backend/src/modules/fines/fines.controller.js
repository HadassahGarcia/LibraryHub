import { audit } from "../../services/audit.js";
import { ok } from "../../utils/response.js";
import { repos } from "../shared/repositories.js";

export async function listFines(_req, res) {
  ok(res, await repos.fines.list());
}

export async function payFine(req, res) {
  const updated = await repos.fines.update(req.params.id, { status: "Pagado", paidAt: new Date().toISOString() });
  await audit(req, "fine_payment", "fines", req.params.id);
  ok(res, updated, "Multa pagada");
}
