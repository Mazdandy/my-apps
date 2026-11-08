# LOTC — CV Reviewer

Review CV yang jujur, spesifik, dan berbasis bukti. Web app (Vite + React 19) untuk
menilai CV dengan skor ATS, temuan berbasis bukti, dan saran perbaikan.

> Status: **review tersambung ke AI** — AtmoRouter (BYOK, bayar per token) dengan kontrak
> JSON di prompt + validasi zod, plus ekstraksi PDF/DOCX di browser. Yang masih mock:
> **login** dan **riwayat**. Lihat `prd.md` untuk rincian cakupan.

---

## Arsitektur

Aplikasi ini **100% client-side** (static site) dengan satu pengecualian:

- Semua UI, parsing PDF/DOCX (`pdfjs-dist`, `mammoth`), dan riwayat berjalan di browser.
- Panggilan AI tidak bisa langsung dari browser karena AtmoRouter tidak mengirim header
  CORS, jadi ada **proxy PHP same-origin** `public/api/review.php` yang diteruskan dari
  hosting yang sama. Proxy hanya meneruskan request BYOK user ke
  `https://atmorouter.dev/v1/chat/completions` — tidak menyimpan API key maupun isi CV.

API key AtmoRouter (awalan `ar-`) disimpan user di localStorage browser masing-masing.

## Local Dev

App ini bagian dari monorepo `my-apps` — satu lockfile di root repo, jadi install dari sana:

```bash
# dari root my-apps
npm install --include=dev
npm run dev --workspace=lotc-cv-reviewer    # http://localhost:5173
```

> Catatan: di dev lokal, `api/review.php` tidak dijalankan Vite (butuh PHP). Untuk mencoba
> alur review penuh, jalankan `php -S` untuk folder `public/api/` atau deploy ke hosting.
> `VITE_ATMOROUTER_MODEL` (opsional) mengubah model default `cbcn/glm-5.3-flash`.

## Build & Deploy (cPanel)

```bash
# dari root monorepo
npm run build --workspace=lotc-cv-reviewer
```

Hasil build ada di `cv-reviewer/dist/` — **termasuk `api/review.php`** (disalin dari
`public/`). Upload seluruh isi `dist/` ke folder public hosting cPanel (mis.
`public_html/cv/`), pastikan:

1. Domain/subdomain menunjuk ke folder itu.
2. PHP aktif (proxy butuh ekstensi `curl`, standar di cPanel).
3. `BASE_PATH` saat build disesuaikan: untuk subfolder `https://domain.com/cv/` gunakan
   `BASE_PATH=/cv/ npm run build --workspace=lotc-cv-reviewer`; untuk root domain,
   `BASE_PATH=/`.

Tidak ada server-side state, database, atau storage yang dibutuhkan — 1 GB hosting
cukup berlebih.
