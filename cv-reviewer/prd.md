# PRD — LOTC - CV Reviewer

| Field | Value |
|---|---|
| Nama Produk | LOTC - CV Reviewer |
| Versi Dokumen | 1.1 |
| Tanggal | 2026-08-18 |
| Status | Final Draft |
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
| Styling | **Tailwind CSS + shadcn/ui** |
| Auth | **Firebase Authentication** (Wajib Login) |
| Database | **Cloud Firestore** (Menyimpan `cvText` & hasil review) |
| AI Model | **Google Gemini (flash tier)** via API key |

---

## 6. Alur Pengguna (User Flow)

1. **Landing Page**: Penjelasan singkat & tombol Login.
2. **Login**: Autentikasi via Firebase.
3. **Dashboard/Upload**: Input CV & Job Description.
4. **Processing**: Ekstraksi teks & analisis AI.
5. **Result**: Tampilan skor, temuan, dan saran perbaikan.
6. **History**: Melihat review sebelumnya dan membandingkan skor.
