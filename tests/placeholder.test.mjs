import { test } from "node:test";
import assert from "node:assert/strict";
import { get, assertHeaderLinks } from "./helpers.mjs";

for (const [path, title] of [
  ["/about", "소개"],
  ["/playground", "놀이터"],
]) {
  test(`${path}에 머리글 링크, '준비 중입니다.', 탭 제목이 있다`, async () => {
    const { status, body } = await get(path);
    assert.equal(status, 200);
    assertHeaderLinks(body);
    assert.ok(body.includes("준비 중입니다."), "'준비 중입니다.'가 없다");
    assert.match(body, new RegExp(`<title>${title} \\| 이승환</title>`));
  });
}
