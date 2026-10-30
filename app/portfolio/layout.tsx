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

// 원고(page.md)의 첫 h1은 첫 화면 "최근 글"과 같은 제목으로 쓰고, PDF 링크를 그 오른쪽 칸에 둔다. 나머지 원고는 두 칸을 모두 쓴다.
// min-w-0: 긴 코드 줄과 넓은 표가 칸을 넓히지 않고 제 안에서 가로 스크롤되게 한다.
const title =
  "grid-cols-[minmax(0,1fr)_auto] items-baseline *:min-w-0 [&>:not(:first-child)]:col-span-2 " +
  "[&>h1:first-of-type]:col-span-1 [&>h1:first-of-type]:row-start-1 [&>h1:first-of-type]:text-section [&>h1:first-of-type]:font-medium";

// 원고가 제목과 문단 하나뿐이면(임시 원고 "준비 중입니다.") 첫 화면의 빈 목록 줄과 같은 상자로 보여 준다.
// 테두리까지 옅어지지 않도록 글자만 글자색 60%로 칠하고, 제목과의 간격은 첫 화면처럼 12px로 줄인다.
const placeholder =
  "[&>h1+p:last-child]:-mt-1 [&>h1+p:last-child]:rounded-lg [&>h1+p:last-child]:border [&>h1+p:last-child]:border-foreground/10 " +
  "[&>h1+p:last-child]:px-6 [&>h1+p:last-child]:py-8 [&>h1+p:last-child]:text-center [&>h1+p:last-child]:leading-[normal] " +
  "[&>h1+p:last-child]:text-foreground/60";

export default function PortfolioLayout({ children }: LayoutProps<"/portfolio">) {
  return (
    <main className="px-4 pt-14 pb-24">
      <div className={`mx-auto grid max-w-content gap-4 leading-[1.6] ${title} ${placeholder} ${body} ${print}`}>
        {/* public/portfolio.pdf는 scripts/portfolio-pdf.sh가 만든다. */}
        <a href="/portfolio.pdf" className="col-start-2 row-start-1 print:hidden">
          PDF로 받기
        </a>
        {children}
      </div>
    </main>
  );
}
