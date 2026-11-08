# PRD — LOTC - CV Reviewer

| Field | Value |
|---|---|
| Nama Produk | LOTC - CV Reviewer |
| Versi Dokumen | 1.2 |
| Tanggal | 2026-09-18 |
| Status | Implementasi — AI aktif, auth belum |
| Tipe Proyek | Web app portfolio-driven, target biaya operasional Rp0 (free tier) |

---

## 1. Ringkasan Produk

Web app yang memungkinkan pencari kerja mengunggah CV (PDF/DOCX), lalu AI bertindak sebagai **reviewer yang jujur dan tanpa basa-basi** untuk memberikan:

1. **Skor ATS (0–100)** beserta rincian per kategori.
2. **Daftar kekurangan** yang konkret, dengan kutipan bukti dari CV.
3. **Saran perbaikan** yang actionable, termasuk contoh penulisan ulang (before → after).
4. **Analisis kecocokan dengan lowongan** (opsional, jika user menempel Job Description).

Nilai jual utama: bukan "AI yang memuji", tapi AI yang **kritis, spesifik, dan berbasis bukti**.

---

## 2. Masalah & Latar Belakang

| Masalah | Dampak ke User |
|---|---|
| 70%+ CV disaring otomatis oleh ATS sebelum dibaca manusia | Kandidat bagus gagal di tahap paling awal tanpa tahu alasannya |
| Feedback dari teman/mentor cenderung sungkan dan generik ("udah bagus kok") | User tidak pernah tahu kelemahan sebenarnya |
| Tools review CV yang ada umumnya berbayar atau menyembunyikan detail di paywall | Barrier untuk fresh graduate & job switcher |
| User tidak tahu cara menerjemahkan pengalaman menjadi bullet berbasis dampak | Bullet point deskriptif, bukan hasil terukur |

---

## 3. Tujuan & Metrik Keberhasilan

### 3.1 Tujuan Produk
- **G1** — User memahami skor ATS CV-nya dan alasan di baliknya dalam < 1 menit setelah upload.
- **G2** — Setiap temuan (finding) selalu disertai bukti dari CV + saran perbaikan konkret.
- **G3** — Seluruh MVP berjalan di kuota gratis (tanpa kartu kredit / tanpa upgrade plan).

### 3.2 Metrik
| Metrik | Target MVP |
|---|---|
| Waktu upload → hasil tampil | ≤ 30 detik (p90) |
| Success rate ekstraksi teks PDF | ≥ 95% untuk PDF text-based |
| Error rate request AI (gagal/parse invalid) | ≤ 3% |

---

## 4. Requirement Fungsional

### FR-1 — Ingest & Ekstraksi Teks
- Format didukung: `.pdf`, `.docx`, dan paste teks manual.
- Ukuran maksimum: 5 MB.
- **Penyimpanan**: Teks hasil ekstraksi (`cvText`) akan disimpan di database untuk keperluan riwayat dan fitur perbandingan versi.

### FR-2 — Mesin Penilaian ATS
Skor total = weighted sum dari 7 kategori: Parseability, Struktur, Keyword Relevance, Impact, Kejelasan, Konsistensi, dan Higiene Penulisan.

### FR-3 — Persona AI "Penilai Jujur"
- Bersikap seperti recruiter senior yang kritis.
- **Wajib** menyertakan kutipan literal dari CV sebagai bukti.
- Memberikan saran rewrite `before → after`.

### FR-4 — Autentikasi & Kuota
- **Wajib Login**: User harus login (Google/Email) sebelum bisa menggunakan layanan.
- **Kuota**: Limitasi jumlah review per hari untuk menjaga kuota free tier AI API.

### FR-5 — Bahasa (i18n)
- Penjelasan dan interface akan menyesuaikan dengan **bahasa default browser** yang digunakan oleh user.

---

## 5. Arsitektur & Tech Stack (Free Tier First)

| Layer | Pilihan |
|---|---|
| Framework | **Next.js (App Router) + TypeScript** |
| Styling | **CSS murni** (hand-authored, `app/globals.css`) — Tailwind + shadcn/ui dibatalkan saat implementasi |
| Auth | **Belum ada** — Firebase Authentication (Wajib Login) ditunda ke v1.3; login masih mock |
| Database | **Belum ada** — Cloud Firestore ditunda ke v1.3; riwayat masih in-memory |
| AI Model | **Google Gemini** (`gemini-3.5-flash` default, via `@google/genai`), structured JSON output |
| Ekstraksi file | **`mammoth`** (DOCX) + **`pdf-parse` v2** (PDF), dijalankan server-side |

