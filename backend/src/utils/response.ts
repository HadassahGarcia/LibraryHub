import type { ServerResponse } from "node:http";
import { env } from "../config/env.js";

export function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

export function ok(res: ServerResponse, data: unknown = null, message = "Operación realizada correctamente", status = 200) {
  sendJson(res, status, { success: true, message, data });
}

export function fail(res: ServerResponse, status: number, message: string, code = "APP_ERROR", details: unknown[] = []) {
  sendJson(res, status, {
    success: false,
    message,
    error: { code, details: env.nodeEnv === "production" ? [] : details },
  });
}
