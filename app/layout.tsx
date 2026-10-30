import type { Metadata } from "next";
import Link from "next/link";
// 한글 전체를 담은 가변 서체는 2MB라, 쓰인 글자 범위의 조각만 받는 dynamic subset을 쓴다.
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import NavLink from "./nav-link";
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
        {/* 포트폴리오 PDF는 이 페이지를 인쇄해 만들므로 머리글을 찍지 않는다.
            848px보다 좁으면 화면 위에 붙고, 바탕색을 칠해 아래로 지나가는 본문을 가린다. */}
        <header className="z-10 bg-background px-4 pt-5 font-medium max-[53rem]:sticky max-[53rem]:top-0 max-[53rem]:pt-3 print:hidden">
          {/* 848px보다 좁으면 다크 모드 버튼(오른쪽 16px, 36px)이 첫 줄 오른쪽 끝에 놓이므로 버튼 폭과 간격 12px만큼 비워 둔다.
              375px까지 한 줄이고, 더 좁으면 메뉴가 아래 줄로 내려간다. */}
          <nav className="mx-auto flex max-w-content flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-b border-current/10 pb-3 max-[53rem]:gap-x-4 max-[53rem]:pr-12">
            {/* 글자 로고 "sh.". 화면 읽기 프로그램에는 사이트 주소로 읽힌다. */}
            <Link href="/" aria-label="seung-hwan.com" className="text-2xl/7 font-bold tracking-[-0.04em] transition-opacity hover:opacity-70 motion-reduce:transition-none">
              sh<span className="opacity-45">.</span>
            </Link>
            {/* 메뉴가 아래 줄로 내려갈 때 줄어 글자가 꺾이지 않게 shrink-0을 둔다. */}
            <ul className="flex shrink-0 list-none gap-8 text-base max-[53rem]:gap-3">
              <li>
                <NavLink href="/about">소개</NavLink>
              </li>
              <li>
                <NavLink href="/blog">블로그</NavLink>
              </li>
              <li>
                <NavLink href="/portfolio">포트폴리오</NavLink>
              </li>
              <li>
                <NavLink href="/playground">놀이터</NavLink>
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
