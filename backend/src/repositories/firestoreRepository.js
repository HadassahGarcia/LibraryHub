import { db, FieldValue } from "../config/firebase.js";

export class FirestoreRepository {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  collection() {
    return db.collection(this.collectionName);
  }

  async list() {
    const snap = await this.collection().get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async get(id) {
    const doc = await this.collection().doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async create(data, id) {
    const doc = id ? this.collection().doc(id) : this.collection().doc();
    const payload = { ...data, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() };
    await doc.set(payload, { merge: true });
    return { id: doc.id, ...data };
  }

  async update(id, data) {
    const ref = this.collection().doc(id);
    await ref.update({ ...data, updatedAt: FieldValue.serverTimestamp() });
    return this.get(id);
  }

  async delete(id) {
    await this.collection().doc(id).delete();
  }
}
