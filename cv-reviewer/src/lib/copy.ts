import type { Locale } from "@/lib/prompt";

/**
 * Copy khusus mode statis (GitHub Pages): tidak ada akun, API key disimpan di
 * browser. Semua teks yang berhubungan dengan login/kuota server dibuang dan
 * diganti teks untuk alur BYOK.
 */
const copy = {
  id: {
    privacyTitle: "Privasi terjaga",
    privacyDesc: "File dibaca di browser ini dan tidak diunggah ke server mana pun.",
    characters: "karakter",
    apiKey: {
      title: "API Key AtmoRouter",
      desc: "Key kamu disimpan hanya di browser ini (localStorage) dan dikirim langsung ke AtmoRouter lewat proxy di hosting ini.",
      placeholder: "ar-...",
      save: "Simpan",
      saved: "Tersimpan",
      change: "Ganti",
      remove: "Hapus dari browser",
      help: "Belum punya key? Buat di dashboard AtmoRouter (top-up USDC/QRIS, bayar per token).",
      link: "https://atmorouter.dev/dashboard/keys",
    },
    nav: {
      workspace: "Reviewer tanpa akun",
      secure: "Diproses di browser",
    },
    history: {
      kicker: "ARSIP REVIEW",
      heading: "Lacak perkembangan CV-mu",
      desc: "Riwayat tersimpan di browser ini. Bandingkan skor dan lihat kembali perbaikan dari setiap versi.",
      empty: "Belum ada review. Hasil analisis akan muncul di sini.",
      search: "Cari nama CV atau posisi",
      clear: "Hapus riwayat",
    },
    errors: {
      missing_api_key: "API key AtmoRouter belum diisi atau tidak valid.",
      rate_limited: "Batas kuota AtmoRouter tercapai. Coba lagi nanti.",
      invalid_output: "Hasil analisis tidak valid. Coba lagi.",
      upstream: "Gagal menganalisis CV. Coba lagi.",
    },
  },
  en: {
    privacyTitle: "Stays private",
    privacyDesc: "Files are read in this browser and never uploaded to any server.",
    characters: "characters",
    apiKey: {
      title: "AtmoRouter API Key",
      desc: "Your key is stored only in this browser (localStorage) and sent straight to AtmoRouter through a proxy on this host.",
      placeholder: "ar-...",
      save: "Save",
      saved: "Saved",
      change: "Change",
      remove: "Remove from browser",
      help: "No key yet? Create one in the AtmoRouter dashboard (USDC/QRIS top-up, pay per token).",
      link: "https://atmorouter.dev/dashboard/keys",
    },
    nav: {
      workspace: "No-account reviewer",
      secure: "Runs in the browser",
    },
    history: {
      kicker: "REVIEW ARCHIVE",
      heading: "Track your CV's progress",
      desc: "History lives in this browser. Compare scores and revisit fixes from each version.",
      empty: "No reviews yet. Results will show up here.",
      search: "Search CV name or role",
      clear: "Clear history",
    },
    errors: {
      missing_api_key: "The AtmoRouter API key is missing or invalid.",
      rate_limited: "AtmoRouter quota reached. Try again later.",
      invalid_output: "The analysis result was invalid. Try again.",
      upstream: "Could not analyze the CV. Try again.",
    },
  },
} as const;

export function getCopy(locale: Locale) {
  return copy[locale];
}
