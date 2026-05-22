import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { env } from "./env.js";

function initFirebase() {
  if (admin.apps.length > 0) return admin.app();

  if (env.firebaseProjectId && env.firebaseClientEmail && env.firebasePrivateKey) {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.firebaseProjectId,
        clientEmail: env.firebaseClientEmail,
        privateKey: env.firebasePrivateKey,
      }),
    });
  }

  return admin.initializeApp({
    projectId: env.firebaseProjectId || undefined,
  });
}

export const firebaseApp = initFirebase();
export const auth = admin.auth(firebaseApp);
export const db = getFirestore(firebaseApp, env.firestoreDatabaseId);
export const FieldValue = admin.firestore.FieldValue;
