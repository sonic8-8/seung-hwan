"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// 네비게이션 메뉴 링크. 지금 있는 페이지(블로그 아래 글 포함)의 메뉴에 aria-current="page"를 달고 글자색 2px 밑줄로 보인다.
// 마우스를 올리면(마우스 기기만) 농도 70%, 누르면(터치 포함) 60%로 흐려진다(globals.css의 press-fade). 지금 페이지 메뉴는 반응하지 않는다.
// 초점 테두리는 글자 줄(24px)을 4px 띄워 둥글게 감싸(globals.css의 focus-round), 6px 아래 2px 밑줄과 테두리 사이에 바탕색이 보인다.
// 848px보다 좁으면 누르는 높이를 투명한 ::before로 위아래 10px씩 늘려 44px로 하므로, 글자 자리와 테두리는 그대로다.
export default function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const current = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className="press-fade focus-round relative inline-block decoration-2 underline-offset-6 aria-[current=page]:underline max-[53rem]:before:absolute max-[53rem]:before:inset-x-0 max-[53rem]:before:-inset-y-2.5"
    >
      {children}
    </Link>
  );
}
