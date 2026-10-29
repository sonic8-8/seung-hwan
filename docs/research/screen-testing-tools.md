# 화면 다듬기 도구 조사

조사일: 2026-10-29(테스트 러너), 2026-10-30(에이전트 도구 보충, Playwright CLI 비교). 버전과 수치는 이날 기준이다. 근거는 1차 출처만 쓰고, 2차 글에만 있는 사실은 그렇다고 적는다. 출처 번호는 8절 목록을 가리킨다.

## 1. 질문과 결론

**질문**: 화면을 다듬는 동안 에이전트(오케스트레이터, 작업자)가 브라우저를 보고 조작해 확인하려면 무슨 도구를 쓰면 되는가. 이 WSL 환경에서 어떻게 띄우는가. 프로젝트에 의존성은 더하지 않는다.

**결론**: 작업자 에이전트에는 Playwright MCP(`@playwright/mcp`) 하나를 붙인다. WSL 안의 headless Chromium으로 띄우고, 실행한 코드를 응답에 다시 싣지 않게 `--codegen none`을 준다. MCP 설정을 붙일 수 없는 세션(이미 떠 있는 오케스트레이터 등)에서는 같은 엔진의 Playwright CLI(`@playwright/cli`)를 버전을 고정해 쓴다. 사람이 쓰는 실제 브라우저에서 한 번 더 볼 일이 있을 때만 Aside를 쓴다. Chrome DevTools MCP와 손수 짠 CDP 스크립트는 기본 도구로 두지 않는다.

이유:

- 다섯 과제(뷰포트 캡처, 타이핑 시간 측정, 다크 모드, hover·Tab 포커스, 요소별 넘침)를 Playwright MCP와 Playwright CLI가 모두 했다(3절). 시계 제어(`page.clock`), 페이지 스크립트보다 먼저 도는 초기 스크립트, 인쇄 흉내까지 된다.
- Playwright CLI는 명령마다 같은 Playwright 안의 MCP 도구를 부른다[55]. 할 수 있는 일, 결과, 응답 글자 수가 같다. 응답을 줄이는 차이는 CLI의 `--raw`와 MCP의 `--codegen none`으로 둘 다 없앨 수 있다(3절 "Playwright CLI 비교").
- CLI는 명령마다 프로세스를 새로 띄워 이 WSL에서 명령 하나가 1.0–1.6초 걸렸다. MCP는 같은 동작이 0.01–0.5초다. 같은 과제 전체가 CLI 91초, MCP 31초였다.
- CLI는 파일 경로를 막지 않고, 닫지 않으면 브라우저가 마지막 명령 뒤 1시간 남는다. MCP는 작업 폴더 밖 저장을 막고, 도구 단위로 허용을 나눌 수 있다(5절).
- Chrome DevTools MCP에는 시계 제어와 인쇄 흉내가 없다[43]. 이 WSL에서는 기본 설정으로 브라우저가 뜨지 않았고, 띄운 뒤에도 hover가 걸리지 않았다(3, 4절).
- Aside는 사용자의 실제 브라우저와 저장값을 쓴다. 시계와 초기 스크립트가 없다. 캡처 파일은 Windows 쪽 세션 폴더에만 써진다(3절).
- 손수 짠 CDP 스크립트는 빠르고 대화 맥락도 적게 먹는다. 대신 과제마다 코드를 새로 써야 한다. 시계 제어도 직접 만들어야 한다.
- 이 세션의 설정(`mcp-trial.json`)은 Playwright MCP와 Chrome DevTools MCP 둘 다 브라우저를 찾지 못해 실패했다. 고친 설정은 5절에 있다.

회귀 테스트를 Jenkins에 붙이는 일은 이 질문과 따로 다룬다. 앞선 조사 내용은 7절에 그대로 둔다.

## 2. 비교 조건

