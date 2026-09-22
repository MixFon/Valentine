#!/usr/bin/env bash
set -euo pipefail

# TODO: заполнить перед первым деплоем реальными значениями VPS.
HOST="mrmixfon.ru"
SSH_PORT=22
SSH_USER="root"
REMOTE_DIR="/opt/valentine"

BIN="bin/valentine"

if [[ ! -f "$BIN" ]]; then
  echo "не найден $BIN — сначала make build" >&2
  exit 1
fi

ssh -p "$SSH_PORT" "$SSH_USER@$HOST" "sudo systemctl stop valentine"
scp -P "$SSH_PORT" "$BIN" "$SSH_USER@$HOST:$REMOTE_DIR/valentine"
ssh -p "$SSH_PORT" "$SSH_USER@$HOST" "sudo systemctl start valentine"
