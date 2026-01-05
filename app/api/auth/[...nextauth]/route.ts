import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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

        // Call your backend API
        const res = await fetch("http://localhost:8080/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emailOrPhonenumber: credentials.username,
            password: credentials.password,
          }),
        });
        const user = await res.json();

        // If login fails
        if (!res.ok || !user) {
          return null;
        }

        // You can attach JWT or other info to session
        return {
          token: user.data,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt", // use JWT strategy
  },

  callbacks: {
    async jwt({ token, user }) {
      // First login
      if (user) {
        token.accessToken = user.token;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        token: token.accessToken,
        role: token.role,
      };
      return session;
    },
  },

  pages: {
    signIn: "/login", // your login page
  },

  secret: process.env.NEXTAUTH_SECRET || "super-secret-key",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

