// 테스트 파일들이 함께 쓰는 요청과 검사. 이름이 *.test.mjs가 아니어서 npm test가 직접 돌리지 않는다.
// 프로덕션 빌드를 띄운 서버(BASE_URL)에 요청해 방문자가 받는 HTML만 검사한다.
import assert from "node:assert/strict";
import http from "node:http";
import https from "node:https";

const BASE_URL = process.env.BASE_URL;
if (!BASE_URL) throw new Error("BASE_URL을 지정한다. 예: BASE_URL=http://127.0.0.1:3020 npm test");

// 이 개발 환경에서는 IPv6 연결이 멈추므로 IPv4로만 접속한다.
export function get(path) {
  const url = new URL(path, BASE_URL);
  const client = url.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    client
      .get(url, { family: 4 }, (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body }));
      })
      .on("error", reject);
  });
}

export function header(html) {
  const match = html.match(/<header[\s\S]*?<\/header>/);
  assert.ok(match, "머리글(<header>)이 없다");
  return match[0];
}

export function assertLink(html, href, text) {
  const links = [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((m) => m[0]);
  assert.ok(
    links.some((a) => a.includes(`href="${href}"`) && a.includes(`>${text}<`)),
    `"${text}"(${href}) 링크가 없다`,
  );
}

export function assertHeaderLinks(html) {
  const nav = header(html);
  assertLink(nav, "/", "seung-hwan.com");
  assertLink(nav, "/about", "소개");
  assertLink(nav, "/blog", "블로그");
  assertLink(nav, "/portfolio", "포트폴리오");
  assertLink(nav, "/playground", "놀이터");
  assert.ok(!nav.includes("https://sonic8-8.com"), "머리글에 sonic8-8.com 링크가 있다");
}