- 대상: 운영 https://seung-hwan.com/ . 읽기와 화면 조작만 했다. 로그인과 폼 제출은 하지 않았다.
- Playwright MCP 0.0.83. 안에 든 Playwright는 `1.64.0-alpha-1790635538000`이다[38]. 브라우저는 사용자 캐시에 받은 Chrome for Testing 155.0.8059.12(`chromium-1247`, headless shell 포함)다.
- Playwright CLI 0.1.22(`@playwright/cli`, 2026-09-28 배포, 이날 latest)[53]. 안에 든 Playwright가 MCP 0.0.83과 같은 `1.64.0-alpha-1790635538000`이라 같은 `chromium-1247`을 그대로 썼다. `npx -y @playwright/cli@0.1.22`로 사용자 npx 캐시(`~/.npm/_npx/`)에만 받았다. 저장소의 `package.json`과 `node_modules`는 건드리지 않았다. 명령마다 프로세스를 새로 띄우는 스크립트(scratchpad)로, 작업 폴더를 저장소로 두고 MCP 때와 같은 페이지 함수와 순서로 돌렸다.
- Chrome DevTools MCP 1.12.0[40]. 같은 Chrome for Testing을 `--executablePath`로 넘겼다.
- Aside CLI 1.26.1028.2335, `aside mcp`의 `repl` 도구[50].
- 비교 기준(손수 짠 CDP 스크립트): 저장소와 `.scratch/`에서 찾지 못했다. 이전 작업 기록에 scratchpad의 `cdp-shot.mjs`와 Windows Chrome `--remote-debugging-port=9333`이 적혀 있지만 파일은 남아 있지 않았다. 그래서 라이브러리 없이 WebSocket으로 CDP를 부르는 최소 스크립트를 새로 짜서 썼다(scratchpad, 저장소 밖).
- MCP 서버 두 개는 이 세션의 MCP 설정을 바꿀 수 없어서, 작은 MCP stdio 클라이언트(scratchpad)로 `npx`로 직접 띄워 Claude Code와 같은 방식으로 도구를 불렀다. 클라이언트는 `roots/list`에 저장소 경로를 답한다. Claude Code도 `roots/list`에 실행 폴더를 답한다[45].
- 결과 파일: `.scratch/screen-testing/mcp-output/`. 접두사 `cli-`는 Playwright CLI(자동 스냅숏은 `cli-run/`, MCP `--codegen none` 비교는 `mcp-codegen-run/`), `pw-`는 Playwright MCP, `cdt-`는 Chrome DevTools MCP, `cdp-`는 CDP 스크립트, `pwcdp-`·`cdtbu-`는 CDP 주소로 붙인 경우, `*-log.jsonl`은 호출별 시간과 응답 크기다. Aside 캡처는 그 폴더에 쓸 수 없어 Aside 세션 폴더(`%USERPROFILE%\.aside\u\0\sessions\<세션>\artifacts\`)에 남았다.
- 캡처는 모두 Read로 열어 위치와 잘림을 확인했다.
- 시간은 WSL의 `Date.now()`로 쟀다. 측정 중 시계가 거꾸로 뛴 호출이 두 번 있었다(-2.9초, -1.3초). 개별 숫자는 수 초 오차가 있을 수 있다. Playwright CLI는 단조 시계(`performance.now()`)로 쟀다. 같은 실행에서 `Date.now()` 차이가 단조 시계와 0.2초 넘게 어긋난 호출이 세 번 있었다(`-1.2초`, `-1.1초`, 6초 대기가 5.2초로 잡힘). 이 WSL의 벽시계가 계속 뛴다는 뜻이다. MCP의 개별 숫자도 그만큼 흔들릴 수 있다.

## 3. 과제별 결과

### 됨·안 됨

| 과제 | Playwright MCP | Chrome DevTools MCP | Aside MCP | CDP 스크립트 |
|---|---|---|---|---|
| 뷰포트 1440·390·320 캡처 | 됨. `browser_resize` + `browser_take_screenshot` | 됨. `emulate`의 `viewport` 또는 `resize_page` | 됨. `setViewportSize` + `screenshot` | 됨. `Emulation.setDeviceMetricsOverride` |
| 캡처 위치·잘림 | 맞음. 스크롤바 없음(본문 폭 320) | 맞음. 스크롤바 없음 | 맞음. 스크롤바 15px(본문 폭 305) | 맞음. 스크롤바 15px |
| 타이핑, 실제 시간 | 됨. 6초 동안 49개 기록, 다 지워진 순간 포함 | 됨. 35개 기록 | 됨. 46개 기록. 지우기 간격 중앙값 63ms(코드 50) | 됨. 35개 기록 |
| 타이핑, 시계 제어 | 됨. `browser_run_code_unsafe`에서 `page.clock` | 안 됨. 도구 없음[43] | 안 됨. `page.clock` 없음 | 직접 만들어야 함 |
| 다크 모드 클릭·새로 고침 유지 | 됨 | 됨 | 됨 | 됨 |
| `prefers-color-scheme` 흉내 | 됨. `browser_emulate_media` | 됨. `emulate`의 `colorScheme` | 됨. `emulateMedia` | 됨. `Emulation.setEmulatedMedia` |
| 페이지 스크립트보다 먼저 스크립트 넣기 | 됨. `page.addInitScript`(run_code) 또는 `--init-script` | 됨. `navigate_page`의 `initScript` | 안 됨. `addInitScript` 없음 | 됨. `Page.addScriptToEvaluateOnNewDocument` |
| 인쇄 흉내 | 됨. `browser_emulate_media`의 `media: print` | 안 됨. 도구 없음[43] | 됨. `emulateMedia` | 됨 |
| hover 상태 | 됨. 캡처에 opacity 0.7이 보임 | 기본 설정으로는 안 됨. 고치는 법은 4절 | 캡처에는 보임. 계산값은 0.5초 뒤에도 1 | 안 됨(hover 미디어 없음). Chrome을 띄울 때 `--blink-settings`를 주면 될 것으로 본다(4절, 시험하지 않음) |
| Tab 포커스 | 됨. 8번 모두 `:focus-visible`, 윤곽선 캡처됨 | 됨 | 됨 | 됨 |
| 요소별 넘침(320, 390) | 됨. 넘친 요소 0 | 됨. 0 | 됨. 0 | 됨. 0 |

모든 도구에서 Tab 순서는 같았다: 머리글 5개 → 모드 버튼 → GitHub → sonic8-8.com. 다크 모드 결과도 같았다. 클릭하면 `data-theme`·저장값·배경이 함께 바뀌고 새로 고쳐도 남는다. 저장값 없이 기기 설정이 다크면 어둡다. 인쇄는 흰 배경이다. 초기 스크립트로 저장값을 넣으면 `<body>`가 생기는 순간 이미 `data-theme="dark"`이고 배경도 rgb(10, 10, 10)이었다.

### 걸린 시간

| 과제 | Playwright MCP | Chrome DevTools MCP | Aside MCP | CDP 스크립트 |
|---|---|---|---|---|
| 서버 연결 | 1.0초 | 1.2초 | 이미 연결됨 | 해당 없음 |
| 첫 페이지 열기(브라우저 시작 포함) | 4.7초 | 5.5초 | 2.7초 | 0.7초 |
| 뷰포트 3개 캡처 | 0.2초 | 0.2초 | 약 14초(캡처 한 장 4.4–5.0초) | 0.3초 |
| 넘침 확인 2폭 | 2.1초 | 0.4초 | 0.1초 미만 | 0.1초 미만 |
| 타이핑 6초 측정 | 9.2초 | 4.7초(시계 오차 의심) | 6.0초 | 6.9초 |
| 시계로 네 문장 모두 넘기기 | 1.9초 | — | — | — |
| 다크 모드 전체 | 9.0초 | 5.5초 | 3.0초 | 1.6초 |
| hover·Tab 8번·캡처 | 3.8초 | 5.1초 | 9.4초 | 1.2초 |

- Playwright MCP는 `browser_evaluate` 한 번이 약 0.5초 걸린다. 동작 뒤에 기본 500ms를 기다리는 설정(`--timeout-settle`) 때문이다[37]. 캡처, 크기 바꾸기, 키 입력은 수십 ms다.
- Chrome DevTools MCP의 `new_page`는 첫 실행에서 기본 시간 제한 10초를 넘겨 실패했다. 페이지 1을 `navigate_page`에 `timeout: 60000`을 주고 열면 5초에 됐다.
- Aside 캡처는 한 장에 4–5초다. 다른 도구의 수십 배다.

### 대화 맥락 부담

| 항목 | Playwright MCP | Chrome DevTools MCP | Aside MCP | CDP 스크립트 |
|---|---|---|---|---|
| 도구 정의 | 25개, 20,286자 | 32개, 29,661자 | 4개 | 없음 |
| 동작 하나의 응답 | 80–340자 | 150–300자 | `console.log`로 찍은 만큼 | 찍은 만큼 |
| JS 실행 응답 | 300–1,200자. 실행한 코드를 다시 보여 줘 결과의 약 2배 | 75–220자 | 찍은 만큼 | 찍은 만큼 |
| 접근성 스냅숏 | 1,856자. 동작마다 `.yml` 파일로 따로 저장하고 응답에는 경로만 | 1,067자 | 썼다면 트리 전체 | 없음 |
| 파일로 저장한 캡처 | 약 320자, 이미지 없음 | 약 300자, 이미지 없음 | 찍은 만큼 | 없음 |
| 응답에 바로 붙은 캡처 | 시험하지 않음 | 320×640 PNG 1장(base64 약 21만 자) | `display()`로 볼 때 | 해당 없음 |

- Claude Code는 MCP 도구 정의를 미리 다 싣지 않는다. 처음에는 도구 이름과 서버 안내만 싣고, 정의는 쓸 때 불러온다[45]. 이 세션도 그렇게 동작했다.
- 이미지 비용은 `⌈가로/28⌉ × ⌈세로/28⌉` 토큰이다[48]. 1440×900은 약 1,716, 390×844는 약 434, 320×640은 약 276 토큰이다. 응답에 바로 붙든, 파일로 저장한 뒤 Read로 열든 이미지를 보면 같은 값을 낸다. 파일로 저장하면 "볼지 말지"를 고를 수 있다는 점만 다르다.
- MCP 응답이 10,000토큰을 넘으면 Claude Code가 경고하고, 기본 25,000토큰에서 자른다. 이미지가 없는 50,000자 넘는 응답은 파일로 돌린다[45].

### 결과 파일이 남는 곳

- Playwright MCP: `filename`을 주면 작업 폴더(MCP roots) 기준 경로에 저장한다. 이름을 안 준 파일과 동작마다 자동으로 남는 스냅숏(`page-*.yml`)은 `--output-dir`에 쌓인다[37]. 이번 실행에서 `.yml` 18개가 생겼다.
- Chrome DevTools MCP: `filePath`에 준 절대 경로에 저장했다. 클라이언트가 roots를 주지 않으면 기본으로 OS 임시 폴더만 쓸 수 있다[41]. Claude Code가 이 서버에 roots를 실제로 주는지는 확인하지 않았다.
- Aside: WSL 경로(`\\wsl.localhost\...`)에 쓰면 "Path escapes Project and session roots"로 막혔다. Windows 쪽 세션 폴더의 `./artifacts/`에만 써진다.
- CDP 스크립트: 스크립트가 쓰는 곳.

### 과제별로 드러난 차이

- **시계 제어**: Playwright MCP의 `browser_run_code_unsafe`로 7.6절 첫 예시와 같은 흐름을 돌렸다. 320px에서 `clock.install()` → `goto` → `runFor(50)` 반복으로 1.9초 만에 네 문장을 모두 넘겼다. 97개 기록에 다 지워진 순간이 들어 있었고, `h1` 높이(110.72px)와 링크 줄 위치(607.72px)가 모든 기록에서 같았다. 기록 간격의 중앙값은 100ms(쓰기 간격)였고, 가장 긴 간격(머무름)은 약 2,450ms였다. 실제 시간으로 재면 네 문장을 다 보는 데 약 20초가 걸린다.
- **hover**: Tailwind v4의 `hover:`는 `@media (hover: hover)` 안에서만 걸린다[49]. Chrome DevTools MCP가 띄운 headless Chrome과 손으로 띄운 headless Chrome에서는 `(hover: hover)`가 거짓이라, 마우스를 올려도 opacity가 1로 남았다. Playwright는 headless로 띄울 때 `--blink-settings=primaryHoverType=2,...`와 `--hide-scrollbars`를 붙인다[39]. 그래서 Playwright가 직접 띄운 브라우저에서만 hover가 걸리고 스크롤바가 없다. Playwright MCP라도 `--cdp-endpoint`로 손수 띄운 Chrome에 붙으면 hover가 안 걸리고 스크롤바가 생겼다.
- **Aside hover**: 열린 탭이 사용자의 활성 탭이 아니어서 화면 갱신이 거의 없다. 계산값은 0.5초 뒤에도 1이었지만 캡처에는 흐려진 GitHub가 찍혔다. 캡처가 프레임을 한 번 그리기 때문으로 보인다(추정). 같은 이유로 지우기 간격도 63ms로 늘었다.
- **넘침**: `html, body`의 `overflow-x: hidden` 때문에 `documentElement.scrollWidth`는 늘 뷰포트 폭과 같았다. 요소마다 `getBoundingClientRect()`를 뷰포트 폭과 비교했다. 넘친 요소는 어느 도구에서도 0이었다.
- **스크롤바가 판정을 바꾼다**: 스크롤바가 없는 320px에서 가장 긴 문장("OOP와 TDD에 관심이 많은")의 커서 오른쪽 끝은 303.3px, `h1` 오른쪽 끝은 304px로 0.7px 남았다. 스크롤바 15px가 있는 브라우저에서는 `h1` 오른쪽 끝이 289px로 줄어, 커서가 `h1` 상자를 14px 넘어 오른쪽 여백으로 들어갔다. 화면 밖으로 나가지는 않았다(본문 폭 305px). 휴대폰은 스크롤바가 겹쳐 그려지므로 스크롤바 없는 결과에 가깝다(확인하지 않음). 좁은 데스크톱 창은 스크롤바 있는 결과에 가깝다. 어느 쪽을 볼지에 따라 도구를 고른다.

### Playwright CLI 비교

Playwright CLI는 Microsoft가 "코딩 에이전트에 가장 맞는다"고 내놓은 명령줄 도구다. 이유로 큰 도구 정의와 접근성 트리를 대화 맥락에 싣지 않아 토큰을 아낀다고 든다[52]. 이 주장을 같은 과제로 확인했다.

**구조**: CLI 명령은 같은 Playwright 안의 MCP 도구 이름으로 바뀌어 실행된다. `run-code`는 `browser_run_code_unsafe`, `set-media`는 `browser_emulate_media`다[55]. `open`이 백그라운드 데몬과 브라우저를 띄우고, 이후 명령은 소켓으로 그 데몬에 붙는다[55]. 그래서 할 수 있는 일과 응답 형식이 MCP와 같다. headless 실행 인자도 같아 hover가 걸리고 스크롤바가 없다(3절과 같은 결과).

**과제별 결과** (응답은 도구가 돌려준 글자 수, 토큰은 글자 수 ÷ 3.5로 어림. 시간은 과제 안 호출의 합)

| 과제 | MCP 됨 | MCP 호출·시간·응답 | CLI 됨 | CLI 호출·시간·응답 |
|---|---|---|---|---|
| 브라우저 시작과 첫 페이지 | 됨 | 1번, 4.7초, 236자 | 됨(`open --browser=chromium` + `goto`) | 2번, 6.6초, 494자 |
| 뷰포트 3개 캡처 + 스냅숏 | 됨 | 7번, 0.2초, 3,081자 | 됨 | 7번, 7.4초, 2,994자 |
| 넘침 확인 2폭 | 됨. 넘친 요소 0 | 4번, 2.1초, 2,498자 | 됨. 0 | 4번, 5.3초, 2,480자(`--raw` 한 번 더: 169자) |
| 타이핑 6초 측정 | 됨. 다 지워진 순간 포함 | 5번, 9.2초, 2,369자 | 됨. 66개 기록, 다 지워진 순간 포함, 높이·위치 그대로 | 5번, 13.1초, 2,224자 |
| 시계로 네 문장 넘기기 | 됨. 97개 기록 | 2번, 1.9초, 3,610자 | 됨. 97개 기록, MCP와 같은 값 | 2번, 4.4초, 3,612자 |
| 다크 모드 전체(클릭·유지·`prefers-color-scheme`·인쇄·초기 스크립트) | 됨 | 16번, 9.0초, 5,166자 | 됨. 값이 모두 MCP와 같음 | 17번, 23.6초, 5,216자 |
| hover·Tab 8번·캡처 | 됨 | 22번, 3.8초, 5,648자 | 됨. opacity 0.7, 8번 모두 `:focus-visible` | 23번, 29.5초, 3,034자(포커스 읽기 8번은 `--raw`) |
| 합계 | | 31.1초, 22,608자(약 6,500토큰) | | 91.5초, 20,223자(약 5,800토큰) |

- 캡처 `cli-320.png`, `cli-hover.png`, `cli-focus.png`, `cli-dark-1440.png`를 Read로 열었다. MCP 캡처와 같은 위치에 잘림 없이 찍혔다. hover 캡처에서 GitHub만 흐리고, 포커스 캡처에 sonic8-8.com 윤곽선이 보인다.
- 같은 동작 하나의 응답은 거의 같다. 탐색 236/245자, 크기 바꾸기 90/91자, 파일 캡처 317/321자, 넘침 evaluate 1,159/1,141자, 시계 run_code 3,519/3,520자(MCP/CLI). 스냅숏은 둘 다 응답에 바로 실렸다(1,856/1,754자).
- CLI 합계가 작은 것은 포커스 읽기에 `--raw`를 썼기 때문이다. `--raw`는 상태와 실행 코드를 빼고 값만 낸다[54]. 넘침 evaluate가 1,141자에서 169자로 줄었다. MCP도 `--codegen none`을 주면 실행 코드를 다시 싣지 않는다[37]. 같은 evaluate가 1,159자에서 181자로, Tab 키 응답이 80자에서 0자로 줄었다. 응답 크기 차이는 도구가 아니라 설정 차이다.
- 사용법을 익히는 비용: CLI `--help`는 7,680자, 명령별 `--help <명령>`은 330–955자다. 설치형 스킬 `SKILL.md`는 15,422자다. MCP 도구 정의 25개는 20,286자지만 Claude Code는 쓸 때 불러온다[45].

**시간**: 차이는 프로세스 시작에서 온다. `npx -y @playwright/cli@0.1.22 --version`이 1.0초, 캐시의 실행 파일을 `node`로 바로 부르면 0.27초였다. `eval "1"`은 npx로 1.45–1.66초, `node`로 0.80–0.87초였다(각 5번). 남는 0.5초는 MCP와 같은 동작 뒤 대기(`settle` 500ms)다[55]. 시간은 단조 시계로 쟀다. 에이전트가 명령을 하나씩 낼 때 모델이 답을 만드는 시간은 재지 않았다. 그 시간이 더 크면 이 차이는 작아진다.

**세션 유지**: 둘 다 된다. CLI는 데몬이 브라우저를 들고 있어, 서로 다른 프로세스에서 낸 명령이 같은 페이지를 본다. 한 명령에서 건 MutationObserver 기록기를 다음 명령에서 읽었고, `window.__probe = 42`를 다음 프로세스에서 다시 읽었다. 다크 모드 저장값도 새로 고침 뒤 남았다. 기본 프로필은 메모리에만 있다(`list`: `user-data-dir: <in-memory>`)[52].

**결과 파일**:

- CLI 기본 출력 폴더는 작업 폴더의 `.playwright-cli/`다[55]. 작업자가 저장소에서 돌리면 저장소 맨 위에 생긴다. 이 저장소의 `.gitignore`에는 없다. `install` 명령은 `.gitignore`에 이 줄을 더하고 `.playwright/` 폴더를 만든다[55]. 이번에는 `install`을 돌리지 않고 환경 변수 `PLAYWRIGHT_MCP_OUTPUT_DIR`로 출력 폴더를 `.scratch/screen-testing/mcp-output/cli-run/`으로 돌렸다. 저장소 맨 위에는 아무것도 생기지 않았다.
- `--filename`의 상대 경로는 작업 폴더 기준이다. `.scratch/screen-testing/mcp-output/cli-320.png`가 그 자리에 생겼다.
- 데몬 정보는 `~/.cache/ms-playwright/daemon/<해시>/`에 둔다. 해시는 가장 가까운 상위 `.playwright` 폴더로 정하고, 없으면 패키지 위치로 정한다[55]. 그래서 `.playwright` 폴더가 없으면 같은 npx 캐시를 쓰는 모든 프로젝트가 `default` 세션 하나를 나눠 쓴다. 작업자를 둘 이상 띄우면 세션 이름을 나눠야 한다.

**뒷정리**: `close` 뒤 `list`가 "(no browsers)"를 냈고, 프로세스 목록에도 브라우저와 데몬이 남지 않았다. 데몬 폴더에는 빈 `default.err`만 남았다. 닫지 않으면 headless 브라우저는 명령이 끊긴 뒤 1시간 동안 남는다[52].

**로컬 Docker 미리보기**: 차이는 주소뿐이다. CLI는 `goto http://127.0.0.1:3020/`, MCP는 `browser_navigate`의 `url`에 같은 주소를 준다. 둘 다 WSL 안에서 브라우저를 띄우므로 `npm test`가 붙는 주소와 같다. 컨테이너를 띄워 확인하지는 않았다.

**임의 코드와 파일 접근** (직접 확인)

| 항목 | Playwright CLI | Playwright MCP |
|---|---|---|
| Playwright 코드 실행 | `run-code`. 안은 `browser_run_code_unsafe`와 같은 코드다[55] | `browser_run_code_unsafe`. 공식 설명이 "RCE-equivalent"다[55] |
| 그 코드의 범위 | 스킬 문서는 "`require`, `process`가 없는 격리 환경"이라 적는다[54]. 실제로 `typeof process`는 `undefined`였다. 그러나 Node `vm`은 보안 장치가 아니다[56]. `page.constructor.constructor('return process')()`로 데몬의 `process`와 `require`를 얻었다. 사용자 권한의 임의 코드 실행이다 | 같은 방법으로 서버 프로세스의 `process`와 `require`를 얻었다 |
| 페이지 JS | `eval`. 페이지 안에서만 돈다(`typeof process`가 `undefined`) | `browser_evaluate`. 같다 |
| 파일 저장 경로 | 막지 않는다. CLI 모드에서는 경로 검사를 건너뛴다[55]. 저장소 밖 scratchpad에 캡처가 써졌다 | 작업 폴더(roots)와 `--output-dir` 밖은 "File access denied"로 막혔다 |
| 허용을 나누는 단위 | Bash 허용 패턴 하나. `run-code`만 빼는 규칙은 `--raw`, `-s=` 같은 앞 옵션으로 쉽게 비켜 간다. 인자로 막는 Bash 규칙은 깨지기 쉽다고 공식 문서가 적는다[46] | 도구 이름 단위. `browser_run_code_unsafe`만 빼고 허용할 수 있다[46] |
| 네트워크 호출 | 하루 한 번 npm 레지스트리에 새 버전을 묻는다. `NO_UPDATE_NOTIFIER`로 끈다[55] | 확인하지 않음 |

## 4. 이 WSL에서 띄우는 법

### Playwright MCP

- 이 세션 설정은 `--browser`를 주지 않아 기본값 `chrome` 채널을 찾았다. `/opt/google/chrome/chrome`이 없어 "Chromium distribution 'chrome' is not found"로 실패했다.
- `--browser chromium`을 주면 Playwright가 받은 Chromium을 쓴다. `--browser`의 문서상 값은 chrome, firefox, webkit, msedge지만, 같은 README의 Docker 예시가 `--browser chromium`을 쓴다[37].
- 브라우저는 MCP 안의 Playwright 버전과 맞아야 한다. `npx -y playwright@1.64.0-alpha-1790635538000 install chromium`으로 `~/.cache/ms-playwright/chromium-1247`과 `chromium_headless_shell-1247`을 받았다(약 120MB, `sudo` 없음). 시스템 라이브러리가 모자라지 않았다. 캐시에 있던 옛 `chromium-1208`도 실행됐다.
- `--executable-path`로 특정 브라우저를 줄 수도 있다[37]. 버전이 맞으면 필요 없다.
- `--cdp-endpoint http://127.0.0.1:<포트>`로 이미 떠 있는 Chrome에 붙는 것도 됐다. 다만 3절처럼 hover와 스크롤바가 달라진다.

### Playwright CLI

- MCP와 같은 설정 해석을 쓴다. `--browser`가 없으면 `chrome` 채널을 고른다[55]. 그래서 `open --browser=chromium`으로 띄웠다. `--browser`를 빼고 띄워 실패하는지는 돌려 보지 않았다(소스상 MCP와 같은 기본값).
- `open --help`는 `--browser` 값으로 chrome, firefox, webkit, msedge만 적지만, 데몬 쪽 설명은 chromium을 적는다[55]. `chromium`은 Chrome for Testing 채널로 바뀐다(`list`: `browser-type: chrome-for-testing`).
- `install`(작업 폴더 초기화)과 `install --skills`는 돌리지 않았다. 앞의 것은 `.playwright/`를 만들고 `.gitignore`를 고치며 브라우저를 받을 수 있다. 뒤의 것은 작업 폴더의 `.claude/skills/playwright-cli/`에 스킬을 복사한다[55]. 이 저장소는 공개라 넣지 않는다.

### Chrome DevTools MCP

- `Target closed`의 원인: WSL에 Chrome이 없으면 Puppeteer가 Windows 쪽 `chrome.exe`를 찾아 띄운다[44]. 공식 문서는 WSL에서 "Windows 쪽 Chrome을 띄우려 하지만 지금은 실패한다"고 적는다. `Target closed`는 브라우저를 띄우지 못했다는 뜻이다[42].
- 고치는 법 1: `--executablePath`로 WSL 안의 Chrome for Testing을 준다[41]. Playwright가 받은 `chromium-1247/chrome-linux64/chrome`으로 됐다. 공식 지원 브라우저는 Chrome과 Chrome for Testing이다[40].
- 고치는 법 2: `--browserUrl`로 떠 있는 Chrome에 붙는다[41][42]. 공식 문서의 WSL 안내는 Windows에서 `chrome.exe --remote-debugging-port=9222 --user-data-dir=C:\path\to\dir`을 띄우고 붙으라고 하며, 미러 네트워킹을 전제로 한다[42]. 이번에는 이 세션에서 `chrome.exe` 실행이 권한으로 막혀, WSL 안 Chrome for Testing에 포트를 열어 `--browserUrl`이 동작하는지만 확인했다.
- hover: `--chromeArg=--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4`를 주면 `(hover: hover)`가 참이 되고 opacity 0.7이 걸렸다. 그런데 `emulate`의 `viewport`를 부르면 다시 거짓이 됐다. 뷰포트는 `resize_page`로 바꿔야 한다. `resize_page`로 320px까지 줄었다.
- 사용 통계를 기본으로 보낸다. `--no-usage-statistics`로 끈다[40]. 이 세션 설정에는 없다.
- `@latest`보다 버전을 고정한다. 스킬과 도구 설명이 버전마다 바뀐다고 공식 README가 적는다[40].

### Aside MCP

- 이 세션에서 그대로 연결됐다(`browser_profiles` → 프로필 하나, connected).
- `repl` 호출 사이에 변수가 남는다. CLI의 일회성 `aside repl "..."`과 다르다[50].
- 시작 전 저장값은 `theme = "light"`였다. 끝에 `light`로 되돌리고 확인했다. `emulateMedia`도 되돌렸다.
- `openTab`으로 연 탭은 `closeTab`으로 닫았다. seung-hwan.com 탭 하나가 남아 있는데, 이번에 연 탭인지 원래 있던 탭인지 확인하지 못했다. 손대지 않았다.

### CDP 스크립트

- Node 22의 내장 `WebSocket`과 `fetch`만 쓴다. 브라우저는 `--remote-debugging-port`로 띄워야 한다.
- 이번에는 WSL 안 Chrome for Testing을 `--headless=new --remote-debugging-port=9334`로 띄웠다. Windows `chrome.exe`는 이 세션 권한으로 실행하지 못했다.
- 시계 제어는 CDP의 `Emulation.setVirtualTimePolicy`가 있지만 시험하지 않았다[51].

## 5. 작업자 에이전트에 붙이는 법

### 권장 설정

`--mcp-config`는 실행 인자라 그 실행에만 쓰인다[47]. 저장소의 `.mcp.json`(프로젝트 범위)이나 `~/.claude.json`(로컬·사용자 범위)에 등록하지 않는다[45]. 저장소가 공개이고 브라우저 도구는 작업자에게만 필요하기 때문이다. `--strict-mcp-config`를 함께 주면 다른 곳에 등록된 MCP 서버를 읽지 않는다[47].

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@0.0.83", "--headless", "--isolated", "--browser", "chromium", "--codegen", "none",
               "--output-dir", "<저장소>/.scratch/screen-testing/mcp-output"]
    }
  }
}
```

`<저장소>`는 저장소의 절대 경로로 바꾼다.

```sh
claude --strict-mcp-config --mcp-config <위 JSON 파일> --allowedTools "mcp__playwright__*"
```

- `--codegen none`: 응답에 실행한 Playwright 코드를 다시 싣지 않는다[37]. evaluate 응답이 1,159자에서 181자로 줄었다(3절 "Playwright CLI 비교"). 세 호출로만 확인했고, 다섯 과제 전체를 이 설정으로 다시 돌리지는 않았다.
- `mcp__playwright__*`는 그 서버의 모든 도구를 묻지 않고 실행하게 한다[46][47].
- 여기에는 `browser_run_code_unsafe`가 들어 있다. 공식 설명이 "RCE-equivalent"(MCP 서버 프로세스에서 임의 코드를 실행)라고 적는다. 시계 제어와 페이지별 초기 스크립트에 필요하다. 빼려면 허용 목록에 도구 이름을 하나씩 적고, 초기 스크립트는 `--init-script <파일>`로 서버 시작 때 넣는다[37].
- `--isolated`: 프로필을 메모리에만 둔다. 저장값이 실행 사이에 남지 않아 되돌릴 일이 없다[37].
- 캡처는 `filename`을 주고 찍게 한다. 응답에 이미지가 붙지 않고 경로만 온다. 볼 때만 Read로 연다.
- `browser_evaluate`로 값을 읽은 뒤 판정한다. hover 직후 바로 읽으면 전환 중간값(0.99)이 나왔다. 0.15초 전환이 끝난 뒤 읽는다.
- 브라우저가 없으면 먼저 `npx -y playwright@1.64.0-alpha-1790635538000 install chromium`을 한 번 돌린다. MCP 버전을 올리면 그 안의 Playwright 버전도 확인한다.
- 수정한 화면을 볼 때는 AGENTS.md의 Docker 순서로 미리보기를 띄우고 `http://127.0.0.1:3020/`을 연다. 소스를 고치면 이미지를 다시 만들고 컨테이너를 다시 띄운다. 운영 주소는 배포 뒤 확인에만 쓴다.

