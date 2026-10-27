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

## 검증 명령

- 타입과 린트: `npx tsc --noEmit`, `npm run lint`
- 빌드와 HTTP 테스트는 Docker로 한다. 이 개발 환경(WSL `networkingMode=virtioproxy`)에서는 Turbopack의 MDX 로더가 loopback 연결에 실패해 로컬 `next dev`, `next build`가 돌지 않는다.
  1. `docker build -t seung-hwan .`
  2. `docker run -d --rm --name sh-test -p 127.0.0.1:3020:3000 seung-hwan`
  3. `BASE_URL=http://127.0.0.1:3020 npm test`
  4. `docker stop sh-test`
- 배포 뒤에는 `BASE_URL=https://seung-hwan.com npm test`로 운영 사이트를 확인한다.

## 공개 저장소

이 저장소와 Issue는 공개다. 커밋 메시지, Issue, 문서, 코드 주석에는 사이트와 코드에 관한 내용만 쓴다. 사용자의 개인 일정과 다른 곳과의 관계는 저장소 밖(`TODO.md`, `.scratch/`)에 둔다.
