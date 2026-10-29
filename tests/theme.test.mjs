import { test } from "node:test";
import assert from "node:assert/strict";
import { get } from "./helpers.mjs";

for (const path of ["/", "/blog", "/portfolio", "/about", "/playground"]) {
  test(`${path}에 이름 있는 모드 버튼이 있고, 인쇄에서 빠지며, 그리기 전에 저장한 모드를 정한다`, async () => {
    const { status, body } = await get(path);
    assert.equal(status, 200);
    const button = body.match(/<button\b[^>]*>/);
    assert.ok(button, "버튼이 없다");
    assert.match(button[0], /aria-label="[^"]+"/, "버튼에 접근성 이름(aria-label)이 없다");
    assert.match(button[0], /type="button"/);
    assert.match(button[0], /class="[^"]*\bprint:hidden\b/, "인쇄에서 버튼이 빠지지 않는다");
    // 모드는 <head>의 인라인 스크립트가 본문을 그리기 전에 정한다.
    const head = body.match(/<head>[\s\S]*?<\/head>/);
    assert.ok(head && /<script>[^<]*localStorage\.getItem\("theme"\)/.test(head[0]), "<head>에 저장한 모드를 읽는 스크립트가 없다");
  });
}
