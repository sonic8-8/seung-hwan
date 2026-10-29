import { test } from "node:test";
import assert from "node:assert/strict";
import { get, assertHeaderLinks, assertLink } from "./helpers.mjs";

function main(html) {
  const match = html.match(/<main[\s\S]*?<\/main>/);
  assert.ok(match, "본문(<main>)이 없다");
  return match[0];
}

// 태그를 지워 화면에 보이는 글자만 남긴다. "개발자 <strong>이승환</strong>입니다."도 한 문장으로 읽힌다.
function text(html) {
  return html.replace(/<[^>]*>/g, "");
}

test("첫 화면의 머리글에 seung-hwan.com, 소개, 블로그, 포트폴리오, 놀이터 링크가 있다", async () => {
  const { status, body } = await get("/");
  assert.equal(status, 200);
  assertHeaderLinks(body);
});

test("첫 화면에 인사말 세 줄이 순서대로 있고, 핸들과 임시 문구는 없다", async () => {
  const { body } = await get("/");
  const visible = text(main(body));
  const lines = ["안녕하세요.", "Java와 Spring을 좋아하는", "개발자 이승환입니다."];
  const positions = lines.map((line) => visible.indexOf(line));
  lines.forEach((line, i) => assert.ok(positions[i] >= 0, `"${line}"이 없다`));
  assert.ok(positions[0] < positions[1] && positions[1] < positions[2], "인사말 순서가 다르다");
  assert.ok(!visible.includes("백엔드 개발자입니다."), "임시 문구가 남아 있다");
  assert.ok(!/sonic8-8(?!\.com)/.test(visible), "핸들 sonic8-8이 남아 있다");
});

test("첫 화면에 GitHub, sonic8-8.com 링크와 최근 글이 있다", async () => {
  const { body } = await get("/");
  const content = main(body);
  assertLink(content, "https://github.com/sonic8-8", "GitHub");
  assertLink(content, "https://sonic8-8.com", "sonic8-8.com");
  assert.ok(content.includes("최근 글"), "'최근 글'이 없다");
  assert.ok(content.includes("아직 글이 없습니다"), "'아직 글이 없습니다'가 없다");
});

test("링크 아이콘 SVG 파일이 응답한다", async () => {
  for (const path of ["/icons/github.svg", "/icons/link.svg"]) {
    const { status, headers } = await get(path);
    assert.equal(status, 200, `${path}가 ${status}로 응답한다`);
    assert.match(headers["content-type"], /^image\/svg\+xml/);
  }
});

test("사진은 대체 텍스트가 있고, 이미지로 응답하며 EXIF가 없다", async () => {
  const { body } = await get("/");
  const img = main(body).match(/<img\b[^>]*src="[^"]*photo[^"]*"[^>]*>/);
  assert.ok(img, "사진(<img>)이 없다");
  const alt = img[0].match(/\balt="([^"]*)"/);
  assert.ok(alt && alt[1].trim(), "사진에 대체 텍스트가 없다");

  const src = img[0].match(/\bsrc="([^"]*)"/)[1];
  const { status, headers, buffer } = await get(src);
  assert.equal(status, 200);
  assert.match(headers["content-type"], /^image\//);
  // PNG의 EXIF는 eXIf 청크에, 옛 도구는 "Exif\0\0" 머리를 붙인 텍스트 청크에 넣는다.
  assert.ok(!buffer.includes("eXIf") && !buffer.includes("Exif\0\0"), "사진에 EXIF가 있다");
});
