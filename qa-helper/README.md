# QA-Helper

Web app bantu QA — **brainstorm Test Strategy, Test Plan, dan Test Case**
dari dokumen PRD (paste teks atau upload `.pdf` / `.docx` / `.txt` / `.md`).
Draf awal dibuat berbasis template & aturan (tanpa AI), sehingga cepat,
deterministik, dan data tidak dikirim ke layanan eksternal.

> Status: MVP v0.1 + Test Case Management. Spesifikasi lengkap: [`PRD.md`](./PRD.md).

## Fitur

- **Brainstorm QA Docs**: input PRD → review ringkasan otomatis (judul, modul,
  requirement) → pilih jenis dokumen → draf siap edit.
- Output dalam Markdown: bisa **disalin**, **diunduh**, atau **disimpan sebagai
  sesi** untuk dibuka/diedit lagi.
- **Test Case Management**: kelola test case per sesi — cari, filter (modul &
  prioritas), tambah/edit/hapus, export CSV atau Markdown. Test case yang
  di-brainstorm otomatis tersimpan terstruktur untuk dikelola di sini.
- Dashboard & daftar sesi terbaru; placeholder menu fase berikutnya
  (Test Execution, Test Report).

## Tech Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Prisma 7 + SQLite via `@prisma/adapter-better-sqlite3` (pola sama dengan
  aplikasi `wedding` di monorepo ini)
- `mammoth` (ekstraksi .docx), `pdf-parse` (ekstraksi .pdf)

## Setup

```bash
cp .env.example .env        # DATABASE_URL="file:./dev.db"
npm install                 # otomatis menjalankan prisma generate (postinstall)
npm run db:migrate          # migrate + generate client + buat prisma/dev.db
npm run dev                 # http://localhost:3000
```

Catatan: folder `src/generated/prisma` (hasil generate) dan `prisma/dev.db*`
di-gitignore — jalankan `npm run db:migrate` setelah clone.

## Script

| Script | Fungsi |
|---|---|
| `npm run dev` | Jalankan dev server |
| `npm run build` / `start` | Build & jalankan production |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Prisma migrate dev |
| `npm run db:studio` | Buka Prisma Studio |

## Struktur

```
src/
├── app/
│   ├── api/
│   │   ├── extract/          # POST — ekstrak teks dari file upload
│   │   └── sessions/         # CRUD sesi brainstorm
│   ├── brainstorm/           # Wizard brainstorm (client)
│   ├── sessions/[id]/        # Detail sesi — edit & export
│   ├── testcases/            # Test Case Management
│   │   ├── page.tsx          # Daftar sesi + jumlah test case
│   │   └── [id]/             # Kelola test case per sesi (CRUD, export)
│   ├── layout.tsx            # Root layout + AppShell (sidebar)
│   └── page.tsx              # Dashboard
├── components/               # AppShell, Badge
├── lib/
│   ├── db.ts                 # Prisma client singleton
│   ├── types.ts              # Shared types (StrategyDoc, TestCase, dll)
│   ├── prd-analysis.ts       # Rule-based: analisis PRD (modul, requirement)
│   └── qadocs-generator.ts   # Rule-based: generate Strategy/Plan/TestCase
└── generated/prisma/         # Prisma client (auto-generated)
```
