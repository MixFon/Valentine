#!/usr/bin/env bash
set -euo pipefail

# TODO: заполнить перед первым деплоем реальными значениями VPS.
HOST="TODO.example.com"
SSH_PORT=22222
SSH_USER="deploy"
REMOTE_DIR="/opt/valentine"

BIN="bin/valentine"

if [[ ! -f "$BIN" ]]; then
  echo "не найден $BIN — сначала make build" >&2
  exit 1
fi

ssh -p "$SSH_PORT" "$SSH_USER@$HOST" "sudo systemctl stop valentine"
scp -P "$SSH_PORT" "$BIN" "$SSH_USER@$HOST:$REMOTE_DIR/valentine"
ssh -p "$SSH_PORT" "$SSH_USER@$HOST" "sudo systemctl start valentine"
