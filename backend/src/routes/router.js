import { fail } from "../utils/response.js";
import { attachUser, roleAllowed } from "../middleware/auth.js";

export class Router {
  constructor() {
    this.routes = [];
  }

  add(method, path, handler, options = {}) {
    const keys = [];
    const source = path
      .replace(/\/:([^/]+)/g, (_, key) => {
        keys.push(key);
        return "/([^/]+)";
      })
      .replace(/\//g, "\\/");
    this.routes.push({
      method: method.toUpperCase(),
      pattern: new RegExp(`^${source}$`),
      keys,
      handler,
      private: options.private,
      roles: options.roles,
    });
  }

  async handle(req, res) {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    req.query = url.searchParams;

    for (const route of this.routes) {
      if (route.method !== req.method?.toUpperCase()) continue;
      const match = url.pathname.match(route.pattern);
      if (!match) continue;

      req.params = {};
      route.keys.forEach((key, index) => {
        req.params[key] = decodeURIComponent(match[index + 1]);
      });

      if (route.private) {
        const user = await attachUser(req);
        if (!user) return fail(res, 401, "No autorizado", "AUTH_UNAUTHORIZED");
        if (user.status === "inactive") return fail(res, 403, "Usuario inactivo", "AUTH_INACTIVE");
        if (!roleAllowed(user.role, route.roles)) return fail(res, 403, "Permisos insuficientes", "AUTH_FORBIDDEN");
      }

      await route.handler(req, res);
      return;
    }

    fail(res, 404, "Ruta no encontrada", "ROUTE_NOT_FOUND");
  }
}
