# PRD — QA-Helper

> Product Requirements Document

| | |
|---|---|
| **Nama Produk** | QA-Helper |
| **Versi** | 0.1 (MVP) |
| **Tanggal** | 2026-09-07 |
| **Status** | Draft — menunggu review |
| **Owner** | Mazdandy |

---

## 1. Ringkasan Produk

QA-Helper adalah web app **single source of truth untuk aktivitas QA**: tempat
brainstorming, menyusun, dan (ke depannya) mengelola dokumen QA seperti **Test
Strategy**, **Test Plan**, dan **Test Case**.

Pada versi awal (MVP), produk ini fokus pada satu kemampuan: membantu QA
**menyusun draf dokumen QA dari dokumen PRD** — baik dengan **paste teks PRD**
maupun **upload file dokumen** — lewat sesi brainstorming terpandu.

Arsitektur produk dirancang multi-menu. Menu lain (manajemen test case,
execution tracking, report, dsb.) akan ditambahkan bertahap di versi berikutnya.

---

## 2. Latar Belakang & Problem Statement

Proses QA biasanya dimulai dari membaca PRD, lalu menuangkan pemahaman menjadi
dokumen Test Strategy, Test Plan, dan Test Case. Problem yang umum terjadi:

- **Memulai dari kosong itu lambat** — menyusun kerangka test plan/strategy
  dari PRD butuh waktu dan mental model yang matang.
- **Format tidak konsisten** — tiap orang/proyek punya gaya dokumen QA sendiri.
- **Dokumen tersebar** — PRD di satu tempat, test case di spreadsheet, hasil
  eksekusi di tempat lain; tidak ada jejak (traceability) PRD → test.
- **Onboarding QA baru lambat** — tidak ada basis pengetahuan yang reusable.

QA-Helper menjawab dengan menyediakan ruang brainstorming yang **terstruktur
dan berulang (reusable)**, berangkat langsung dari input PRD.

---

## 3. Tujuan Produk

1. Mempercepat penyusunan draf Test Strategy, Test Plan, dan Test Case dari
   sebuah PRD.
2. Menjaga konsistensi format dokumen QA lintas proyek.
3. Menjadi fondasi untuk menu-menu QA lain (manajemen & eksekusi test case)
   di fase berikutnya.

### Metrik keberhasilan (usulan, diukur setelah MVP live)

- Waktu penyusunan draf dokumen QA per PRD berkurang (mis. dari jam → menit).
- % test case yang dapat langsung dieksekusi tanpa revisi besar.
- Adopsi: jumlah sesi brainstorm per minggu per pengguna.

---

## 4. Target Pengguna & Persona

| Persona | Kebutuhan |
|---|---|
| **QA Engineer** | Menyusun test strategy/plan/case dengan cepat dari PRD; format konsisten. |
| **QA Lead** | Menjaga standar dokumen QA; mereview hasil brainstorming tim. |
| **Developer (sampingan)** | Membuat test case ringan untuk fitur yang baru ia bangun. |

Asumsi: pengguna paham istilah QA (test strategy, test case, prioritas, dll.)
— produk membantu menyusun, bukan mengajari QA dari nol.

---

## 5. Scope

### 5.1 In Scope (MVP — v0.1)

- Halaman utama/dashboard sederhana berisi navigasi menu.
- Menu **Brainstorm QA Docs** (satu-satunya modul aktif di MVP):
  - Input dokumen PRD via **paste teks** atau **upload file**.
  - Sesi brainstorming terpandu untuk menghasilkan draf:
    1. **Test Strategy** — pendekatan & level testing, scope, risiko.
    2. **Test Plan** — ruang lingkup, jadwal, lingkungan, kriteria keluar.
    3. **Test Case** — skenario fungsional dari requirement PRD.
  - Output draf dapat **disalin** / **di-export** (Markdown), dan **disimpan**
    sebagai sesi yang bisa dibuka lagi.
- Penyimpanan data lokal/database sederhana (belum ada multi-user/auth).

### 5.2 Out of Scope (bukan bagian MVP)

- Eksekusi test & pencatatan hasil (pass/fail/bug).
- Manajemen test case penuh (CRUD, folder, tagging).
- Kolaborasi real-time / multi-user.
- Integrasi dengan tool lain (Jira, CI/CD, dsb.).
- AI/LLM opsional — baru dibahas di fase berikutnya (lihat §10).

---

## 6. Struktur Menu & Navigasi

