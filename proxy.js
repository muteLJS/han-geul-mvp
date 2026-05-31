import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// 로그인이 필요한 경로
const protectedRoutes = ["/write", "/library", "/records", "/settings", "/subscribe"];

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isProtected = protectedRoutes.some((path) => nextUrl.pathname.startsWith(path));

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
