"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [tab, setTab] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "회원가입에 실패했습니다.");
      return;
    }

    // 가입 후 자동 로그인
    const loginRes = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);
    if (loginRes?.error) {
      setError("가입은 완료되었지만 로그인에 실패했습니다. 다시 로그인해주세요.");
      setTab("login");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 탭 */}
      <div className="flex rounded-xl bg-white border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => { setTab("login"); setError(""); }}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            tab === "login" ? "bg-ink text-white" : "text-ink-light hover:text-ink"
          }`}
        >
          로그인
        </button>
        <button
          type="button"
          onClick={() => { setTab("signup"); setError(""); }}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            tab === "signup" ? "bg-ink text-white" : "text-ink-light hover:text-ink"
          }`}
        >
          회원가입
        </button>
      </div>

      <form onSubmit={tab === "login" ? handleLogin : handleSignup} className="flex flex-col gap-3">
        {tab === "signup" && (
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="이름"
            required
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm text-ink placeholder:text-ink-light focus:outline-none focus:border-cheong transition-colors"
          />
        )}
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="이메일"
          required
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm text-ink placeholder:text-ink-light focus:outline-none focus:border-cheong transition-colors"
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder={tab === "signup" ? "비밀번호 (8자 이상)" : "비밀번호"}
          required
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm text-ink placeholder:text-ink-light focus:outline-none focus:border-cheong transition-colors"
        />

        {error && (
          <p className="text-xs text-jeok text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-cheong text-white text-sm font-medium hover:opacity-90 active:opacity-75 transition-opacity disabled:opacity-50"
        >
          {loading ? "처리 중…" : tab === "login" ? "로그인" : "회원가입"}
        </button>
      </form>
    </div>
  );
}
