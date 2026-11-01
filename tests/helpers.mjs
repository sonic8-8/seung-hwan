// 테스트 파일들이 함께 쓰는 요청과 검사. 이름이 *.test.mjs가 아니어서 npm test가 직접 돌리지 않는다.
// 프로덕션 빌드를 띄운 서버(BASE_URL)에 요청해 방문자가 받는 HTML만 검사한다.
import assert from "node:assert/strict";
import http from "node:http";
import https from "node:https";

const BASE_URL = process.env.BASE_URL;
if (!BASE_URL) throw new Error("BASE_URL을 지정한다. 예: BASE_URL=http://127.0.0.1:3030 npm test");

// 이 개발 환경에서는 IPv6 연결이 멈추므로 IPv4로만 접속한다.
export function get(path) {
  const url = new URL(path, BASE_URL);
  const client = url.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    client
      .get(url, { family: 4 }, (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          // 이미지 같은 바이너리 응답은 buffer로 검사한다.
          const buffer = Buffer.concat(chunks);
          resolve({ status: res.statusCode, headers: res.headers, body: buffer.toString("utf8"), buffer });
        });
      })
      .on("error", reject);
  });
}

export function header(html) {
  const match = html.match(/<header[\s\S]*?<\/header>/);
  assert.ok(match, "머리글(<header>)이 없다");
  return match[0];
}

// 화면 읽기 프로그램이 읽는 링크 이름: aria-label이 있으면 그것, 없으면 태그를 지운 글자.
function linkName(a) {
  const label = a.match(/^<a\b[^>]*\baria-label="([^"]*)"/);
  return label ? label[1] : a.replace(/<[^>]*>/g, "").trim();
}

export function assertLink(html, href, text) {
  const links = [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((m) => m[0]);
  assert.ok(
    links.some((a) => a.includes(`href="${href}"`) && linkName(a) === text),
    `"${text}"(${href}) 링크가 없다`,
  );
}

// 홈 링크는 좁은 화면의 "sh."와 넓은 화면의 "seung-hwan.com"을 따로 담고, 폭에 맞는 하나만 보인다.
// 이름을 덮어쓰는 aria-label이 없어야 화면 읽기 프로그램도 보이는 글자를 읽는다.
function assertHomeLink(nav) {
  const a = nav.match(/<a\b[^>]*\bhref="\/"[^>]*>([\s\S]*?)<\/a>/);
  assert.ok(a, "홈 링크가 없다");
  assert.ok(!/^<a\b[^>]*\baria-label=/.test(a[0]), "홈 링크에 aria-label이 있다");
  const parts = [...a[1].matchAll(/<span\b[^>]*>((?:[^<]|<span\b[^>]*>[^<]*<\/span>)*)<\/span>/g)].map((m) =>
    m[1].replace(/<[^>]*>/g, ""),
  );
  assert.deepEqual(parts, ["sh.", "seung-hwan.com"], "홈 링크 글자가 'sh.'와 'seung-hwan.com' 둘로 나뉘어 있지 않다");
}

export function assertHeaderLinks(html) {
  const nav = header(html);
  assertHomeLink(nav);
  assertLink(nav, "/about", "소개");
  assertLink(nav, "/blog", "블로그");
  assertLink(nav, "/portfolio", "포트폴리오");
  assertLink(nav, "/playground", "놀이터");
  assert.ok(!nav.includes("https://sonic8-8.com"), "머리글에 sonic8-8.com 링크가 있다");
}
