"use client";

import { useLayoutEffect } from "react";

// 고른 모드("light" | "dark")를 저장하는 localStorage 키. app/layout.tsx의 <head> 스크립트도 같은 키를 읽는다.
const THEME_KEY = "theme";

// 화면 오른쪽 위의 모드 버튼. 저장한 모드는 <html data-theme>로 걸고, 없으면 globals.css가 기기 설정을 따른다.
// 아이콘과 이름은 지금 모드를 보인다: 라이트는 달과 "다크 모드로 바꾸기", 다크는 해와 "라이트 모드로 바꾸기".
// 둘 다 HTML에 두고 dark 변형(globals.css)으로 하나만 보이므로, 스크립트가 돌기 전 첫 화면부터 맞고 숨긴 쪽은 화면 읽기 프로그램도 읽지 않는다.
export default function ThemeToggle() {
  // 개발 모드의 Strict Mode 재마운트가 <html>의 data-theme를 지우므로 다시 건다. 운영 빌드에서는 바뀌는 것이 없다.
  useLayoutEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") document.documentElement.dataset.theme = saved;
    } catch {}
  }, []);

  function toggle() {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    const next = dark ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      // 시안(1536px 폭)은 오른쪽 26px의 44px 원, 아이콘은 원의 42%(약 18px). 세로 중심은 네비게이션 줄(위 20px, 높이 28px)의 중심 34px에 맞춘다.
      // 본문 폭 밖에 자리가 없는 lg 미만에서는 40px로 줄인다.
      // 848px보다 좁으면 화면에 고정해 머리글 첫 줄(위 12px, 높이 28px) 오른쪽 끝에 36px로 놓는다. 세로 중심은 26px.
      className="fixed top-2 right-4 z-20 grid size-9 cursor-pointer place-items-center rounded-full bg-foreground text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground min-[53rem]:absolute min-[53rem]:top-3.5 min-[53rem]:size-10 lg:top-3 lg:right-6.5 lg:size-11 print:hidden"
    >
      {/* viewBox를 아이콘 상자(18×18)에 맞춰, SVG 크기가 곧 아이콘 크기다. */}
      <span className="contents dark:hidden">
        <svg aria-hidden="true" viewBox="3 3 18 18" className="size-[42%] fill-current">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
        <span className="sr-only">다크 모드로 바꾸기</span>
      </span>
      <span className="hidden dark:contents">
        <svg aria-hidden="true" viewBox="3 3 18 18" className="size-[42%] fill-current stroke-current stroke-2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" stroke="none" />
          <path d="M12 4v1.5M12 18.5V20M4 12h1.5M18.5 12H20M6.34 6.34l1.06 1.06M16.6 16.6l1.06 1.06M6.34 17.66l1.06-1.06M16.6 7.4l1.06-1.06" />
        </svg>
        <span className="sr-only">라이트 모드로 바꾸기</span>
      </span>
    </button>
  );
}
