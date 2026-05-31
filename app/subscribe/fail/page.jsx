"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function FailContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";
  const message = searchParams.get("message") ?? "결제가 취소되었습니다.";

  return (
    <div className="w-full max-w-xs flex flex-col items-center gap-5 text-center">
      <div className="w-16 h-16 rounded-full bg-jeok-light flex items-center justify-center text-2xl">✗</div>
      <div>
        <h1 className="text-lg font-bold text-ink">결제가 실패했습니다</h1>
        <p className="text-sm text-ink-light mt-1">{message}</p>
        {code && <p className="text-xs text-ink-light mt-1 opacity-60">오류 코드: {code}</p>}
      </div>
      <div className="w-full flex flex-col gap-2">
        <Link href="/subscribe" className="w-full py-3 rounded-xl bg-cheong text-white text-sm font-bold text-center hover:opacity-90 transition-opacity">
          다시 시도하기
        </Link>
        <Link href="/" className="w-full py-3 rounded-xl border border-border text-sm text-ink-light text-center hover:bg-baek transition-colors">
          홈으로
        </Link>
      </div>
    </div>
  );
}

export default function SubscribeFailPage() {
  return (
    <div className="min-h-screen bg-hanji flex items-center justify-center px-6">
      <Suspense fallback={<p className="text-sm text-ink-light">로딩 중…</p>}>
        <FailContent />
      </Suspense>
    </div>
  );
}
