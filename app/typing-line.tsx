"use client";

import { useEffect, useState } from "react";

// 글자당 쓰기·지우기 간격과 한 문장이 다 쓰인 채 머무는 시간(ms).
const TYPE_MS = 100;
const DELETE_MS = 50;
const HOLD_MS = 2400;

// 홈 인사말 가운데 줄. 서버 HTML에는 첫 문장이 다 쓰인 채로 들어간다.
// 바뀌는 글자는 aria-hidden으로 감추고, 화면 읽기 프로그램에는 네 문장을 한 번에 sr-only로 준다.
export default function TypingLine({ lines }: { lines: string[] }) {
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(lines[0].length);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // shortcut: 페이지를 연 뒤 동작 줄이기 설정을 바꾸면 새로 고쳐야 반영된다.
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const full = length === lines[index].length;
    const id = setTimeout(
      () => {
        if (!deleting && full) setDeleting(true);
        else if (deleting && length === 0) {
          setDeleting(false);
          setIndex((index + 1) % lines.length);
        } else setLength(length + (deleting ? -1 : 1));
      },
      !deleting && full ? HOLD_MS : deleting ? DELETE_MS : TYPE_MS,
    );
    return () => clearTimeout(id);
  }, [index, length, deleting, lines]);

  return (
    <span className="block whitespace-nowrap">
      {/* 커서가 줄 상자를 받치므로 다 지워진 순간에도 줄 높이가 남는다. */}
      <span aria-hidden="true">
        {lines[index].slice(0, length)}
        <span className="ml-0.5 inline-block h-[1em] w-0.5 bg-current align-[-0.1em] motion-reduce:hidden" />
      </span>
      <span className="sr-only">{lines.join(", ")}</span>
    </span>
  );
}
