import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

export type UserRole = "ADMIN" | "HOUSEOWNER" | "RENTER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      token: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: UserRole;
    token: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: UserRole;
    accessToken: string;
  }
}

