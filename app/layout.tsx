import type { Metadata } from "next";
import Link from "next/link";
// 한글 전체를 담은 가변 서체는 2MB라, 쓰인 글자 범위의 조각만 받는 dynamic subset을 쓴다.
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | 이승환",
    default: "이승환",
  },
  description: "이승환(sonic8-8)의 개인 홈페이지",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body className="font-sans">
        {/* 포트폴리오 PDF는 이 페이지를 인쇄해 만들므로 머리글을 찍지 않는다. */}
        <header className="mx-auto flex w-full max-w-160 flex-wrap justify-between gap-4 px-4 pt-6 print:hidden">
          <Link href="/" className="font-bold">
            이승환
          </Link>
          <nav>
            <ul className="flex list-none gap-4">
              <li>
                <Link href="/portfolio">포트폴리오</Link>
              </li>
              <li>
                <Link href="/blog">블로그</Link>
              </li>
              <li>
                <a href="https://sonic8-8.com">sonic8-8.com</a>
              </li>
            </ul>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
