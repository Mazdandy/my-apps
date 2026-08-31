# LOTC — CV Reviewer

Review CV yang jujur, spesifik, dan berbasis bukti. Web app (Next.js 15 + React 19) untuk
menilai CV dengan skor ATS, temuan berbasis bukti, dan saran perbaikan.

> Status: **mockup/UI prototype** — login, skor, dan hasil review masih simulasi di frontend
> (belum ada Firebase Auth, Firestore, atau Gemini). Lihat `prd.md` untuk target arsitektur.

---

## Local Dev

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build (production)

```bash
env -u NODE_ENV npm run build
```

Build menghasilkan output **standalone** (`.next/standalone/server.js`) untuk deploy VPS
tanpa Docker, persis pola proyek Wedding & YT Downloader.

> **Penting:** `next.config.ts` menetapkan `outputFileTracingRoot` ke folder repo ini.
> Folder ini berada di dalam `~/Documents/Project` yang punya package manifest sendiri;
> tanpa setting itu, Next.js menelusuri dari root yang salah dan menyarangkan seluruh
> working directory ke dalam `.next/standalone/`.

---

## Deployment (VPS, systemd + Caddy)

App ini jalan di VPS yang sama dengan Wedding & YT Downloader, dengan subdomain baru:

| Subdomain | App | Port |
|---|---|---|
| `loveonthe.cloud` | Wedding | 3001 |
| `downloader.loveonthe.cloud` | YT Downloader (frontend `/`, api `/api/*`) | 3000 / 8787 |
| `cv.loveonthe.cloud` | **CV Reviewer** | 3002 |

Requirements: Ubuntu 22.04/24.04 VPS, DNS A record `cv` → IP server.

### 1. Push repo ke GitHub

```bash
cd cv-reviewer
git init && git add -A && git commit -m "init"
git remote add origin git@github.com:<kamu>/cv-reviewer.git
git push -u origin main
```

### 2. Di VPS

```bash
cd ~ && git clone <repo-url> cv-reviewer && cd cv-reviewer
bash deploy/setup-vps.sh cv.loveonthe.cloud
```

Script melakukan: install Node 22 + Caddy, `npm ci` + build, **menulis ulang Caddyfile
berisi ketiga subdomain**, install systemd unit `lotc-cv`, dan restart Caddy.

> Caddyfile ditulis ulang penuh oleh script — ketiga app harus tercantum di dalamnya atau
> route app lain akan hilang. `deploy/setup-vps.sh` sudah memuat semuanya.

### 3. Cek & update

```bash
systemctl status lotc-cv        # status service
journalctl -u lotc-cv -f        # log

# setelah git pull
cd ~/cv-reviewer && NODE_ENV=development npm ci && env -u NODE_ENV npm run build
bash deploy/install-services.sh
```

> `NODE_ENV=development` pada `npm ci` diperlukan karena npm melewati devDependencies
> (build tools) saat `NODE_ENV=production`. `env -u NODE_ENV` sebelum build agar
> `next build` berjalan dalam mode production.
