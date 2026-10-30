import { test } from "node:test";
import assert from "node:assert/strict";
import { get, assertHeaderLinks } from "./helpers.mjs";

test("블로그의 머리글에 링크 5개와 제목(h1) '블로그'가 있고, 글이 없으면 '아직 글이 없습니다'를 보여 준다", async () => {
  const { status, body } = await get("/blog");
  assert.equal(status, 200);
  assertHeaderLinks(body);
  assert.match(body, /<h1\b[^>]*>블로그<\/h1>/, "제목(h1) '블로그'가 없다");
  assert.ok(body.includes("아직 글이 없습니다"), "'아직 글이 없습니다'가 없다");
});
