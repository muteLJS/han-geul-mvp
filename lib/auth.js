import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const KakaoProvider = {
  id: "kakao",
  name: "Kakao",
  type: "oauth",
  authorization: {
    url: "https://kauth.kakao.com/oauth/authorize",
    params: { scope: "profile_nickname profile_image account_email" },
  },
  token: "https://kauth.kakao.com/oauth/token",
  userinfo: "https://kapi.kakao.com/v2/user/me",
  profile(profile) {
    return {
      id: String(profile.id),
      name: profile.kakao_account?.profile?.nickname ?? "카카오 사용자",
      email: profile.kakao_account?.email ?? "",
      image: profile.kakao_account?.profile?.profile_image_url ?? null,
    };
  },
  clientId: process.env.KAKAO_CLIENT_ID,
  clientSecret: process.env.KAKAO_CLIENT_SECRET ?? "",
};

const NaverProvider = {
  id: "naver",
  name: "Naver",
  type: "oauth",
  authorization: "https://nid.naver.com/oauth2.0/authorize",
  token: "https://nid.naver.com/oauth2.0/token",
  userinfo: "https://openapi.naver.com/v1/nid/me",
  profile(profile) {
    return {
      id: profile.response.id,
      name: profile.response.name ?? "네이버 사용자",
      email: profile.response.email ?? "",
      image: profile.response.profile_image ?? null,
    };
  },
  clientId: process.env.NAVER_CLIENT_ID,
  clientSecret: process.env.NAVER_CLIENT_SECRET,
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    KakaoProvider,
    NaverProvider,
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
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;

      // 이메일 없는 경우 provider + id로 폴백 식별자 생성
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
        // DB 실패해도 로그인 자체는 허용 (세션은 JWT로 유지됨)
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
