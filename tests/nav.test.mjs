import { test } from "node:test";
import assert from "node:assert/strict";
import { get, header } from "./helpers.mjs";

for (const [path, current] of [
  ["/", null],
  ["/about", "/about"],
  ["/blog", "/blog"],
  ["/portfolio", "/portfolio"],
  ["/playground", "/playground"],
]) {
  test(`${path}의 머리글에서 ${current ? `${current} 메뉴만` : "어느 메뉴도"} 지금 페이지(aria-current="page")로 표시된다`, async () => {
    const { status, body } = await get(path);
    assert.equal(status, 200);
    const marked = [...header(body).matchAll(/<a\b[^>]*>/g)]
      .map((m) => m[0])
      .filter((a) => /\baria-current="page"/.test(a))
      .map((a) => a.match(/\bhref="([^"]*)"/)[1]);
    assert.deepEqual(marked, current ? [current] : []);
  });
}
