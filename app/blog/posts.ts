// 목록 페이지는 이 순서로 글을 묶는다.
export const categories = ["개발", "관심사"] as const;

export type Category = (typeof categories)[number];

export type Post = {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD. 문자열 비교로 정렬한다.
  category: Category;
};

// 폴더를 읽지 않고 손으로 적는다. 글이 0개일 때 폴더 기반 동적 import와 빈 generateStaticParams는 빌드를 깨뜨린다.
// 글을 더할 때는 app/blog/<slug>/page.mdx와 여기 한 줄을 함께 적는다.
export const posts: Post[] = [];
