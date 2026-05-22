export function asObject(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("El cuerpo debe ser un objeto JSON.");
  }
  return body;
}

export function requiredString(body, key) {
  const value = body[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${key} es requerido.`);
  }
  return value.trim();
}

export function optionalString(body, key, fallback = "") {
  const value = body[key];
  return typeof value === "string" ? value.trim() : fallback;
}

export function optionalNumber(body, key, fallback = 0) {
  const value = body[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return fallback;
}

export function assertEmail(email) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Correo electrónico inválido.");
  }
}
