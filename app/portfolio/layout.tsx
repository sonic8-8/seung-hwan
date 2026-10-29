import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "포트폴리오",
};

// 그림은 본문 폭에 맞춰 줄이고, 넓은 표와 긴 코드 줄은 가로 스크롤로 본다.
const body =
  "[&_:is(ul,ol)]:pl-6 [&_a]:underline [&_a]:underline-offset-[0.2em] [&_img]:h-auto [&_img]:max-w-full " +
  "[&_table]:block [&_table]:max-w-full [&_table]:border-collapse [&_table]:overflow-x-auto " +
  "[&_:is(th,td)]:border [&_:is(th,td)]:px-2 [&_:is(th,td)]:py-1 [&_pre]:max-w-full [&_pre]:overflow-x-auto";

// PDF(인쇄)에는 스크롤이 없으므로 긴 코드 줄과 넓은 표는 줄바꿈하고, 그림과 표의 행은 쪽 경계에서 자르지 않는다.
const print =
  "print:[&_pre]:whitespace-pre-wrap print:[&_pre]:wrap-anywhere print:[&_table]:table print:[&_table]:wrap-anywhere " +
  "print:[&_:is(img,tr)]:break-inside-avoid";

export default function PortfolioLayout({ children }: LayoutProps<"/portfolio">) {
  return (
    <main className={`mx-auto flex w-full max-w-160 flex-col gap-4 px-4 py-12 leading-[1.6] ${body} ${print}`}>
      {/* public/portfolio.pdf는 scripts/portfolio-pdf.sh가 만든다. */}
      <a href="/portfolio.pdf" className="self-start print:hidden">
        PDF로 받기
      </a>
      {children}
    </main>
  );
}
