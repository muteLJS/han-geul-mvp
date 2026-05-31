import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
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
      name: profile.kakao_account?.profile?.nickname ?? "",
      email: profile.kakao_account?.email ?? "",
      image: profile.kakao_account?.profile?.profile_image_url ?? null,
    };
  },
  clientId: process.env.KAKAO_CLIENT_ID,
  clientSecret: process.env.KAKAO_CLIENT_SECRET,
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
      name: profile.response.name ?? "",
      email: profile.response.email ?? "",
      image: profile.response.profile_image ?? null,
    };
  },
  clientId: process.env.NAVER_CLIENT_ID,
  clientSecret: process.env.NAVER_CLIENT_SECRET,
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    KakaoProvider,
    NaverProvider,
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      try {
        await connectDB();
        const existing = await User.findOne({ email: user.email });
        if (!existing) {
          await User.create({
            email: user.email,
            name: user.name ?? "",
            image: user.image ?? null,
            provider: account.provider,
          });
        }
        return true;
      } catch {
        return false;
      }
    },

    async session({ session }) {
      if (!session.user?.email) return session;
      await connectDB();
      const dbUser = await User.findOne({ email: session.user.email }).lean();
      if (dbUser) {
        session.user.id = String(dbUser._id);
        session.user.role = dbUser.role;
        session.user.points = dbUser.points;
        session.user.subscription = dbUser.subscription;
        session.user.writingGoal = dbUser.writingGoal;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
});
