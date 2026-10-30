import type { Metadata } from "next";
import Link from "next/link";
import { categories, posts } from "./posts";

export const metadata: Metadata = {
  title: "블로그",
};

// 틀, 제목, 빈 목록 상자는 첫 화면(app/page.tsx)의 "최근 글"과 같다.
export default function Blog() {
  return (
    <main className="px-4 pt-14 pb-24">
      <div className="mx-auto flex max-w-content flex-col gap-3">
        <h1 className="text-section font-medium">블로그</h1>
        {posts.length === 0 && (
          <p className="rounded-lg border border-current/10 px-6 py-8 text-center">
            <span className="opacity-60">아직 글이 없습니다.</span>
          </p>
        )}
        {categories.map((category) => {
          const inCategory = posts
            .filter((post) => post.category === category)
            .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
          if (inCategory.length === 0) return null;
          return (
            <section key={category}>
              <h2>{category}</h2>
              <ul>
                {inCategory.map((post) => (
                  <li key={post.slug}>
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>{" "}
                    <time dateTime={post.date}>{post.date}</time>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
