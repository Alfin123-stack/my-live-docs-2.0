import { MongoClient, type Collection, type Db, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;

/**
 * Di dev mode Next.js hot-reload berkali-kali me-reimport module ini; simpan
 * promise-nya di `global` (khusus dev) supaya koneksi dipakai ulang.
 */
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClient(): Promise<MongoClient> {
  if (!uri) {
    throw new Error("MONGODB_URI belum diisi di .env — lihat .env.example.");
  }
  return new MongoClient(uri, {
    appName: "livedocs",
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8000,
  }).connect();
}

let clientPromise: Promise<MongoClient> | null = null;

export function getMongoClient(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "development") {
    global._mongoClientPromise ??= createClient();
    return global._mongoClientPromise;
  }
  clientPromise ??= createClient();
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(process.env.MONGODB_DB_NAME || "livedocs");
}

/** Shape dokumen user di MongoDB. Hash password TIDAK PERNAH dikirim ke client. */
export type UserDoc = {
  _id: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  /** null / undefined = belum diverifikasi (termasuk akun legacy sebelum fitur ini). */
  emailVerified?: Date | null;
  /** Naik setiap password diubah → semua sesi JWT lama menjadi tidak valid. */
  tokenVersion?: number;
  passwordChangedAt?: Date | null;
};
export type NewUserDoc = Omit<UserDoc, "_id">;

/** Pendaftaran yang menunggu verifikasi email. Password disimpan sebagai hash. */
export type PendingSignupDoc = {
  _id: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
};
export type NewPendingSignupDoc = Omit<PendingSignupDoc, "_id">;

export type ResetTokenDoc = {
  _id: ObjectId;
  userId: ObjectId;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
};
export type NewResetTokenDoc = Omit<ResetTokenDoc, "_id">;

/**
 * Preferensi PER USER terhadap sebuah dokumen (favorit, terakhir dibuka) — sengaja
 * disimpan di MongoDB, BUKAN di metadata room Liveblocks, karena ini data personal per
 * user, bukan data yang dibagikan ke semua kolaborator.
 */
export type DocumentPrefDoc = {
  _id: ObjectId;
  userId: string; // email (huruf kecil) — konsisten dengan identitas Liveblocks
  roomId: string;
  starred: boolean;
  lastOpenedAt: Date;
};
export type NewDocumentPrefDoc = Omit<DocumentPrefDoc, "_id">;

let indexesPromise: Promise<void> | null = null;

async function ensureIndexes(db: Db): Promise<void> {
  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("pending_signups").createIndex({ tokenHash: 1 }, { unique: true }),
    db.collection("pending_signups").createIndex({ email: 1 }),
    // TTL: dokumen otomatis dihapus MongoDB setelah expiresAt
    db.collection("pending_signups").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("reset_tokens").createIndex({ tokenHash: 1 }, { unique: true }),
    db.collection("reset_tokens").createIndex({ userId: 1 }),
    db.collection("reset_tokens").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("document_prefs").createIndex({ userId: 1, roomId: 1 }, { unique: true }),
    db.collection("document_prefs").createIndex({ userId: 1, starred: 1 }),
  ]);
}

/** Index dibuat sekali per proses (bukan di setiap query seperti sebelumnya). */
async function getDbWithIndexes(): Promise<Db> {
  const db = await getDb();
  indexesPromise ??= ensureIndexes(db).catch((error) => {
    indexesPromise = null; // coba lagi di request berikutnya
    throw error;
  });
  await indexesPromise;
  return db;
}

export async function getUsersCollection(): Promise<Collection<UserDoc>> {
  return (await getDbWithIndexes()).collection<UserDoc>("users");
}

export async function getPendingSignupsCollection(): Promise<Collection<PendingSignupDoc>> {
  return (await getDbWithIndexes()).collection<PendingSignupDoc>("pending_signups");
}

export async function getResetTokensCollection(): Promise<Collection<ResetTokenDoc>> {
  return (await getDbWithIndexes()).collection<ResetTokenDoc>("reset_tokens");
}

export async function getDocumentPrefsCollection(): Promise<Collection<DocumentPrefDoc>> {
  return (await getDbWithIndexes()).collection<DocumentPrefDoc>("document_prefs");
}

/** `_id` di-generate MongoDB; cast dipusatkan di sini supaya pemanggil tetap type-safe. */
export async function insertUser(doc: NewUserDoc): Promise<ObjectId> {
  const users = await getUsersCollection();
  const result = await users.insertOne(doc as unknown as UserDoc);
  return result.insertedId;
}

export async function insertPendingSignup(doc: NewPendingSignupDoc): Promise<void> {
  const col = await getPendingSignupsCollection();
  await col.insertOne(doc as unknown as PendingSignupDoc);
}

export async function insertResetToken(doc: NewResetTokenDoc): Promise<void> {
  const col = await getResetTokensCollection();
  await col.insertOne(doc as unknown as ResetTokenDoc);
}

export { ObjectId };
