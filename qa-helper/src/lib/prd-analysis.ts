import type { PrdSummary } from './types'

// Heuristic helpers for rule-based PRD analysis (no AI, deterministic).

const TITLE_PATTERNS = [
  /^\s*#+\s+.+/, // markdown heading, e.g. "# PRD — Nama Produk"
  /\b(?:PRD|produk|product|aplikasi|judul|spesifikasi)\s*:?\s*[-–—]?\s*/i, // labeled title
]

const MODULE_KEYWORDS = [
  'modul',
  'fitur',
  'halaman',
  'menu',
  'landing',
  'dashboard',
  'auth',
  'api',
]

// "terlalu banyak kata sambung / panjang" filter: strip light punctuation so we
// only judge alphabetic words, then reject lines with >= 6 connective-ish words.
const STOP_HINTS = /(?:yang|dan|untuk|dengan|agar|sehingga|maka|atau|pada|dari|adalah|dapat|bisa|harus|wajib|setelah|sebelum|ke|di|ini|itu|tersebut|serta)/gi

const REQUIREMENT_PATTERNS = [
  /\b(?:harus|wajib)\b/i,
  /\b(?:dapat melihat|dapat menampilkan|dapat meng|dapat mem|dapat melihat)\b/i,
  /\b(?:user dapat|pengguna dapat|user bisa|pengguna bisa)\b/i,
  /\b(?:bisa)\b/i,
  /\bfitur\b/i,
  /\b(?:menampilkan|menyediakan|menyimpan|menghapus|mengubah|memperbarui|mengirim|menerima|melakukan|memproses|mendukung|mengelola)\b/i,
  /\b(?:login|register|masuk|daftar|upload|download|notifikasi|pembayaran|payment|checkout|search|cari|filter|sortir)\b/i,
]

const WORD_COUNT_RE = /[A-Za-z0-9_]+/g

/** Extract the best-guess document title from the first lines of the PRD. */
function detectTitle(lines: string[]): string | null {
  for (const line of lines) {
    const candidate = line.trim()
    if (candidate.length < 3 || candidate.length > 200) continue
    if (/^https?:\/\/|^www\./i.test(candidate)) continue
    for (const pattern of TITLE_PATTERNS) {
      if (pattern.test(candidate)) return candidate
    }
  }
  return null
}

/** Normalize a raw module line: drop markdown marks + numbering, then capitalize. */
function normalizeModule(raw: string): string {
  let m = raw.trim()
  m = m.replace(/^#{1,6}\s*/, '')
  m = m.replace(/^\s*\*+\s*/, '')
  m = m.replace(/^\d+(?:\.\d+)*[.)]\s*/, '')
  m = m.replace(/^\d+[.)]\s*/, '')
  m = m.trim()
  if (!m) return m
  return m.charAt(0).toUpperCase() + m.slice(1)
}

function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
}

function looksLikeParagraph(line: string): boolean {
  const words = line.toLowerCase().match(WORD_COUNT_RE) ?? []
  if (words.length < 4) return false
  const stops = line.toLowerCase().match(STOP_HINTS) ?? []
  return stops.length >= 6
}

/** Collect module/feature candidates from heuristic heading lines. */
function detectModules(lines: string[]): string[] {
  const seen = new Set<string>()
  const modules: string[] = []

  for (const line of lines) {
    if (modules.length >= 30) break
    if (line.length < 3 || line.length > 100) continue
    if (/^https?:\/\/|^www\./i.test(line)) continue
    if (looksLikeParagraph(line)) continue

    const lower = line.toLowerCase()
    const isMarkdownHeading = /^#{1,6}\s/.test(line)
    const isNumberedHeading = /^\d+(?:\.\d+)*[.)]\s*[A-Za-z]/.test(line)
    const hasModuleKeyword = MODULE_KEYWORDS.some((kw) =>
      new RegExp(`\\b${kw}\\b`, 'i').test(lower)
    )
    if (!isMarkdownHeading && !isNumberedHeading && !hasModuleKeyword) continue

    const normalized = normalizeModule(line)
    if (normalized.length < 3 || normalized.length > 100) continue
    if (looksLikeParagraph(normalized)) continue
    // Drop pure numeric labels like "1." with no name.
    if (!/\p{L}/u.test(normalized)) continue

    const key = normalized.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    modules.push(normalized)
  }

  return modules
}

/** Split the text into sentences and keep the requirement-looking ones. */
function detectRequirements(text: string): string[] {
  const sentences = text
    .split(/\.\s+|\r?\n|\.$/)
    .map((s) => s.trim().replace(/^[-*•]\s*/, ''))
    .filter((s) => s.length > 0)

  const seen = new Set<string>()
  const requirements: string[] = []

  for (const sentence of sentences) {
    if (requirements.length >= 60) break
    const trimmed = sentence.trim()
    if (trimmed.length < 20 || trimmed.length > 400) continue
    // Lewati heading/struktur dokumen (markdown, penomoran, label) — bukan requirement.
    if (/^#{1,6}\s/.test(trimmed)) continue
    if (/^\d+(?:\.\d+)*[.)]\s*[A-Za-z]/.test(trimmed) && !/\b(?:dapat|harus|wajib|bisa|user|pengguna|sistem)\b/i.test(trimmed)) continue

    const lower = trimmed.toLowerCase()
    const matched = REQUIREMENT_PATTERNS.some((pattern) =>
      pattern.test(lower)
    )
    if (!matched) continue

    const key = lower.replace(/\s+/g, ' ').replace(/[.\s]+$/, '')
    if (seen.has(key)) continue
    seen.add(key)
    requirements.push(trimmed)
  }

  return requirements
}

/**
 * Analyze raw PRD text and produce a structured summary.
 * Heuristic + deterministic; not meant to be exhaustive.
 */
export function analyzePrd(text: string): PrdSummary {
  const raw = text ?? ''
  const lines = splitLines(raw)
  const fallback = raw
    .trim()
    .split(/\r?\n/)[0]
    ?.trim()
    .slice(0, 90)

  const title =
    detectTitle(lines) ??
    (fallback && fallback.length >= 3 && fallback.length <= 200
      ? fallback
      : 'Dokumen PRD')

  return {
    title: title.length > 90 ? `${title.slice(0, 87).trimEnd()}...` : title,
    modules: detectModules(lines),
    requirements: detectRequirements(raw),
    raw,
  }
}

/** Render a compact markdown summary of the PRD analysis. */
export function formatPrdSummary(s: PrdSummary): string {
  const moduleLines =
    s.modules.length > 0
      ? s.modules.map((m) => `- ${m}`).join('\n')
      : '- _Tidak ada modul terdeteksi secara otomatis._'

  const requirementLines =
    s.requirements.length > 0
      ? s.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')
      : '- _Tidak ada requirement terdeteksi._'

  return [
    '## Ringkasan PRD',
    '',
    `**Judul:** ${s.title}`,
    '',
    '### Modul terdeteksi',
    moduleLines,
    '',
    '### Requirement terdeteksi',
    requirementLines,
  ].join('\n')
}
