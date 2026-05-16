import { FirestoreRepository } from "../repositories/firestoreRepository.js";
import type { AppRequest } from "../types.js";

const auditRepo = new FirestoreRepository<Record<string, unknown>>("audit");

export async function audit(req: AppRequest, action: string, entity: string, entityId?: string, metadata: Record<string, unknown> = {}) {
  await auditRepo.create({
    action,
    entity,
    entityId: entityId || null,
    userId: req.user?.id || null,
    userEmail: req.user?.email || null,
    ip: req.ipKey,
    metadata,
    at: new Date().toISOString(),
  });
}