### MCP를 붙일 수 없을 때 (Playwright CLI)

이미 떠 있는 세션은 MCP 설정을 바꿀 수 없다(이 세션이 그랬다, 2절). 그때는 Bash만 있으면 되는 Playwright CLI를 쓴다. 엔진과 결과는 MCP와 같다(3절).

```sh
cd <저장소>
PLAYWRIGHT_CLI_SESSION=<작업자 이름> \
PLAYWRIGHT_MCP_OUTPUT_DIR=<저장소>/.scratch/screen-testing/mcp-output \
NO_UPDATE_NOTIFIER=1 \
claude --allowedTools "Bash(npx -y @playwright/cli@0.1.22 *)"
```

작업자가 내는 명령:

```sh
npx -y @playwright/cli@0.1.22 open --browser=chromium http://127.0.0.1:3020/
npx -y @playwright/cli@0.1.22 resize 320 640
npx -y @playwright/cli@0.1.22 screenshot --filename=.scratch/screen-testing/mcp-output/<이름>.png
npx -y @playwright/cli@0.1.22 --raw eval "() => getComputedStyle(document.body).backgroundColor"
npx -y @playwright/cli@0.1.22 run-code "async (page) => { await page.clock.install(); await page.goto('http://127.0.0.1:3020/'); }"
npx -y @playwright/cli@0.1.22 close
```

