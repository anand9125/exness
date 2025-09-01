import { BACKEND_URL } from "@/app/config";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          const res = await fetch(`${BACKEND_URL}/api/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });
          
          const data = await res.json();

          if (!res.ok || !data.jwt) return null;

          return {
            id: data.id,
            token: data.jwt,
          };
        } catch (e) {
          console.error("Login failed", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user  }) {
      if (user) {
        token.accessToken = user.token; 
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/signin", 
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
