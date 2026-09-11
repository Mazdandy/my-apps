# my-apps

Monorepo (npm workspaces) berisi aplikasi-aplikasi personal (Dwi Fajar Dandy Saputra / Mazdandy).
Satu `package-lock.json` di root untuk semua app — jangan buat lockfile per-app.

## Struktur

```
my-apps/                   # root workspace, satu lockfile
├── wedding/               # Undangan website (Next.js + Prisma + SQLite)
├── qa-helper/             # QA helper (Next.js + Prisma + SQLite)
├── cv-reviewer/           # CV reviewer (Next.js)
├── yt-downloader/
│   ├── frontend/          # Next.js
│   └── backend/           # Express 5 (TypeScript)
└── landing-page/          # HTML/CSS/JS statis — TIDAK ikut workspace
```

`wedding`, `qa-helper`, `cv-reviewer`, dan kedua app di `yt-downloader` terdaftar di
`workspaces`. `landing-page` hanya folder statis tanpa `package.json`, jadi tidak ikut
`npm run dev/build/lint` di root.

## Versi utama

| Paket | Versi |
|---|---|
| Node.js | >= 22 |
| Next.js | 16.3.4 |
| React / React DOM | 19.3.0 |
| Tailwind CSS | 4.3.3 |
| Prisma | 7.10.0 |
| Express | 5.2.1 |
| TypeScript | 7.0.2 (build) — 6.0.3 di root untuk tooling ESLint |
| ESLint | 9.39.5 (`eslint-config-next` belum mendukung ESLint 10) |

## Setup

```bash
npm install --include=dev
```

> **Penting:** kalau shell kamu punya `NODE_ENV=production`, npm melewati devDependencies
> (TypeScript, ESLint, Tailwind) dan build akan gagal. Pakai `--include=dev` seperti di atas.

`qa-helper` menjalankan `prisma generate` otomatis lewat `postinstall`. Untuk `wedding`,
generate manual bila perlu:

```bash
cd wedding && npx prisma generate
```

## Menjalankan app

Semua app `next dev` default ke port 3000, jadi tentukan port saat jalan bareng:

```bash
npm run dev --workspace=yt-downloader/backend          # API   :8787
npm run dev --workspace=yt-downloader/frontend         # web   :3000
npm run dev --workspace=wedding -- -p 3001             # web   :3001
npm run dev --workspace=cv-reviewer -- -p 3002         # web   :3002
npm run dev --workspace=qa-helper -- -p 3003           # web   :3003

cd landing-page && python3 -m http.server 8000         # statis:8000
```

Database SQLite tiap app (Prisma):

```bash
npm run db:migrate --workspace=wedding   # prisma migrate dev
npm run db:studio  --workspace=wedding   # prisma studio
```

## Build & lint

```bash
npm run build      # semua workspace
npm run lint
npm run typecheck  # hanya workspace yang punya script ini (saat ini: yt-downloader/backend)
```

Untuk satu app: `npm run build --workspace=wedding`.

## Deploy

### VPS (systemd, tanpa Docker)

Tiap app punya `deploy/install-services.sh` + unit di `deploy/systemd/`.

```bash
# dari root monorepo
npm run build --workspace=wedding
cd wedding && bash deploy/install-services.sh
```

Output Next.js **standalone** menyalin struktur workspace, jadi `server.js` tidak lagi
langsung di `.next/standalone/`:

| App | Lokasi `server.js` |
|---|---|
| wedding | `.next/standalone/wedding/server.js` |
| cv-reviewer | `.next/standalone/cv-reviewer/server.js` |
| yt-downloader/frontend | `frontend/.next/standalone/yt-downloader/frontend/server.js` |

`install-services.sh` mencari lokasi itu sendiri (`find`) lalu mengisi `__SERVER_JS__` di unit
systemd, jadi tidak perlu diubah manual kalau struktur berubah.

### Docker

Lockfile hanya ada di root, jadi **build context harus root monorepo**:

```bash
docker build -f yt-downloader/backend/Dockerfile  -t vdl-backend  .
docker build -f yt-downloader/frontend/Dockerfile -t vdl-frontend .
```

`.dockerignore` diletakkan di root (file `.dockerignore` per-app sudah dihapus). Untuk Render,
lihat `yt-downloader/backend/render.yaml`. Untuk Railway, set **Root Directory** service ke
root repo, bukan `backend/`.
