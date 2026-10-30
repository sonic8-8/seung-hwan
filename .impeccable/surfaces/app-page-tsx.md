---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: []
---

# 첫 화면 (app/page.tsx)

승인한 시안: `.impeccable/mocks/approved-home.png` (배치는 `h-cutout-small-flip.png`, 사진은 `source/profile-edited.jpg`로 바꾼 합성본)

## Direction contract

THESIS: 인사말과 이름으로 누구인지 먼저 알리고, 실제 사진 한 장과 두 갈래(포트폴리오·블로그)로 안내하는 깔끔한 개인 프로필 홈. 은유형 첫 화면과, 아바타·아이콘 줄·기술 배지로 된 개발 블로그 머리말을 거부한다.

OWN-WORLD: 흰 바탕, 거의 검정 글자와 회색 보조 글자, 옅은 회색 얇은 테두리와 둥근 모서리의 카드. 한글 산세리프 하나를 세 단계 크기로만 쓴다. 색은 사진에서만 온다(크림색 벽, 저녁빛).

STORY: 방문자는 첫 줄에서 "백엔드 개발자 이승환"을 알고, 소개 한 줄에서 판단과 검증을 기록하는 사람임을 알고, 포트폴리오나 블로그 중 하나를 고른다.

FIRST VIEWPORT: 좁은 가운데 열. 위에 이름과 포트폴리오·블로그 링크가 있는 얇은 머리줄. 왼쪽에 큰 3줄 인사말("안녕하세요." / "백엔드 개발자" / "**이승환**입니다."), 그 아래 소개 한 줄과 GitHub·sonic8-8.com 작은 링크. 오른쪽에 지름 264px 원형 실제 사진(인물이 인사말 쪽을 봄, 테두리·그림자 없음, 아래 끝은 링크 줄보다 16px 아래). 768px 미만에서는 사진이 인사말 오른쪽 옆으로 붙고 인사말 크기에 맞춰 함께 줄어든다(390px 이상 지름 112px). 그 아래 간격을 두고 같은 무게의 카드 두 장(포트폴리오, 블로그)이 주요 행동이다. 그 아래 최근 글.

FORM: 범주 표준(canon)을 사용자가 고름. 기준 사이트 hyewoncc.github.io, 영감 jeong-min.com. seed:1e0a7b373cda6bce

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