- 환경 변수는 `claude`를 띄울 때 준다. 명령 앞에 `X=1 npx ...`로 붙이면 허용 규칙에 맞지 않는다. Claude Code는 알려진 몇 변수만 떼고 비교한다[46]. 세션 이름은 README가 같은 방식(`PLAYWRIGHT_CLI_SESSION=... claude`)을 적는다[52]. 출력 폴더 변수가 Claude Code의 Bash를 거쳐 데몬까지 가는지는 작업자로 확인하지 않았다. 직접 띄운 프로세스에서는 갔다.
- 세션 이름을 작업자마다 다르게 준다. `.playwright` 폴더가 없으면 모든 프로젝트가 `default` 세션 하나를 나눠 쓴다(3절).
- 끝에 반드시 `close`를 낸다. 안 내면 headless 브라우저가 1시간 남는다[52]. 남았는지는 `list`로 본다. 이상하면 `close-all`, 그래도 남으면 `kill-all`이다.
- 기다릴 때는 `run-code "async (page) => { await page.waitForTimeout(<ms>); }"`를 쓴다. CLI에는 MCP `browser_wait_for` 같은 대기 명령이 없다(`--help`에 없음).
- 값을 읽을 때는 `--raw`를 붙인다. 응답이 값만 남아 7분의 1로 준다(3절).
- 명령 하나에 1.0–1.6초가 든다. 여러 명령을 `&&`로 이어 한 번에 낼 수 있다. 이어 붙인 명령이 모두 허용 패턴에 맞을 때만 묻지 않고 돈다[46].

이 허용 패턴이 실제로 허락하는 것:

- 정확히 `npx -y @playwright/cli@0.1.22 `로 시작하는 명령만 맞는다. `@latest`, `-y` 없는 형태, `npx playwright cli`는 다시 묻는다. 버전이 고정된다.
- 그 안의 `run-code`는 사용자 권한의 임의 코드 실행이다. `vm`을 빠져나와 `process`와 `require`를 얻는 것을 확인했다(3절). MCP의 `browser_run_code_unsafe`와 같다.
- `screenshot`, `pdf`, `state-save`의 `--filename`은 어느 경로에나 쓴다. MCP는 작업 폴더 밖을 막는다(3절).
- `run-code`만 빼는 규칙은 믿기 어렵다. 앞에 `--raw`나 `-s=`가 오면 비켜 간다. 인자로 막는 Bash 규칙은 깨지기 쉽다고 공식 문서가 적는다[46]. 임의 코드를 빼야 하면 MCP를 도구 이름 단위로 허용한다.
- `Bash(npx *)`나 스킬이 적는 `Bash(npx playwright:*)`는 쓰지 않는다. `npx`는 Claude Code가 떼어 내는 감싸기 명령이 아니라서, 그 뒤의 아무 패키지나 허락하게 된다[46][54]. 스킬의 `allowed-tools`는 스킬을 부른 차례 동안 묻지 않고 허용한다[57]. 그래서 `install --skills`로 저장소에 스킬을 넣지 않는다.
- 전역 설치(`npm install -g @playwright/cli@0.1.22`)를 하면 `playwright-cli`로 부를 수 있고 명령마다 0.7초쯤 준다(`node`로 바로 부른 값으로 어림). 이번에는 사용자 캐시 밖에 설치하지 않아 시험하지 않았다.

### 사용자의 실제 브라우저로 볼 때 (Aside)

```json
{ "mcpServers": { "aside": { "command": "/mnt/c/Users/YOU/AppData/Local/Aside/CLI/current/aside.exe", "args": ["mcp"] } } }
```

`--allowedTools "mcp__aside__repl"`. `exec`(Aside 안의 에이전트에 일을 맡김)는 화면 확인에 필요 없어 허용하지 않는다. 사용자의 로그인 상태와 저장값을 쓰므로, 시작할 때 `theme` 값을 기록하고 끝에 되돌리게 한다.

### Chrome DevTools MCP를 쓸 때

성능 기록, 네트워크, Lighthouse가 필요할 때만 붙인다. 이번 과제에는 필요 없었다.

```json
{ "mcpServers": { "chrome-devtools": { "command": "npx", "args": ["-y", "chrome-devtools-mcp@1.12.0", "--headless", "--isolated", "--no-usage-statistics",
  "--executablePath", "<홈>/.cache/ms-playwright/chromium-1247/chrome-linux64/chrome",
  "--chromeArg=--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4"] } } }
```

`<홈>`은 홈 폴더의 절대 경로로 바꾼다(JSON 안에서는 `~`가 풀리지 않는다). `--allowedTools "mcp__chrome-devtools__*"`. 뷰포트는 `resize_page`로 바꾸고, 첫 탐색은 `navigate_page`에 긴 `timeout`을 준다.

## 6. 반례·대안, 확인하지 못한 것

### 결론을 흔들 수 있는 반례와 대안

- **실제 화면과 다르다**: Playwright headless는 스크롤바를 숨기고 hover를 켠 채 Linux 서체 렌더링으로 그린다. 사용자가 보는 Windows Chrome과 다르다. 스크롤바 15px 차이로 320px 판정이 바뀌는 것을 3절에서 봤다. 최종 확인이 "사용자 화면에서 어떻게 보이는가"라면 Aside나 Windows Chrome이 맞다.
- **손수 짠 CDP 스크립트가 더 나을 수 있다**: 과제마다 1–2초로 가장 빠르고, 대화에는 찍은 값만 들어온다. 오케스트레이터가 한 번 짜 두고 반복해 쓰는 확인이라면 MCP보다 낫다. 다만 시계, hover 설정, 탐색 대기를 직접 만들어야 한다. 이 부분은 Playwright가 이미 한다.
- **Playwright 라이브러리를 scratchpad 스크립트로 직접 쓰기**: MCP 없이 `npx` 캐시의 `playwright-core`를 불러 같은 일을 했다(브라우저 시작과 첫 페이지 3.9초). 반복 측정은 MCP 호출보다 빠르고 맥락을 덜 먹는다. 에이전트가 화면을 보며 한 단계씩 조작할 때는 MCP가 편하다.
- **Chrome DevTools MCP**: Google 공식이고 DevTools 기능(성능 기록, 네트워크, 콘솔)이 많다. 화면 다듬기에는 시계와 인쇄가 없는 점이 크다.
- **Playwright CLI를 기본으로 두기**: 공식 README는 코딩 에이전트에 CLI를 권한다[52]. MCP 설정·재시작 없이 Bash만으로 붙고, 명령을 `&&`로 묶어 한 차례에 여러 동작을 낼 수 있다. 에이전트의 차례 수가 시간을 좌우한다면 CLI가 더 빠를 수 있다(차례당 모델 시간은 재지 않음). 그래도 기본으로 두지 않은 이유는 셋이다. 이 WSL에서 명령당 시간이 MCP의 3–100배, 같은 과제 전체로 약 3배였다. 응답 크기 이점은 MCP `--codegen none`으로 같아졌다. 파일 경로 제한과 도구 단위 허용이 없고, 닫지 않으면 브라우저가 남는다. 작업자를 Bash만으로 붙여야 하거나 차례 수가 문제가 되면 CLI로 바꾼다.
- **표본**: 페이지 하나, 도구별로 각 과제를 한두 번 돌렸다. 시간 수치는 이 WSL과 이날 네트워크 기준이다.

### 확인하지 못한 것

