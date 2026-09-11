#!/usr/bin/env bash
# ============================================================
# FAAS Wedding Invitation — VPS setup (no Docker)
# Tested on Ubuntu 22.04/24.04. Run as a normal user with sudo.
#   usage: bash deploy/setup-vps.sh loveonthe.cloud
# (Downloader already runs on downloader.loveonthe.cloud on this server)
# ============================================================
set -euo pipefail

DOMAIN="${1:-}"
if [ -z "$DOMAIN" ]; then
  echo "Usage: bash deploy/setup-vps.sh <your-domain.com>"
  echo "  (DNS A record must already point at this server)"
  exit 1
fi

# This app is part of the my-apps monorepo, which has a single lockfile at the
# repo root. Resolve paths from this script's own location so the deploy works
# wherever the repo was cloned.
APP_DIR="${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
REPO_ROOT="$(cd "$APP_DIR/.." && pwd)"
[ -f "$REPO_ROOT/package-lock.json" ] || {
  echo "package-lock.json not found at $REPO_ROOT"
  echo "Set APP_DIR to the app folder inside a full my-apps clone (not a standalone app copy)."
  exit 1
}
DOWNLOADER_DOMAIN="${DOWNLOADER_DOMAIN:-downloader.loveonthe.cloud}"

echo "==> 1/5 Installing system packages (node 22, git, caddy)..."
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

echo "==> 2/5 Building app (from monorepo root)..."
cd "$REPO_ROOT"
NODE_ENV=development npm ci --include=dev
env -u NODE_ENV npm run build --workspace=faas-wedding-scaffold

echo "==> 3/5 Setting up database (migrate + seed)..."
cd "$APP_DIR"
# Prisma generates the client during build; apply schema + demo data
npx prisma db push --skip-generate 2>/dev/null || npm run db:migrate
npm run seed

echo "==> 4/5 Writing Caddyfile for $DOMAIN (+ $DOWNLOADER_DOMAIN)..."
sudo tee /etc/caddy/Caddyfile >/dev/null <<CADDY
$DOMAIN {
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
CADDY
sudo systemctl reload caddy

echo "==> 5/5 Installing systemd service..."
APP_DIR="$APP_DIR" bash "$APP_DIR/deploy/install-services.sh"

echo ""
echo "Done! Service:"
systemctl --no-pager status faas-wedding --no-legend 2>/dev/null | grep -E "Active|●" || true
echo ""
echo "Visit: https://$DOMAIN"
echo "(Caddy provisions the HTTPS cert automatically on first request)"
