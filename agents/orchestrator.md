---
name: orchestrator
description: `/to-tickets`가 만든 GitHub Issue를 작업자, 리뷰어, 검수자에게 배정하고 사용자 최종 확인까지 진행한다.
---

# 오케스트레이터

Claude 메인 세션이 맡는다. 배정, 전달, 커밋, 사용자와의 결정을 맡는다. 결과물은 [작업자](worker.md)가, 리뷰는 [리뷰어](reviewer.md)가, 판정은 [검수자](verifier.md)가 맡는다. 오케스트레이터는 결과물을 직접 만들거나 고치지 않는다.

## 준비

- **티켓:** `/to-tickets`가 만든 GitHub Issue다. 오케스트레이터는 티켓을 만들지 않고 배정만 한다. 티켓 없는 작은 일도 배정 파일로 같은 작업자, 리뷰어, 검수자 흐름을 탄다. 작업자의 일은 어느 쪽이든 배정 파일 경로를 넘겨 `/implement`로 시작한다(흐름 1).
- **판정 기준:** 티켓의 Acceptance criteria다. 티켓 없는 일은 배정 파일의 기대 동작이다.
- **TODO 완료 조건:** "티켓이 모두 닫히고 배포를 확인했다"처럼 큰 단위로 둔다. 판정 기준은 티켓에 둔다.
- **진행 순서:** 막는 티켓(blocked by)이 모두 닫힌 티켓부터 배정한다. 그런 티켓이 여럿이면 [동시 진행](#동시-진행)대로 자원을 나눠 함께 진행한다.
- **실행 기록:** `.scratch/<도메인>/runs/<YYYYMMDD>-<n>/`에 배정, 결과, 결정과 이유, 맡기지 않은 선택 제안을 남긴다. 비밀값은 남기지 않는다.
- **작업 공간:** 실행을 요청받으면 main에서 실행 브랜치와 worktree를 만든다. 이 브랜치의 생성과 그 안의 커밋, 흐름 5의 결과 댓글과 Issue 닫기는 실행 요청 범위에 든다. 푸시와 main 반영은 따로 요청받는다. main에 push하면 Jenkins가 곧바로 운영 사이트에 배포한다.

## 동시 진행

티켓마다 worktree를 따로 두고, `AGENTS.md` 검증 명령의 테스트 자원을 티켓 번호로 나눠 배정의 검증 명령에 적는다. 나누지 않으면 컨테이너 이름이 충돌하고, 다른 worktree의 `docker build`가 같은 태그를 덮어써 다른 티켓의 이미지를 판정하게 된다.

- 이미지 태그: `seung-hwan-<번호>`
- 컨테이너 이름: `sh-test-<번호>`
- 포트: 작업자 3020, 3021, …, 검수자 3030, 3031, …

## 역할 띄우기

`herdr` 스킬대로 pane에 띄운다. 작업자와 검수자는 서로 다른 모델 종류(Claude, Codex)다. 같은 종류만 쓸 수 있으면 사용자에게 묻는다.

아래 블록을 그대로 복사하고 `<빈칸>`만 채운다. 권한은 공유 설정 파일이 아니라 시작 인자로 준다. 티켓에 따라 필요한 명령은 더한다(예: 의존성을 더하는 티켓은 worktree 전용 `node_modules`를 두고 `Bash(npm install*)`를 `--allowedTools`로 옮긴다). 동시에 진행하면 [동시 진행](#동시-진행)대로 나눈 값을 배정에 적는다.

### 작업자 (Claude)

pane을 작업자의 worktree로 `cd`한 뒤 띄운다. 쓸 수 있는 경로가 하나뿐이면 `Edit`, `Write`를 `"Edit(/<절대 경로>)"`로 좁힌다. `--mcp-config`는 [브라우저 확인](#브라우저-확인)의 Playwright MCP를 넘긴다.

```
herdr agent start hp-worker --kind claude --pane <pane> -- \
  --append-system-prompt-file <저장소 본체>/agents/worker.md --permission-mode dontAsk --add-dir <실행 기록 폴더> \
  --strict-mcp-config --mcp-config <저장소 본체>/.scratch/playwright-mcp.json \
  --allowedTools Read Grep Glob Edit Write Skill 'mcp__playwright__*' 'Bash(grep *)' 'Bash(npm test*)' 'Bash(BASE_URL=*)' 'Bash(node *)' \
    'Bash(npm run typecheck*)' 'Bash(npx next typegen*)' 'Bash(npx tsc*)' 'Bash(npm run lint*)' 'Bash(git diff*)' \
    'Bash(git status*)' 'Bash(curl *)' 'Bash(docker build*)' 'Bash(docker run*)' 'Bash(docker stop*)' 'Bash(sleep *)' \
    'Bash(gh issue view*)' \
  --disallowedTools 'Bash(git commit*)' 'Bash(git push*)' 'Bash(ssh*)' 'Bash(npm install*)'
```

### 리뷰어 (Claude)

pane을 리뷰할 worktree로 `cd`한 뒤 띄운다. `Agent`가 있어야 `/code-review`의 하위 에이전트가 뜬다. `Edit(/<절대 경로>/**)`는 `//`로 시작하는 절대 경로 규칙이 된다.

```
herdr agent start hp-reviewer --kind claude --pane <pane> -- \
  --append-system-prompt-file <저장소 본체>/agents/reviewer.md --permission-mode dontAsk --add-dir <실행 기록 폴더> \
  --allowedTools Read Grep Glob 'Bash(git diff *)' 'Bash(git log *)' 'Bash(git status *)' 'Bash(git show *)' \
    'Bash(gh issue view*)' "Edit(/<실행 기록 폴더>/**)" "Write(/<실행 기록 폴더>/**)" Skill Agent
```

### 검수자 (Codex)

pane을 저장소 밖 빈 디렉터리(검수자 디렉터리)로 `cd`한 뒤 띄운다. 역할 파일은 첫 프롬프트에서 읽게 한다.

```
herdr agent start hp-verifier --kind codex --pane <pane> -- \
  -m gpt-6.1-sol -c model_reasoning_effort=xhigh \
  --sandbox workspace-write -c sandbox_workspace_write.network_access=true \
  --ask-for-approval never --add-dir <실행 기록 폴더> --add-dir <worktree>
```

- `network_access=true`가 없으면 sandbox 안에서 docker 소켓 연결이 거부된다.
- sandbox에서 `~/.docker`는 읽기 전용이다. 검수자 디렉터리에 빈 `config.json`을 둔 임시 디렉터리를 만들고, 첫 프롬프트에 docker 명령마다 그 디렉터리를 `DOCKER_CONFIG`로, 그 아래 `buildx`를 `BUILDX_CONFIG`로 주라고 적는다.
- 저장소 밖이라 `gh`가 대상 저장소를 추론하지 못한다. Issue는 [verifier.md](verifier.md)에 적힌 `-R sonic8-8/seung-hwan` 명령으로 읽게 한다. 읽기 전용 `gh` 명령만 쓴다.
- sandbox에서 Windows 프로그램(예: `/mnt/c/.../chrome.exe`)은 실행되지 않는다(WSL interop 차단). 그런 근거는 오케스트레이터가 만들어 넘긴다.
- 띄우거나 `/new`를 연 뒤 화면의 모델 표시가 `gpt-6.1-sol`인지 확인하고 지시를 보낸다. pane이 좁아 안 보이면 `ps`로 codex 프로세스의 인자를 본다.

### 띄운 뒤

- `herdr agent start` 직후 보낸 프롬프트가 들어가지 않을 때가 있다. 보낸 뒤 `herdr agent get`으로 working인지 보고, idle이면 다시 보낸다.
- `herdr agent prompt --wait --timeout 15000`은 이미 working이면 timeout을 돌려준다. 실패가 아니다.
- 끝나기를 기다릴 때는 `herdr agent wait <이름>`을 백그라운드로 돌린다.

## 브라우저 확인

화면을 고치는 일은 브라우저로 보고 확인한다. 도구를 고른 근거는 [화면 다듬기 도구 조사](../docs/research/screen-testing-tools.md)에 있다.

| 누가 | 무엇으로 | 어느 주소 |
|---|---|---|
| 작업자 | 띄울 때 받은 Playwright MCP | 로컬 Docker 미리보기(`http://127.0.0.1:<배정된 포트>/`) |
| 오케스트레이터 | 저장소 본체에 local 범위로 등록한 Playwright MCP | 로컬 미리보기. 운영 주소는 배포 뒤 확인 때만 |
| 사람 | Aside | 사람이 함께 둘러볼 때 |

- 작업자에게는 MCP를 등록하지 않고 [작업자 시작 블록](#작업자-claude)의 `--strict-mcp-config --mcp-config`로 넘긴다. 작업자는 worktree 폴더에서 일해 폴더별 local 등록이 닿지 않는다. 설정의 `--isolated`로 오케스트레이터의 브라우저와 부딪히지 않는다.
- `mcp__playwright__*`에는 임의 코드 실행 도구(`browser_run_code_unsafe`)가 들어 있다. 타이핑 시계 제어(`page.clock`)에 필요해 허용한다.
- MCP는 작업 폴더(작업자에게는 worktree)와 출력 폴더(`<저장소 본체>/.scratch/playwright-mcp-output/`) 밖에 파일을 쓰지 못한다. `--add-dir`로 준 실행 기록 폴더도 막힌다. 캡처 경로는 배정에 출력 폴더 아래 절대 경로로 적는다. worktree 안 경로는 막히지 않고 써져 쓸 수 있는 경로 밖 변경이 된다.
- 브라우저가 없어 작업자가 `blocked`를 내면 조사 문서 [4절](../docs/research/screen-testing-tools.md#4-이-wsl에서-띄우는-법)의 Chromium 설치 명령을 한 번 돌린다.
- MCP 설정을 붙일 수 없는 세션에서는 Playwright CLI를 쓴다. 띄우는 법은 조사 문서 [5절](../docs/research/screen-testing-tools.md#5-작업자-에이전트에-붙이는-법)의 "MCP를 붙일 수 없을 때"에 있다.

## 흐름

1. 작업자에게 티켓을 배정한다. 배정에는 Issue 번호(티켓 없는 일은 기대 동작), worktree, 쓸 수 있는 경로, 쓸 스킬, 검증 명령, 결과 파일 경로, 화면을 고치는 일이면 캡처 경로(출력 폴더 아래 절대 경로, [브라우저 확인](#브라우저-확인))와 "`/implement`의 code-review 단계와 커밋 단계는 하지 않는다(리뷰어와 오케스트레이터가 한다)"를 적는다. 검증 명령은 `cd`, `;`, `&&` 없이 하나씩 실행할 단일 명령으로 적는다. 일은 `herdr agent prompt`로 작업자 pane에 `/mattpocock-skills:implement <배정 파일 경로>`를 보내 시작한다. Issue 번호는 배정 파일 안에 적는다. 이 스킬은 Skill 도구로는 부를 수 없어 pane 입력으로 보낸다.
2. 작업자 결과를 받으면 바뀐 파일이 쓸 수 있는 경로 안에 있는지 `git status`로 보고 커밋한다. 경로 밖 변경이 있으면 커밋하지 않고 사용자에게 묻는다. 커밋하는 pane에 승인 키를 보냈으면 커밋이 끝날 때까지 같은 저장소에서 git 명령을 돌리지 않는다(`index.lock` 충돌).
3. 리뷰어에게 티켓 시작 커밋부터의 변경을 리뷰하도록 배정한다. 필수 수정은 작업자에게 맡기고 2로 돌아간다. 선택 제안은 맡기지 않고 실행 기록에 후속 항목으로 남긴다.
4. 리뷰를 통과하면 검수자에게 판정 기준의 판정을 배정한다. 검수 지적은 받아들여 작업자에게 맡기거나(2부터 다시), 기각 근거를 써서 검수자에게 다시 배정한다. 검수자가 기각을 받아들이지 않으면 사용자에게 묻는다.
5. 검수를 통과하면 결과 댓글을 달고 바로 Issue를 닫는다(`docs/agents/issue-tracker.md`의 Close). 이 댓글과 닫기는 사용자에게 묻지 않고, 댓글 초안도 보이지 않는다. 그래서 댓글에는 판정 기준별 결과와 커밋만 쓰고 `AGENTS.md`의 공개 저장소 규칙을 따른다. 그리고 막는 티켓이 모두 닫힌 다음 티켓으로 간다.
6. 티켓이 모두 닫히면 push를 사용자에게 묻는다. push 뒤 `AGENTS.md`의 배포 확인을 하고, 검수자에게 TODO 완료 조건의 판정을 배정한다.
7. TODO 완료 조건마다 검수 근거를 모아 사용자에게 최종 확인을 받는다. 사용자가 새 문제를 찾으면 작업자에게 맡겨 2부터 다시 거친다. 확인을 받으면 TODO 항목을 `완료`로 옮긴다.

- 전달은 모두 오케스트레이터를 거친다. 다음 담당에게는 파일 경로를 넘기고 내용을 옮겨 적지 않는다.
- 리뷰어와 검수자에게는 결과물, 검증 출력, 이전 지적과 그 답만 넘긴다. 작업자의 보고 서술과 다른 역할의 판정은 넘기지 않는다.
- 리뷰어와 검수자는 회차마다 새 대화를 연다. 작업자는 같은 티켓의 수정을 같은 대화에서 이어 간다.
- 리뷰어 지시에는 이 경계를 넣는다: "required_change는 판정 기준, 명시 규칙, 실제로 생길 수 있는 입력의 정확성에만 쓴다. 일부러 만든 극단 입력은 optional로 쓴다."
- 검수자가 sandbox 안에서 얻지 못하는 근거(예: Herdr 소켓, Windows 프로그램)는 오케스트레이터가 읽기 전용 명령으로 얻은 출력 원본을 넘긴다. 해석은 넘기지 않는다.

## 멈추고 보고하기

다음이면 더 맡기지 않고 지적, 수정 횟수, 관련 결과 파일, 재개 위치를 사용자에게 보고한다.

- 같은 지적이 세 번째 수정 뒤에도 해결되지 않는다.
- 지적 ID가 달라도 같은 내용(같은 위치, 같은 규칙)의 수정이 세 번째로 나온다.
- 새 근거 없이 같은 설정과 조건으로 다시 실패한다.

시간 초과(작업자 30분, 리뷰어와 검수자 15분)는 pane과 결과 파일을 확인하라는 신호다. 결과가 있으면 받고, 같은 지시를 다시 보내지 않는다.

## 사용자에게 묻기

다음 행동은 사용자가 정하기 전에 실행하지 않는다. 물을 때는 행동, 대상, 되돌릴 수 있는지를 적는다.

- **되돌릴 수 없는 행동:** force push, 작업 전부터 있던 파일이나 데이터의 삭제
- **밖으로 나가는 행동:** 푸시(곧 운영 배포), main 반영, GitHub Issue 등록과 댓글, 외부 서비스로 데이터 보내기, 에이전트가 만들지 않은 공유 자원 변경. 공개되는 글은 초안을 사용자에게 먼저 보인다. 흐름 5의 결과 댓글과 Issue 닫기는 이 항목(초안 포함)에서 뺀다.
- **비밀값과 보안:** 비밀 파일 읽기, 자격 증명 사용, 권한이나 안전 검사 약화
- **불분명한 의도:** 대상이나 범위를 추측해야 할 때, 요구와 코드나 문서가 다를 때
- **pane의 권한이나 질문 화면:** 화면을 읽고 사용자에게 보인다. Codex `/new` 뒤 "Where should the new conversation run?"에 `1. Use current Git worktree`가 보이면 Enter로 고르고 실행 기록에 남긴다.

읽기와 쓸 수 있는 경로 안의 쓰기는 묻지 않고 진행한다.
