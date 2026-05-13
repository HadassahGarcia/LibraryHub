import type { IncomingMessage, ServerResponse } from "node:http";

export type Role = "Administrador" | "Bibliotecario" | "Usuario";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  status?: "active" | "inactive";
}

export interface AppRequest extends IncomingMessage {
  body?: unknown;
  params: Record<string, string>;
  query: URLSearchParams;
  user?: AuthUser;
  ipKey: string;
}

export type Handler = (req: AppRequest, res: ServerResponse) => Promise<void> | void;

export interface Route {
  method: string;
  pattern: RegExp;
  keys: string[];
  handler: Handler;
  private?: boolean;
  roles?: Role[];
}

export interface ApiErrorBody {
  code: string;
  details?: unknown[];
}
