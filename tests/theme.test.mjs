import { test } from "node:test";
import assert from "node:assert/strict";
import { get } from "./helpers.mjs";

for (const path of ["/", "/blog", "/portfolio", "/about", "/playground"]) {
  test(`${path}에 이름 있는 모드 버튼이 있다`, async () => {
    const { status, body } = await get(path);
    assert.equal(status, 200);
    const button = body.match(/<button\b[^>]*>/);
    assert.ok(button, "버튼이 없다");
    assert.match(button[0], /aria-label="[^"]+"/, "버튼에 접근성 이름(aria-label)이 없다");
    assert.match(button[0], /type="button"/);
  });
}
