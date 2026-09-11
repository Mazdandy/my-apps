#!/usr/bin/env bash
# ============================================================
# Install or update the systemd services for LOTC - Video Downloader.
# Run after git pull to redeploy:
#   bash deploy/install-services.sh && sudo systemctl restart vdl-backend vdl-frontend
# ============================================================
set -euo pipefail

# Resolve from this script's own location (deploy/ sits inside the app folder) so it
# works from any cwd, with or without APP_DIR set.
APP_DIR="${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
APP_DIR="$(cd "$APP_DIR" && pwd)"
UNIT_DIR="$APP_DIR/deploy/systemd"

echo "Using app dir: $APP_DIR"
[ -d "$UNIT_DIR" ] || { echo "systemd unit dir missing: $UNIT_DIR"; exit 1; }

echo "==> Preparing frontend standalone runtime ..."
# Standalone output mirrors the workspace layout, so server.js can be nested
# (e.g. frontend/.next/standalone/yt-downloader/frontend/server.js) instead of
# sitting directly at .next/standalone/server.js. Locate it, then place
# .next/static + public beside it, which is where the runtime expects them.
SERVER_JS="$(find "$APP_DIR/frontend/.next/standalone" -maxdepth 5 -type f -name server.js -print -quit 2>/dev/null || true)"
[ -n "$SERVER_JS" ] || { echo "standalone server.js not found under $APP_DIR/frontend/.next/standalone — run 'npm run build' first"; exit 1; }
SERVER_DIR="$(dirname "$SERVER_JS")"
echo "    server.js: $SERVER_JS"

mkdir -p "$SERVER_DIR/.next"
cp -r "$APP_DIR/frontend/.next/static" "$SERVER_DIR/.next/static"
[ -d "$APP_DIR/frontend/public" ] && cp -r "$APP_DIR/frontend/public" "$SERVER_DIR/public"

echo "==> Installing systemd units ..."
sudo mkdir -p /etc/systemd/system
sudo sed -e "s|__APP_DIR__|$APP_DIR|g" -e "s|__USER__|$USER|g" \
  "$UNIT_DIR/vdl-backend.service"  > /etc/systemd/system/vdl-backend.service
sudo sed -e "s|__APP_DIR__|$APP_DIR|g" \
         -e "s|__SERVER_JS__|$SERVER_JS|g" \
         -e "s|__USER__|$USER|g" \
  "$UNIT_DIR/vdl-frontend.service" > /etc/systemd/system/vdl-frontend.service

echo "==> Enabling + starting services ..."
sudo systemctl daemon-reload
sudo systemctl enable vdl-backend vdl-frontend
sudo systemctl restart vdl-backend vdl-frontend

echo ""
echo "Services installed. Status:"
systemctl --no-pager status vdl-backend vdl-frontend --no-legend 2>/dev/null | grep -E "Active|●" || true
echo ""
echo "Logs: journalctl -u vdl-backend -f   |   journalctl -u vdl-frontend -f"
