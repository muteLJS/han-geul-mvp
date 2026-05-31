const TOSS_API_BASE = "https://api.tosspayments.com/v1";

function getAuthHeader() {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) throw new Error("TOSS_SECRET_KEY가 설정되지 않았습니다.");
  // Toss 인증: Base64(secretKey + ":")
  const encoded = Buffer.from(`${secretKey}:`).toString("base64");
  return `Basic ${encoded}`;
}

// 결제 승인
export async function confirmPayment({ paymentKey, orderId, amount }) {
  const res = await fetch(`${TOSS_API_BASE}/payments/confirm`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? "결제 승인에 실패했습니다.");
  }
  return data;
}

// 결제 조회
export async function getPayment(paymentKey) {
  const res = await fetch(`${TOSS_API_BASE}/payments/${paymentKey}`, {
    headers: { Authorization: getAuthHeader() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "결제 조회에 실패했습니다.");
  return data;
}

// 플랜 정보
export const PLANS = {
  monthly: { name: "월 구독", amount: 4900, label: "4,900원/월" },
  yearly: { name: "연 구독", amount: 39900, label: "39,900원/년" },
};
