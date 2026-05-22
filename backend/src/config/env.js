import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDir, "../../.env") });
dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "",
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
  firebasePrivateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  firebaseWebApiKey: process.env.FIREBASE_WEB_API_KEY || "",
  firestoreDatabaseId: process.env.FIRESTORE_DATABASE_ID || "(default)",
  finePerDay: Number(process.env.FINE_PER_DAY || 5),
  nodeEnv: process.env.NODE_ENV || "development",
};
