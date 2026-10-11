#!/usr/bin/env bash
#
# macOS 一键停止：停止并移除本地全栈（web + admin + api）容器。
#
# 用法:
#   ./deploy/scripts/stop.sh            # 停止并移除容器与网络
#   ./deploy/scripts/stop.sh --purge    # 同时删除本机构建的镜像
#   ./deploy/scripts/stop.sh --help
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
COMPOSE_FILE="${ROOT_DIR}/deploy/compose/full.yaml"

PURGE=0

usage() {
  cat <<'USAGE'
停止并移除本地全栈（web + admin + api）容器。

用法:
  ./deploy/scripts/stop.sh [选项]

选项:
  --purge      同时删除本机构建的镜像（下次启动会重新构建）
  --help, -h   显示本帮助
USAGE
}

for arg in "$@"; do
  case "$arg" in
    --purge) PURGE=1 ;;
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

if ! docker info >/dev/null 2>&1; then
  echo "✗ Docker 守护进程未运行，无需停止。" >&2
  exit 1
fi

if [ "${PURGE}" -eq 1 ]; then
  echo "→ 停止并移除容器，同时删除本机构建镜像…"
  docker compose -f "${COMPOSE_FILE}" down --remove-orphans --rmi local
else
  echo "→ 停止并移除容器…"
  docker compose -f "${COMPOSE_FILE}" down --remove-orphans
fi

echo "✓ 已停止（compose 项目: modu-dev）"
