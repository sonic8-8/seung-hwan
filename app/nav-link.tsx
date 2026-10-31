"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// 네비게이션 메뉴 링크. 지금 있는 페이지(블로그 아래 글 포함)의 메뉴에 aria-current="page"를 달고 글자색 2px 밑줄로 보인다.
// 마우스를 올리면(마우스 기기만) 농도 70%, 누르면(터치 포함) 60%로 흐려진다. 테마 버튼(app/theme-toggle.tsx)과 같은 값이다. 지금 페이지 메뉴는 반응하지 않는다.
// 848px보다 좁으면 누르는 높이를 44px로 늘리고, 같은 만큼 바깥 여백을 줄여 글자 자리는 그대로 둔다.
export default function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const current = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className="decoration-2 underline-offset-6 transition-opacity duration-150 ease-[cubic-bezier(.35,0,.35,1)] not-aria-[current=page]:hover:opacity-70 not-aria-[current=page]:active:opacity-60 motion-safe:active:duration-60 motion-reduce:duration-0 aria-[current=page]:underline max-[53rem]:-my-2.5 max-[53rem]:inline-block max-[53rem]:py-2.5"
    >
      {children}
    </Link>
  );
}
