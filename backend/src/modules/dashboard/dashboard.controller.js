import { ok } from "../../utils/response.js";
import { buildDashboardSummary } from "./dashboard.service.js";

export async function dashboardSummary(_req, res) {
  ok(res, await buildDashboardSummary());
}
