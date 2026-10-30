import { test } from "node:test";
import assert from "node:assert/strict";
import { get } from "./helpers.mjs";

// 두 이름이 모두 HTML에 있고, 지금 모드에 맞는 하나만 CSS로 보인다(화면 읽기 프로그램도 그 하나만 읽는다).
for (const path of ["/", "/blog", "/portfolio", "/about", "/playground"]) {
  test(`${path}에 누르면 바뀔 모드를 이름으로 가진 모드 버튼이 있다`, async () => {
    const { status, body } = await get(path);
    assert.equal(status, 200);
    const button = body.match(/<button\b[^>]*>[\s\S]*?<\/button>/);
    assert.ok(button, "버튼이 없다");
    assert.match(button[0], /^<button\b[^>]*type="button"/);
    for (const name of ["다크 모드로 바꾸기", "라이트 모드로 바꾸기"]) {
      assert.ok(button[0].includes(name), `버튼에 이름 "${name}"이 없다`);
    }
  });
}