Desain produk multi-menu. MVP hanya mengaktifkan menu #1; sisanya placeholder.

```
QA-Helper
├── Dashboard                      [aktif — ringkasan & pintu masuk]
├── 1. Brainstorm QA Docs          [AKTIF di MVP]
│     ├── Test Strategy
│     ├── Test Plan
│     └── Test Case
├── 2. Test Case Management        [placeholder — fase 2]
├── 3. Test Execution              [placeholder — fase 3]
├── 4. Test Report                 [placeholder — fase 3+]
└── Settings                       [aktif minimal: hapus data / preferensi]
```

Menu placeholder tetap tampil tapi diberi label **"Segera hadir"** agar arah
produk terlihat sejak awal.

---

## 7. Alur Pengguna (MVP)

### 7.1 Alur utama — Brainstorm dari PRD

1. Pengguna membuka menu **Brainstorm QA Docs**.
2. Pengguna **paste teks PRD** atau **upload file** (format: `.pdf`, `.docx`,
   `.txt`, `.md`).
3. Sistem menampilkan **ringkasan PRD** (judul, fitur/modul yang terdeteksi,
   poin requirement) untuk dikonfirmasi pengguna.
4. Pengguna memilih output yang ingin di-brainstorm:
   - Test Strategy, dan/atau
   - Test Plan, dan/atau
   - Test Case.
5. Sistem memandu sesi brainstorming langkah demi langkah (lihat §7.2),
   menghasilkan draf yang **bisa diedit langsung** oleh pengguna.
6. Pengguna **menyimpan sesi** dan/atau **export draf** (Markdown).
7. (Opsional) Membuka kembali sesi dari daftar riwayat untuk melanjutkan.

### 7.2 Bentuk sesi brainstorming

- Sistem memberi **kerangka/template** per jenis dokumen, terisi awal dari
  isi PRD (mis. modul & requirement → kandidat test case).
- Pengguna menjawab/melengkapi poin yang butuh konteks (lingkungan uji,
  prioritas, data test, risiko) lewat pertanyaan terpandu.
- Hasil tiap langkah **dapat direvisi** sebelum dianggap final.

---

## 8. Functional Requirements

Prioritas: **M** = Must (wajib MVP), **S** = Should (penting, bisa menyusul),
**C** = Could (nice to have).

### 8.1 Input Dokumen

| ID | Requirement | Prio |
|---|---|---|
| FR-01 | Pengguna dapat **paste teks PRD** (textarea) dalam jumlah besar. | M |
| FR-02 | Pengguna dapat **upload file** `.pdf`, `.docx`, `.txt`, `.md`. | M |
| FR-03 | Sistem mengekstrak teks dari file yang di-upload. | M |
| FR-04 | Sistem menampilkan feedback error yang jelas bila file gagal dibaca / format tidak didukung. | M |
| FR-05 | Batas ukuran file (mis. 10 MB) dengan pesan yang jelas. | S |

### 8.2 Ringkasan & Analisis PRD

| ID | Requirement | Prio |
|---|---|---|
| FR-10 | Sistem menampilkan ringkasan PRD: judul, daftar fitur/modul, dan requirement utama. | M |
| FR-11 | Pengguna dapat mengoreksi/menambah daftar modul sebelum lanjut. | S |

### 8.3 Brainstorm Test Strategy

| ID | Requirement | Prio |
|---|---|---|
| FR-20 | Sistem menghasilkan draf Test Strategy berisi: tujuan, scope (in/out), level testing, pendekatan per modul, lingkungan, risiko & mitigasi. | M |
| FR-21 | Draf dapat diedit inline sebelum disimpan. | M |

### 8.4 Brainstorm Test Plan

| ID | Requirement | Prio |
|---|---|---|
| FR-30 | Sistem menghasilkan draf Test Plan berisi: ruang lingkup, strategi ringkas, lingkungan/perangkat, jadwal kasar, peran, kriteria keluar (exit criteria). | M |
| FR-31 | Pengguna dapat mengisi bagian yang butuh konteks proyek (jadwal, peran). | M |

### 8.5 Brainstorm Test Case

| ID | Requirement | Prio |
|---|---|---|
| FR-40 | Sistem menghasilkan daftar **kandidat test case** dari requirement PRD (per modul), dengan field: ID, judul, pre-condition, langkah, data test, hasil yang diharapkan. | M |
| FR-41 | Pengguna dapat menambah/mengubah/menghapus test case per baris. | M |
| FR-42 | Prioritas tiap test case (High/Medium/Low) diberi saran awal dan dapat diubah. | S |
| FR-43 | Traceability: tiap test case menunjuk ke requirement/sumber di PRD. | S |

