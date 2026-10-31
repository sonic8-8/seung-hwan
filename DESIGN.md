---
name: seung-hwan.com
description: 이승환(sonic8-8)의 개인 홈페이지. 옅은 회색 바탕(다크 모드는 차콜 바탕)에 글자색 하나와 실제 사진 한 장으로 된 프로필형 사이트.
colors:
  background: "#e4e4e7"
  foreground: "#09090b"
  background-dark: "#27272a"
  foreground-dark: "#e4e4e7"
  background-print: "#ffffff"
  foreground-print: "#171717"
typography:
  greeting:
    fontFamily: "Pretendard Variable, Pretendard, system-ui, sans-serif"
    fontSize: "2.43rem"
    fontWeight: 400
    lineHeight: 1.42
  greeting-narrow:
    fontFamily: "Pretendard Variable, Pretendard, system-ui, sans-serif"
    fontSize: "min(1.3125rem, calc((100vw - 2.875rem) / 16.38))"
    fontWeight: 400
    lineHeight: 1.42
  section:
    fontFamily: "Pretendard Variable, Pretendard, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 500
    lineHeight: 1.4
  site-name:
    fontFamily: "Pretendard Variable, Pretendard, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
  logo:
    fontFamily: "Pretendard Variable, Pretendard, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: "1.75rem"
    letterSpacing: "-0.04em"
  menu:
    fontFamily: "Pretendard Variable, Pretendard, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
  body:
    fontFamily: "Pretendard Variable, Pretendard, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
rounded:
  lg: "0.5rem"
  full: "9999px"
spacing:
  content: "45rem"
  content-narrow: "26rem"
  gutter: "1rem"
  photo: "16.5rem"
  photo-narrow: "calc(var(--text-greeting-narrow) * 16 / 3)"
components:
  nav-bar:
    textColor: "{colors.foreground}"
    typography: "{typography.menu}"
    width: "{spacing.content}"
  theme-toggle-sm:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.background}"
    rounded: "{rounded.full}"
    size: "36px"
  theme-toggle:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.background}"
    rounded: "{rounded.full}"
    size: "40px"
  theme-toggle-lg:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.background}"
    rounded: "{rounded.full}"
    size: "44px"
  profile-photo:
    rounded: "{rounded.full}"
    size: "{spacing.photo}"
  profile-photo-narrow:
    rounded: "{rounded.full}"
    size: "{spacing.photo-narrow}"
  icon-link:
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
  list-row:
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "20px 24px"
---

# Design System: seung-hwan.com

## Overview

**Creative North Star: "한 장의 명함"**

사이트는 옅은 회색 종이 한 장 위에 이름, 인사말, 실제 사진 한 장만 올려 둔 명함처럼 보인다. 색은 바탕색과 글자색 두 개뿐이고, 화면에서 색을 띠는 것은 사진(흰 벽돌 벽과 저녁빛)뿐이다. 보조 글자와 선은 따로 회색을 두지 않고 글자색의 농도를 낮춰 만든다. 그래서 다크 모드는 두 변수만 바꾸면 화면 전체가 따라온다.

밀도는 낮다. 본문은 720px(45rem, 768px보다 좁으면 416px) 가운데 한 단이고, 구역 사이를 넓게 띄운다. 그림자, 그라데이션, 강조색이 없다. 깊이는 옅은 테두리 한 줄과 둥근 모서리로만 나눈다. 움직임은 링크의 농도 변화와 인사말 가운데 줄의 타자 효과뿐이다. 동작 줄이기 설정에서 링크 농도는 전환 없이 바로 바뀌고, 타자 효과는 이 설정에서도 그대로 움직인다.

**Key Characteristics:**
- 바탕색과 글자색 두 토큰, 다크 모드는 같은 변수를 덮어쓴다.
- 보조 글자는 글자색 60%, 선과 테두리는 글자색 10%.
- Pretendard Variable 한 서체, 굵기 400·500·700.
- 720px 가운데 단(768px보다 좁으면 416px), 768px에서 홈의 인사말·사진 배치가 바뀐다.
- 원형 실제 사진, 테두리·그림자 없음.

## Colors

