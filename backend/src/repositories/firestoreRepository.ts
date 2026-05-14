import { db, FieldValue } from "../config/firebase.js";

export class FirestoreRepository<T extends Record<string, unknown>> {
  constructor(private readonly collectionName: string) {}

  collection() {
    return db.collection(this.collectionName);
  }

  async list() {
    const snap = await this.collection().get();
    return snap.docs.map((doc: { id: string; data: () => Record<string, unknown> }) => ({ id: doc.id, ...doc.data() })) as Array<T & { id: string }>;
  }

  async get(id: string) {
    const doc = await this.collection().doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as T & { id: string };
  }

  async create(data: T, id?: string) {
    const doc = id ? this.collection().doc(id) : this.collection().doc();
    const payload = { ...data, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() };
    await doc.set(payload, { merge: true });
    return { id: doc.id, ...data };
  }

  async update(id: string, data: Partial<T>) {
    const ref = this.collection().doc(id);
    await ref.update({ ...data, updatedAt: FieldValue.serverTimestamp() });
    return this.get(id);
  }

  async delete(id: string) {
    await this.collection().doc(id).delete();
  }
}
