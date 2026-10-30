import type { Metadata } from "next";
import Link from "next/link";
// 한글 전체를 담은 가변 서체는 2MB라, 쓰인 글자 범위의 조각만 받는 dynamic subset을 쓴다.
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import ThemeToggle from "./theme-toggle";

export const metadata: Metadata = {
  title: {
    template: "%s | 이승환",
    default: "이승환",
  },
  description: "이승환(sonic8-8)의 개인 홈페이지",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // 아래 스크립트가 data-theme를 걸어 서버 HTML과 달라지므로 hydration 경고를 끈다.
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 본문을 그리기 전에 저장한 모드(키 "theme", app/theme-toggle.tsx와 같다)를 건다. 없으면 globals.css가 기기 설정을 따른다. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-background font-sans text-foreground">
        {/* 포트폴리오 PDF는 이 페이지를 인쇄해 만들므로 머리글을 찍지 않는다. */}
        <header className="px-4 pt-14 font-medium print:hidden">
          <nav className="mx-auto flex max-w-content flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b border-current/10 pb-3">
            <Link href="/" className="text-lg transition-opacity hover:opacity-70 motion-reduce:transition-none">
              seung-hwan.com
            </Link>
            <ul className="flex list-none gap-8 text-base">
              <li>
                <Link href="/about" className="transition-opacity hover:opacity-70 motion-reduce:transition-none">소개</Link>
              </li>
              <li>
                <Link href="/blog" className="transition-opacity hover:opacity-70 motion-reduce:transition-none">블로그</Link>
              </li>
              <li>
                <Link href="/portfolio" className="transition-opacity hover:opacity-70 motion-reduce:transition-none">포트폴리오</Link>
              </li>
              <li>
                <Link href="/playground" className="transition-opacity hover:opacity-70 motion-reduce:transition-none">놀이터</Link>
              </li>
            </ul>
          </nav>
        </header>
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