바탕과 글자, 두 색의 흑백 체계다. 화면 색은 Tailwind zinc 단계(라이트 200·950, 다크 800·200)로, 순수한 흰색과 검정을 피하고 아주 약한 차가운 기운만 둔다. 인쇄 값은 `@theme`에, 화면의 라이트·다크 값은 `@layer base`의 `@media screen` 안에서 같은 변수(`--color-background`, `--color-foreground`)를 덮어써 정의한다.

### Neutral
- **옅은 아연 회색** (background): 화면 라이트 모드 바탕.
- **먹색** (foreground): 화면 라이트 모드 글자, 테마 버튼 바탕, 초점 윤곽선, 선택 영역 바탕.
- **차콜** (background-dark): 다크 모드 바탕.
- **회백** (foreground-dark): 다크 모드 글자.
- **인쇄 흰색·먹색** (background-print, foreground-print): 포트폴리오 PDF는 모드와 관계없이 흰 바탕에 이 글자색이다.

60% 보조 글자의 대비는 라이트 4.9:1, 다크 5.2:1이다. 바탕이나 글자색을 바꾸면 이 값이 4.5:1 아래로 내려가지 않는지 먼저 계산한다.

### Named Rules
**The 두 변수 Rule.** 새 색 토큰을 만들지 않는다. 보조 글자는 글자색에 `opacity: 0.6`, 테두리와 구분선은 `currentColor` 10%(`border-current/10`), 타자 커서는 `currentColor` 50%로 만든다. 그래야 다크 모드에서 따로 손대지 않아도 맞는다.

**The 모드 순서 Rule.** 버튼으로 고른 모드(`<html data-theme>`, localStorage 키 `theme`)가 먼저이고, 고른 적이 없으면 `prefers-color-scheme`을 따른다. 다크 색은 `@media screen` 안에만 둔다.

**The 반전 Rule.** 선택 영역(`::selection`)과 테마 버튼은 바탕색과 글자색을 맞바꿔 칠한다.

## Typography

**Body Font:** Pretendard Variable (Pretendard, system-ui, sans-serif로 대체). 한글 전체를 담은 파일이 커서 dynamic subset CSS를 불러온다.

**Character:** 한 서체를 크기와 굵기로만 나눈다. 장식 서체나 고정폭 서체가 없다.

### Hierarchy
- **Greeting** (400, 2.43rem, 1.42): 홈 인사말 세 줄. 이름 "이승환"만 700. 가장 긴 가운데 줄과 커서가 사진 옆 432px에 한 줄로 들어가는 크기다.
- **Greeting narrow** (400, `min(1.3125rem, calc((100vw - 2.875rem) / 16.38))`, 1.42): 768px 미만의 인사말. 390px 이상에서 21px, 그보다 좁으면 함께 줄어 320px에서 약 16.7px.
- **Section** (500, 1.375rem, 1.4): "최근 글" 같은 구역 제목. 소개·블로그·포트폴리오·놀이터 페이지 제목도 이것을 쓴다.
- **Site name** (500, 1.125rem): 848px 이상에서 네비게이션 바 왼쪽 seung-hwan.com.
- **Logo** (700, 1.5rem, 줄 높이 1.75rem, 자간 -0.04em): 848px보다 좁은 화면에서 네비게이션 바 왼쪽 글자 로고 "sh.". "sh"는 글자색, 점은 글자색 45%.
- **Menu** (500, 1rem): 네비게이션 바 메뉴.
- **Body** (400, 1rem): 링크 줄, 목록 행, 본문. 포트폴리오 본문은 줄 간격 1.6.

### Named Rules
**The 한 서체 Rule.** 모든 글자는 Pretendard Variable이다. 위계는 크기와 굵기(400, 500, 700)로만 만든다.

## Layout

