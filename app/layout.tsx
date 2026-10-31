import type { Metadata } from "next";
import Link from "next/link";
// 한글 전체를 담은 가변 서체는 2MB라, 쓰인 글자 범위의 조각만 받는 dynamic subset을 쓴다.
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import NavLink from "./nav-link";
import ThemeToggle from "./theme-toggle";

export const metadata: Metadata = {
  title: {
    template: "개발자 이승환 | %s",
    default: "개발자 이승환",
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
            848px보다 좁으면 화면 위에 붙고, 바탕색을 칠해 아래로 지나가는 본문을 가린다.
            848px보다 좁으면 큰 로고와 기준선을 맞춘 첫 줄이 29px로 1px 높으므로, 위 21px·선 위 10px로 메뉴 글자 자리와 아래 선(61px)을 848px 이상과 같게 둔다. */}
        <header className="z-10 bg-background px-4 pt-5 font-medium max-[53rem]:sticky max-[53rem]:top-0 max-[53rem]:pt-5.25 print:hidden">
          {/* 다크 모드 버튼은 메뉴 줄의 마지막 칸이다. 848px 이상은 메뉴 다음 칸이고, 메뉴는 오른쪽으로 민다.
              848px보다 좁으면 버튼을 첫 줄 오른쪽 끝에 띄워 두므로 48px를 비워 둔다(44px 누르는 상자가 오른쪽으로 3px 나가 "놀이터"와 7px).
              375px까지 한 줄이고, 더 좁으면 메뉴만 아래 줄로 내려가고 버튼은 로고와 같은 첫 줄에 남는다. */}
          <nav className="mx-auto flex max-w-content flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-b border-current/10 pb-3 max-[53rem]:relative max-[53rem]:gap-x-4 max-[53rem]:pr-12 max-[53rem]:pb-2.5">
            {/* 848px보다 좁으면 글자 로고 "sh.", 넓으면 사이트 이름 "seung-hwan.com". 숨긴 쪽은 display:none이라 화면 읽기 프로그램도 보이는 글자만 읽는다. */}
            <Link href="/" className="rounded-md text-lg transition-opacity focus-visible:outline-offset-4 hover:opacity-70 motion-reduce:transition-none max-[53rem]:text-2xl/7 max-[53rem]:font-bold max-[53rem]:tracking-[-0.04em]">
              <span className="min-[53rem]:hidden">
                sh<span className="opacity-45">.</span>
              </span>
              <span className="max-[53rem]:hidden">seung-hwan.com</span>
            </Link>
            {/* 메뉴가 아래 줄로 내려갈 때 줄어 글자가 꺾이지 않게 shrink-0을 둔다.
                848px보다 좁으면 기준선을 맞춘 메뉴 글자가 큰 로고보다 3px 아래에 보이므로, 자리(헤더 높이)는 두고 3px 올려 글자 모양의 위아래 가운데를 로고·버튼에 맞춘다. */}
            <ul className="flex shrink-0 list-none gap-8 text-base min-[53rem]:ml-auto max-[53rem]:relative max-[53rem]:-top-0.75 max-[53rem]:gap-3">
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
            <ThemeToggle />
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
