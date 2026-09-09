'use client'

import { useState } from 'react'
import Link from 'next/link'
import Icon from '@/components/Icon'

export type SessionLite = {
  id: string
  title: string
  sourceType: string
  docTypes: string
  testCasesJson: string
  updatedAt: string
}

export default function DashboardClient({ sessions }: { sessions: SessionLite[] }) {
  const [q, setQ] = useState('')

  const fmt = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  const totalSessions = sessions.length
  const totalCases = sessions.reduce(
    (acc, s) => {
      try {
        const arr = JSON.parse(s.testCasesJson || '[]')
        return acc + (Array.isArray(arr) ? arr.length : 0)
      } catch {
        return acc
      }
    },
    0
  )

  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(q.trim().toLowerCase())
  )

  const iconFor = (title: string) => {
    const t = title.toLowerCase()
    if (t.includes('payment') || t.includes('bayar') || t.includes('checkout'))
      return { name: 'payments', tone: 'text-secondary' }
    if (t.includes('auth') || t.includes('login'))
      return { name: 'security', tone: 'text-tertiary' }
    if (t.includes('class') || t.includes('kelas') || t.includes('belajar'))
      return { name: 'school', tone: 'text-primary' }
    return { name: 'description', tone: 'text-primary-fixed-dim' }
  }

  const counts = sessions.reduce(
    (acc, s) => {
      try {
        const arr = JSON.parse(s.testCasesJson || '[]')
        if (Array.isArray(arr)) {
          acc.high += arr.filter((c: { priority?: string }) => c.priority === 'High').length
          acc.medium += arr.filter((c: { priority?: string }) => c.priority === 'Medium').length
        }
      } catch {
        /* ignore */
      }
      return acc
    },
    { high: 0, medium: 0 }
  )

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-8 md:py-8">
      {/* ===== Greeting & telemetry header ===== */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-widest text-primary">
              QA-Helper Platform
            </span>
            <span className="h-1 w-1 rounded-full bg-outline-variant" />
            <span className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
              PRD Engine Ready
            </span>
          </div>
          <h1 className="mt-1 font-display text-[28px] font-semibold leading-10 tracking-tight">
            Selamat Datang di QA-Helper
          </h1>
          <p className="max-w-2xl text-[15px] leading-relaxed text-on-surface-variant">
            Single source of truth untuk menyusun dokumen QA terstandar langsung
            dari input dokumen PRD.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-lg bg-surface-container-low px-3 py-2 md:self-auto">
          <Icon name="terminal" className="text-lg text-outline" />
          <div className="leading-tight">
            <div className="font-mono text-[11px] text-on-surface">SQLite Local Storage</div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-outline">
              Monorepo Ready
            </div>
          </div>
        </div>
      </div>

      {/* ===== Hero CTA ===== */}
      <div className="relative mt-5 overflow-hidden rounded-xl bg-surface-container-low p-6 shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-96 w-96 rounded-full bg-primary-container/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-1/3 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1 rounded-lg bg-surface-container-highest px-2 py-1">
              <Icon name="auto_awesome" className="text-sm text-secondary" />
              <span className="font-mono text-[11px] text-on-surface">
                Modul 1: Sesi Brainstorming Terpandu
              </span>
            </div>
            <h2 className="mt-3 font-display text-xl font-semibold tracking-tight">
              Mulai Brainstorm Dokumen QA Baru
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
              Ubah PRD menjadi Test Strategy, Test Plan, dan Test Case terstruktur
              hanya dalam beberapa menit. Unggah dokumen atau tempel teks PRD
              langsung tanpa konfigurasi rumit.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href="/brainstorm"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-container px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-on-primary-container shadow-md transition-all hover:brightness-110 active:scale-[0.99]"
              >
                <Icon name="add_circle" className="text-base" />
                + Mulai Sesi Baru dari PRD
              </Link>
            </div>
          </div>
          {/* Feature checklist mosaic */}
          <div className="grid shrink-0 grid-cols-2 gap-2 sm:w-80">
            {[
              { icon: 'upload_file', label: 'Ekstraksi File', sub: '.PDF, .DOCX, .MD', tone: 'text-primary' },
              { icon: 'psychology', label: 'Strategy Matrix', sub: 'Scope & Risk Draft', tone: 'text-secondary' },
              { icon: 'checklist', label: 'Test Plan', sub: 'Entry & Exit Specs', tone: 'text-tertiary' },
              { icon: 'terminal', label: 'Traceability', sub: 'PRD ID → Test Case', tone: 'text-primary-fixed-dim' },
            ].map((f) => (
              <div key={f.label} className="flex flex-col gap-1 rounded-lg bg-surface-container p-3">
                <div className={`flex items-center gap-1.5 text-sm ${f.tone}`}>
                  <Icon name={f.icon} className="text-base" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    {f.label}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-outline">{f.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Telemetry & metrics ===== */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Sesi Brainstorm"
          icon="chat_bubble"
          value={String(totalSessions)}
          suffix={`${totalSessions} Tersimpan`}
          sub="Tersimpan di local SQLite"
          progress={totalSessions > 0 ? 100 : 0}
          tone="text-primary"
          bar="bg-primary"
        />
        <StatCard
          label="Test Case Dihasilkan"
          icon="fact_check"
          value={String(totalCases)}
          suffix="Kandidat"
          sub="Terstruktur & siap dikelola"
          progress={totalCases > 0 ? 100 : 0}
          tone="text-secondary"
          bar="bg-secondary"
        />
        <StatCard
          label="Prioritas High"
          icon="priority_high"
          value={String(counts.high)}
          suffix="High"
          sub="Eksekusi pertama"
          progress={counts.high > 0 ? 100 : 0}
          tone="text-error"
          bar="bg-error"
        />
        <StatCard
          label="Prioritas Medium"
          icon="speed"
          value={String(counts.medium)}
          suffix="Medium"
          sub="Kandidat terstruktur"
          progress={counts.medium > 0 ? 100 : 0}
          tone="text-tertiary"
          bar="bg-tertiary"
        />
      </div>

      {/* ===== Split workbench ===== */}
      <div className="mt-5 grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
        {/* Left: riwayat sesi */}
        <section className="flex flex-col gap-3 rounded-xl bg-surface-container-low p-4 shadow-sm xl:col-span-8">
          <div className="flex flex-col justify-between gap-2 pb-1 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Icon name="history" className="text-lg text-primary" />
              <h2 className="font-display text-base font-semibold">
                Riwayat Sesi Brainstorming Terakhir
              </h2>
              <span className="rounded bg-surface-container px-1.5 py-0.5 font-mono text-[10px] text-outline">
                {filtered.length} Sesi
              </span>
            </div>
            <div className="relative">
              <Icon
                name="search"
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-base text-outline"
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Saring sesi..."
                className="w-full rounded-lg bg-surface-container py-1.5 pl-8 pr-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition placeholder:text-outline focus:bg-surface-container-high focus:ring-primary sm:w-56"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-outline-variant p-8 text-center">
              <p className="text-sm text-on-surface-variant">
                {sessions.length === 0
                  ? 'Belum ada sesi. Buat sesi pertama dari menu Brainstorm QA Docs.'
                  : 'Tidak ada sesi yang cocok dengan pencarian.'}
              </p>
              <Link
                href="/brainstorm"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary-container px-4 py-2 text-sm font-medium text-on-primary-container hover:brightness-110"
              >
                <Icon name="auto_awesome" className="text-base" />
                Buka Brainstorm
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((s) => {
                const ic = iconFor(s.title)
                let types: string[] = []
                try {
                  types = JSON.parse(s.docTypes)
                } catch {
                  /* ignore */
                }
                let nCases = 0
                try {
                  const arr = JSON.parse(s.testCasesJson || '[]')
                  nCases = Array.isArray(arr) ? arr.length : 0
                } catch {
                  /* ignore */
                }
                const meta =
                  types.join(' · ') +
                  (nCases > 0 ? ` · ${nCases} Test Case` : '')
                return (
                  <Link
                    key={s.id}
                    href={`/sessions/${s.id}`}
                    className="group flex flex-col justify-between gap-3 rounded-lg bg-surface-container p-3 transition-colors hover:bg-surface-container-high sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest">
                        <Icon name={ic.name} className={`text-xl ${ic.tone}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-[15px] font-semibold text-on-surface">
                            {s.title}
                          </span>
                          {s.sourceType === 'upload' && (
                            <span className="rounded bg-secondary-container/25 px-1.5 py-0.5 font-mono text-[10px] text-secondary">
                              Upload
                            </span>
                          )}
                          <span className="font-mono text-[11px] text-outline">
                            {fmt.format(new Date(s.updatedAt))}
                          </span>
                        </div>
                        {meta && (
                          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-on-surface-variant">
                            <Icon name="layers" className="text-xs text-outline" />
                            {meta}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                      <Link
                        href={`/testcases/${s.id}`}
                        className="rounded-lg bg-surface-container-highest px-2.5 py-1.5 font-mono text-[11px] text-on-surface transition-colors hover:bg-surface-bright"
                        onClick={(e) => e.stopPropagation()}
                      >
                        TC Management
                      </Link>
                      <span className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 font-mono text-[11px] text-on-primary transition-colors group-hover:brightness-110">
                        Buka Sesi
                        <Icon name="arrow_forward" className="text-xs" />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* Right: modul & panduan */}
        <aside className="flex flex-col gap-3 xl:col-span-4">
          <div className="rounded-xl bg-surface-container-low p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Icon name="view_in_ar" className="text-lg text-primary" />
                <h3 className="font-display text-base font-semibold">Jelajahi Modul MVP</h3>
              </div>
              <span className="rounded bg-primary-container px-1.5 py-0.5 font-mono text-[10px] text-on-primary-container">
                v0.2
              </span>
            </div>
            <div className="mt-3 flex flex-col gap-1.5">
              {[
                { icon: 'psychology', title: 'Test Strategy Generator', desc: 'Pendekatan level testing, scope, risiko.', tone: 'text-secondary', href: '/brainstorm' },
                { icon: 'checklist', title: 'Test Plan Builder', desc: 'Jadwal, lingkungan uji, exit criteria.', tone: 'text-tertiary', href: '/brainstorm' },
                { icon: 'fact_check', title: 'Test Case Management', desc: 'Kelola skenario, prioritas, traceability.', tone: 'text-primary', href: '/testcases' },
              ].map((m) => (
                <Link
                  key={m.title}
                  href={m.href}
                  className="flex items-start gap-2.5 rounded-lg bg-surface-container p-2.5 transition-colors hover:bg-surface-container-high"
                >
                  <Icon name={m.icon} className={`mt-0.5 text-lg ${m.tone}`} />
                  <span>
                    <span className="block text-sm font-medium text-on-surface">
                      {m.title}
                    </span>
                    <span className="block text-xs text-on-surface-variant">
                      {m.desc}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-surface-container-low p-4 shadow-sm">
            <div className="flex items-center gap-1.5">
              <Icon name="info" className="text-lg text-secondary" />
              <h3 className="font-display text-base font-semibold">Panduan Format PRD</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
              Agar sistem mendeteksi modul dan functional requirements secara
              optimal, gunakan heading & bullet yang jelas di dokumen.
            </p>
            <div className="mt-2 flex flex-col gap-1">
              {[
                { k: 'Ekstensi yang Didukung', v: '.md .pdf .docx .txt', tone: 'text-primary' },
                { k: 'Batas Maksimal File', v: '10 MB', tone: 'text-secondary' },
                { k: 'Heading Modul', v: '## Nama Modul', tone: 'text-tertiary' },
              ].map((r) => (
                <div
                  key={r.k}
                  className="flex items-center justify-between rounded bg-surface-container px-2 py-1 font-mono text-[11px]"
                >
                  <span className="text-on-surface">{r.k}</span>
                  <span className={`font-bold ${r.tone}`}>{r.v}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-surface-container-highest p-2">
              <Icon name="lock" className="mt-0.5 text-base text-outline" />
              <p className="text-xs text-on-surface-variant">
                <strong className="font-medium text-on-surface">Privasi:</strong>{' '}
                Dokumen PRD diproses lokal & tidak dikirim ke pihak ketiga.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function StatCard({
  label,
  icon,
  value,
  suffix,
  sub,
  progress,
  tone,
  bar,
}: {
  label: string
  icon: string
  value: string
  suffix: string
  sub: string
  progress: number
  tone: string
  bar: string
}) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-xl bg-surface-container-low p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-outline">
          {label}
        </span>
        <span className="rounded-lg bg-surface-container p-1.5">
          <Icon name={icon} className={`text-lg ${tone}`} />
        </span>
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[26px] font-semibold leading-none text-on-surface">
            {value}
          </span>
          <span className={`text-sm font-medium ${tone}`}>{suffix}</span>
        </div>
        <span className="text-xs text-on-surface-variant">{sub}</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container-highest">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
