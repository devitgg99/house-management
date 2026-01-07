import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { UserRole } from "@/types/next-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Decode JWT payload without verification (just to extract user data)
function decodeJWT(token: string) {
  try {
    const base64Payload = token.split('.')[1];
    const payload = Buffer.from(base64Payload, 'base64').toString('utf-8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials) return null;

        try {
          console.log("API_URL:", API_URL);
          const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              emailOrPhonenumber: credentials.username,
              password: credentials.password,
            }),
          });

          console.log("Login response status:", res.status);

          if (!res.ok) return null;

          const response = await res.json();
          console.log("Login data:", response);

          if (!response?.success || !response?.data) return null;

          // The API returns JWT token as string in data field
          const jwtToken = response.data;
          const decoded = decodeJWT(jwtToken);
          
          console.log("Decoded JWT:", decoded);

          if (!decoded) return null;

          // Extract user info from JWT payload
          return {
            id: decoded.userId || "1",
            name: decoded.sub || credentials.username, // sub contains email
            email: decoded.sub || "",
            role: (decoded.role as UserRole) || "RENTER",
            token: jwtToken,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt" as const,
  },

  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.token = token.accessToken;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET || "super-secret-key",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
