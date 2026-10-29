import Image from "next/image";
import Link from "next/link";
import { posts } from "./blog/posts";

const recentPosts = [...posts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

export default function Home() {
  return (
    <main className="px-4 pt-14 pb-24">
      <div className="mx-auto max-w-content">
        <section className="flex flex-col-reverse gap-8 md:flex-row md:items-center md:gap-6">
          <div className="md:flex-1">
            {/* 39px: 가장 긴 가운데 줄 "OOP와 TDD에 관심이 많은"(10.77em)이 사진 옆 432px에 한 줄로 들어가는 크기 */}
            <h1 className="text-[1.625rem] leading-[1.4] font-light md:text-[2.4375rem]">
              <span className="block">안녕하세요.</span>
              <span className="block">Java와 Spring을 좋아하는</span>
              <span className="block">
                개발자 <strong className="font-bold">이승환</strong>입니다.
              </span>
            </h1>
            <ul className="mt-5 flex list-none flex-wrap gap-x-10 gap-y-2">
              <li>
                <a href="https://github.com/sonic8-8" className="flex items-center gap-3">
                  <svg viewBox="0 0 16 16" width="22" height="22" fill="currentColor" aria-hidden="true">
                    <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
                  </svg>
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a href="https://sonic8-8.com" className="flex items-center gap-3">
                  <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  <span>sonic8-8.com</span>
                </a>
              </li>
            </ul>
          </div>
          {/* public/photo.png는 보정한 원본(1839px)을 2배 해상도인 530px로 줄이고 메타데이터를 지운 것이다. */}
          <Image
            src="/photo.png"
            alt="흰 벽돌 벽 앞에 앉아 있는 이승환"
            width={264}
            height={264}
            unoptimized
            loading="eager"
            fetchPriority="high"
            className="block size-66 shrink-0"
          />
        </section>

        <section className="mt-22">
          <h2 className="text-[1.375rem] leading-[1.4] font-medium">최근 글</h2>
          {recentPosts.length === 0 ? (
            <p className="mt-3 rounded-lg border border-current/10 px-6 py-5">
              <span className="opacity-60">아직 글이 없습니다.</span>
            </p>
          ) : (
            <ul className="mt-3 flex list-none flex-col gap-3">
              {recentPosts.map((post) => (
                <li key={post.slug} className="flex justify-between gap-4 rounded-lg border border-current/10 px-6 py-5">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  <time dateTime={post.date} className="shrink-0 opacity-60">
                    {post.date}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
