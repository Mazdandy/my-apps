import type {
  PrdSummary,
  StrategyDoc,
  PlanDoc,
  TestCase,
  TestCaseDoc,
  Docs,
  BrainstormOutput,
  DocType,
} from './types'

const HIGH_KW =
  /\b(?:login|log in|sign in|masuk|auth|pembayaran|payment|checkout|bayar|upload|register|daftar)\b/i
const LOW_KW =
  /\b(?:tampilan|tampil|warna|kosmetik|placeholder|minor|layout|desain)\b/i
const API_KW = /\b(?:api|backend|server|service)\b/i
const PAY_KW = /\b(?:pembayaran|payment|checkout|bayar)\b/i
const LOGIN_KW = /\b(?:login|log in|sign in|masuk|auth|register|daftar)\b/i
const UPLOAD_KW = /\b(?:upload|unggah)\b/i
const SEARCH_KW = /\b(?:search|cari|filter|sortir)\b/i

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function modulMatch(modules: string[], text: string): string | null {
  const lower = text.toLowerCase()
  for (const m of modules) {
    const ml = m.toLowerCase()
    if (ml.length < 3) continue
    // cocokkan kata utuh; untuk nama modul 2 kata cocokkan bila salah satu katanya muncul
    const parts = ml.split(/\s+/)
    if (
      parts.some(
        (p) =>
          p.length >= 3 &&
          new RegExp(`\\b${escapeRegExp(p)}\\b`, 'i').test(lower)
      )
    )
      return m
  }
  // fallback sinonim untuk modul umum
  const synonym: [RegExp, RegExp][] = [
    [/login|log in|sign in|masuk|regist|daftar|otentikasi|autentikasi|auth/i, /\b(?:auth|login|masuk|akun)\b/i],
    [/bayar|payment|checkout|transaksi|invoice/i, /\b(?:bayar|payment|checkout|transaksi|invoice|harga|paket)\b/i],
  ]
  for (const [modRe, txtRe] of synonym) {
    const target = modules.find((m) => modRe.test(m))
    if (target && txtRe.test(lower)) return target
  }
  return null
}

function shorten(s: string, max: number): string {
  const t = s.trim().replace(/\s+/g, ' ')
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t
}

function listOrFallback(items: string[], fallback: string[]): string[] {
  return items.length > 0 ? items : fallback
}

export function generateStrategyDoc(s: PrdSummary): StrategyDoc {
  const approach = listOrFallback(
    s.modules.map((m) => {
      const base = `Pendekatan fungsional berbasis requirement pada modul ${m}, prioritas pada alur kritis.`
      if (PAY_KW.test(m))
        return `${base} Validasi skenario pembayaran sukses, gagal, dan dibatalkan.`
      if (LOGIN_KW.test(m))
        return `${base} Validasi skenario autentikasi sukses & gagal, serta otorisasi per peran.`
      return base
    }),
    [
      'Pendekatan fungsional berbasis requirement yang terdeteksi dari PRD, prioritas pada alur kritis.',
    ]
  )

  const levels = [
    'Unit test (bila relevan, untuk modul dengan logika bisnis)',
    'Integration test (alur antar-modul / API)',
    'System / E2E test (alur utama pengguna)',
    'Regression test (menjelang rilis)',
  ]
  const hasApi = s.modules.some((m) => API_KW.test(m))
  if (hasApi) levels.splice(2, 0, 'Contract / API test')

  const env = [
    'Browser: Chrome versi terbaru (primary), Firefox & Safari (secondary)',
    'Resolusi: desktop 1440x900 & mobile 390x844 (mode responsif)',
  ]
  if (hasApi) env.push('Environment API: staging (base URL staging)')

  const risks: StrategyDoc['risks'] = [
    {
      risk: 'Cakupan requirement berubah di tengah siklus',
      mitigation:
        'Lock requirement baseline setelah kickoff; perubahan lewat change request.',
    },
    {
      risk: 'Data test tidak tersedia / tidak valid',
      mitigation:
        'Siapkan dataset & akun test sejak awal, dokumentasikan di test plan.',
    },
    {
      risk: 'Ketergantungan ke pihak ketiga (payment, notifikasi, OAuth)',
      mitigation:
        'Gunakan mock/stub saat integrasi belum siap; jadwalkan contract test.',
    },
  ]
  if (s.modules.some((m) => PAY_KW.test(m) || LOGIN_KW.test(m))) {
    risks.push({
      risk: 'Bug pada alur kritis (pembayaran/autentikasi) baru terdeteksi di akhir',
      mitigation:
        'Eksekusi alur kritis di awal siklus dan prioritaskan pada tiap regression.',
    })
  }

  return {
    title: `Test Strategy — ${s.title}`,
    purpose: `Memastikan kualitas fungsional ${s.title} melalui pendekatan testing yang terstruktur, mencakup ${s.modules.length} modul yang terdeteksi dari PRD.`,
    scopeIn: [
      ...s.modules.map((m) => `Pengujian fungsional untuk modul: ${m}`),
      'Pengujian alur utama pengguna (happy path) dan alur alternatif',
      'Verifikasi data yang ditampilkan/diproses sesuai requirement',
    ],
    scopeOut: [
      'Pengujian non-fungsional menyeluruh (performa, keamanan, beban) di luar MVP',
      'Pengujian pada perangkat/versi browser di luar daftar lingkungan yang disepakati',
      'Eksplorasi bebas tanpa skenario (kecuali masuk fase eksplorasi terencana)',
    ],
    levels,
    approach,
    environment: env,
    risks,
  }
}

