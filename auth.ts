import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { getUsersCollection, ObjectId } from "@/lib/db/mongodb";
import { loginSchema } from "@/lib/auth/schemas";
import { isLocked } from "@/lib/auth/lockout-policy";
import { recordFailedLogin, resetLoginState } from "@/lib/auth/lockout";
import {
  burnPasswordVerification,
  hashPassword,
  verifyPassword,
} from "@/lib/auth/password";
import { rateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/request";

const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 hari (dulu 30 hari)
const STATE_CACHE_TTL_MS = 30_000;

type UserState = { tv: number; verified: boolean; name: string; email: string; at: number };
const stateCache = new Map<string, UserState>();

/**
 * Status terkini user dari DB (di-cache 30 detik per instance) supaya sesi JWT
 * bisa dicabut: password diubah (tokenVersion naik), akun dihapus, atau belum
 * terverifikasi → sesi tidak valid paling lambat ~30 detik kemudian.
 */
async function loadUserState(userId: string): Promise<UserState | null> {
  if (!ObjectId.isValid(userId)) return null;

  const cached = stateCache.get(userId);
  if (cached && Date.now() - cached.at < STATE_CACHE_TTL_MS) return cached;

  const users = await getUsersCollection();
  const user = await users.findOne(
    { _id: new ObjectId(userId) },
    { projection: { tokenVersion: 1, emailVerified: 1, name: 1, email: 1 } }
  );
  if (!user) {
    stateCache.delete(userId);
    return null;
  }

  const state: UserState = {
    tv: user.tokenVersion ?? 0,
    verified: Boolean(user.emailVerified),
    name: user.name,
    email: user.email,
    at: Date.now(),
  };
  if (stateCache.size > 5_000) stateCache.clear();
  stateCache.set(userId, state);
  return state;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    // Credentials provider di Auth.js hanya mendukung strategi JWT.
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
    updateAge: 24 * 60 * 60,
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw, request) => {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        // Rate limit per email DAN per IP (terdistribusi bila Redis diisi).
        // Semua kegagalan mengembalikan `null` (respons seragam) — tidak ada
        // pesan khusus "akun terkunci" yang bisa dipakai untuk enumerasi akun.
        const ip = request instanceof Request ? getClientIp(request.headers) : null;
        const [byEmail, byIp] = await Promise.all([
          rateLimit({ key: `login:email:${email}`, limit: 10, windowSec: 600 }),
          ip
            ? rateLimit({ key: `login:ip:${ip}`, limit: 30, windowSec: 600 })
            : Promise.resolve({ allowed: true }),
        ]);
        if (!byEmail.allowed || !byIp.allowed) return null;

        const users = await getUsersCollection();
        const user = await users.findOne({ email });

        // Tidak ada / belum terverifikasi / terkunci: tetap jalankan satu verifikasi
        // Argon2 palsu agar waktu responsnya sama dengan password salah.
        if (!user || !user.emailVerified || isLocked(user)) {
          await burnPasswordVerification(password);
          return null;
        }

        const { valid, needsRehash } = await verifyPassword(password, user.passwordHash);
        if (!valid) {
          await recordFailedLogin(user._id);
          return null;
        }

        await resetLoginState(user._id);
        if (needsRehash) {
          // Upgrade bcrypt lama / parameter Argon2 lama ke konfigurasi terkini.
          await users.updateOne(
            { _id: user._id },
            { $set: { passwordHash: await hashPassword(password) } }
          );
        }

        return { id: user._id.toString(), name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        const state = await loadUserState(user.id).catch(() => null);
        token.tv = state?.tv ?? 0;
        return token;
      }

      if (!token.id) return null;

      try {
        const state = await loadUserState(token.id as string);
        // null → sesi dicabut (user dihapus / belum verifikasi / password diubah)
        if (!state || !state.verified || state.tv !== (token.tv ?? 0)) return null;
        token.name = state.name;
        token.email = state.email;
      } catch (error) {
        // DB sementara tidak terjangkau: pertahankan sesi (ketersediaan), coba lagi nanti.
        console.error("[auth] gagal memeriksa status user:", (error as Error).message);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
});
