import { test } from "node:test";
import assert from "node:assert/strict";
import { get, assertLink, assertHeaderLinks } from "./helpers.mjs";

test("포트폴리오 페이지에 머리글 링크, 제목(h1), 탭 제목이 있다", async () => {
  const { status, body } = await get("/portfolio");
  assert.equal(status, 200);
  assertHeaderLinks(body);
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
