# my-apps

Monorepo berisi aplikasi-aplikasi personal (Dwi Fajar Dandy Saputra / Mazdandy).

## Struktur

```
my-apps/
├── wedding/          # Undangan website (Next.js 16 + Prisma) — submodule
├── yt-downloader/    # Video downloader (Express + Next.js) — submodule
├── landing-page/     # Landing page / portfolio (HTML+CSS+JS) — submodule
└── cv-reviewer/      # CV reviewer (Next.js 15) — folder biasa (belum ada repo)
```

| Folder | Teknologi | Repo |
|---|---|---|
| `wedding` | Next.js 16 + Prisma (SQLite) | github.com/Mazdandy/Wedding-Project |
| `yt-downloader` | Express + Next.js 14 | github.com/Mazdandy/yt-downloader |
| `landing-page` | HTML/CSS/JS statis | github.com/Mazdandy/profile |
| `cv-reviewer` | Next.js 15 | *(belum punya repo)* |

## Setup

```bash
# Clone monorepo + semua submodule
git clone --recurse-submodules git@github.com:Mazdandy/my-apps.git
cd my-apps

# Atau, jika sudah ter-clone tanpa submodule:
git submodule update --init --recursive
```

## Menjalankan setiap app

Setiap app berdiri sendiri (bukan npm workspace) — masuk ke folder masing-masing
lalu jalankan sesuai README-nya:

```bash
cd wedding && npm install && npm run dev            # http://localhost:3000
cd yt-downloader && cd backend && npm run dev        # API :8787
cd cv-reviewer && npm install && npm run dev         # http://localhost:3000
cd landing-page && python3 -m http.server 8000       # http://localhost:8000
```

## Workflow submodule

Submodule adalah repo git terpisah. Perubahan dikerjakan dan di-push dari dalam
folder masing-masing:

```bash
cd wedding
git add . && git commit -m "fix: ..." && git push
cd ..
git add wedding          # catat commit baru submodule di monorepo
git commit -m "chore: bump wedding submodule"
```

> **Catatan:** root monorepo mencatat pointer commit submodule, bukan isinya.
> Setelah `git pull` di submodule, jalankan `git submodule update` di root.
