export const translations = {
  id: {
    title: "LOTC — CV Reviewer",
    tagline: "Review CV yang jujur, spesifik, dan berbasis bukti.",
    login: {
      welcome: "Selamat datang",
      subtitle: "Masuk untuk mulai mereview CV-mu.",
      google: "Lanjutkan dengan Google",
      email: "Email",
      password: "Kata sandi",
      enter: "Masuk",
      demo: "Mode demo: gunakan tombol mana pun untuk masuk.",
      terms: "Dengan masuk, kamu menyetujui Ketentuan Layanan dan Kebijakan Privasi.",
      brandTitle: "CV yang kuat dimulai dari feedback yang jujur.",
      brandDesc: "Lihat apa yang recruiter lihat. Temukan bagian yang menghambatmu, lalu perbaiki dengan saran yang konkret."
    },
    nav: {
      review: "Review CV",
      history: "Riwayat",
      workspace: "Workspace pribadi",
      secure: "Data tersimpan secara lokal",
      logout: "Keluar"
    },
    quota: {
      title: "Kuota hari ini",
      remaining: "tersisa",
      reset: "Reset besok pukul 00.00"
    },
    upload: {
      kicker: "ANALISIS BARU",
      heading: "Seberapa kuat CV-mu di mata recruiter?",
      subheading: "Dapatkan penilaian jujur, spesifik, dan berbasis bukti dalam hitungan detik.",
      cvTitle: "Masukkan CV",
      cvDesc: "Unggah file atau tempel isi CV.",
      dropzone: "Tarik file CV ke sini",
      or: "pilih dari perangkat",
      paste: "ATAU TEMPEL TEKS",
      placeholder: "Tempel seluruh isi CV di sini...",
      demoCv: "Gunakan contoh CV",
      jdTitle: "Job Description",
      jdDesc: "Tambahkan lowongan untuk analisis kecocokan.",
      jdPlaceholder: "Tempel job description atau persyaratan posisi yang kamu incar...",
      jdBenefits: "Dengan Job Description, kamu dapat:",
      analyze: "Analisis CV",
      analyzing: "Menganalisis CV..."
    },
    results: {
      kicker: "HASIL ANALISIS",
      heading: "CV-mu cukup kuat, tapi belum meyakinkan.",
      save: "Simpan ringkasan",
      scoreLabel: "SKOR ATS",
      scoreTitle: "Bagus, belum menonjol",
      scoreDesc: "Struktur CV mudah dibaca ATS. Kelemahan terbesar ada pada dampak yang belum terukur.",
      findings: "TEMUAN UTAMA",
      findingsDesc: "hal yang paling menghambat CV-mu",
      evidence: "BUKTI DARI CV",
      before: "SEBELUM",
      after: "SESUDAH",
      back: "Review baru"
    }
  },
  en: {
    title: "LOTC — CV Reviewer",
    tagline: "Honest, specific, and evidence-based CV reviews.",
    login: {
      welcome: "Welcome",
      subtitle: "Sign in to start reviewing your CV.",
      google: "Continue with Google",
      email: "Email",
      password: "Password",
      enter: "Sign In",
      demo: "Demo mode: use any button to enter.",
      terms: "By signing in, you agree to our Terms of Service and Privacy Policy.",
      brandTitle: "A strong CV starts with honest feedback.",
      brandDesc: "See what recruiters see. Find what's holding you back and fix it with concrete advice."
    },
    nav: {
      review: "Review CV",
      history: "History",
      workspace: "Personal Workspace",
      secure: "Data stored locally",
      logout: "Log out"
    },
    quota: {
      title: "Today's Quota",
      remaining: "left",
      reset: "Resets tomorrow at 00:00"
    },
    upload: {
      kicker: "NEW ANALYSIS",
      heading: "How strong is your CV in a recruiter's eyes?",
      subheading: "Get an honest, specific, and evidence-based assessment in seconds.",
      cvTitle: "Insert CV",
      cvDesc: "Upload a file or paste your CV content.",
      dropzone: "Drop CV file here",
      or: "choose from device",
      paste: "OR PASTE TEXT",
      placeholder: "Paste your entire CV content here...",
      demoCv: "Use sample CV",
      jdTitle: "Job Description",
      jdDesc: "Add a job opening for fit analysis.",
      jdPlaceholder: "Paste job description or requirements for the position you're targeting...",
      jdBenefits: "With a Job Description, you can get:",
      analyze: "Analyze CV",
      analyzing: "Analyzing CV..."
    },
    results: {
      kicker: "ANALYSIS RESULT",
      heading: "Your CV is strong, but not yet convincing.",
      save: "Save summary",
      scoreLabel: "ATS SCORE",
      scoreTitle: "Good, not yet outstanding",
      scoreDesc: "CV structure is ATS-friendly. The biggest weakness is impact that hasn't been quantified.",
      findings: "MAIN FINDINGS",
      findingsDesc: "things holding your CV back the most",
      evidence: "EVIDENCE FROM CV",
      before: "BEFORE",
      after: "AFTER",
      back: "New review"
    }
  }
};

export type Language = keyof typeof translations;
export type TranslationKeys = typeof translations.id;
