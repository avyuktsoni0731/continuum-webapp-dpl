import NextAuth, { type AuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { apiFetch } from "@/lib/api";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    accountId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    accountId?: string;
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const data = await apiFetch<{
            account_id: string;
            email: string;
            access_token: string;
          }>("/auth/login", {
            method: "POST",
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          return {
            id: data.account_id,
            email: data.email,
            accessToken: data.access_token,
          };
        } catch {
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({
      user,
      account,
    }: {
      user: { id?: string; accessToken?: string };
      account: { provider?: string; id_token?: string } | null;
    }) {
      if (account?.provider === "google" && account.id_token) {
        try {
          const data = await apiFetch<{
            account_id?: string;
            access_token?: string;
          }>("/auth/google", {
            method: "POST",
            body: JSON.stringify({ id_token: account.id_token }),
          });
          if (!data.account_id || !data.access_token) return false;
          (user as { id?: string; accessToken?: string }).id = data.account_id;
          (user as { id?: string; accessToken?: string }).accessToken =
            data.access_token;
        } catch {
          return false;
        }
      }
      return true;
    },
    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user?: { id?: string; accessToken?: string } | null;
    }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.accountId = user.id;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: JWT }) {
      if (session?.user) {
        (session as { accessToken?: string; accountId?: string }).accessToken =
          token.accessToken as string;
        (session as { accessToken?: string; accountId?: string }).accountId =
          token.accountId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

const handler = NextAuth(authOptions as AuthOptions);
export { handler as GET, handler as POST };
