#!/usr/bin/env bash
# 떠 있는 사이트의 포트폴리오 페이지를 headless Chrome으로 인쇄해 public/portfolio.pdf로 저장한다.
# 사용: scripts/portfolio-pdf.sh [사이트 주소]   기본 주소는 http://127.0.0.1:3020
# Chrome 경로는 CHROME 환경 변수로 바꾼다. 기본값은 WSL에서 쓰는 Windows Chrome이다.
set -euo pipefail

url="${1:-http://127.0.0.1:3020}/portfolio"
chrome="${CHROME:-/mnt/c/Program Files/Google/Chrome/Application/chrome.exe}"
out="$(cd "$(dirname "$0")/.." && pwd)/public/portfolio.pdf"
tmp="$out.tmp"

# 서버가 없거나 오류를 돌려주면 오류 페이지를 인쇄하지 않고, 기존 PDF도 건드리지 않는다.
if ! curl -4 -sf -o /dev/null "$url"; then
  echo "$url 에 접속하지 못했다. 사이트를 띄운 뒤 다시 실행한다." >&2
  exit 1
fi

# Windows Chrome은 Windows 경로로 받아야 파일을 쓴다.
tmp_arg="$tmp"
if [[ "$chrome" == *.exe ]] && command -v wslpath >/dev/null; then
  tmp_arg="$(wslpath -w "$tmp")"
fi

rm -f "$tmp"
"$chrome" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="$tmp_arg" "$url"

# 인쇄가 실패하면 임시 파일만 지우고 기존 PDF는 그대로 둔다.
if [[ "$(head -c 5 "$tmp" 2>/dev/null)" != "%PDF-" ]]; then
  rm -f "$tmp"
  echo "PDF를 만들지 못했다." >&2
  exit 1
fi
mv "$tmp" "$out"
echo "$out"
