import { createServer } from "node:http";
import { env } from "./config/env.js";
import { createRouter } from "./routes/index.js";
import { fail } from "./utils/response.js";
import { getClientIp, readBody } from "./utils/request.js";

const router = createRouter();

const server = createServer(async (rawReq, res) => {
  const req = rawReq;
  const origin = req.headers.origin || "";
  const allowedOrigin = origin === env.frontendOrigin ? origin : env.frontendOrigin;

  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  req.params = {};
  req.query = new URLSearchParams();
  req.ipKey = getClientIp(req);

  try {
    if (["POST", "PUT", "PATCH"].includes(req.method || "")) {
      req.body = await readBody(req);
    } else {
      req.body = {};
    }
    await router.handle(req, res);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno";
    fail(res, message === "INVALID_JSON" ? 400 : 500, message === "INVALID_JSON" ? "JSON inválido" : "Error interno", message === "INVALID_JSON" ? "INVALID_JSON" : "INTERNAL_ERROR", [message]);
  }
});

server.listen(env.port, () => {
  console.log(`LibraryHub API running on http://localhost:${env.port}`);
});
