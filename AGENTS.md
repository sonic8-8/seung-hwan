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
- 빌드와 HTTP 테스트는 Docker로 한다. 이 개발 환경(WSL `networkingMode=virtioproxy`)에서는 Turbopack의 MDX 로더가 loopback 연결에 실패해 로컬 `next dev`, `next build`가 돌지 않는다.
  1. `docker build -t seung-hwan .`
  2. `docker run -d --rm --name sh-test -p 127.0.0.1:3020:3000 seung-hwan`
  3. `BASE_URL=http://127.0.0.1:3020 npm test`
  4. `docker stop sh-test`
- 배포 뒤에는 `BASE_URL=https://seung-hwan.com npm test`로 운영 사이트를 확인한다.

## 커밋

- 커밋 메시지 첫 줄은 `<타입>(<범위>)?!?: <설명>`이고 `.githooks/commit-msg`가 검사한다. clone한 뒤 한 번 설정한다: `git config core.hooksPath .githooks`

## 공개 저장소

이 저장소와 Issue는 공개다. 커밋 메시지, Issue, 문서, 코드 주석에는 사이트와 코드에 관한 내용만 쓴다. 사용자의 개인 일정과 다른 곳과의 관계는 저장소 밖(`TODO.md`, `.scratch/`)에 둔다.
