// 프로덕션 빌드를 띄운 서버(BASE_URL)에 요청해 방문자가 받는 HTML만 검사한다.
import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import https from "node:https";

const BASE_URL = process.env.BASE_URL;
if (!BASE_URL) throw new Error("BASE_URL을 지정한다. 예: BASE_URL=http://127.0.0.1:3020 npm test");

// 이 개발 환경에서는 IPv6 연결이 멈추므로 IPv4로만 접속한다.
function get(path) {
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

function header(html) {
  const match = html.match(/<header[\s\S]*?<\/header>/);
  assert.ok(match, "머리글(<header>)이 없다");
  return match[0];
}

function assertLink(html, href, text) {
  const links = [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((m) => m[0]);
  assert.ok(
    links.some((a) => a.includes(`href="${href}"`) && a.includes(`>${text}<`)),
    `"${text}"(${href}) 링크가 없다`,
  );
}

test("첫 화면의 머리글에 이름, 포트폴리오, 블로그, sonic8-8.com 링크가 있다", async () => {
  const { status, body } = await get("/");
  assert.equal(status, 200);
  const nav = header(body);
  assertLink(nav, "/", "이승환");
  assertLink(nav, "/portfolio", "포트폴리오");
  assertLink(nav, "/blog", "블로그");
  assertLink(nav, "https://sonic8-8.com", "sonic8-8.com");
});

test("포트폴리오 페이지에 머리글 링크, 제목(h1), 탭 제목이 있다", async () => {
  const { status, body } = await get("/portfolio");
  assert.equal(status, 200);
  const nav = header(body);
  assertLink(nav, "/", "이승환");
  assertLink(nav, "/portfolio", "포트폴리오");
  assertLink(nav, "/blog", "블로그");
  assertLink(nav, "https://sonic8-8.com", "sonic8-8.com");
  assert.match(body, /<h1\b[^>]*>[^<]+<\/h1>/, "제목(h1)이 없다");
  assert.match(body, /<title>포트폴리오 \| 이승환<\/title>/);
});

test("포트폴리오 본문 위에 PDF 다운로드 링크가 있다", async () => {
  const { body } = await get("/portfolio");
  const main = body.match(/<main[\s\S]*?<\/main>/);
  assert.ok(main, "본문(<main>)이 없다");
  assertLink(main[0], "/portfolio.pdf", "PDF로 받기");
  assert.ok(
    main[0].indexOf('href="/portfolio.pdf"') < main[0].search(/<h1\b/),
    "다운로드 링크가 본문 제목(h1)보다 위에 있지 않다",
  );
});

test("/portfolio.pdf가 200과 PDF 형식으로 응답한다", async () => {
  const { status, headers, body } = await get("/portfolio.pdf");
  assert.equal(status, 200);
  assert.equal(headers["content-type"], "application/pdf");
  assert.ok(body.startsWith("%PDF-"), "응답 본문이 PDF가 아니다");
});

test("블로그의 머리글에 링크 4개가 있고, 글이 없으면 '아직 글이 없습니다'를 보여 준다", async () => {
  const { status, body } = await get("/blog");
  assert.equal(status, 200);
  const nav = header(body);
  assertLink(nav, "/", "이승환");
  assertLink(nav, "/portfolio", "포트폴리오");
  assertLink(nav, "/blog", "블로그");
  assertLink(nav, "https://sonic8-8.com", "sonic8-8.com");
  assert.ok(body.includes("아직 글이 없습니다"), "'아직 글이 없습니다'가 없다");
});
