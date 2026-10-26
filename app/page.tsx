import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>이승환</h1>
      <p className={styles.handle}>sonic8-8</p>
      <p>백엔드 개발자입니다.</p>
      <ul className={styles.links}>
        <li>
          <a href="https://github.com/sonic8-8">GitHub</a>
        </li>
        <li>
          <a href="https://sonic8-8.com">sonic8-8.com</a>
        </li>
      </ul>
    </main>
  );
}