### 8.6 Sesi & Output

| ID | Requirement | Prio |
|---|---|---|
| FR-50 | Sesi brainstorm dapat **disimpan** dan **dibuka kembali**. | M |
| FR-51 | Draf dapat **di-export sebagai Markdown** (satu dokumen per jenis, atau digabung). | M |
| FR-52 | Draf dapat disalin ke clipboard. | C |
| FR-53 | Daftar riwayat sesi dengan pencarian sederhana. | S |

### 8.7 Umum

| ID | Requirement | Prio |
|---|---|---|
| FR-60 | Navigasi menu di sidebar/topbar konsisten di semua halaman. | M |
| FR-61 | Menu yang belum aktif tampil sebagai placeholder "Segera hadir". | S |
| FR-62 | Pengguna dapat menghapus sesi/data yang disimpan. | M |

---

## 9. Non-Functional Requirements

- **Bahasa UI:** Bahasa Indonesia (mengikuti preferensi pengguna), istilah teknis
  QA boleh dipertahankan dalam bahasa Inggris.
- **Privasi data:** Dokumen PRD bersifat sensitif — tidak boleh dikirim ke
  layanan pihak ketiga tanpa persetujuan eksplisit (penting bila nanti memakai
  LLM cloud).
- **Performa:** Paste/upload PRD → ringkasan tampil < 5 detik; penyimpanan sesi
  terasa instan.
- **Responsive:** Layar utama adalah desktop, tapi tetap bisa dipakai di tablet.
- **Reliability:** Draft tidak hilang — autosave/konfirmasi sebelum meninggalkan
  halaman dengan perubahan belum tersimpan.

---

## 10. Tech Stack (Rekomendasi)

Mengikuti ekosistem monorepo `my-apps` (Next.js). Belum final — perlu konfirmasi:

- **Framework:** Next.js (App Router) + TypeScript.
  - Catatan: repo berisi Next.js 14, 15, dan 16; sebaiknya pilih satu versi
    yang seragam untuk memudahkan maintenance.
- **UI:** Tailwind CSS (konsisten dengan app lain).
- **Database:** SQLite via Prisma (pola yang sama dengan `wedding`) — cukup
  untuk data sesi lokal; bisa dimigrasi ke Postgres bila butuh multi-user.
- **File parsing:** library ekstraksi teks untuk PDF & DOCX
  (mis. `pdf-parse`, `mammoth`).
- **AI/LLM (fase berikutnya):** menghasilkan draf awal bisa dibantu LLM, tapi
  MVP harus tetap berfungsi **tanpa LLM** (berbasis template & aturan) agar
  biaya/privasi terkontrol.

---

## 11. Roadmap

| Fase | Isi | Status |
|---|---|---|
| **Fase 0** | PRD & desain dasar | Sekarang |
| **Fase 1 (MVP v0.1)** | Dashboard + Brainstorm QA Docs (input paste/upload, draf strategy/plan/test case, simpan/export) | Belum |
| **Fase 2** | Test Case Management (CRUD penuh, folder/modul, tagging, search) | Rencana |
| **Fase 3** | Test Execution (jalankan & catat hasil) + Test Report | Rencana |
| **Fase 4** | Integrasi (export ke Jira/CSV, CI, dsb.) & kolaborasi | Rencana |

---

## 12. Keputusan Terbuka (Open Questions)

1. **Versi Next.js** mana yang dipakai (14/15/16)?
2. Draft awal cukup berbasis **template/aturan**, atau langsung sertakan
   bantuan LLM? (implikasi biaya & privasi dokumen)
3. Apakah tiap output (strategy/plan/test case) satu sesi terpisah, atau satu
   sesi bisa menghasilkan ketiganya sekaligus? *(PRD ini mengasumsikan:
   pengguna bisa pilih salah satu atau ketiganya dalam satu sesi.)*
4. Perlu tidaknya multi-user/auth sejak awal (saat ini diasumsikan **tidak**).
5. Format export selain Markdown (mis. CSV untuk test case agar bisa dibuka
   di spreadsheet)?

---

## 13. Referensi & Lampiran

- Struktur monorepo: `README.md` di root `my-apps`.
- Folder implementasi produk ini: `qa-helper/` (kosong, menunggu inisialisasi).