export function generatePlanDoc(s: PrdSummary): PlanDoc {
  const scope =
    s.modules.length > 0
      ? `Ruang lingkup pengujian mencakup ${s.modules.length} modul utama: ${s.modules.join(
          ', '
        )}. Pengujian dilakukan pada tingkat fungsional.`
      : 'Ruang lingkup pengujian mencakup seluruh requirement fungsional yang terdeteksi dari PRD, pada tingkat fungsional.'

  return {
    title: `Test Plan — ${s.title}`,
    scope,
    environment: [
      'Lingkungan: staging',
      'Database: dataset QA (bukan data produksi)',
      'Alat: browser DevTools untuk inspeksi network/konsol',
      'Perangkat: desktop & mobile (mode responsif)',
    ],
    schedule: [
      {
        phase: 'Persiapan & analisis',
        detail: 'Review PRD, finalisasi test strategy & test case.',
      },
      {
        phase: 'Eksekusi fungsional',
        detail: 'Eksekusi test case per modul, catat hasil & defect.',
      },
      {
        phase: 'Regression & pelaporan',
        detail: 'Regression alur kritis, susun laporan hasil testing.',
      },
    ],
    roles: [
      'QA Engineer',
      'Developer (untuk konfirmasi perilaku & perbaikan defect)',
      'Product Owner / tim produk (untuk klarifikasi requirement)',
    ],
    entryCriteria: [
      'PRD/requirement sudah final & disetujui',
      'Lingkungan staging siap & stabil',
      'Test case sudah direview (minimal untuk modul prioritas)',
    ],
    exitCriteria: [
      'Seluruh test case prioritas High sudah dieksekusi',
      'Tidak ada defect severity Critical/High yang masih open',
      'Laporan hasil testing sudah dibuat & dikomunikasikan',
    ],
    assumptions: [
      'Data test dapat disiapkan oleh tim',
      'Defect akan diperbaiki dan diverifikasi dalam siklus yang sama',
      'Tidak ada perubahan requirement mayor setelah baseline',
    ],
  }
}

export function generateTestCaseDoc(s: PrdSummary): TestCaseDoc {
  const cases: TestCase[] = s.requirements
    .slice(0, 40)
    .map((req, i) => {
      const mod = modulMatch(s.modules, req) ?? 'Umum'
      const phrase = shorten(req, 80)
      const lower = req.toLowerCase()
      let steps: string[]
      if (LOGIN_KW.test(lower)) {
        steps = [
          'Buka aplikasi dan arahkan ke halaman login/registrasi.',
          'Masukkan kredensial/data yang sesuai skenario.',
          'Kirim permintaan (klik tombol login/daftar).',
          'Amati respons sistem.',
        ]
      } else if (UPLOAD_KW.test(lower)) {
        steps = [
          'Buka aplikasi dan arahkan ke fitur terkait.',
          'Pilih file yang sesuai skenario (format/ukuran valid atau tidak valid).',
          'Konfirmasi proses upload.',
          'Amati status & hasil yang muncul.',
        ]
      } else if (SEARCH_KW.test(lower)) {
        steps = [
          'Buka aplikasi dan arahkan ke fitur pencarian/filter.',
          'Masukkan kata kunci / atur kriteria filter.',
          'Jalankan pencarian.',
          'Amati hasil yang ditampilkan.',
        ]
      } else {
        steps = [
          'Buka aplikasi dan arahkan ke fitur terkait.',
          'Siapkan data/kondisi yang dibutuhkan untuk skenario ini.',
          `Lakukan aksi utama: ${phrase}.`,
          'Amati hasil yang muncul.',
          'Ulangi bila perlu untuk memastikan konsistensi.',
        ]
      }

      const isLogin = LOGIN_KW.test(lower)
      const priority: TestCase['priority'] = HIGH_KW.test(lower)
        ? 'High'
        : LOW_KW.test(lower)
          ? 'Low'
          : 'Medium'

      return {
        id: `TC-${String(i + 1).padStart(3, '0')}`,
        module: mod,
        title: shorten(`Memastikan ${req.replace(/[.。\s]+$/u, '')}`, 120),
        preconditions: isLogin
          ? 'Pengguna memiliki akun valid (atau kredensial test).'
          : 'Pengguna telah membuka aplikasi dan berada pada halaman yang relevan.',
        steps,
        testData: isLogin
          ? 'Email & password akun test yang valid (dan akun non-aktif untuk skenario negatif).'
          : 'Data valid sesuai skenario (mis. akun test / input contoh).',
        expected: isLogin
          ? 'Pengguna berhasil masuk dan diarahkan ke halaman utama; kredensial salah menampilkan pesan error yang jelas.'
          : 'Sistem menampilkan hasil sesuai requirement dan tidak ada error.',
        priority,
        traceability: `Req: ${shorten(req, 200)}`,
      }
    })
    .filter((tc) => tc.title.length > 20)

  return { title: `Test Case — ${s.title}`, cases }
}

