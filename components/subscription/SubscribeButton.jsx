"use client";

import { useState, useTransition } from "react";
import Script from "next/script";

export default function SubscribeButton({ plan, label, amount, disabled }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [sdkReady, setSdkReady] = useState(false);

  const handlePayment = () => {
    if (!sdkReady) { setError("결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요."); return; }

    setError("");
    startTransition(async () => {
      // 1. 서버에서 orderId 발급
      const checkoutRes = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (!checkoutRes.ok) {
        const data = await checkoutRes.json();
        setError(data.error ?? "결제 준비에 실패했습니다.");
        return;
      }

      const { orderId, orderName, amount: finalAmount } = await checkoutRes.json();
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

      if (!clientKey) { setError("결제 설정이 올바르지 않습니다."); return; }

      // 2. Toss Payments SDK 호출
      try {
        const tossPayments = window.TossPayments(clientKey);
        await tossPayments.requestPayment("카드", {
          amount: finalAmount,
          orderId,
          orderName,
          customerName: "한-글 사용자",
          successUrl: `${window.location.origin}/subscribe/success`,
          failUrl: `${window.location.origin}/subscribe/fail`,
        });
      } catch (err) {
        if (err.code !== "USER_CANCEL") {
          setError(err.message ?? "결제 중 오류가 발생했습니다.");
        }
      }
    });
  };

  return (
    <>
      <Script
        src="https://js.tosspayments.com/v1/payment"
        onReady={() => setSdkReady(true)}
        strategy="afterInteractive"
      />

      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handlePayment}
          disabled={isPending || disabled}
          className="w-full py-3.5 rounded-xl bg-cheong text-white text-sm font-bold hover:opacity-90 active:opacity-75 disabled:opacity-40 transition-opacity"
        >
          {isPending ? "결제 준비 중…" : label}
        </button>
        {error && <p className="text-xs text-jeok text-center">{error}</p>}
      </div>
    </>
  );
}
