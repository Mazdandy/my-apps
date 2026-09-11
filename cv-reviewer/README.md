# LOTC — CV Reviewer

Review CV yang jujur, spesifik, dan berbasis bukti. Web app (Next.js 16 + React 19) untuk
menilai CV dengan skor ATS, temuan berbasis bukti, dan saran perbaikan.

> Status: **mockup/UI prototype** — login, skor, dan hasil review masih simulasi di frontend
> (belum ada Firebase Auth, Firestore, atau Gemini). Lihat `prd.md` untuk target arsitektur.

---

## Local Dev

App ini bagian dari monorepo `my-apps` — satu lockfile di root repo, jadi install dari sana:

```bash
# dari root my-apps
npm install --include=dev
npm run dev --workspace=lotc-cv-reviewer    # http://localhost:3000
```

## Build (production)

```bash
env -u NODE_ENV npm run build --workspace=lotc-cv-reviewer
```

Build menghasilkan output **standalone** (`.next/standalone/cv-reviewer/server.js`) untuk
deploy VPS tanpa Docker, persis pola proyek Wedding & YT Downloader.

> **Penting:** `next.config.ts` menetapkan `outputFileTracingRoot` ke root monorepo (folder
> di atas app ini). Next.js memakai nilai itu sebagai filesystem root untuk resolusi module,
> dan npm workspaces meng-hoist `node_modules` ke root tersebut — kalau diarahkan ke folder
> app, `next` tidak ketemu dan build gagal. Efek sampingnya output standalone menyalin
> struktur workspace, jadi `server.js` berada di `.next/standalone/cv-reviewer/`, bukan
> langsung di `.next/standalone/`. `deploy/install-services.sh` mencari path itu otomatis.

---

## Deployment (VPS, systemd + Caddy)

App ini jalan di VPS yang sama dengan Wedding & YT Downloader, dengan subdomain baru:

| Subdomain | App | Port |
|---|---|---|
| `loveonthe.cloud` | Wedding | 3001 |
| `downloader.loveonthe.cloud` | YT Downloader (frontend `/`, api `/api/*`) | 3000 / 8787 |
| `cv.loveonthe.cloud` | **CV Reviewer** | 3002 |

Requirements: Ubuntu 22.04/24.04 VPS, DNS A record `cv` → IP server.

### 1. Di VPS

cv-reviewer sekarang bagian dari monorepo `my-apps` (satu lockfile di root), jadi yang
di-clone adalah monorepo-nya, bukan repo app ini sendiri:

```bash
cd ~ && git clone <monorepo-url> my-apps && cd my-apps
bash cv-reviewer/deploy/setup-vps.sh cv.loveonthe.cloud
```

Script melakukan: install Node 22 + Caddy, `npm ci` di root monorepo (sekali untuk semua
workspace) + build workspace `lotc-cv-reviewer`, **menulis ulang Caddyfile berisi ketiga
subdomain**, install systemd unit `lotc-cv`, dan restart Caddy.

> Caddyfile ditulis ulang penuh oleh script — ketiga app harus tercantum di dalamnya atau
> route app lain akan hilang. `deploy/setup-vps.sh` sudah memuat semuanya.

### 2. Cek & update

```bash
systemctl status lotc-cv        # status service
journalctl -u lotc-cv -f        # log

# setelah git pull — dari root monorepo
NODE_ENV=development npm ci --include=dev
env -u NODE_ENV npm run build --workspace=lotc-cv-reviewer
bash cv-reviewer/deploy/install-services.sh
```

> `--include=dev` diperlukan karena npm melewati devDependencies (build tools) saat
> `NODE_ENV=production`. `env -u NODE_ENV` sebelum build agar `next build` berjalan dalam
> mode production.
>
> `deploy/install-services.sh` mencari sendiri lokasi standalone `server.js` — di monorepo
> ia ada di `.next/standalone/cv-reviewer/server.js`, bukan langsung di `.next/standalone/`.
