#!/usr/bin/env bash
# ============================================================
# LOTC CV Reviewer — VPS setup (no Docker)
# Tested on Ubuntu 22.04/24.04. Run as a normal user with sudo.
#   usage: bash deploy/setup-vps.sh cv.loveonthe.cloud
# This server already hosts (see Wedding + YT Downloader repos):
#   loveonthe.cloud           -> Wedding (127.0.0.1:3001)
#   downloader.loveonthe.cloud-> YT Downloader (frontend :3000, api :8787)
#   cv.loveonthe.cloud        -> THIS app (127.0.0.1:3002)
# ============================================================
set -euo pipefail

DOMAIN="${1:-}"
if [ -z "$DOMAIN" ]; then
  echo "Usage: bash deploy/setup-vps.sh <cv.your-domain.com>"
  echo "  (DNS A record must already point at this server)"
  exit 1
fi

APP_DIR="${APP_DIR:-$HOME/cv-reviewer}"
WEDDING_DOMAIN="${WEDDING_DOMAIN:-loveonthe.cloud}"
DOWNLOADER_DOMAIN="${DOWNLOADER_DOMAIN:-downloader.loveonthe.cloud}"

echo "==> 1/4 Installing system packages (node 22, git, caddy)..."
# NodeSource repo for a current Node
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
fi
sudo apt-get update -y
sudo apt-get install -y nodejs git

# Caddy web server (reverse proxy + automatic HTTPS)
if ! command -v caddy >/dev/null 2>&1; then
  sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  sudo apt-get update -y
  sudo apt-get install -y caddy
fi

echo "==> 2/4 Building app..."
cd "$APP_DIR"
NODE_ENV=development npm ci
env -u NODE_ENV npm run build

echo "==> 3/4 Writing Caddyfile for $DOMAIN (+ $WEDDING_DOMAIN, $DOWNLOADER_DOMAIN)..."
# NOTE: this rewrites the whole Caddyfile, so all three apps on this VPS
# must be listed here or their routes will be dropped.
sudo tee /etc/caddy/Caddyfile >/dev/null <<CADDY
$WEDDING_DOMAIN {
	encode gzip

	# Wedding app (Next.js)
	reverse_proxy 127.0.0.1:3001
}

$DOWNLOADER_DOMAIN {
	encode gzip

	# YT Downloader backend API
	handle /api/* {
		reverse_proxy 127.0.0.1:8787
	}
	# YT Downloader frontend
	handle {
		reverse_proxy 127.0.0.1:3000
	}
}

$DOMAIN {
	encode gzip

	# LOTC CV Reviewer (Next.js)
	reverse_proxy 127.0.0.1:3002
}
CADDY
sudo systemctl reload caddy

echo "==> 4/4 Installing systemd service..."
APP_DIR="$APP_DIR" bash deploy/install-services.sh

echo ""
echo "Done! Service:"
systemctl --no-pager status lotc-cv --no-legend 2>/dev/null | grep -E "Active|●" || true
echo ""
echo "Visit: https://$DOMAIN"
echo "(Caddy provisions the HTTPS cert automatically on first request)"
