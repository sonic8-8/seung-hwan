# Next.js 공식 예제(examples/with-docker)를 npm 전용으로 줄인 것이다.
# 세 단계로 나눠, 마지막 이미지에는 실행에 필요한 파일만 남긴다.

# Node.js 24 LTS. LTS 새 버전이 나오면 올린다.
ARG NODE_VERSION=24.22.1-slim

# 1단계: 의존성 설치
FROM node:${NODE_VERSION} AS dependencies
WORKDIR /app
# package 파일만 먼저 복사한다. 의존성이 그대로면 다음 빌드에서 이 단계를 캐시로 건너뛴다.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# 2단계: 빌드
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# next.config.ts의 output: "standalone" 때문에 .next/standalone에 실행용 파일이 모인다.
RUN npm run build

# 3단계: 실행
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# 컨테이너 밖(호스트 Nginx)에서 들어오는 요청을 받으려면 0.0.0.0에서 기다려야 한다.
ENV HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/public ./public
# 서버가 미리 그린 페이지 캐시를 쓰는 폴더. node 사용자가 쓸 수 있어야 한다.
RUN mkdir .next && chown node:node .next
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# root가 아닌 사용자로 실행한다.
USER node
EXPOSE 3000
CMD ["node", "server.js"]
