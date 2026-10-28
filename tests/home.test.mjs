import { test } from "node:test";
import assert from "node:assert/strict";
import { get, assertHeaderLinks } from "./helpers.mjs";

test("첫 화면의 머리글에 이름, 포트폴리오, 블로그, sonic8-8.com 링크가 있다", async () => {
  const { status, body } = await get("/");
  assert.equal(status, 200);
  assertHeaderLinks(body);
});
