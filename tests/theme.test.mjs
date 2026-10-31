import { test } from "node:test";
import assert from "node:assert/strict";
import { get, header } from "./helpers.mjs";

// 두 이름이 모두 HTML에 있고, 지금 모드에 맞는 하나만 CSS로 보인다(화면 읽기 프로그램도 그 하나만 읽고, 그쪽 툴팁만 뜬다).
for (const path of ["/", "/blog", "/portfolio", "/about", "/playground"]) {
  test(`${path}에 누르면 바뀔 모드를 이름과 툴팁으로 가진 모드 버튼이 메뉴 줄 끝에 있다`, async () => {
    const { status, body } = await get(path);
    assert.equal(status, 200);
    const button = body.match(/<button\b[^>]*>[\s\S]*?<\/button>/);
    assert.ok(button, "버튼이 없다");
    assert.match(button[0], /^<button\b[^>]*type="button"/);
    for (const name of ["다크 모드로 바꾸기", "라이트 모드로 바꾸기"]) {
      assert.ok(button[0].includes(name), `버튼에 이름 "${name}"이 없다`);
      assert.ok(button[0].includes(`title="${name}"`), `버튼에 툴팁 "${name}"이 없다`);
    }
    // 키보드로는 메뉴 다음에 닿는다.
    const nav = header(body);
    assert.ok(nav.indexOf("<button") > nav.indexOf('href="/playground"'), "버튼이 머리글의 마지막 메뉴 뒤에 없다");
  });
}
