#!/usr/bin/env bash
# ============================================================
# Install or update the systemd service for the Wedding app.
# Run after git pull to redeploy:
#   bash deploy/install-services.sh && sudo systemctl restart faas-wedding
# ============================================================
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/wedding}"
APP_DIR="$(cd "$APP_DIR" && pwd)"
UNIT_DIR="$APP_DIR/deploy/systemd"

echo "Using app dir: $APP_DIR"
[ -d "$UNIT_DIR" ] || { echo "systemd unit dir missing: $UNIT_DIR"; exit 1; }

echo "==> Preparing Next.js standalone runtime ..."
# Next.js standalone output needs .next/static + public copied next to server.js
if [ -d "$APP_DIR/.next/standalone" ]; then
  mkdir -p "$APP_DIR/.next/standalone/.next"
  cp -r "$APP_DIR/.next/static" "$APP_DIR/.next/standalone/.next/static"
  [ -d "$APP_DIR/public" ] && cp -r "$APP_DIR/public" "$APP_DIR/.next/standalone/public"
fi

echo "==> Installing systemd unit ..."
sudo mkdir -p /etc/systemd/system
sudo sed -e "s|__APP_DIR__|$APP_DIR|g" -e "s|__USER__|$USER|g" \
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
