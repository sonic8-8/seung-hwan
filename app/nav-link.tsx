"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// 네비게이션 메뉴 링크. 지금 있는 페이지(블로그 아래 글 포함)의 메뉴에 aria-current="page"를 달고 글자색 2px 밑줄로 보인다.
// 848px보다 좁으면 누르는 높이를 44px로 늘리고, 같은 만큼 바깥 여백을 줄여 글자 자리는 그대로 둔다.
export default function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const current = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className="decoration-2 underline-offset-6 transition-opacity hover:opacity-70 motion-reduce:transition-none aria-[current=page]:underline max-[53rem]:-my-2.5 max-[53rem]:inline-block max-[53rem]:py-2.5"
    >
      {children}
    </Link>
  );
}
