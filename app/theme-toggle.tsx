"use client";

import { useLayoutEffect } from "react";

// 고른 모드("light" | "dark")를 저장하는 localStorage 키. app/layout.tsx의 <head> 스크립트도 같은 키를 읽는다.
const THEME_KEY = "theme";

// 머리글 메뉴 줄의 마지막 칸에 놓는 모드 버튼(app/layout.tsx). 기기 설정과 다른 모드를 고르면 저장하고 <html data-theme>로 걸며,
// 기기 설정과 같은 모드로 돌아오면 저장값을 지워 globals.css가 다시 기기 설정을 따른다.
// 아이콘, 이름, 툴팁은 지금 모드를 보인다: 라이트는 달과 "다크 모드로 바꾸기", 다크는 해와 "라이트 모드로 바꾸기".
// 둘 다 HTML에 두고 dark 변형(globals.css)으로 하나만 보이므로, 스크립트가 돌기 전 첫 화면부터 맞고 숨긴 쪽은 화면 읽기 프로그램도 읽지 않으며 툴팁도 뜨지 않는다.
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
    const systemDark = matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : systemDark;
    const next = dark ? "light" : "dark";
    // 고른 모드가 기기 설정과 같아지면 저장한 값을 지워, 그 뒤로는 다시 기기 설정을 따른다.
    const followSystem = (next === "dark") === systemDark;
    if (followSystem) delete root.dataset.theme;
    else root.dataset.theme = next;
    try {
      if (followSystem) localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, next);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      // 바탕·테두리 없이 20px 선 아이콘만 보이고, 버튼 상자는 누르는 영역이다. 아이콘은 글자색 그대로이고,
      // 메뉴 링크(app/nav-link.tsx)와 같이 마우스를 올리면(마우스 기기만) 농도 70%, 누르면(터치 포함) 60%로 흐려진다.
      // 848px보다 좁으면 44px 상자를 nav 위 기준 위 −8px(세로 중심 머리글 위에서 35px), 오른쪽 끝에 놓는다.
      // 오른쪽 −3px라 아이콘 오른쪽 끝은 단 끝에서 9px 안이고, 상자는 단 끝 밖으로 3px 나가며 nav가 비워 둔 48px 안에서 "놀이터"와 7px 떨어진다.
      // 848px 이상은 메뉴 다음 칸이다. 40px 상자를 사방 10px씩 바깥으로 빼 줄에서는 20px 아이콘 상자만큼만 차지하므로,
      // 아이콘 상자가 메뉴 간격 32px 뒤에 오고 그 오른쪽 끝이 아래 선 끝에 맞으며 헤더 높이는 그대로다. 세로는 줄 가운데.
      className="grid size-11 cursor-pointer place-items-center rounded-full transition-opacity duration-150 ease-[cubic-bezier(.35,0,.35,1)] hover:opacity-70 active:opacity-60 motion-safe:active:duration-60 motion-reduce:duration-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground max-[53rem]:absolute max-[53rem]:-top-2 max-[53rem]:-right-0.75 min-[53rem]:-m-2.5 min-[53rem]:size-10 min-[53rem]:self-center"
    >
      {/* 툴팁(title)이 버튼 어디에 올려도 뜨도록 보이는 쪽 span이 버튼을 채운다. 이름은 sr-only 글자에서 오므로 title은 이름에 더해지지 않는다.
          24px 격자의 선 굵기 2를 20px로 줄여 그린다(화면에서 약 1.67px). */}
      <span title="다크 모드로 바꾸기" className="grid size-full place-items-center dark:hidden">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
        </svg>
        <span className="sr-only">다크 모드로 바꾸기</span>
      </span>
      <span title="라이트 모드로 바꾸기" className="hidden size-full place-items-center dark:grid">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
        <span className="sr-only">라이트 모드로 바꾸기</span>
      </span>
    </button>
  );
}
