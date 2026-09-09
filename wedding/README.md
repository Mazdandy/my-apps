# FAAS Wedding Invitation

Platform undangan digital berlangganan (Subscription-as-a-Service). User berlangganan paket, lalu membuat halaman undangan pernikahan dengan tema, RSVP, ucapan, dan dashboard manajemen tamu.

## Tech Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript
- **Tailwind CSS v4**
- **Prisma 7** + SQLite (`dev.db`), siap migrasi ke Postgres
- **JWT session** (jose) + bcrypt — custom auth, role `ADMIN` / `USER`
- **Mock payment gateway** — seam untuk Midtrans/Xendit

## Setup

```bash
npm install
npm run db:migrate   # buat schema (prisma migrate dev)
npm run seed         # isi data demo
npm run dev
```

Buka http://localhost:3000

### Akun demo

| Role  | Email          | Password |
|-------|----------------|----------|
| Admin | admin@faas.id  | admin123 |
| User  | user@faas.id   | user123  |

Halaman undangan demo: http://localhost:3000/u/raka-ayu

## Struktur

```
src/
  app/            # routes (landing, auth, u/[slug], dashboard, admin)
  components/     # UI + form + invitation components
  lib/
    actions/      # server actions (auth, invitations, guests, subscription, admin)
    db.ts         # Prisma client (better-sqlite3 adapter)
    session.ts    # JWT session (jose)
    dal.ts        # data access layer (verifySession)
  generated/      # generated Prisma client (jangan diedit)
prisma/
  schema.prisma
  seed.ts
proxy.ts          # Next 16 middleware — proteksi /dashboard & /admin
```

## Fitur (M0 MVP)

- **Auth & RBAC**: register/login/logout, JWT cookie, role admin/user
- **Langganan**: paket Free/Pro/Business, mock checkout, riwayat pembayaran
- **Katalog tema**: 5 template seed, detail & preview
- **Public invitation** (`/u/[slug]`): cover + nama tamu personal, countdown, musik, quote, profil mempelai, detail acara + maps, RSVP, ucapan, galeri, story, tanda kasih, dress code, live streaming
- **Smart dashboard (user)**: statistik, daftar undangan, builder, manajemen tamu + link unik, toggle kirim/dibuka, moderasi ucapan
- **Admin console**: statistik platform, manajemen user (role), tema (CRUD), paket (CRUD), pembayaran

## Catatan npm 11

Environment ini punya bug `npm install` yang diam-diam tidak mengekstrak package dengan install scripts (mis. `@tailwindcss/postcss`, `tsx`, `eslint`). Jika package hilang dari `node_modules`, jalankan:

```bash
node scripts/fix-packages.mjs
```

Script ini mengunduh & mengekstrak package yang hilang langsung dari lockfile dan membuat bin link. Jangan jalankan `npm install` setelahnya (bisa memangkas package hasil ekstraksi manual).

## Scripts

```bash
npm run dev          # dev server
npm run build        # production build
npm run seed         # reseed data demo
npm run db:migrate   # prisma migrate dev
npm run db:studio    # prisma studio
```

## Deployment (VPS, systemd + Caddy)

Runs on a VPS alongside the YT Downloader. Caddy routes by subdomain:

- `loveonthe.cloud` → this app (`127.0.0.1:3001`)
- `downloader.loveonthe.cloud` → YT Downloader (`127.0.0.1:3000`, `/api/*` → `8787`)

Requirements: Ubuntu 22.04/24.04 VPS, DNS A records for both domains pointing to the server.

1. **On the server**, clone the repo:
   ```bash
   git clone <your-repo-url> && cd wedding
   ```
2. **Run the setup script** (installs Node 22 + Caddy, builds the app, applies the DB schema + seed, writes the Caddyfile for both subdomains, installs and starts the service):
   ```bash
   bash deploy/setup-vps.sh loveonthe.cloud
   ```
3. Visit `https://loveonthe.cloud` — Caddy provisions the HTTPS cert automatically.

Managed by systemd:

```bash
systemctl status faas-wedding     # check status
journalctl -u faas-wedding -f     # watch logs
```

**Updating after a `git pull`:**

```bash
cd wedding && NODE_ENV=development npm ci && env -u NODE_ENV npm run build
bash deploy/install-services.sh   # copies static assets + reinstalls/restarts service
```

> The `NODE_ENV=development` prefix on `npm ci` is required because npm skips devDependencies (build tools) when `NODE_ENV=production` is set in the shell. The `env -u NODE_ENV` before the build unsets it again so `next build` runs in production mode.

**Notes:**
- The app runs on port `3001` to avoid clashing with the downloader's frontend on `3000`.
- `APP_URL` (set in the systemd unit) drives the share/WhatsApp links — default `https://loveonthe.cloud`.
- SQLite (`dev.db`) lives in the app dir. Back it up regularly (`sqlite3 dev.db ".backup backup.db"` or cron). Switch to Postgres if you ever scale beyond one server.
