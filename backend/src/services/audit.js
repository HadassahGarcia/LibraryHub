import { FirestoreRepository } from "../repositories/firestoreRepository.js";

const auditRepo = new FirestoreRepository("audit");

export async function audit(req, action, entity, entityId, metadata = {}) {
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
