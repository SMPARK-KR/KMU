import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy-client-secret",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-local-development-12345",
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      try {
        // 1. 필수 관리자용 계정(교수님 등) 상시 동기화 (없다면 주입)
        const defaultAllowed = ["kts123@kookmin.ac.kr"];
        for (const email of defaultAllowed) {
          const check = await db.select().from(users).where(eq(users.email, email)).limit(1);
          if (check.length === 0) {
            await db.insert(users).values({ email });
            console.log("Seeded default user:", email);
          }
        }

        // 2. 다른 사람들도 로그인 시 자동 회원가입 되어야 하므로, 
        // 테이블에 없는 신규 유저라면 가입(등록) 처리 수행
        const checkCurrent = await db.select().from(users).where(eq(users.email, user.email)).limit(1);
        if (checkCurrent.length === 0) {
          await db.insert(users).values({ email: user.email });
          console.log("New user registered:", user.email);
        }

        return true; // 로그인 허용
      } catch (error) {
        console.error("Auth DB Error:", error);
        return true; // DB 장비 이상 시에도 시연 중단을 막기 위한 임시 허용
      }
    }
  },
});

export { handler as GET, handler as POST };
