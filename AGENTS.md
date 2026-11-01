<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues (`sonic8-8/seung-hwan`, public), via `gh`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## 에이전트 도구

- Herdr로 pane, 탭, 에이전트를 확인하거나 조작하기 전에 `herdr` 스킬을 불러 그 절차를 따른다.
- 작업 오케스트레이션을 운영할 때 `agents/orchestrator.md`를 따른다. 역할을 띄울 때는 `agents/`의 역할 파일을 넘긴다.
- 배포 확인: 운영 `npm test`는 사이트 내용이 같으면 배포 전후를 구분하지 못한다. SSH 별칭 `hetzner-ops`(Jenkins), `hetzner-app`(앱 서버)로 접속해 읽기만 한다.
  - Jenkins 빌드 기록: 빌드 결과, 빌드한 커밋(`Checking out Revision`), Verify 응답(`responded 200`)을 본다. `<번호>`는 `builds` 폴더의 숫자 이름 중 가장 큰 것이다. `lastBuild` 링크는 볼륨 밖을 가리켜 읽히지 않는다.

    ```
    ssh -4 -o BatchMode=yes hetzner-ops 'b="/var/lib/docker/volumes/ops_jenkins_home/_data/jobs/이승환 개인 홈페이지 (seung-hwan.com)/builds/<번호>"; grep -o "<result>[A-Z]*</result>" "$b/build.xml" | head -1; grep -a -E "Checking out Revision|responded 200|Finished:" "$b/log"'
    ```

  - 앱 서버 컨테이너: 생성 시각이 push 뒤인지 본다.

    ```
    ssh -4 -o BatchMode=yes hetzner-app 'docker ps --filter name=seung-hwan --format "{{.Names}} {{.CreatedAt}} {{.Status}}"'
    ```

  - SSH가 막혔을 때만 Windows 쪽 Aside CLI(`/mnt/c/Users/YOU/AppData/Local/Aside/CLI/current/aside.exe`)로 jenkins.sonic8-8.com의 빌드 결과와 콘솔 끝부분을 읽는다. 로그인은 사용자가 Aside 브라우저에서 한다.

## 검증 명령

- 타입과 린트: `npm run typecheck`, `npm run lint`
- 이 WSL에서는 IPv6 연결이 멈추므로 `curl`에는 `-4`를 붙인다.
- 작업 중 화면 확인: 개발 서버를 `npm run dev -- -p 3020`으로 띄운다(127.0.0.1). 소스를 고치면 바로 반영되어 다시 빌드하지 않는다. `BASE_URL=http://127.0.0.1:3020 npm test`도 개발 서버에 붙는다. 로컬 `next dev`, `next build`는 WSL `networkingMode=nat`에서 돈다. `virtioproxy`로 두면 Turbopack의 MDX 로더가 loopback 연결에 실패해 돌지 않는다.
- 마지막 검증: 운영과 같은 이미지(Node 24, `output: "standalone"`, 이미지 안의 lint·typecheck)로 빌드하고 HTTP 테스트를 한다. 로컬 Node는 버전이 다를 수 있고, 개발 서버로는 이 차이를 잡지 못한다. Docker는 WSL 안의 Docker Engine(context `default`)을 쓴다.
  1. `docker build -t seung-hwan .`
  2. `docker run -d --rm --name sh-test -p 127.0.0.1:3030:3000 seung-hwan`
  3. `BASE_URL=http://127.0.0.1:3030 npm test`
  4. `docker stop sh-test`
- 배포 뒤에는 `BASE_URL=https://seung-hwan.com npm test`로 운영 사이트를 확인한다.

## 커밋

- 첫 줄은 `<타입>(<범위>)?!?: <의도>, <원인>을 <결과>`인 한 문장이다.
  - 의도: 무엇을 하려고 바꾸는지("…하도록", "…하려고").
  - 원인: 바꾸기 전의 상태("…하던 …").
  - 결과: 바꾼 뒤의 상태를 동사로 끝낸다("…로 옮김", "…를 띄움").
  - 예: `fix(nav-link): 키보드 초점이 잘 보이도록, 밑줄을 가리던 초점 테두리를 4px 띄움`
  - 예: `docs(orchestrator): 빌드 대기를 줄이려고, 회차마다 Docker로 빌드하던 화면 확인을 개발 서버로 옮김`
- 타입은 Angular 타입(feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert) 중 하나다. 범위는 바꾼 모듈이나 파일의 실제 이름을 쓴다.
- 첫 줄은 72자 이하다.
- 문장은 ASD-STE100 원칙을 따른다.
  - 한 문장에 한 가지 변경만 쓴다.
  - 능동형으로 쓴다.
  - 한 뜻에는 한 단어만 쓴다.
  - 용어는 줄이지 않고 정확한 이름으로 쓴다(예: "dev 서버"가 아니라 "개발 서버", "repo"가 아니라 "저장소").
- merge 커밋은 `chore: <브랜치>를 main에 합침`이다.
- `.githooks/commit-msg`가 타입 형식과 길이를 검사한다. clone한 뒤 한 번 설정한다: `git config core.hooksPath .githooks`

## 공개 저장소

이 저장소와 Issue는 공개다. 커밋 메시지, Issue, 문서, 코드 주석에는 사이트와 코드에 관한 내용만 쓴다. 사용자의 개인 일정과 다른 곳과의 관계는 저장소 밖(`TODO.md`, `.scratch/`)에 둔다.
