export default function Home() {
  return (
    <main className="mx-auto flex max-w-160 flex-col gap-3 px-4 py-24 leading-[1.6]">
      <h1>이승환</h1>
      <p className="opacity-60">sonic8-8</p>
      <p>백엔드 개발자입니다.</p>
      <ul className="flex list-none gap-4 [&_a]:underline [&_a]:underline-offset-[0.2em]">
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
