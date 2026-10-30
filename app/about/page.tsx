import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "소개",
};

export default function About() {
  return (
    <main className="px-4 pt-14 pb-24 leading-[1.6]">
      <p className="mx-auto max-w-content">준비 중입니다.</p>
    </main>
  );
}
