import { test } from "node:test";
import assert from "node:assert/strict";
import { get, assertHeaderLinks } from "./helpers.mjs";

test("첫 화면의 머리글에 seung-hwan.com, 소개, 블로그, 포트폴리오, 놀이터 링크가 있다", async () => {
  const { status, body } = await get("/");
  assert.equal(status, 200);
  assertHeaderLinks(body);
});
