import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";
import Naver from "next-auth/providers/naver";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET ?? "",
    }),
    Naver({
      clientId: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
    }),
    Credentials({
      id: "credentials",
      name: "이메일",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString();
        if (!email || !password) return null;

        try {
          await connectDB();
          const user = await User.findOne({ email, provider: "credentials" }).lean();
          if (!user || !user.passwordHash) return null;

          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) return null;

          return {
            id: String(user._id),
            email: user.email,
            name: user.name,
            image: user.image ?? null,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;

      if (!user.email) {
        user.email = `${account.provider}_${user.id}@noemail.hangeul`;
      }

      try {
        await connectDB();
        const existing = await User.findOne({ email: user.email });
        if (!existing) {
          await User.create({
            email: user.email,
            name: user.name ?? "사용자",
            image: user.image ?? null,
            provider: account.provider,
          });
        }
        return true;
      } catch (err) {
        console.error("[auth] signIn DB error:", err);
        return true;
      }
    },

    async session({ session }) {
      if (!session.user?.email) return session;
      try {
        await connectDB();
        const dbUser = await User.findOne({ email: session.user.email }).lean();
        if (dbUser) {
          session.user.id = String(dbUser._id);
          session.user.role = dbUser.role;
          session.user.points = dbUser.points;
          session.user.subscription = dbUser.subscription;
          session.user.writingGoal = dbUser.writingGoal;
        }
      } catch (err) {
        console.error("[auth] session callback error:", err);
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
});