- **본문 폭:** 네비게이션 바와 모든 페이지(홈, 소개, 블로그, 포트폴리오, 놀이터)는 `max-w-content`(45rem, 720px) 가운데 단, 좌우 여백 16px(1rem). 본문 왼쪽·오른쪽 끝이 네비게이션 바 선 끝과 같다. 768px보다 좁은 화면은 `--container-content`를 26rem(416px)으로 바꿔 단을 좁히고 가운데에 둔다(448px보다 좁으면 단은 화면 폭 − 32px). 화면(`@media screen`)에만 걸어, 인쇄는 A4 폭이 768px보다 좁아도 720px 단이다.
- **세로 리듬:** 네비게이션 바 위 20px(848px 미만은 12px), 본문 위 56px, 아래 96px(모든 페이지). 홈은 인사말 묶음과 "최근 글" 사이 88px, 인사말 묶음과 "최근 글" 사이 88px. 인사말과 링크 줄 사이 20px, 구역 제목과 목록 사이 12px, 목록 행 사이 12px.
- **홈 첫 구역(768px 이상):** 인사말 묶음과 사진을 가로로 놓고 아래 끝을 맞춘다(간격 24px). 인사말 묶음은 아래에 16px를 더 둬서, 링크 줄 아래 끝이 사진 아래 끝보다 16px 위에 온다.
- **홈 첫 구역(768px 미만):** 두 칸 격자(`1fr auto`, 간격 12px). 사진은 인사말 오른쪽 위에 놓이고, 링크 줄은 그 아래 두 칸 전체를 쓴다. 인사말 글자 크기와 사진 지름은 같은 비율로 함께 줄어, 320px 폭에서도 가운데 줄이 한 줄에 들어간다.
- **링크 줄:** 가로 간격 40px, 줄바꿈 시 세로 8px. 아이콘 22px와 글자 사이 12px.
- **브레이크포인트:** 768px(md)에서 단 폭(416px ↔ 720px), 홈 배치, 테마 버튼 오른쪽 위치, 848px에서 머리글 고정, 홈 링크 글자(사이트 이름·로고), 테마 버튼 자리, 1024px(lg)에서 테마 버튼 크기와 위치가 바뀐다.
- **인쇄:** 네비게이션 바와 테마 버튼은 인쇄하지 않는다.

## Elevation & Depth

그림자를 쓰지 않는 평평한 체계다. 영역은 글자색 10%의 1px 테두리와 둥근 모서리로만 나눈다. 겹쳐 뜨는 것은 오른쪽 위 테마 버튼과, 848px 미만에서 화면 위에 붙는 머리글이다. 버튼은 그림자 없이 반전색 원으로, 머리글은 바탕색과 아래 선 한 줄로 본문과 나뉜다.

**The 선 한 줄 Rule.** 깊이가 필요하면 그림자 대신 `currentColor` 10% 테두리를 쓴다.

## Shapes

모서리는 두 가지다. 목록 행 같은 상자는 8px(0.5rem) 둥근 모서리, 사진과 테마 버튼은 완전한 원이다. 구분선은 네비게이션 바 아래 한 줄뿐이다. 아이콘(GitHub, 링크)은 SVG 파일을 `mask`로 씌우고 `bg-current`로 칠해 글자색을 따른다. 테마 버튼의 초승달과 해는 인라인 SVG로 `fill-current`(해의 빛줄기는 `stroke-current` 2, 둥근 끝).

## Components

