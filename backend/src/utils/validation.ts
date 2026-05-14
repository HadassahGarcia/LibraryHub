export function asObject(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("El cuerpo debe ser un objeto JSON.");
  }
  return body as Record<string, unknown>;
}

export function requiredString(body: Record<string, unknown>, key: string) {
  const value = body[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${key} es requerido.`);
  }
  return value.trim();
}

export function optionalString(body: Record<string, unknown>, key: string, fallback = "") {
  const value = body[key];
  return typeof value === "string" ? value.trim() : fallback;
}

export function optionalNumber(body: Record<string, unknown>, key: string, fallback = 0) {
  const value = body[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return fallback;
}

export function assertEmail(email: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Correo electrónico inválido.");
  }
}
