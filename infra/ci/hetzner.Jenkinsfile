// Mirror of the Hetzner Jenkins job's inline pipeline (job: 이승환 개인 홈페이지 (seung-hwan.com)). Based on the 애자일러너 job.
def notifyDiscord(String status) {
  try {
    withEnv(["DISCORD_STATUS=${status}"]) {
      withCredentials([string(credentialsId: env.DISCORD_CREDENTIAL_ID, variable: 'DISCORD_WEBHOOK_URL')]) {
        sh '''
set +x
branch="${GIT_BRANCH:-${BRANCH:-}}"
[ -n "$branch" ] || branch="-"
commit="${GIT_COMMIT:-unknown}"
short_commit="$(printf '%s' "$commit" | cut -c1-12)"
failed_stage="${FAILED_STAGE:-}"
[ -n "$failed_stage" ] || failed_stage="-"

case "$DISCORD_STATUS" in
  SUCCESS)
    status_label="성공"
    color=3066993
    description="${PROJECT_NAME} 배포가 끝났습니다."
    ;;
  ABORTED)
    status_label="중단"
    color=9807270
    description="${PROJECT_NAME} 배포가 중단됐습니다."
    ;;
  *)
    status_label="실패"
    color=15158332
    description="${PROJECT_NAME} 배포가 ${failed_stage} 단계에서 멈췄습니다."
    ;;
esac

build_url="${BUILD_URL:-}"
[ -n "$build_url" ] || build_url="https://jenkins.sonic8-8.com/job/${JOB_NAME}/${BUILD_NUMBER}/"

jq -n \
  --arg title "${PROJECT_NAME} 배포 ${status_label}" \
  --arg description "$description" \
  --arg build "#${BUILD_NUMBER}" \
  --arg branch "$branch" \
  --arg commit "$short_commit" \
  --arg stage "$failed_stage" \
  --arg url "$build_url" \
  --argjson color "$color" \
  '{embeds: [{title: $title, description: $description, color: $color, url: $url, fields: [{name: "빌드", value: $build, inline: true}, {name: "브랜치", value: $branch, inline: true}, {name: "커밋", value: $commit, inline: true}, {name: "단계", value: $stage, inline: true}, {name: "Jenkins", value: ("[빌드 로그](" + $url + ")"), inline: false}]}]}' \
  > .discord-payload.json
curl -fsS -H "Content-Type: application/json" --data @.discord-payload.json "$DISCORD_WEBHOOK_URL" >/dev/null || true
        '''
      }
    }
  } catch (err) {
    echo 'Discord notification skipped.'
  }
}

pipeline {
  agent any

  triggers { githubPush() }

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    PROJECT_NAME = '이승환'
    REPO_URL = 'https://github.com/sonic8-8/seung-hwan.git'
    BRANCH = '*/main'
    APP_HOST = '167.233.204.148'
    APP_DIR = '/srv/apps/seung-hwan'
    DISCORD_CREDENTIAL_ID = 'discord-seung-hwan-webhook-url'
  }

  stages {
    stage('Checkout') {
      steps {
        script { env.FAILED_STAGE = 'Checkout' }
        checkout([$class: 'GitSCM', branches: [[name: env.BRANCH]], userRemoteConfigs: [[url: env.REPO_URL]]])
        sh 'git log -1 --oneline'
      }
    }

    stage('Sync') {
      steps {
        script { env.FAILED_STAGE = 'Sync' }
        withCredentials([sshUserPrivateKey(credentialsId: 'app-deploy-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
          sh '''
set -eu
# The job name has spaces, so the key path does too. Quote it so rsync keeps it as one argument.
RSYNC_RSH="ssh -i '${SSH_KEY}' -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
ssh -i "${SSH_KEY}" -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new "${SSH_USER}@${APP_HOST}" "mkdir -p ${APP_DIR}/source"
rsync -az --delete \
  -e "${RSYNC_RSH}" \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude '.next' \
  ./ "${SSH_USER}@${APP_HOST}:${APP_DIR}/source/"
          '''
        }
      }
    }

    stage('Deploy') {
      steps {
        script { env.FAILED_STAGE = 'Deploy' }
        withCredentials([sshUserPrivateKey(credentialsId: 'app-deploy-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
          sh '''
set -eu
ssh -i "${SSH_KEY}" -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new "${SSH_USER}@${APP_HOST}" <<'REMOTE'
set -eu
cd /srv/apps/seung-hwan
docker compose -f source/infra/docker/docker-compose.runtime.yml up -d --build
REMOTE
          '''
        }
      }
    }

    stage('Verify') {
      options { timeout(time: 2, unit: 'MINUTES') }
      steps {
        script { env.FAILED_STAGE = 'Verify' }
        withCredentials([sshUserPrivateKey(credentialsId: 'app-deploy-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
          sh '''
set -eu
# sh -s keeps login-shell exit hooks from changing the check's exit status (see suri-map #64).
ssh -i "${SSH_KEY}" -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new "${SSH_USER}@${APP_HOST}" sh -s <<'REMOTE'
set -eu
attempt=0
while [ "$attempt" -lt 30 ]; do
  attempt=$((attempt + 1))
  if curl --fail --silent --output /dev/null --max-time 2 http://127.0.0.1:18084/; then
    echo "seung-hwan responded 200; attempt=${attempt}"
    exit 0
  fi
  sleep 2
done
echo 'seung-hwan did not respond on 127.0.0.1:18084' >&2
exit 1
REMOTE
          '''
        }
      }
    }
  }

  post {
    success { script { notifyDiscord('SUCCESS') } }
    failure { script { notifyDiscord('FAILURE') } }
    aborted { script { notifyDiscord('ABORTED') } }
  }
}
