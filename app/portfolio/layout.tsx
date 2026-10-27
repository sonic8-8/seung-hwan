import type { Metadata } from "next";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "포트폴리오",
};

export default function PortfolioLayout({ children }: LayoutProps<"/portfolio">) {
  return <main className={styles.main}>{children}</main>;
}