- Windows `chrome.exe --headless=new --remote-debugging-port=9333`에 WSL에서 붙는 것. 이 세션에서 `chrome.exe` 실행이 권한으로 막혔다. `--cdp-endpoint`·`--browserUrl`은 WSL 안 Chrome으로만 확인했다.
- 이 세션의 `mcp-trial.json` 설정 자체를 고쳐 Claude Code가 띄운 서버로 돌리는 것. 같은 인자를 직접 띄운 서버로 확인했다.
- Claude Code가 Chrome DevTools MCP에 roots를 주어 저장소에 캡처를 쓸 수 있는지.
- Playwright MCP의 응답에 바로 붙는 캡처(파일 이름 없이 찍기)의 크기.
- Playwright MCP `--mobile`·`--device`로 휴대폰처럼 돌렸을 때의 스크롤바와 hover.
- CDP `Emulation.setVirtualTimePolicy`로 타이핑을 멈추는 것.
- Aside에서 남은 seung-hwan.com 탭이 이번에 연 것인지.
- 작업자 에이전트를 실제로 위 인자로 띄워 본 것. Playwright CLI도 Claude Code의 Bash와 허용 패턴을 거쳐 돌려 보지 않았다. 직접 띄운 프로세스로 같은 명령을 냈다.
- Playwright MCP `--codegen none`으로 다섯 과제 전체를 다시 돌린 것(세 호출만 쟀다).
- Playwright CLI를 `--browser` 없이 띄웠을 때 실패하는지, 이미지 파일 이름 없이 찍은 캡처가 어디에 어떻게 나오는지, `--mobile`·`--device`.
- Playwright CLI 전역 설치(`npm install -g`)와 그때의 명령당 시간.
- 로컬 Docker 미리보기(`http://127.0.0.1:3020`)를 두 도구로 실제로 연 것. 명령 차이만 확인했다.

## 7. 나중에 Jenkins 테스트를 붙일 때 참고

아래는 2026-10-29에 "어떤 화면 테스트 러너를 쓰는가"로 조사한 내용이다. 지금 질문(에이전트의 화면 다듬기 도구)과 다르다. 회귀 테스트를 Jenkins에 붙이기로 할 때 참고한다. 7.4절의 Aside 결과는 그날 CLI로 잰 것이다.

### 7.1 당시 질문과 결론

**질문**: seung-hwan.com은 어떤 브라우저 화면 테스트 도구를 쓰면 되는가. 처음 시도할 최소 구성은 무엇인가.

**결론**: Playwright Test 하나를 Chromium 한 프로젝트로 시작한다. 공식 Docker 이미지 안에서, 이미 쓰는 앱 컨테이너(`seung-hwan`)를 대상으로 돌린다. 접근성 검사가 필요해지면 `@axe-core/playwright`를 더한다. 지금 있는 `node --test` HTML 테스트는 그대로 둔다.

이유:

- 확인할 항목 대부분을 한 도구의 내장 API로 다룬다. 타이핑은 `page.clock`[3], 다크 모드와 인쇄는 `emulateMedia`·`addInitScript`[6], 반응형은 뷰포트, 시각 비교는 `toHaveScreenshot`[1][2], 키보드·hover는 입력 API로 한다. Puppeteer, Cypress, Selenium에는 스크린샷 비교나 시계 제어 중 하나 이상이 없다(7.2절).
- 로컬 `next dev`/`next build`가 이 WSL에서 돌지 않는 제약과 맞는다. 테스트가 빌드된 컨테이너에 HTTP로 붙기만 하면 된다. 공식 이미지에 브라우저와 시스템 의존성이 들어 있다[4].
- 스크린샷은 기준 이미지를 만든 환경에서만 맞는다[1]. 버전을 고정한 Docker 이미지 하나로 로컬과 CI를 같게 만들 수 있다[4].
- Next.js 공식 문서가 Playwright 설정 안내를 두고, 운영 빌드를 대상으로 돌리라고 권한다[12].
- 외부 시각 회귀 서비스는 필요 없다. 페이지 수가 적고 검토자가 한 명이다. 서비스는 월 무료 한도가 있고, 그중 하나(Lost Pixel)는 저장소가 보관 처리됐다(7.2절).

Aside는 사람이 한 번 확인하는 도구로 쓴다. 반복 실행과 판정 자동화는 테스트 러너가 맡는다(7.4절).

### 7.2 도구별 정리

| 도구 | 무엇인가 | 이 프로젝트에서 좋은 점 | 이 프로젝트에서 걸리는 점 |
|---|---|---|---|
| Playwright Test 1.64.1 | Microsoft의 브라우저 테스트 러너. Chromium·Firefox·WebKit[12] | `toHaveScreenshot`(두 번 연속 같은 화면이 나올 때까지 기다린 뒤 비교, 기본으로 CSS 애니메이션 정지·캐럿 숨김)[2], `page.clock`(setTimeout·rAF·Date 대체)[3], `emulateMedia`(colorScheme, reducedMotion, print)[6], 공식 Docker 이미지와 Jenkins 예시[4][5], trace viewer | 패키지 하나와 브라우저 이미지가 는다. 스크린샷은 OS·폰트·headless 여부에 따라 달라 플랫폼별 기준 이미지가 생긴다[1] |
| Puppeteer | Chrome·Firefox를 조작하는 라이브러리. CDP와 WebDriver BiDi 사용[13] | 설치 시 Chrome for Testing을 받는다[14]. `puppeteer-core`는 브라우저를 받지 않는다[14] | 테스트 러너, 스크린샷 비교, 시계 제어가 없다. `node --test`에 붙이면 비교·대기 코드를 직접 써야 한다 |
| Chrome for Testing | 자동 업데이트가 없는 테스트용 Chrome 빌드. 버전마다 내려받을 수 있다[15] | Playwright는 1.57부터 Chromium 대신 이 빌드를 쓴다[7]. Puppeteer도 기본으로 받는다[14]. 따로 고를 필요가 없다 | 독립 도구가 아니라 브라우저 바이너리다 |
| Cypress | 브라우저 안에서 도는 E2E 러너 | 익숙한 사람이 많다 | 이미지 비교를 하지 않는다. 플러그인이나 상용 서비스가 필요하다[16] |
| Selenium / WebDriver / WebDriver BiDi | W3C 표준 프로토콜과 그 구현 | BiDi는 표준이다. 2026-10-08 Working Draft[17]. Selenium은 BiDi로 옮기는 중이다[18] | 러너·비교·시계가 기본 제공이 아니다. 단일 브라우저·단일 언어 사이트에는 이점이 작다 |
| Aside | 사용자의 브라우저를 Playwright 비슷한 API로 조작하는 AI 브라우저 CLI | 운영 사이트를 실제 브라우저로 바로 본다. 7.4절 참고 | `page.clock`, `addInitScript`가 없다. 30초 CDP 제한. 사용자 프로필을 쓴다. CI에서 돌지 않는다 |
| Percy | BrowserStack의 시각 테스트 서비스 | Playwright 테스트에서 쓸 수 있다. 월 5,000장 무료[19] | 외부 계정·토큰. 검토 UI가 이 규모에는 과하다 |
| Chromatic | Storybook 팀의 서비스 | 월 5,000 스냅샷 무료, 유료 월 $179부터[20] | 주 대상이 Storybook이다 |
| Applitools Eyes | 상용 Visual AI 비교 | 폰트 안티앨리어싱 같은 차이를 무시한다고 한다(업체 주장)[21] | 상시 무료 요금제를 확인하지 못했다[21] |
| Argos | 시각 회귀 서비스 | 월 5,000장 무료, Pro 월 $100[22] | 외부 서비스 |
| Lost Pixel | 오픈소스 시각 회귀 도구와 플랫폼 | 페이지 모드가 Next.js 예시를 든다 | 저장소가 보관(archived) 상태이고 제품을 접는다고 공지했다[23][24] |
| reg-suit | 스크린샷 폴더를 비교·보고하는 오픈소스 | 최근 릴리스 v0.14.6(2026-03-16)[25] | 캡처는 다른 도구가 한다. 저장소(S3 등)와 알림 플러그인 구성이 필요하다 |
| BackstopJS | 설정 파일 기반 시각 회귀 도구 | npm 최신 6.3.25[26] | GitHub 릴리스 목록은 2020년에서 멈춰 있다[27]. 시계 제어가 없다 |
| Storybook 테스트 | 스토리를 테스트 케이스로 쓰는 방식(Vitest 애드온, 접근성 애드온, Chromatic) | — | 스토리가 있어야 한다[28]. 이 사이트에는 Storybook이 없고, 홈은 컴포넌트보다 페이지 단위로 확인한다. 해당하지 않는다 |
| axe-core / @axe-core/playwright 4.14.0 | 자동 접근성 검사 엔진과 Playwright 연결 | Playwright 공식 문서가 예시를 둔다[8]. WCAG 2.0–2.2 지원[9] | 자동 검사는 WCAG 문제를 평균 57%만 찾는다[9]. 나머지는 수동 확인이다[8] |

### 7.3 테크 기업 사례와 설문

#### 사례 (1차 출처)

| 기업 | 날짜 | 내용 |
|---|---|---|
| 우아한형제들 | 2024-04-16 | 디자인 시스템 115개 컴포넌트에 시각 회귀 테스트를 적용했다. Playwright `toHaveScreenShot()`, Storybook을 테스트베드로, Microsoft Artifact Registry의 Playwright Docker 이미지를 GitLab CI에서 썼다. 빈 화면 캡처는 MutationObserver로 DOM이 멈출 때까지 기다려 풀었다. 자동 슬라이드 배너의 `setTimeout`이 실행마다 다른 스크린샷을 만들어, 테스트 중에는 `setTimeout`을 막았다[29] |
| 토스페이먼츠 | SLASH24(날짜 표기 없음) | "Playwright로 구축한" 테스트 자동화 플랫폼. 하루 45만 개 테스트[30]. 테스트 종류는 세션 소개에 없다 |
| LY Corporation | 2024-10 조사 | 그룹 프런트엔드 엔지니어 342명 설문. 주로 쓰는 테스트 도구 응답: Jest 256, Vitest 123, Playwright 121, Cypress 54, Puppeteer 50[31] |
| GitHub(Primer React) | 저장소 문서(현재판) | Playwright로 컴포넌트 시각 회귀와 axe 접근성 검사를 돌린다. 스냅샷 갱신은 CI와 같은 Docker로 하라고 권한다[32] |
| Canva | 2022-03-03 | 브라우저 테스트 1,000개 이상을 CodeceptJS+Playwright로 옮겼다. CI WebKit 실행 시간이 절반이 됐다[33] |

카카오, 네이버, LINE(옛 엔지니어링 블로그)에서는 도구 이름을 밝힌 화면 테스트 글을 찾지 못했다. 우아한형제들의 사례는 이 사이트와 가장 가깝다. 타이머로 움직이는 화면을 시간 제어 없이 찍으면 결과가 흔들린다는 점이 같다.

#### 설문과 다운로드 수