### Navigation
- **Style:** 본문 폭 720px 가운데 단. 왼쪽에 홈 링크, 오른쪽에 소개·블로그·포트폴리오·놀이터(1rem, 500, 간격 32px). 아래에 글자색 10% 1px 선, 선 위 여백 12px. 848px 이상은 글자 기준선을 맞춘다.
- **Home link:** 848px 이상은 사이트 이름 seung-hwan.com(Site name), 848px보다 좁으면 글자 로고 "sh."(Logo). 링크 안에 두 글자를 모두 두고 폭에 맞지 않는 쪽을 `display: none`으로 숨기므로(CSS만, 스크립트 없음), 화면 읽기 프로그램도 보이는 글자를 링크 이름으로 읽는다. `aria-label`은 두지 않는다.
- **Current page:** 지금 있는 페이지의 메뉴(블로그는 그 아래 글 포함)에 `aria-current="page"`를 달고 글자색 2px 밑줄(6px 띄움)로 보인다. 첫 화면에서는 어느 메뉴에도 없다.
- **Hover / Focus:** 링크 공통 상태를 따른다.
- **Mobile:** 848px보다 좁으면 머리글이 화면 위에 붙고(`sticky`, 바탕색으로 본문을 가림), 위 여백은 12px다. 로고, 메뉴(간격 12px), 테마 버튼(36px)을 한 줄에 두고, 메뉴 오른쪽에 48px(버튼 36px와 간격 12px)을 비워 버튼과 겹치지 않는다. 375px까지 한 줄이고, 더 좁으면 메뉴가 로고 아래 줄로 내려간다(세로 간격 12px). 메뉴 링크는 위아래 10px 안쪽 여백으로 누르는 높이를 44px로 늘리고, 같은 만큼 바깥 여백을 줄여 글자 자리는 그대로다. 기준선을 맞추면 작은 메뉴 글자가 큰 로고보다 3px 아래에 보이므로, 메뉴 목록을 `position: relative`로 3px 올려(헤더 높이는 그대로) 로고·메뉴 글자·테마 버튼의 글자 모양 기준 위아래 가운데를 맞춘다(390px에서 25.5·25.5·26px). 메뉴가 둘째 줄로 내려가는 320px에서도 같이 3px 올라간다. 768px보다 좁으면 단이 416px이라 로고·메뉴·버튼이 단을 따라 가운데로 모인다.
- **Print:** 숨긴다.

