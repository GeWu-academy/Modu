#!/usr/bin/env bash
#
# macOS 一键启动：把本地全栈（web + admin + api）全部拉起。
#
# 用法:
#   ./deploy/scripts/start.sh               # 构建并后台启动
#   ./deploy/scripts/start.sh --no-build    # 不重新构建，直接启动
#   ./deploy/scripts/start.sh --logs        # 启动后跟随日志（Ctrl+C 退出日志，容器继续运行）
#   ./deploy/scripts/start.sh --help
#
# 端口冲突（如本机 3000 已被占用）时可改宿主端口:
#   WEB_HOST_PORT=3001 ADMIN_HOST_PORT=8082 API_HOST_PORT=8080 ./deploy/scripts/start.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
COMPOSE_FILE="${ROOT_DIR}/deploy/compose/full.yaml"

# Host ports; keep in sync with full.yaml defaults so the printed URLs are correct.
WEB_PORT="${WEB_HOST_PORT:-3000}"
ADMIN_PORT="${ADMIN_HOST_PORT:-8081}"
API_PORT="${API_HOST_PORT:-8080}"

BUILD_ARGS=("--build")
FOLLOW_LOGS=0

usage() {
  cat <<'USAGE'
把本地全栈（web + admin + api）一次拉起。

用法:
  ./deploy/scripts/start.sh [选项]

选项:
  --no-build   不重新构建镜像，直接启动已有镜像
  --logs, -f   启动后跟随容器日志
  --help, -h   显示本帮助

宿主端口可用环境变量覆盖（默认 3000 / 8081 / 8080）:
  WEB_HOST_PORT  ADMIN_HOST_PORT  API_HOST_PORT

启动后（默认端口）:
  web    http://localhost:3000
  admin  http://localhost:8081
  api    http://localhost:8080/health
停止: ./deploy/scripts/stop.sh
USAGE
}

for arg in "$@"; do
  case "$arg" in
    --no-build) BUILD_ARGS=() ;;
    --logs|-f) FOLLOW_LOGS=1 ;;
    --help|-h) usage; exit 0 ;;
    *)
      echo "未知选项: $arg" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if ! command -v docker >/dev/null 2>&1; then
  echo "✗ 未找到 docker 命令。请先安装 Docker Desktop:" >&2
  echo "  https://www.docker.com/products/docker-desktop/" >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "✗ 未找到 'docker compose'。请使用带 Compose v2 的 Docker Desktop。" >&2
  exit 1
fi

# 等待 Docker 守护进程就绪（macOS 上常见于刚打开 Docker Desktop 时）。
if ! docker info >/dev/null 2>&1; then
  echo "… Docker 守护进程未运行，正在尝试启动 Docker Desktop（最多等待 120 秒）"
  if [ "$(uname -s)" = "Darwin" ] && [ -d "/Applications/Docker.app" ]; then
    open -a Docker >/dev/null 2>&1 || true
  fi
  waited=0
  until docker info >/dev/null 2>&1; do
    if [ "$waited" -ge 120 ]; then
      echo
      echo "✗ Docker 守护进程仍未就绪。请手动启动 Docker Desktop 后重试。" >&2
      exit 1
    fi
    sleep 3
    waited=$((waited + 3))
    printf '.'
  done
  echo
fi

# 提前检查宿主端口占用，避免 compose 中途失败、留下半启动状态。
port_busy() {
  if command -v lsof >/dev/null 2>&1; then
    lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
  else
    return 1
  fi
}

conflict=0
for entry in "web:${WEB_PORT}" "admin:${ADMIN_PORT}" "api:${API_PORT}"; do
  name="${entry%%:*}"
  port="${entry##*:}"
  if port_busy "${port}"; then
    echo "✗ 宿主端口 ${port}（${name}）已被占用。" >&2
    conflict=1
  fi
done
if [ "${conflict}" -eq 1 ]; then
  echo "  请先释放端口，或改用其它宿主端口，例如:" >&2
  echo "  WEB_HOST_PORT=3001 ./deploy/scripts/start.sh" >&2
  exit 1
fi

echo "→ 构建并启动全栈服务（web + admin + api）…"
docker compose -f "${COMPOSE_FILE}" up ${BUILD_ARGS[@]+"${BUILD_ARGS[@]}"} -d

echo
echo "✓ 已启动（compose 项目: modu-dev）"
echo "  web    http://localhost:${WEB_PORT}"
echo "  admin  http://localhost:${ADMIN_PORT}"
echo "  api    http://localhost:${API_PORT}/health"
echo
docker compose -f "${COMPOSE_FILE}" ps
echo
echo "查看日志: docker compose -f ${COMPOSE_FILE} logs -f"
echo "停止服务: ${SCRIPT_DIR}/stop.sh"

if [ "${FOLLOW_LOGS}" -eq 1 ]; then
  echo
  echo "→ 跟随日志中，按 Ctrl+C 退出（容器继续运行）…"
  docker compose -f "${COMPOSE_FILE}" logs -f
fi