- State of JS 2025(테스트 분야 응답 10,820명): 만족도 Playwright 94%, Puppeteer 70%, Storybook 69%, Cypress 57%, Selenium 24%. Playwright 사용률은 전년보다 14%p 올랐다[10][11]. 2차 글들은 Playwright 91%, Cypress 72%라고 옮기는데[34], 공식 페이지의 숫자와 다르다. 이 문서는 공식 숫자를 쓴다.
- npm 공식 API, 2026-09-28~2026-10-27 내려받기 수[35]:

| 패키지 | 내려받기 |
|---|---|
| playwright-core | 489,498,455 |
| playwright | 442,112,986 |
| axe-core | 311,038,245 |
| @playwright/test | 295,365,032 |
| puppeteer-core | 91,312,914 |
| @axe-core/playwright | 56,606,634 |
| puppeteer | 45,010,758 |
| chromatic | 32,108,239 |
| cypress | 23,147,929 |
| webdriverio | 10,011,681 |
| @storybook/test-runner | 8,891,306 |
| selenium-webdriver | 6,760,438 |
| @percy/cli | 1,910,608 |
| @argos-ci/playwright | 890,389 |
| reg-suit | 518,247 |
| backstopjs | 361,569 |
| @applitools/eyes-playwright | 199,262 |
| lost-pixel | 136,324 |

내려받기 수는 CI 반복 설치와 다른 패키지가 끌어오는 의존성을 포함한다. `playwright-core`와 `axe-core`는 다른 도구가 의존성으로 많이 받는다. 사용자 수가 아니라 추세로만 읽는다.

### 7.4 Aside 직접 사용 결과 (2026-10-29, CLI)

Aside CLI 1.26.1028.2335로 https://seung-hwan.com/ 을 열어 `aside repl "<JS>"`로 조작했다. 쓰기와 로그인은 하지 않았다. 다크 모드 버튼을 누르면 브라우저의 localStorage가 바뀌므로, 끝에 처음 값(`light`)으로 되돌렸다.

#### 된 것

| 확인 | 방법 | 결과 |
|---|---|---|
| 타이핑 시간 | 페이지 안에 MutationObserver 기록기를 걸고 `sleep(9000)` 뒤 읽음 | 머무름 약 2,480ms(코드 2,400), 지우기 간격 약 63ms(코드 50), 쓰기 간격 약 110ms(코드 100). 9초 동안 `h1` 높이 166.125px, 아래 링크 줄 위치 379px로 그대로 |
| 레이아웃 흔들림 | `PerformanceObserver('layout-shift')` | 약 1초마다 값 0.000002–0.000025의 항목이 잡혔다. 원인은 확인하지 않았다(커서 이동으로 추정). CLS로 판정하려면 문턱값이 필요하고, 요소 위치로 재는 편이 명확하다 |
| 다크 모드 | 버튼 클릭, 새로 고침, `emulateMedia` | 클릭으로 `data-theme`·localStorage·배경색(rgb(10,10,10))이 함께 바뀌고 새로 고쳐도 유지됐다. 저장값이 없고 `colorScheme: 'dark'`이면 어둡게, `media: 'print'`이면 저장값과 관계없이 흰 배경 |
| 동작 줄이기 | `emulateMedia({reducedMotion: 'reduce'})` 후 새로 고침 | 첫 문장이 다 쓰인 채 멈추고 커서가 `display: none`. 스크린샷을 고정하는 데 쓸 수 있다 |
| Tab 순서 | `keyboard.press('Tab')` 10번, `:focus-visible`과 outline 읽기 | 머리글 5개 → 모드 버튼 → GitHub → sonic8-8.com 순서. 모두 `:focus-visible`이고 2px solid 윤곽선 |
| 뷰포트 | `setViewportSize` 320–1600 | 1280/1440/1600에서 인사말 폭 432px, 사진과 인사말 위치가 가운데 정렬로 같은 간격 이동. 버튼은 lg 이상에서 44px |
| 스크린샷 | 뷰포트, `clip`, 요소, `fullPage` | 스크롤하지 않은 상태에서는 넷 다 됐다(1.7–3.6초). 홈은 짧아 전체 스크린샷도 시간 초과가 나지 않았다 |
| `page.pdf` | A4 | 0.3초, 341KB 파일. 내용은 열어 보지 못했다(PDF 렌더러 없음) |

#### 안 된 것과 알려진 한계 재현

| 한계 | 재현 | 우회 |
|---|---|---|
| evaluate 한 번이 30초를 넘으면 시간 초과 | 재현. 35초 Promise가 30,010ms에 `CDP command timeout: Runtime.callFunctionOn` | 페이지 안에 기록기를 걸고 바깥에서 `sleep`(40초도 됨) 뒤 짧은 evaluate로 읽는다. 한 번의 repl 호출 전체는 120초 제한 |
| `clip`이 엉뚱한 곳을 찍음 | 일부 재현. 390×600에서 스크롤한 뒤 `clip`이 30초 시간 초과로 실패했고, 그 뒤 뷰포트가 390×120으로 남았다. 같은 조건의 다른 `clip`은 성공했다. `clip` 좌표는 문서가 아니라 현재 화면(뷰포트) 기준으로 동작했다 | `clip` 대신 `locator.scrollIntoViewIfNeeded()` 뒤 `locator.screenshot()`. 실패하면 `setViewportSize`로 크기를 되돌린다 |
| 요소 스크린샷 | Playwright와 달리 화면 밖 요소를 자동으로 스크롤하지 않는다. "element is not visible in the viewport" | 위와 같이 먼저 스크롤 |
| hover 상태가 안 보임 | `:hover`는 바로 걸렸지만 240ms 동안 opacity가 1로 남았다. 0.5초 뒤 다시 읽으니 0.7 | 열린 탭이 사용자의 활성 탭이 아니어서 화면 갱신이 거의 없었다(1.2초 동안 requestAnimationFrame 1번). 전환은 프레임이 돌아야 진행된다. 충분히 기다린 뒤 읽는다. `bringToFront`는 사용자 화면을 바꿔서 시험하지 않았다 |
| `fs` | `await fs.mkdir('./artifacts', {recursive: true})` 뒤 `await fs.writeFile`로 됐다. 작업 폴더가 repl 호출마다 새 세션 폴더로 바뀐다 | 같은 호출 안에서 만들고 저장하고 확인한다 |
| 없는 API | `page.clock`, `page.addInitScript`, `page.route`, `page.context`가 `undefined` | 시간 고정, 첫 그림 전 상태 주입은 Aside로 할 수 없다. 저장값을 바꾼 뒤 새로 고치는 것까지만 된다 |
| 탭 닫기 | `attachBrowserTab`로 붙인 탭에 `closeTab`을 부르면 세션에서만 떨어지고 브라우저 탭은 남았다 | 사용자가 직접 닫는다 |

#### 테스트 러너와 다른 점

- **반복 실행**: Aside 호출은 매번 새 REPL이다. 변수는 남지 않고 탭만 남는다. 실행마다 같은 조건을 만드는 장치(시계, 초기 스크립트, 새 브라우저 컨텍스트)가 없다.
- **환경**: 사용자의 실제 브라우저 프로필과 창을 쓴다. 저장값, 확장, 창 크기, 스크롤바(320px 뷰포트에서 본문 폭이 스크롤바 15px만큼 줄었다), 활성 탭 여부가 결과에 섞인다.
- **CI**: Jenkins에서 돌릴 수 없다. 사용자 브라우저가 떠 있어야 한다.
- **판정**: 값을 읽어 사람이 판단한다. 기대값, 재시도, 기준 이미지, 보고서가 없다.

정리하면 Aside는 "운영 사이트가 지금 이렇게 동작한다"를 한 번 확인하거나, 테스트에 넣을 기대값을 미리 재 보는 데 맞다. 회귀를 막는 일은 테스트 러너가 한다.

### 7.5 이 프로젝트에서의 선택

#### 확인 항목과 API

| 확인 항목 | 도구·API | 구현에 맞춘 주의점 |
|---|---|---|
| 타이핑 시간·순서 | Playwright `page.clock.install()` → `goto` → `pauseAt` → `runFor`[3] | `app/typing-line.tsx`는 `setTimeout`으로 돈다. `toHaveScreenshot`의 `animations: 'disabled'`는 CSS 애니메이션·전환만 멈추므로[2] 이 줄은 멈추지 않는다. 시계로 멈추거나 동작 줄이기를 켠다 |
| 커서 | 시계를 멈춘 상태의 스크린샷, 또는 커서 요소의 크기·위치 | 동작 줄이기를 켜면 커서가 `motion-reduce:hidden`으로 사라진다. 커서를 확인하는 테스트에서는 동작 줄이기를 쓰지 않는다 |
| 레이아웃 흔들림 없음 | 글자가 바뀔 때마다 MutationObserver로 `h1` 높이와 아래 링크 줄 `top`을 기록하고, 시계로 다음 문장까지 넘긴 뒤 모든 기록을 비교(7.6절) | 커서가 줄 높이를 받쳐 다 지워져도 높이가 남는 설계다. 다 지워진 순간을 기록했는지 확인하고, 그 순간에도 값이 그대로인지 본다. CLS 값은 작은 항목이 잡혀(7.4절) 판정에 쓰기 애매하다 |
| 다크 모드 전환·유지 | 버튼 클릭 → `data-theme`, localStorage, `toHaveCSS('background-color')` → `reload` | 각 테스트는 새 브라우저 컨텍스트라 저장값이 섞이지 않는다 |
| 깜빡임 없음 | `addInitScript`로 저장값을 넣고, 같은 초기 스크립트의 MutationObserver가 `<body>`가 생기는 순간의 `data-theme`를 기록[6] | `app/layout.tsx`의 `<head>` 동기 스크립트가 본문보다 먼저 도는지를 직접 본다. 스크린샷으로 첫 프레임을 잡는 것보다 확실하다 |
| 기기 설정 기본 | `emulateMedia({ colorScheme: 'dark' })`, 저장값 없음[6] | `globals.css`의 `:root:not([data-theme="light"])` 규칙 |
| 인쇄는 라이트 | `emulateMedia({ media: 'print' })` 뒤 배경색. 필요하면 `page.pdf()`[6] | 다크 규칙이 `@media screen` 안에만 있다. 포트폴리오 PDF는 지금 `scripts/portfolio-pdf.sh`가 Windows Chrome으로 만든다 |
| 320/390 가로 스크롤 없음 | 뷰포트 320·390에서 요소 오른쪽 끝, 또는 `whitespace-nowrap` 줄의 `scrollWidth` | `globals.css`가 `html, body`에 `overflow-x: hidden`을 건다. 그래서 `documentElement.scrollWidth`는 넘쳐도 뷰포트와 같게 나온다. 넘침이 잘려 보이는지를 요소 단위로 재야 한다. 스크롤바 폭이 본문 폭을 줄일 수 있다(7.4절, 3절). 모바일 기기 설정(`isMobile`)으로 돌리는 편이 실제 휴대폰과 가깝다(확인하지 않음) |
| 1280/1440/1600 배치 같음 | 폭마다 `h1`·사진·버튼의 위치와 크기, 또는 폭별 `toHaveScreenshot` | Aside 측정에서 인사말 432px, 사진은 인사말 왼쪽 + 456px로 같았다 |
| hover | `locator.hover()` 뒤 `toHaveCSS('opacity', '0.7')` | Tailwind 전환 0.15s. `toHaveCSS`는 기대값이 될 때까지 재시도하므로 전환 중간값에 걸리지 않는다. Tailwind v4 `hover:`는 `(hover: hover)` 미디어 안에서만 걸린다[49]. Playwright가 직접 띄운 headless 브라우저는 이 값이 참이다(3절) |
| focus-visible | `keyboard.press('Tab')` 뒤 `toBeFocused()`, outline 스타일 | 링크는 `globals.css`, 버튼은 Tailwind `focus-visible:` 클래스로 같은 윤곽선 |
| 키보드 순서 | Tab을 차례로 눌러 `document.activeElement` 이름 목록 비교 | 기대 순서는 7.4절 측정값 |
| 시안과 시각 비교 | 사람이 한 번 비교한다. 승인한 실제 화면을 `toHaveScreenshot` 기준 이미지로 고정한다 | 시안은 브라우저가 그린 이미지가 아니라 픽셀 비교 기준으로 쓰기 어렵다. 회귀 방지는 "승인한 렌더링"과의 비교로 한다 |
| 접근성 | `@axe-core/playwright`의 `AxeBuilder`[8] | 자동 검사로 잡히는 것은 일부다[9]. sr-only 문장, 라이브 영역 없음 같은 기존 HTML 테스트는 그대로 둔다 |

