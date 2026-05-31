"use client";

import { Suspense, useEffect, useReducer } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function reducer(state, action) {
  switch (action.type) {
    case "SUCCESS": return { status: "success", errorMsg: "" };
    case "ERROR": return { status: "error", errorMsg: action.msg };
    default: return state;
  }
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const hasParams = !!(paymentKey && orderId && amount);

  const [state, dispatch] = useReducer(reducer, {
    status: hasParams ? "pending" : "error",
    errorMsg: hasParams ? "" : "결제 정보가 올바르지 않습니다.",
  });

  useEffect(() => {
    if (!hasParams) return;

    fetch("/api/payments/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) dispatch({ type: "SUCCESS" });
        else dispatch({ type: "ERROR", msg: data.error ?? "결제 승인에 실패했습니다." });
      })
      .catch(() => dispatch({ type: "ERROR", msg: "네트워크 오류가 발생했습니다." }));
  }, [hasParams, paymentKey, orderId, amount]);

  if (state.status === "pending") {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-cheong border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-ink-light">결제를 확인하고 있습니다…</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="w-full max-w-xs flex flex-col items-center gap-5 text-center">
        <div className="w-16 h-16 rounded-full bg-jeok-light flex items-center justify-center text-2xl">✗</div>
        <div>
          <h1 className="text-lg font-bold text-ink">결제에 실패했습니다</h1>
          <p className="text-sm text-ink-light mt-1">{state.errorMsg}</p>
        </div>
        <Link href="/subscribe" className="w-full py-3 rounded-xl bg-cheong text-white text-sm font-bold text-center hover:opacity-90 transition-opacity">
          다시 시도하기
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xs flex flex-col items-center gap-5 text-center">
      <div className="w-16 h-16 rounded-full bg-cheong-light flex items-center justify-center text-2xl">✓</div>
      <div>
        <h1 className="text-lg font-bold text-ink">구독이 시작됐습니다!</h1>
        <p className="text-sm text-ink-light mt-1">한-글의 모든 기능을 자유롭게 사용하세요.</p>
      </div>
      <Link href="/" className="w-full py-3 rounded-xl bg-cheong text-white text-sm font-bold text-center hover:opacity-90 transition-opacity" onClick={() => router.refresh()}>
        홈으로 가기
      </Link>
    </div>
  );
}

export default function SubscribeSuccessPage() {
  return (
    <div className="min-h-screen bg-hanji flex items-center justify-center px-6">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cheong border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-ink-light">로딩 중…</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
