import { env } from "../config/env.js";

export function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

export function ok(res, data = null, message = "Operación realizada correctamente", status = 200) {
  sendJson(res, status, { success: true, message, data });
}

export function fail(res, status, message, code = "APP_ERROR", details = []) {
  sendJson(res, status, {
    success: false,
    message,
    error: { code, details: env.nodeEnv === "production" ? [] : details },
  });
}
