import { auth } from "../../config/firebase.js";
import { repos } from "../shared/repositories.js";
import { activeLoansForUser } from "../shared/libraryRules.js";

export async function deleteUserWithRules(targetUserId, currentUserId) {
  if (targetUserId === currentUserId) {
    return { error: [409, "No puedes eliminar tu propia cuenta desde el panel", "USER_DELETE_SELF"] };
  }
  if ((await activeLoansForUser(targetUserId)).length > 0) {
    return { error: [409, "El usuario tiene préstamos activos", "USER_HAS_ACTIVE_LOANS"] };
  }

  await repos.users.delete(targetUserId);
  await auth.deleteUser(targetUserId).catch(() => undefined);
  return { ok: true };
}
