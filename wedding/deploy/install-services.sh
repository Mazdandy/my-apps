#!/usr/bin/env bash
# ============================================================
# Install or update the systemd service for the Wedding app.
# Run after git pull to redeploy:
#   bash deploy/install-services.sh && sudo systemctl restart faas-wedding
# ============================================================
set -euo pipefail

# Resolve from this script's own location (deploy/ sits inside the app folder) so it
# works from any cwd, with or without APP_DIR set.
APP_DIR="${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
APP_DIR="$(cd "$APP_DIR" && pwd)"
UNIT_DIR="$APP_DIR/deploy/systemd"

echo "Using app dir: $APP_DIR"
[ -d "$UNIT_DIR" ] || { echo "systemd unit dir missing: $UNIT_DIR"; exit 1; }

echo "==> Preparing Next.js standalone runtime ..."
# Standalone output mirrors the workspace layout, so server.js can be nested
# (e.g. .next/standalone/wedding/server.js) instead of sitting directly at
# .next/standalone/server.js. Locate it, then place .next/static + public beside
# it, which is where the standalone runtime expects them.
SERVER_JS="$(find "$APP_DIR/.next/standalone" -maxdepth 4 -type f -name server.js -print -quit 2>/dev/null || true)"
[ -n "$SERVER_JS" ] || { echo "standalone server.js not found under $APP_DIR/.next/standalone — run 'npm run build' first"; exit 1; }
SERVER_DIR="$(dirname "$SERVER_JS")"
echo "    server.js: $SERVER_JS"

mkdir -p "$SERVER_DIR/.next"
cp -r "$APP_DIR/.next/static" "$SERVER_DIR/.next/static"
[ -d "$APP_DIR/public" ] && cp -r "$APP_DIR/public" "$SERVER_DIR/public"

echo "==> Installing systemd unit ..."
sudo mkdir -p /etc/systemd/system
sudo sed -e "s|__APP_DIR__|$APP_DIR|g" \
         -e "s|__SERVER_JS__|$SERVER_JS|g" \
         -e "s|__USER__|$USER|g" \
  "$UNIT_DIR/faas-wedding.service" > /etc/systemd/system/faas-wedding.service

echo "==> Enabling + starting service ..."
sudo systemctl daemon-reload
sudo systemctl enable faas-wedding
sudo systemctl restart faas-wedding

echo ""
echo "Service installed. Status:"
systemctl --no-pager status faas-wedding --no-legend 2>/dev/null | grep -E "Active|●" || true
echo ""
echo "Logs: journalctl -u faas-wedding -f"
