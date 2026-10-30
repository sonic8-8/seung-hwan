import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "소개",
};

// 틀, 제목, 빈 상자는 블로그(app/blog/page.tsx)와 같다.
export default function About() {
  return (
    <main className="px-4 pt-14 pb-24">
      <div className="mx-auto flex max-w-content flex-col gap-3">
        <h1 className="text-section font-medium">소개</h1>
        <p className="rounded-lg border border-current/10 px-6 py-8 text-center">
          <span className="opacity-60">준비 중입니다.</span>
        </p>
      </div>
    </main>
  );
}
