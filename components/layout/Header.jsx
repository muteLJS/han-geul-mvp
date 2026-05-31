import Link from "next/link";
import { auth } from "@/lib/auth";
import { signOut } from "@/lib/auth";

export default async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 w-full bg-hanji border-b border-border">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-ink tracking-tight">
          한-글
        </Link>

        <div className="flex items-center gap-2">
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-ink-light">
                {session.user?.points ?? 0}pt
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="text-sm text-ink-light hover:text-ink transition-colors"
                >
                  로그아웃
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-cheong hover:opacity-80 transition-opacity"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
