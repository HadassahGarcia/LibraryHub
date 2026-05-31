export const staffRoles = ["Administrador", "Bibliotecario"];
export const adminRoles = ["Administrador"];

const validRoles = ["Administrador", "Bibliotecario", "Usuario"];

export function normalizeRole(role) {
  return validRoles.includes(role) ? role : "Usuario";
}
