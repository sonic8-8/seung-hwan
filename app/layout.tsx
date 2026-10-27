import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import styles from "./layout.module.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | 이승환",
    default: "이승환",
  },
  description: "이승환(sonic8-8)의 개인 홈페이지",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <header className={styles.header}>
          <Link href="/" className={styles.name}>
            이승환
          </Link>
          <nav>
            <ul className={styles.nav}>
              <li>
                <Link href="/portfolio">포트폴리오</Link>
              </li>
              <li>
                <Link href="/blog">블로그</Link>
              </li>
              <li>
                <a href="https://sonic8-8.com">sonic8-8.com</a>
              </li>
            </ul>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
