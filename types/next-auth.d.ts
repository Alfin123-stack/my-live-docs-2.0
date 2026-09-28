import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    /** tokenVersion saat login; dibandingkan dengan DB untuk pencabutan sesi. */
    tv?: number;
  }
}
