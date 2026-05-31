import { ok } from "../../utils/response.js";
import { repos } from "../shared/repositories.js";

export async function listAudit(_req, res) {
  ok(res, await repos.audit.list());
}