#### WSL, Docker, Jenkins 제약

- **로컬(WSL)**: 브라우저 테스트도 Docker로 한다. 앱 이미지를 띄우고, 같은 Docker 네트워크에서 Playwright 공식 이미지를 실행한다. 컨테이너끼리 통신하므로 WSL의 loopback 문제를 거치지 않는다. 이미지 태그는 `@playwright/test` 버전과 같게 고정한다[4].
- **Windows Chrome에 CDP로 붙기**: `connectOverCDP`는 Chromium 계열만 되고 `connect`보다 충실도가 "상당히 낮다"고 공식 문서가 적는다[36]. 스크린샷 기준이 Windows 폰트 렌더링에 묶여 CI와 맞지 않는다. 디버깅용으로만 고려한다. Windows Chrome에 실제로 붙여 보지는 않았다. 손수 띄운 Chrome에 붙으면 hover와 스크롤바가 달라진다(3절).
- **Jenkins**: 지금 파이프라인(`infra/ci/hetzner.Jenkinsfile`)은 `agent any`에서 소스를 앱 서버로 보내 그곳에서 `docker compose up --build`를 하고 HTTP 200만 본다. Playwright 공식 문서의 Jenkins 예시는 Docker agent(`mcr.microsoft.com/playwright:v1.64.1-noble`)다[5]. Jenkins 호스트에서 Docker agent를 쓸 수 있는지는 확인하지 못했다. 쓸 수 없으면 Verify 단계처럼 앱 서버에 SSH로 들어가 Playwright 이미지를 `--network host`로 띄워 `127.0.0.1:18084`를 대상으로 돌리는 방법이 있다. 이 방법은 앱 서버에 브라우저 이미지를 받아 두어야 한다.
- **스크린샷 기준 이미지**: 기준 이미지는 Docker 안에서만 만들고 갱신한다. 파일 이름에 플랫폼이 붙으므로(`-chromium-linux.png`) 다른 환경에서 만든 것과 섞이지 않는다[1].
- **CI 설정**: 공식 문서는 CI에서 worker 1개를 권한다[5].

### 7.6 시도해 볼 최소 구성

결정하고 한 번 돌려 보는 데 필요한 것만 적는다. 아래 코드는 테스트 러너로는 실행하지 않았다. 첫 예시와 같은 흐름(시계 설치, 기록기, `runFor(50)` 반복)은 2026-10-30에 Playwright MCP의 `browser_run_code_unsafe`로 운영 사이트에 돌려, 다 지워진 순간이 기록되고 높이·위치가 그대로인 것을 확인했다(3절). 커서 높이를 뺐을 때 실패하는지는 아직 보지 않았다.

#### 패키지

- `@playwright/test@1.64.1`(devDependencies). 버전을 Docker 이미지 태그와 같게 고정한다.
- 접근성 검사는 두 번째 단계에서 `@axe-core/playwright`를 더한다.

#### 설정 요지 (`playwright.config.mjs`)

```js
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e", // npm test(tests/**/*.test.mjs)와 섞이지 않게 폴더를 나눈다.
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: process.env.BASE_URL, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
```

#### 예시 테스트 (`e2e/home.spec.mjs`)

```js
import { test, expect } from "@playwright/test";

test("가운데 줄이 다 지워진 순간에도 인사말 높이와 링크 줄 위치가 그대로다", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  // 글자가 바뀔 때마다(다 지워진 순간 포함) 그 글자와 h1 높이, 링크 줄 위치를 함께 기록한다.
  await page.evaluate(() => {
    const line = document.querySelector("h1 [aria-hidden=true]");
    const links = document.querySelector("h1 + ul");
    const measure = () => ({
      text: line.textContent,
      height: line.closest("h1").getBoundingClientRect().height,
      linksTop: links.getBoundingClientRect().top,
    });
    window.__typing = [measure()];
    new MutationObserver(() => window.__typing.push(measure()))
      .observe(line, { childList: true, subtree: true, characterData: true });
  });
  // 머무름 2400ms + 지우기 18×50ms + 다음 문장 첫 글자까지. 넉넉히 8초 안에서 OOP가 보이면 멈춘다.
  for (let i = 0; i < 160; i++) {
    await page.clock.runFor(50);
    if (await page.evaluate(() => /^OOP/.test(window.__typing.at(-1).text))) break;
  }
  const records = await page.evaluate(() => window.__typing);
  const [base] = records;
  expect(base.text, "기록 전에 줄이 이미 비었다(로딩이 3초를 넘음)").not.toBe("");
  expect(records.some((r) => r.text === ""), "다 지워진 상태를 기록하지 못했다").toBe(true);
  expect(records.at(-1).text).toMatch(/^OOP/);
  for (const r of records) {
    expect(r.height, `"${r.text}"일 때 h1 높이`).toBe(base.height);
    expect(r.linksTop, `"${r.text}"일 때 링크 줄 위치`).toBe(base.linksTop);
  }
});

test("저장한 다크 모드가 본문 전에 걸리고, 인쇄는 라이트다", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("theme", "dark");
    new MutationObserver((_, observer) => {
      if (!document.body) return;
      window.__themeAtBody = document.documentElement.dataset.theme ?? null;
      observer.disconnect();
    }).observe(document, { childList: true, subtree: true });
  });
  await page.goto("/");
  expect(await page.evaluate(() => window.__themeAtBody)).toBe("dark");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(10, 10, 10)");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(255, 255, 255)");
});
```

첫 테스트는 시계를 넘긴 뒤에 위치를 재지 않는다. React가 글자를 바꿔 DOM에 반영할 때마다 MutationObserver가 그 글자와 위치를 같은 순간에 잰다. 그래서 시계를 얼마씩 넘기든 다 지워진 상태(`""`)가 기록에 들어간다. 테스트는 그 상태를 실제로 기록했는지 먼저 확인하고, 그 상태를 포함한 모든 기록에서 `h1` 높이와 링크 줄 위치가 기준과 같은지 본다. 기준은 첫 기록이다. 지우기 도중의 글자여도 줄 높이는 같으므로, 로딩이 머무름 시간을 넘겨도 줄이 비기 전에만 기록을 시작하면 된다.

처음 돌릴 때 이 테스트가 실패할 수 있는지 확인한다. `app/typing-line.tsx`의 커서에서 `inline-block h-[1.1em]`을 잠깐 빼면, 다 지워진 순간 가운데 줄이 접혀 이 테스트가 실패해야 한다. 실패하지 않으면 테스트가 그 상태를 보지 못하는 것이다. `runFor(50)`과 React 다시 그리기의 순서가 의도대로인지도 이때 함께 확인한다.

시각 비교는 위 두 테스트가 돈 뒤에 더한다. `emulateMedia({ reducedMotion: "reduce" })`로 타이핑을 멈추고 폭마다 `toHaveScreenshot()`을 찍는 것부터 시작한다.

#### 로컬 Docker에서 돌리기

```sh
docker build -t seung-hwan .
docker network create sh-net
docker run -d --rm --name sh-test --network sh-net seung-hwan
docker run --rm --init --ipc=host --network sh-net \
  -v "$PWD":/work -v /work/node_modules -w /work -e BASE_URL=http://sh-test:3000 \
  mcr.microsoft.com/playwright:v1.64.1-noble \
  sh -c "npm ci && npx playwright test"
docker stop sh-test
```

- `--ipc=host`, `--init`은 공식 권장이다[4].
- `-v /work/node_modules`는 컨테이너 안의 `npm ci`가 호스트의 `node_modules`를 덮어쓰지 않게 가린다.
- 기본 사용자가 root라 기준 이미지와 보고서 파일이 root 소유로 생긴다[4]. 필요하면 실행 뒤 소유자를 바꾼다.
- 기준 이미지 갱신은 같은 명령에 `--update-snapshots`를 붙인다[1].

#### Jenkins에서 돌리기

1. Jenkins 호스트에서 Docker agent를 쓸 수 있는지 먼저 확인한다.
2. 쓸 수 있으면 Deploy 앞에 공식 예시와 같은 Docker agent 단계를 둔다[5]. 이때 테스트 대상 앱 컨테이너를 그 단계에서 함께 띄워야 한다.
3. 쓸 수 없으면 Verify 뒤에 앱 서버에서 `docker run --rm --init --ipc=host --network host -v <소스 폴더>:/work ... npx playwright test`를 실행하고 `BASE_URL=http://127.0.0.1:18084`로 배포된 컨테이너를 검사한다. 이미 배포된 뒤이므로 "막는" 검사가 아니라 "알리는" 검사가 된다.

처음에는 로컬 Docker 실행만으로 시작하고, 쓸 만하다고 판단되면 Jenkins에 붙인다.

### 7.7 반례·대안, 확인하지 못한 것

#### 결론을 흔들 수 있는 반례와 대안