### Tab Title & Icon
- **Title:** 첫 화면은 "개발자 이승환", 다른 페이지는 `개발자 이승환 | <페이지>`(예: "개발자 이승환 | 블로그"). `app/layout.tsx`의 `metadata.title`.
- **Icon:** `app/favicon.ico`(16·32·48px PNG). 32×32 기준 7px 둥근 사각형을 옅은 아연 회색(#e4e4e7)으로 칠하고, 그 위에 Logo와 같은 "sh."(Pretendard 700, 19px, 자간 -0.8px)를 먹색(#09090b)으로, 점은 같은 색 45%로 그린다. 그림으로 저장해 방문자 기기의 서체와 관계없이 같은 모양이다. 브라우저 모드와 관계없이 이 색 하나다(라이트·다크 크롬 탭 모두에서 사각형이 보인다).

### Theme Toggle
- **Style:** 글자색 바탕에 바탕색 아이콘(버튼 지름의 42%)이 있는 원형 버튼. 아이콘이 지금 모드를 보인다: 라이트 화면은 초승달, 다크 화면은 해. 848px 이상에서는 페이지 오른쪽 위에 `absolute`로 놓여 스크롤하면 함께 올라가고, 848px보다 좁으면 `fixed`로 머리글 첫 줄 오른쪽 끝에 늘 보인다.
- **Size:** 848px 미만은 지름 36px, 위 8px(세로 중심이 머리글 첫 줄 중심 26px). 오른쪽은 768~847px에서 16px, 768px보다 좁으면 단의 오른쪽 끝(`max(1rem, (100% − var(--container-content)) / 2)`, `fixed`라 100%는 스크롤 막대를 뺀 창 폭)이라 448px보다 좁은 휴대폰은 16px다. 848~1023px은 지름 40px, 위 14px·오른쪽 16px. 1024px 이상은 지름 44px, 위 12px·오른쪽 26px. 848px 이상의 두 경우 모두 세로 중심이 네비게이션 줄(위 20px, 높이 28px)의 중심 34px에 온다.
- **Focus:** 2px 글자색 윤곽선, 2px 띄움.
- **Label:** 이름은 누르면 바뀔 모드를 말한다: 라이트 화면은 "다크 모드로 바꾸기", 다크 화면은 "라이트 모드로 바꾸기". 두 아이콘과 이름을 모두 HTML에 두고 `dark:` 변형(`globals.css`의 `@custom-variant dark`, 모드 순서 Rule과 같은 순서)으로 하나만 보이므로, 첫 화면부터 맞고 깜빡이지 않는다. 누르면 `data-theme`를 바꾸고 localStorage `theme`에 저장한다.

### Profile Photo
- **Style:** 원형으로 자른 실제 인물 사진, 테두리·그림자 없음. 원본은 528px 정사각형(2배 해상도)이다.
- **Size:** 768px 이상 지름 264px(16.5rem). 768px 미만은 `--spacing-photo-narrow`(인사말 글자 크기의 16/3배): 390px 이상에서 112px, 320px에서 약 89px.
- **Loading:** 첫 화면 이미지라 `loading="eager"`, `fetchPriority="high"`.

### Typing Line
- **Style:** 인사말 가운데 줄. 네 문장을 글자당 100ms로 쓰고 50ms로 지우며, 다 쓴 문장은 2400ms 머문다. 서버 HTML에는 첫 문장이 다 쓰인 채로 들어간다.
- **Cursor:** 폭 2px, 높이 1.1em, 글자 끝에서 0.2em 띄움, 글자색 50%.
- **Reduced motion:** 동작 줄이기 설정에서도 같은 속도로 타자를 치고 커서를 보인다.
- **Screen reader:** 바뀌는 글자는 숨기고, 화면 읽기 프로그램에는 네 문장을 한 번에 준다.

### Links
- **Default:** 글자색 그대로, 밑줄 없음. 포트폴리오 본문 안의 링크만 밑줄(0.2em 띄움). 네비게이션의 지금 페이지 메뉴는 2px 밑줄(Navigation 참고).
- **Hover:** 농도 70%로 옅어진다(`opacity` 전환). 동작 줄이기 설정에서는 전환 없이 바로 바뀐다.
- **Focus:** 2px 글자색 실선 윤곽선, 2px 띄움. 테마 버튼과 같다.

### List Row ("최근 글")
- **Corner Style:** 8px(0.5rem).
- **Background:** 없음(바탕색 그대로).
- **Border:** 1px, 글자색 10%.
- **Internal Padding:** 위아래 20px, 좌우 24px.
- **Content:** 왼쪽 글 제목 링크, 오른쪽 날짜(글자색 60%, 줄지 않음). 사이 간격 16px. 행 사이 12px.
- **Empty:** 글이 없으면 같은 테두리 상자 한 칸에 "아직 글이 없습니다."를 글자색 60%로 가로 가운데에 보여 준다. 안쪽 여백은 위아래 32px, 좌우 24px. 빈 상자는 다섯 곳(홈 "최근 글", 블로그 빈 목록, 포트폴리오 임시 원고, 소개·놀이터의 "준비 중입니다.")이 모두 같다. 제목과의 간격은 12px.

### Page Title (소개, 블로그, 포트폴리오, 놀이터)
- **Style:** Section 글자(500, 1.375rem). 본문 단 왼쪽 끝, 본문 첫 줄(위 56px)에 놓인다. 화면 전체를 가운데 정렬하지 않는다.
- **Portfolio:** 제목 오른쪽 끝에 "PDF로 받기" 링크(밑줄, 기준선 맞춤). 인쇄에서는 링크를 숨긴다.

## Do's and Don'ts

### Do:
- **Do** 색은 `--color-background`, `--color-foreground` 두 토큰만 쓰고, 보조 글자는 60%, 선은 10% 농도로 만든다.
- **Do** 네비게이션 바와 모든 페이지는 본문 폭 `max-w-content`(45rem, 768px보다 좁으면 26rem), 좌우 여백 1rem을 써서 왼쪽·오른쪽 끝을 맞춘다.
- **Do** 링크 hover는 `opacity: 0.7` 전환, 초점은 2px 글자색 윤곽선(2px 띄움)으로 통일하고, 동작 줄이기 설정에서는 전환을 끈다.
- **Do** 상자는 1px 글자색 10% 테두리와 0.5rem 둥근 모서리로 만든다.
- **Do** 인물 사진은 실제 사진을 원형으로, 테두리·그림자 없이 쓴다.

### Don't:
- **Don't** 강조색이나 회색 hex를 새로 더하지 않는다. 화면의 색은 사진에서만 온다.
- **Don't** 그림자나 그라데이션으로 깊이를 만들지 않는다.
- **Don't** Pretendard Variable 말고 다른 서체를 더하지 않는다.
- **Don't** 다크 색을 `@media screen` 밖에 두지 않는다. 인쇄는 흰 바탕의 인쇄 색이어야 한다.
