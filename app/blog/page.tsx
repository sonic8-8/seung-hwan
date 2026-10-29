import type { Metadata } from "next";
import Link from "next/link";
import { categories, posts } from "./posts";

export const metadata: Metadata = {
  title: "블로그",
};

export default function Blog() {
  return (
    <main className="mx-auto flex max-w-160 flex-col gap-3 px-4 py-24 leading-[1.6]">
      <h1>블로그</h1>
      {posts.length === 0 && <p>아직 글이 없습니다.</p>}
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
    </main>
  );
}
