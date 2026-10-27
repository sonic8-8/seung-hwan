import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    // Turbopack은 함수를 넘길 수 없어 플러그인을 이름 문자열로 준다.
    remarkPlugins: ["remark-gfm"],
  },
});

export default withMDX(nextConfig);
