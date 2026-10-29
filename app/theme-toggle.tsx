"use client";

import { useLayoutEffect } from "react";

// 고른 모드("light" | "dark")를 저장하는 localStorage 키. app/layout.tsx의 <head> 스크립트도 같은 키를 읽는다.
const THEME_KEY = "theme";

// 화면 오른쪽 위의 모드 버튼. 저장한 모드는 <html data-theme>로 걸고, 없으면 globals.css가 기기 설정을 따른다.
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
      aria-label="라이트·다크 모드 바꾸기"
      onClick={toggle}
      // 시안(1536px 폭)은 오른쪽 22px, 위 20px의 54px 원. 본문 폭 밖에 자리가 없는 lg 미만에서는 머리글(위 56px)과 겹치지 않게 줄인다.
      className="absolute top-2 right-4 grid size-10 cursor-pointer place-items-center rounded-full bg-foreground text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground lg:top-5 lg:right-5.5 lg:size-13.5 print:hidden"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[42%] fill-current">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </button>
  );
}
