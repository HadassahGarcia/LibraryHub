import { auth } from "../config/firebase.js";
import { env } from "../config/env.js";
import { FirestoreRepository } from "../repositories/firestoreRepository.js";
import { seedAuthors, seedBooks, seedCategories, seedFines, seedLoans, seedUsers } from "../data/seedData.js";

async function seedCollection(name: string, rows: Array<Record<string, unknown> & { id: string }>) {
  const repo = new FirestoreRepository<Record<string, unknown>>(name);
  for (const row of rows) {
    const { id, ...data } = row;
    await repo.create(data, id);
  }
}

async function seedUsersCollection() {
  const repo = new FirestoreRepository<Record<string, unknown>>("users");
  for (const user of seedUsers) {
    const { id, password, ...profile } = user;
    try {
      await auth.createUser({ uid: id, email: user.email, password, displayName: user.name });
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code !== "auth/uid-already-exists" && code !== "auth/email-already-exists") {
        throw error;
      }
    }
    await repo.create(profile, id);
  }
}

async function main() {
  await Promise.all([
    seedCollection("books", seedBooks),
    seedCollection("authors", seedAuthors),
    seedCollection("book-categories", seedCategories),
    seedUsersCollection(),
    seedCollection("loans", seedLoans),
    seedCollection("fines", seedFines),
  ]);

  console.log("Seed completado.");
}

main().catch((error) => {
  const code = (error as { code?: number | string }).code;
  if (code === 5 || code === "5") {
    console.error(
      [
        "Firestore respondió NOT_FOUND.",
        `Proyecto configurado: ${env.firebaseProjectId || "(sin FIREBASE_PROJECT_ID)"}`,
        `Base configurada: ${env.firestoreDatabaseId}`,
        "",
        "Revisa en Firebase Console:",
        "1. Build > Firestore Database.",
        "2. Crea la base si todavía no existe.",
        "3. Si la base no se llama (default), configura FIRESTORE_DATABASE_ID con su ID real.",
        "4. Vuelve a ejecutar: npm run seed",
      ].join("\n"),
    );
  } else {
    console.error(error);
  }
  process.exit(1);
});