> Catatan: Tailwind dan Firestore di atas adalah rencana awal. Yang benar-benar
> berjalan saat ini mengikuti tabel versi di §7.

---

## 6. Alur Pengguna (User Flow)

1. **Landing Page**: Penjelasan singkat & tombol Login.
2. **Login**: Autentikasi via Firebase.
3. **Dashboard/Upload**: Input CV & Job Description.
4. **Processing**: Ekstraksi teks & analisis AI.
5. **Result**: Tampilan skor, temuan, dan saran perbaikan.
6. **History**: Melihat review sebelumnya dan membandingkan skor.

---

## 7. Riwayat Versi

### v1.2 — 2026-09-18 — Integrasi AI (selesai)

**Cakupan:** review disambungkan ke AI sungguhan + ekstraksi file nyata. Auth dan
penyimpanan sengaja ditunda.

Yang berubah:

- `analyze()` tidak lagi `setTimeout` + skor `82` hardcoded. Frontend memanggil
  `POST /api/extract` (kalau ada file) lalu `POST /api/review`, dan merender hasilnya.
- **Mesin penilaian ATS (FR-2)** diimplementasikan sebagai rubrik berbobot: `parseability` 20,
  `structure` 15, `keywords` 20, `impact` 20, `clarity` 10, `consistency` 8, `hygiene` 7.
  Bobot tinggal di `lib/review.ts` dan diberitahukan ke model hanya sebagai konteks kalibrasi.
  **Skor akhir dihitung server** (`computeAtsScore()`) dari 7 skor kategori yang dikembalikan
  model — awalnya model diminta menghitung sendiri, tapi terbukti tidak konsisten (melaporkan
  39 padahal weighted sum dari kategorinya sendiri 51). Karena itu `score` juga dihapus dari
  skema output AI, sehingga FR-2 terpenuhi secara konstruksi, bukan bergantung kepatuhan model.
- **Persona AI (FR-3)** di-instruksikan lewat `system_instruction`: recruiter senior yang
  kritis, wajib mengutip literal dari CV di tiap temuan, wajib memberi rewrite
  `quote → after`, dilarang mengarang metrik.
- **Ingest (FR-1)**: `.pdf` dan `.docx` diekstrak server-side (`pdf-parse`, `mammoth`);
  paste teks manual tetap didukung. Batas 5 MB divalidasi di klien dan server.
- **Bahasa (FR-5)**: `locale` dikirim dari klien mengikuti bahasa browser; seluruh string
  hasil AI dipaksa ke bahasa itu, sementara `findings.quote` tetap bahasa asli CV. Aturan
  bahasa diletakkan di awal *dan* akhir `system_instruction` — tanpa pengulangan itu, model
  mengikuti bahasa CV (CV Indonesia + `locale: "en"` keluar dalam Bahasa Indonesia).
- Output AI divalidasi skema (zod) sebelum dikirim ke UI. Struct output Gemini memakai
  `response_format.schema` yang diturunkan dari skema zod yang sama.
- **Deploy**: `pdf-parse`, `pdfjs-dist`, dan `mammoth` memuat berkas lewat path saat runtime
  (entry CJS dan PDF worker), yang tidak terlihat oleh file tracing Next. Tanpa
  `outputFileTracingIncludes`, output standalone hanya berisi `esm/` dan setiap upload PDF
  gagal di produksi. Glob-nya relatif ke direktori app (`../node_modules/...`).

**Keputusan provider:** Google Gemini dengan API key sendiri. Tidak memakai token/plan
Command Code karena tidak ada API key publik untuk aplikasi eksternal — model catalog-nya
hanya bisa diakses lewat harness CLI, yang berarti token akun pribadi harus ditaruh di VPS
dan kuota plan pribadi terkuras tiap review publik.

**Sengaja ditunda (bukan selesai):**

| Item | Status | Rencana |
|---|---|---|
| FR-4 Autentikasi (wajib login) | Login masih mock | v1.3 — Firebase Auth |
| FR-4 Kuota harian | Kartu kuota cuma tampilan statis | v1.3 — butuh identitas user dulu |
| Riwayat & perbandingan versi | In-memory, hilang saat reload | v1.3 — Firestore (`cvText` ikut disimpan) |
| Streaming hasil | JSON sekali jalan | Belum dijadwalkan |
| Rate limiting endpoint publik | Belum ada | Perlu sebelum rilis publik |

### v1.1 — 2026-08-18

Draft final PRD; aplikasi masih mockup UI (skor dan temuan hardcoded).
