import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "../../../db";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      try {
        const allowedUser = await db.select().from(users).where(eq(users.email, user.email)).limit(1);
        if (allowedUser.length > 0) {
          return true;
        }
        console.log("Unauthorized login attempt from: " + user.email);
        return false;
      } catch (error) {
        console.error("Auth DB Error:", error);
        return false;
      }
    }
  },
  pages: {
    signIn: "/",
    error: "/", // Optional: redirect to custom error page
  },
});

export { handler as GET, handler as POST };