export function renderStrategyMarkdown(d: StrategyDoc): string {
  return [
    `# ${d.title}`,
    '',
    '## Tujuan',
    d.purpose,
    '',
    '## Ruang Lingkup (In Scope)',
    ...d.scopeIn.map((x) => `- ${x}`),
    '',
    '## Di Luar Lingkup (Out of Scope)',
    ...d.scopeOut.map((x) => `- ${x}`),
    '',
    '## Level Testing',
    ...d.levels.map((x) => `- ${x}`),
    '',
    '## Pendekatan',
    ...d.approach.map((x) => `- ${x}`),
    '',
    '## Lingkungan Pengujian',
    ...d.environment.map((x) => `- ${x}`),
    '',
    '## Risiko & Mitigasi',
    ...d.risks.map((r) => `- **Risiko:** ${r.risk}\n  - **Mitigasi:** ${r.mitigation}`),
    '',
  ].join('\n')
}

export function renderPlanMarkdown(d: PlanDoc): string {
  return [
    `# ${d.title}`,
    '',
    '## Ruang Lingkup',
    d.scope,
    '',
    '## Lingkungan Pengujian',
    ...d.environment.map((x) => `- ${x}`),
    '',
    '## Jadwal',
    ...d.schedule.map(
      (x) => `- **${x.phase}:** ${x.detail}`
    ),
    '',
    '## Peran & Tanggung Jawab',
    ...d.roles.map((x) => `- ${x}`),
    '',
    '## Kriteria Masuk (Entry Criteria)',
    ...d.entryCriteria.map((x) => `- ${x}`),
    '',
    '## Kriteria Keluar (Exit Criteria)',
    ...d.exitCriteria.map((x) => `- ${x}`),
    '',
    '## Asumsi',
    ...d.assumptions.map((x) => `- ${x}`),
    '',
  ].join('\n')
}

export function renderTestCaseMarkdown(d: TestCaseDoc): string {
  const blocks: string[] = [`# ${d.title}`, '']
  if (d.cases.length === 0) {
    blocks.push('_Tidak ada test case yang dihasilkan._', '')
    return blocks.join('\n')
  }
  for (const tc of d.cases) {
    blocks.push(
      `## ${tc.id} — ${tc.title}`,
      '',
      `- **Prioritas:** ${tc.priority}`,
      `- **Modul:** ${tc.module}`,
      `- **Pre-condition:** ${tc.preconditions}`,
      '- **Langkah:**',
      ...tc.steps.map((st, i) => `  1. ${st}`.replace('  1. ', `  ${i + 1}. `)),
      `- **Data test:** ${tc.testData}`,
      `- **Hasil yang diharapkan:** ${tc.expected}`,
      `- **Traceability:** ${tc.traceability}`,
      ''
    )
  }
  return blocks.join('\n')
}

export function buildDocsForTypes(s: PrdSummary, types: DocType[]): Docs {
  const docs: Docs = {}
  if (types.includes('strategy')) docs.strategy = generateStrategyDoc(s)
  if (types.includes('plan')) docs.plan = generatePlanDoc(s)
  if (types.includes('testcase')) docs.testcase = generateTestCaseDoc(s)
  return docs
}

export function renderDocsMarkdown(docs: Docs): BrainstormOutput {
  const out: BrainstormOutput = { strategy: '', plan: '', testcase: '' }
  if (docs.strategy) out.strategy = renderStrategyMarkdown(docs.strategy)
  if (docs.plan) out.plan = renderPlanMarkdown(docs.plan)
  if (docs.testcase) out.testcase = renderTestCaseMarkdown(docs.testcase)
  return out
}
