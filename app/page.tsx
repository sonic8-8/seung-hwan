import Image from "next/image";
import Link from "next/link";
import { posts } from "./blog/posts";
import TypingLine from "./typing-line";

const recentPosts = [...posts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

export default function Home() {
  return (
    <main className="px-4 pt-14 pb-24">
      <div className="mx-auto max-w-content">
        {/* 좁은 화면은 사진을 인사말 오른쪽 위에 두고, 링크 줄은 그 아래 전체 폭을 쓴다. */}
        <section className="grid grid-cols-[1fr_auto] items-start gap-x-3 md:flex md:items-end md:gap-6">
          {/* 시안에서 링크 줄 아래 끝이 사진 아래 끝보다 16px 위에 있다. */}
          <div className="contents md:block md:flex-1 md:pb-4">
            <h1 className="text-greeting-narrow font-normal md:text-greeting">
              <span className="block">안녕하세요.</span>
              <TypingLine lines={["Java와 Spring을 좋아하는", "OOP와 TDD에 관심이 많은", "AI 에이전트에 관심이 많은", "LLM Eval에 관심이 많은"]} />
              <span className="block">
                개발자 <strong className="font-bold">이승환</strong>입니다.
              </span>
            </h1>
            {/* 아이콘은 SVG 파일을 mask로 씌워 그린다. 색은 bg-current라 글자색(다크 모드 포함)을 따른다. */}
            <ul className="col-span-2 mt-5 flex list-none flex-wrap gap-x-10 gap-y-2">
              <li>
                <a href="https://github.com/sonic8-8" className="flex items-center gap-3 transition-opacity hover:opacity-70 motion-reduce:transition-none">
                  <span aria-hidden="true" className="size-5.5 bg-current mask-[url(/icons/github.svg)] mask-contain mask-no-repeat" />
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a href="https://sonic8-8.com" className="flex items-center gap-3 transition-opacity hover:opacity-70 motion-reduce:transition-none">
                  <span aria-hidden="true" className="size-5.5 bg-current mask-[url(/icons/link.svg)] mask-contain mask-no-repeat" />
                  <span>sonic8-8.com</span>
                </a>
              </li>
            </ul>
          </div>
          {/* public/photo.png는 보정한 원본(1839px)에서 GitHub 프로필 사진과 같은 범위(왼쪽 위 510, 535에서 1150px 정사각형)를 잘라
              2배 해상도인 528px로 줄이고 메타데이터를 지운 것이다. */}
          <Image
            src="/photo.png"
            alt="흰 벽돌 벽 앞에 앉아 있는 이승환"
            width={264}
            height={264}
            unoptimized
            loading="eager"
            fetchPriority="high"
            className="col-start-2 row-start-1 block size-photo-narrow shrink-0 rounded-full md:size-66"
          />
        </section>

        <section className="mt-22">
          <h2 className="text-section font-medium">최근 글</h2>
          {recentPosts.length === 0 ? (
            <p className="mt-3 rounded-lg border border-current/10 px-6 py-5">
              <span className="opacity-60">아직 글이 없습니다.</span>
            </p>
          ) : (
            <ul className="mt-3 flex list-none flex-col gap-3">
              {recentPosts.map((post) => (
                <li key={post.slug} className="flex justify-between gap-4 rounded-lg border border-current/10 px-6 py-5">
                  <Link href={`/blog/${post.slug}`} className="transition-opacity hover:opacity-70 motion-reduce:transition-none">
                    {post.title}
                  </Link>
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
