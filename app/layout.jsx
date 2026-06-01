import "./globals.css";
import SessionProvider from "@/components/auth/SessionProvider";

export const metadata = {
  title: "한-글 | 하루에 한 자씩. 한 글로-",
  description: "쓰면서 배우고, 쌓으면서 성장하는 한국어 글쓰기 에듀테크 플랫폼",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "한-글",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    title: "한-글 | 하루에 한 자씩. 한 글로-",
    description: "쓰면서 배우고, 쌓으면서 성장하는 한국어 글쓰기 에듀테크 플랫폼",
    siteName: "한-글",
  },
};

export const viewport = {
  themeColor: "#FAF6EE",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col font-sans antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
