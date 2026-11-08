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
  hosting yang sama. Proxy membaca API key AtmoRouter dari `api/config.php` (sisi server,
  tidak pernah sampai ke browser) dan hanya meneruskan request ke
  `https://atmorouter.dev/v1/chat/completions` — tidak menyimpan isi CV. Semua pengunjung
  memakai key pemilik situs; pilihan model dikunci di config supaya biaya terkendali.

## Local Dev

App ini bagian dari monorepo `my-apps` — satu lockfile di root repo, jadi install dari sana:

```bash
# dari root my-apps
npm install --include=dev
npm run dev --workspace=lotc-cv-reviewer    # http://localhost:5173
```

> Catatan: di dev lokal, `api/review.php` tidak dijalankan Vite (butuh PHP). Untuk mencoba
> alur review penuh, jalankan `php -S` untuk folder `public/api/` atau deploy ke hosting.

## Build & Deploy (cPanel)

```bash
# dari root monorepo
npm run build --workspace=lotc-cv-reviewer
```

Hasil build ada di `cv-reviewer/dist/` — **termasuk `api/review.php` dan
`api/config.example.php`** (disalin dari `public/`). Upload seluruh isi `dist/` ke folder
public hosting cPanel (mis. `public_html/cv/`), lalu:

1. Duplikat `api/config.example.php` menjadi `api/config.php`, isi API key AtmoRouter
   kamu (awalan `ar-`), set permission `600` via File Manager.
2. Pastikan PHP aktif (proxy butuh ekstensi `curl`, standar di cPanel).
3. `BASE_PATH` saat build disesuaikan: untuk subfolder `https://domain.com/cv/` gunakan
   `BASE_PATH=/cv/ npm run build --workspace=lotc-cv-reviewer`; untuk root domain,
   `BASE_PATH=/`.

Tidak ada server-side state, database, atau storage yang dibutuhkan — 1 GB hosting
cukup berlebih.

> **Catatan biaya:** semua pengunjung memakai saldo AtmoRouter kamu. Kendalikan risiko
> via `Dashboard → Budgets` di atmorouter.dev (batas harga per model) dan isi saldo
> seperlunya. `api/config.php` di-ignore git — jangan pernah commit key asli.
>
> **Rate limit:** `review.php` membatasi **5 review per IP per jam** (counter file di
> `api/../.rate-limit/`, tanpa database). Ubah angkanya di `review.php` bila perlu.
> `api/test-rate-limit.php` adalah unit test CLI (`php api/test-rate-limit.php`).