- **아예 브라우저 테스트를 두지 않는다**: 사이트가 작고 화면이 자주 바뀌지 않는다. 기준 이미지 관리(폰트·환경 차이, 의도한 변경마다 갱신)가 얻는 것보다 클 수 있다. 이 경우 기존 HTML 테스트에 더해, 바꿀 때마다 에이전트가 1–5절의 도구로 화면을 한 번 재는 방법이 남는다. 다만 타이핑 타이밍과 깜빡임은 사람이 매번 보기 어렵다.
- **Puppeteer + `node --test`**: 지금 테스트 러너를 그대로 쓰고 의존성이 하나다. 대신 시계 제어, 스크린샷 비교, 자동 재시도를 직접 만들어야 한다. 우아한형제들도 `setTimeout`을 막는 장치를 따로 만들어야 했다[29].
- **스크린샷 없이 값만 검사**: 위치·크기·색을 숫자로 검사하면 기준 이미지 문제가 없다. 시각 비교가 꼭 필요한지는 첫 단계 뒤에 다시 정해도 된다. 7.6절 예시가 이 방식부터 시작하는 이유다.
- **외부 서비스**: 검토 UI와 브라우저 여러 개가 필요해지면 Argos·Percy 무료 한도로 충분하다[19][22]. 지금은 필요 없다. 서비스가 사라질 수 있다는 점은 Lost Pixel이 보여 준다[23].
- **설문과 다운로드 수의 한계**: State of JS는 자발 응답이다. npm 수치는 CI와 의존성 설치를 포함한다. 도구 선택의 근거는 수치보다 7.2절의 기능 차이다.
- **국내 사례가 적다**: 도구 이름을 밝힌 1차 출처는 우아한형제들, 토스페이먼츠, LY 설문뿐이었다.

#### 확인하지 못한 것

- Playwright Test를 설치하거나 실행하지 않았다(패키지 설치 금지). 7.6절의 설정, 테스트, Docker 명령은 모두 실행 전이다. `page.clock`과 React 다시 그리기의 순서는 MCP로 같은 흐름을 돌려 확인했다(3절).
- Jenkins 호스트의 Docker 사용 가능 여부와 앱 서버의 여유 자원.
- WSL에서 Windows Chrome에 `connectOverCDP`로 붙는 것.
- `isMobile` 설정의 효과. 스크롤바 폭이 320px 결과에 주는 영향은 3절에서 쟀다.
- Pretendard dynamic subset 웹폰트가 늦게 받아질 때 스크린샷이 흔들리는지.
- Aside에서 `bringToFront`로 탭을 앞으로 가져오면 hover 전환과 프레임 수가 정상이 되는지(사용자 화면을 바꿔서 하지 않음).
- Aside `page.pdf` 결과물의 색과 쪽 나눔(렌더러가 없어 열지 못함).
- Aside로 깜빡임을 재는 방법(초기 스크립트 주입이 없어 할 수 없었다).
- 측정한 레이아웃 이동 항목의 원인.
- State of JS 2025의 도구별 사용률 수치(공식 페이지의 대화형 차트에만 있다).

## 8. 출처

1. Playwright, Visual comparisons. https://playwright.dev/docs/test-snapshots
2. Playwright, PageAssertions `toHaveScreenshot`. https://playwright.dev/docs/api/class-pageassertions#page-assertions-to-have-screenshot-1
3. Playwright, Clock. https://playwright.dev/docs/clock
4. Playwright, Docker. https://playwright.dev/docs/docker
5. Playwright, Continuous Integration (Jenkins, workers). https://playwright.dev/docs/ci
6. Playwright, Page `emulateMedia`, `pdf`, `addInitScript`. https://playwright.dev/docs/api/class-page#page-emulate-media
7. Playwright, Release notes (1.45 Clock, 1.49 aria snapshot, 1.57 Chrome for Testing). https://playwright.dev/docs/release-notes
8. Playwright, Accessibility testing. https://playwright.dev/docs/accessibility-testing
9. Deque, axe-core README. https://github.com/dequelabs/axe-core
10. State of JavaScript 2025, Libraries. https://2025.stateofjs.com/en-US/libraries/
11. State of JavaScript 2025, Testing. https://2025.stateofjs.com/en-US/libraries/testing/
12. Next.js, How to set up Playwright with Next.js (2026-10-15 갱신). https://nextjs.org/docs/app/guides/testing/playwright
13. Puppeteer, What is Puppeteer. https://pptr.dev/guides/what-is-puppeteer
14. Puppeteer, Installation. https://pptr.dev/guides/installation
15. Chrome for Developers, Chrome for Testing (2023-06-12 갱신). https://developer.chrome.com/blog/chrome-for-testing
16. Cypress, Visual Testing. https://docs.cypress.io/app/tooling/visual-testing
17. W3C, WebDriver BiDi (Working Draft, 2026-10-08). https://www.w3.org/TR/webdriver-bidi/
18. Selenium, WebDriver BiDi. https://www.selenium.dev/documentation/webdriver/bidi/
19. BrowserStack, Percy. https://www.browserstack.com/percy
20. Chromatic, Pricing. https://www.chromatic.com/pricing
21. Applitools, Eyes. https://applitools.com/platform/eyes/
22. Argos, Pricing. https://argos-ci.com/pricing
23. Lost Pixel 저장소(보관 상태, 공지). https://github.com/lost-pixel/lost-pixel
24. GitHub API, lost-pixel/lost-pixel(`archived: true`, 마지막 push 2026-04-22). https://api.github.com/repos/lost-pixel/lost-pixel
25. reg-suit 릴리스 v0.14.6. https://github.com/reg-viz/reg-suit/releases/tag/v0.14.6
26. npm registry, backstopjs(latest 6.3.25). https://registry.npmjs.org/backstopjs
27. BackstopJS 릴리스. https://github.com/garris/BackstopJS/releases
28. Storybook, How to test UIs with Storybook. https://storybook.js.org/docs/writing-tests
29. 우아한형제들 기술블로그, 우아한형제들 디자인 시스템에 시각적 회귀 테스트 적용하기(2024-04-16). https://techblog.woowahan.com/17081/
30. 토스 SLASH24, 클릭 한 번으로 테스트 45만 개 완료! 테스트 자동화 플랫폼 구축기. https://toss.im/slash-24/sessions/15
31. LY Corporation Tech Blog, State of LY Frontend 2024 실시 보고서. https://techblog.lycorp.co.jp/ko/state-of-ly-frontend-2024-report
32. Primer React, contributor docs: testing. https://github.com/primer/react/blob/main/contributor-docs/testing.md
33. Canva Engineering, Speeding up UI tests with CodeceptJS and Playwright(2022-03-03). https://www.canva.dev/blog/engineering/speeding-up-ui-tests-with-codeceptjs-and-playwright/
34. 2차 글 예: tech-insider.org, Playwright vs Cypress vs Selenium 2026. https://tech-insider.org/playwright-vs-cypress-vs-selenium-2026/
35. npm Downloads API, 2026-09-28~2026-10-27. 예: https://api.npmjs.org/downloads/point/2026-09-28:2026-10-27/@playwright/test
36. Playwright, BrowserType `connectOverCDP`. https://playwright.dev/docs/api/class-browsertype#browser-type-connect-over-cdp
37. Microsoft, Playwright MCP README(옵션 표, 도구 목록, Docker 예시). 내려받은 npm 패키지 0.0.83의 README로 확인. https://github.com/microsoft/playwright-mcp
38. npm registry, @playwright/mcp 0.0.83(의존성 playwright 1.64.0-alpha-1790635538000). https://registry.npmjs.org/@playwright/mcp/0.0.83
39. Playwright 소스, Chromium headless 실행 인자(`--hide-scrollbars`, `--blink-settings=primaryHoverType=2,...`). 설치된 playwright-core 번들로 확인. https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/chromium/chromium.ts
40. Google, Chrome DevTools MCP README(지원 브라우저, 사용 통계, 버전). https://github.com/ChromeDevTools/chrome-devtools-mcp
41. Chrome DevTools MCP, Configuration(`--browserUrl`, `--executablePath`, `--chromeArg`, 파일 접근 범위). https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/configuration.md
42. Chrome DevTools MCP, Troubleshooting(WSL, `Target closed`). https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/troubleshooting.md
43. Chrome DevTools MCP, Tool reference(`emulate`, `resize_page`, `navigate_page`의 `initScript`). https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md
44. Puppeteer 소스, WSL에서 Windows Chrome 경로 찾기(`getWslLocation`). chrome-devtools-mcp 1.12.0 번들로 확인. https://github.com/puppeteer/puppeteer/blob/main/packages/browsers/src/browser-data/chrome.ts
45. Claude Code, Connect Claude Code to tools via MCP(범위, tool search, 출력 한도, 이미지, roots). https://code.claude.com/docs/en/mcp
46. Claude Code, Configure permissions(`mcp__<server>__*`). https://code.claude.com/docs/en/permissions
47. Claude Code, CLI reference(`--mcp-config`, `--strict-mcp-config`, `--allowedTools`). https://code.claude.com/docs/en/cli-reference
48. Claude API, Vision(이미지 토큰 계산). https://platform.claude.com/docs/en/build-with-claude/vision
49. Tailwind CSS, Hover, focus, and other states(`hover`는 `@media (hover: hover) { &:hover }`). https://tailwindcss.com/docs/hover-focus-and-other-states
50. Aside CLI 1.26.1028.2335, `aside guide`, `aside guide repl` 출력과 MCP `repl` 도구 설명. 공개 URL은 확인하지 않았다.
51. Chrome DevTools Protocol, Emulation 도메인(`setDeviceMetricsOverride`, `setEmulatedMedia`, `setVirtualTimePolicy`). https://chromedevtools.github.io/devtools-protocol/tot/Emulation/
52. Microsoft, Playwright CLI README(CLI와 MCP 비교, 명령 목록, 세션, 1시간 유휴 종료, 설정 파일, 환경 변수). https://github.com/microsoft/playwright-cli
53. npm registry, @playwright/cli(latest 0.1.22, 2026-09-28. 의존성 playwright·playwright-core 1.64.0-alpha-1790635538000). https://registry.npmjs.org/@playwright/cli
54. Playwright CLI 스킬 `SKILL.md`와 `references/running-code.md`, `references/session-management.md`(`--raw`, `run-code`의 격리 설명, `allowed-tools: Bash(playwright-cli:*) Bash(npx playwright:*) ...`). playwright-core 1.64.0-alpha-1790635538000 패키지의 `lib/tools/skills/playwright-cli/`를 npx 캐시로 확인. https://www.npmjs.com/package/playwright-core/v/1.64.0-alpha-1790635538000
55. Playwright 소스, CLI 데몬과 도구(`cli-daemon/program.ts`·`daemon.ts`의 세션·소켓·`install`, `resolveCLIConfigForCLI`의 기본 브라우저와 출력 폴더, CLI 모드의 `checkFile` 건너뛰기, `run-code` → `browser_run_code_unsafe`의 `vm` 실행, `settle` 500ms)와 @playwright/cli `playwright-cli.js`의 새 버전 확인(`NO_UPDATE_NOTIFIER`). 같은 버전 패키지의 번들로 확인. https://github.com/microsoft/playwright/tree/main/packages/playwright-core/src/tools
56. Node.js, VM 모듈("The `node:vm` module is not a security mechanism"). https://nodejs.org/api/vm.html
57. Claude Code, Skills(`allowed-tools`는 스킬을 부른 차례 동안 묻지 않고 허용, 프로젝트 스킬 위치 `.claude/skills/`). https://code.claude.com/docs/en/skills
