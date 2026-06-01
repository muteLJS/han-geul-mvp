import { signIn } from "@/lib/auth";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "로그인 | 한-글",
};

function SocialButton({ provider, label, bgColor, textColor, children }) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn(provider, { redirectTo: "/" });
      }}
    >
      <button
        type="submit"
        className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-opacity hover:opacity-90 active:opacity-75 ${bgColor} ${textColor}`}
      >
        {children}
        <span>{label}</span>
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-hanji">
      <div className="w-full max-w-xs flex flex-col items-center gap-8">
        {/* 로고 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-ink tracking-tight">한-글</h1>
          <p className="mt-2 text-sm text-ink-light">하루에 한 자씩. 한 글로-</p>
        </div>

        {/* 소셜 로그인 */}
        <div className="w-full flex flex-col gap-3">
          <SocialButton
            provider="google"
            label="Google로 계속하기"
            bgColor="bg-white border border-border"
            textColor="text-ink"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
          </SocialButton>

          <SocialButton
            provider="kakao"
            label="카카오로 계속하기"
            bgColor="bg-[#FEE500]"
            textColor="text-[#191919]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M9 1C4.582 1 1 3.79 1 7.22c0 2.178 1.424 4.09 3.578 5.19l-.91 3.39c-.08.3.27.54.52.36L8.32 13.8c.223.02.449.03.68.03 4.418 0 8-2.79 8-6.61C17 3.79 13.418 1 9 1z" fill="#191919"/>
            </svg>
          </SocialButton>

          <SocialButton
            provider="naver"
            label="네이버로 계속하기"
            bgColor="bg-[#03C75A]"
            textColor="text-white"
          >
            <span className="font-bold text-base leading-none">N</span>
          </SocialButton>
        </div>

        {/* 구분선 */}
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-ink-light">또는</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* 이메일 로그인/회원가입 (클라이언트 컴포넌트) */}
        <LoginForm />

        <p className="text-xs text-ink-light text-center leading-relaxed">
          로그인하면 한-글의{" "}
          <span className="underline underline-offset-2">이용약관</span>과{" "}
          <span className="underline underline-offset-2">개인정보처리방침</span>에<br />
          동의하는 것으로 간주됩니다.
        </p>
      </div>
    </main>
  );
}
