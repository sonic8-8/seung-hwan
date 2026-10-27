import type { Metadata } from "next";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "포트폴리오",
};

export default function PortfolioLayout({ children }: LayoutProps<"/portfolio">) {
  return (
    <main className={styles.main}>
      {/* public/portfolio.pdf는 scripts/portfolio-pdf.sh가 만든다. */}
      <a href="/portfolio.pdf" className={styles.download}>
        PDF로 받기
      </a>
      {children}
    </main>
  );
}
