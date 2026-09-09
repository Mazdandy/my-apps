'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Badge from '@/components/Badge'
import Icon from '@/components/Icon'
import type { TestCase } from '@/lib/types'
import { renderTestCaseMarkdown } from '@/lib/qadocs-generator'

type Draft = Omit<TestCase, 'id'> & { id?: string }

const EMPTY: Draft = {
  title: '',
  module: '',
  preconditions: '',
  steps: [],
  testData: '',
  expected: '',
  priority: 'Medium',
  traceability: '',
}

const PRIO_BADGE: Record<TestCase['priority'], 'error' | 'tertiary' | 'neutral'> = {
  High: 'error',
  Medium: 'tertiary',
  Low: 'neutral',
}

function nextId(cases: TestCase[]): string {
  let max = 0
  for (const c of cases) {
    const m = c.id.match(/^TC-(\d+)$/i)
    if (m) max = Math.max(max, parseInt(m[1], 10))
  }
  return `TC-${String(max + 1).padStart(3, '0')}`
}

function csvCell(v: string): string {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export default function TestCaseManager({
  sessionId,
  sessionTitle,
  initialCases,
  prdText,
}: {
  sessionId: string
  sessionTitle: string
  initialCases: TestCase[]
  prdText: string
}) {
  const router = useRouter()
  const [cases, setCases] = useState<TestCase[]>(initialCases)
  const [q, setQ] = useState('')
  const [filterModule, setFilterModule] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [editing, setEditing] = useState<TestCase | null>(null)
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const modules = useMemo(() => {
    const s = new Set(cases.map((c) => c.module).filter(Boolean))
    return [...s].sort()
  }, [cases])

  const perModule = useMemo(() => {
    const m = new Map<string, number>()
    for (const c of cases) m.set(c.module, (m.get(c.module) ?? 0) + 1)
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [cases])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return cases.filter((c) => {
      if (filterModule && c.module !== filterModule) return false
      if (filterPriority && c.priority !== filterPriority) return false
      if (!query) return true
      return [c.id, c.title, c.module, c.expected, c.traceability]
        .join(' ')
        .toLowerCase()
        .includes(query)
    })
  }, [cases, q, filterModule, filterPriority])

  const counts = useMemo(() => {
    const high = cases.filter((c) => c.priority === 'High').length
    const medium = cases.filter((c) => c.priority === 'Medium').length
    const low = cases.filter((c) => c.priority === 'Low').length
    return { total: cases.length, high, medium, low }
  }, [cases])

  async function persist(next: TestCase[]) {
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testCases: next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan.')
      setCases(next)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan perubahan.')
    } finally {
      setBusy(false)
    }
  }

  function openCreate() {
    setDraft({ ...EMPTY, module: modules[0] || 'Umum' })
    setCreating(true)
  }

  function openEdit(tc: TestCase) {
    setDraft({ ...tc })
    setEditing(tc)
  }

  function closeForm() {
    setCreating(false)
    setEditing(null)
    setDraft(EMPTY)
  }

  function saveForm() {
    if (!draft.title.trim() || !draft.module.trim()) {
      setError('Judul dan modul wajib diisi.')
      return
    }
    const tc: TestCase = {
      id: editing ? editing.id : nextId(cases),
      title: draft.title.trim(),
      module: draft.module.trim(),
      preconditions: draft.preconditions.trim(),
      steps: draft.steps.map((s) => s.trim()).filter((s) => s.length > 0),
      testData: draft.testData.trim(),
      expected: draft.expected.trim(),
      priority: draft.priority,
      traceability: draft.traceability.trim(),
    }
    const next = creating ? [...cases, tc] : cases.map((c) => (c.id === editing?.id ? tc : c))
    closeForm()
    void persist(next)
  }

  function deleteCase(id: string) {
    setConfirmId(null)
    void persist(cases.filter((c) => c.id !== id))
  }

  function exportCsv() {
    const header = [
      'ID', 'Modul', 'Prioritas', 'Judul', 'Pre-condition',
      'Langkah', 'Data Test', 'Hasil Diharapkan', 'Traceability',
    ]
    const lines = filtered.map((c) =>
      [
        c.id, c.module, c.priority, c.title, c.preconditions,
        c.steps.join(' | '), c.testData, c.expected, c.traceability,
      ]
        .map(csvCell)
        .join(',')
    )
    downloadBlob(
      new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' }),
      `${slug(sessionTitle)}-test-cases.csv`
    )
  }

  function exportMarkdown() {
    const md = renderTestCaseMarkdown({
      title: `Test Case — ${sessionTitle}`,
      cases: filtered,
    })
    downloadBlob(new Blob([md], { type: 'text/markdown;charset=utf-8' }), `${slug(sessionTitle)}-test-cases.md`)
  }

  function downloadBlob(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  async function generateFromPrd() {
    setBusy(true)
    setError('')
    try {
      const { analyzePrd } = await import('@/lib/prd-analysis')
      const { generateTestCaseDoc } = await import('@/lib/qadocs-generator')
      const s = analyzePrd(prdText)
      const doc = generateTestCaseDoc(s)
      await persist(doc.cases)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal membuat test case dari PRD.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-8 md:py-8">
      {/* ===== Toolbar sesi ===== */}
      <div className="flex flex-col gap-3 rounded-xl bg-surface-container-low p-3 shadow-sm md:p-4">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          {/* Identitas */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-outline">
              <Link href="/testcases" className="hover:text-on-surface">
                Test Case Management
              </Link>
              <Icon name="chevron_right" className="text-xs" />
              <Link href={`/sessions/${sessionId}`} className="truncate hover:text-on-surface">
                {sessionTitle}
              </Link>
              <Icon name="chevron_right" className="text-xs" />
              <span className="flex items-center gap-1 font-semibold text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                Sesi Aktif
              </span>
            </div>
            <h1 className="mt-1 truncate font-display text-lg font-semibold tracking-tight">
              Workspace Test Case
            </h1>
          </div>

          {/* Aksi kanan */}
          <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
            <button
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className="flex items-center gap-1.5 rounded-lg bg-surface-container-high px-3 py-1.5 text-sm font-medium text-on-surface transition-colors hover:bg-surface-bright disabled:opacity-50"
            >
              <Icon name="download" className="text-base text-tertiary" />
              CSV
            </button>
            <button
              onClick={exportMarkdown}
              disabled={filtered.length === 0}
              className="flex items-center gap-1.5 rounded-lg bg-surface-container-high px-3 py-1.5 text-sm font-medium text-on-surface transition-colors hover:bg-surface-bright disabled:opacity-50"
            >
              <Icon name="download" className="text-base text-primary" />
              .MD
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-1 rounded-lg bg-primary-container px-3 py-1.5 text-sm font-semibold text-on-primary-container shadow-md transition-all hover:brightness-110 active:scale-95"
            >
              <Icon name="add_circle" className="text-base text-secondary" />
              + Tambah Test Case
            </button>
          </div>
        </div>

        {/* Stats & coverage banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-container-lowest px-3 py-2 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-outline">
              Cakupan Modul:
              <span className="font-medium text-secondary">
                {perModule.length} modul · {counts.total} skenario
              </span>
            </span>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-error" />
                <span className="text-on-surface-variant">{counts.high} High</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-tertiary" />
                <span className="text-on-surface-variant">{counts.medium} Med</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-outline" />
                <span className="text-on-surface-variant">{counts.low} Low</span>
              </span>
            </span>
          </div>
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-primary">
            <Icon name="auto_fix_high" className="text-sm" />
            Rule-Engine v0.2
          </span>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-error-container bg-error-container/15 px-3 py-2.5 text-sm text-on-error-container">
          <Icon name="error" className="mt-0.5 text-base" />
          {error}
        </div>
      )}
      {saved && !busy && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-secondary-container/40 bg-secondary-container/15 px-3 py-2.5 text-sm text-secondary">
          <Icon name="check_circle" className="text-base" />
          Perubahan tersimpan — markdown sesi ikut diperbarui.
        </div>
      )}

      {/* ===== Workbench 2 kolom ===== */}
      <div className="mt-4 grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
        {/* ===== Left drawer: konteks PRD ===== */}
        <aside className="flex flex-col gap-3 rounded-xl bg-surface-container-low p-3 shadow-sm xl:col-span-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-outline">
              Konteks PRD Aktif
            </span>
            <Badge tone="primary">Trace</Badge>
          </div>

          {/* Coverage */}
          <div className="rounded-lg bg-surface-container p-2.5">
            <div className="flex items-center justify-between text-xs text-outline">
              <span>Kesiapan Skenario</span>
              <span className="font-mono text-[11px] text-secondary">
                {counts.total} Generated
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-lowest">
              <div
                className="h-full rounded-full bg-secondary transition-all"
                style={{ width: counts.total > 0 ? '100%' : '0%' }}
              />
            </div>
          </div>

          {/* Modul & distribusi */}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-outline">
              Ganti Lingkup Modul
            </span>
            {perModule.length === 0 ? (
              <p className="text-xs text-on-surface-variant">
                Belum ada modul. Tambah test case untuk mulai.
              </p>
            ) : (
              perModule.map(([mod, n]) => (
                <button
                  key={mod}
                  onClick={() =>
                    setFilterModule(filterModule === mod ? '' : mod)
                  }
                  className={`flex items-center justify-between rounded-lg p-2 text-left transition-colors ${
                    filterModule === mod
                      ? 'bg-primary-container/25 text-primary ring-1 ring-primary/40'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <span className="text-xs font-medium">{mod}</span>
                  <span className="rounded bg-surface-container-lowest px-1.5 py-0.5 font-mono text-[10px] text-on-surface-variant">
                    {n} kasus
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Sumber data */}
          <div className="rounded-lg bg-surface-container p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-tertiary">
              <Icon name="info" className="text-sm" />
              Sumber Data
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-on-surface-variant">
              Test case ini tersimpan terstruktur per sesi dan menautkan
              traceability ke requirement PRD asal.
            </p>
          </div>

          {prdText.trim().length > 0 && cases.length === 0 && (
            <button
              onClick={generateFromPrd}
              disabled={busy}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-primary-container px-3 py-2 text-xs font-semibold text-on-primary-container transition-all hover:brightness-110 disabled:opacity-50"
            >
              <Icon name="auto_awesome" className="text-sm" />
              {busy ? 'Membuat…' : 'Generate dari PRD sesi ini'}
            </button>
          )}
        </aside>

        {/* ===== Main: tabel test case ===== */}
        <section className="flex flex-col gap-3 rounded-xl bg-surface-container-low p-3 shadow-sm xl:col-span-9">
          {/* Filter bar */}
          <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] max-w-sm flex-1">
                <Icon
                  name="search"
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-base text-outline"
                />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari skenario, ID, atau kata kunci..."
                  className="w-full rounded-lg bg-surface-container-lowest py-2 pl-8 pr-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition placeholder:text-outline focus:bg-surface-container-high focus:ring-primary"
                />
              </div>
              {/* Segmented priority filter */}
              <div className="flex items-center gap-0.5 rounded-lg bg-surface-container-lowest p-0.5">
                {[
                  { v: '', label: 'Semua' },
                  { v: 'High', label: 'High', dot: 'bg-error' },
                  { v: 'Medium', label: 'Med', dot: 'bg-tertiary' },
                  { v: 'Low', label: 'Low', dot: 'bg-outline' },
                ].map((p) => (
                  <button
                    key={p.v || 'all'}
                    onClick={() => setFilterPriority(p.v)}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors ${
                      filterPriority === p.v
                        ? 'bg-surface-container-high font-medium text-on-surface'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {p.dot && <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />}
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-outline">
              <span>
                Menampilkan {filtered.length} dari {counts.total} test case
              </span>
            </div>
          </div>

          {/* Empty states */}
          {cases.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-outline-variant p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-high text-outline">
                <Icon name="data_object" className="text-2xl" />
              </div>
              <p className="mt-3 max-w-sm text-sm text-on-surface-variant">
                Sesi ini belum punya test case terstruktur. Hasilkan dari PRD,
                atau tambahkan manual.
              </p>
              <button
                onClick={openCreate}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container hover:brightness-110"
              >
                <Icon name="add_circle" className="text-base" />
                + Tambah Test Case Manual
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <p className="rounded-xl border border-dashed border-outline-variant p-8 text-center text-sm text-on-surface-variant">
              Tidak ada test case yang cocok dengan pencarian/filter.
            </p>
          ) : (
            /* Tabel */
            <div className="overflow-x-auto rounded-xl bg-surface-container-lowest shadow-inner">
              <table className="w-full min-w-[860px] border-collapse text-left">
                <thead className="sticky top-0 z-10 bg-surface-container-high font-mono text-[10px] uppercase tracking-wider text-outline">
                  <tr>
                    <th className="w-20 px-3 py-2.5 font-medium">ID</th>
                    <th className="w-64 px-3 py-2.5 font-medium">Judul Skenario</th>
                    <th className="hidden w-40 px-3 py-2.5 font-medium lg:table-cell">
                      Pre-condition
                    </th>
                    <th className="hidden px-3 py-2.5 font-medium xl:table-cell">
                      Langkah Pengujian
                    </th>
                    <th className="hidden px-3 py-2.5 font-medium 2xl:table-cell">
                      Hasil Diharapkan
                    </th>
                    <th className="w-24 px-3 py-2.5 text-center font-medium">
                      Prioritas
                    </th>
                    <th className="w-24 px-3 py-2.5 text-center font-medium">
                      Trace
                    </th>
                    <th className="w-28 px-3 py-2.5 text-center font-medium">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[13px] text-on-surface">
                  {filtered.map((tc, idx) => (
                    <tr
                      key={tc.id}
                      className={`align-top transition-colors hover:bg-surface-container-low/70 ${
                        idx % 2 === 1 ? 'bg-surface-container-low/30' : ''
                      }`}
                    >
                      <td className="px-3 py-2.5 font-mono text-[11px] font-medium text-primary">
                        {tc.id}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="font-medium leading-snug text-on-surface">
                          {tc.title}
                        </div>
                        <div className="mt-0.5 font-mono text-[10px] text-outline">
                          {tc.module}
                        </div>
                      </td>
                      <td className="hidden px-3 py-2.5 text-on-surface-variant lg:table-cell">
                        {tc.preconditions || '—'}
                      </td>
                      <td className="hidden px-3 py-2.5 xl:table-cell">
                        <ol className="list-inside list-decimal space-y-0.5 whitespace-pre-line font-mono text-[11px] leading-relaxed text-on-surface-variant">
                          {tc.steps.slice(0, 3).map((st, i) => (
                            <li key={i}>{st}</li>
                          ))}
                          {tc.steps.length > 3 && (
                            <li className="text-outline">+{tc.steps.length - 3} lagi…</li>
                          )}
                        </ol>
                      </td>
                      <td className="hidden max-w-[240px] px-3 py-2.5 text-on-surface-variant 2xl:table-cell">
                        <span className="line-clamp-2 leading-snug">{tc.expected}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Badge tone={PRIO_BADGE[tc.priority]}>{tc.priority}</Badge>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {tc.traceability ? (
                          <span
                            title={tc.traceability}
                            className="inline-block cursor-help rounded bg-surface-container px-1.5 py-0.5 font-mono text-[10px] text-primary"
                          >
                            {(tc.traceability.match(/REQ[-: ]?\w*/i)?.[0] ||
                              'Req')
                              .slice(0, 12)}
                          </span>
                        ) : (
                          <span className="text-outline">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            onClick={() => openEdit(tc)}
                            title="Edit"
                            className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                          >
                            <Icon name="edit" className="text-base" />
                          </button>
                          {confirmId === tc.id ? (
                            <span className="flex items-center gap-1">
                              <button
                                onClick={() => deleteCase(tc.id)}
                                disabled={busy}
                                className="rounded bg-error px-1.5 py-0.5 font-mono text-[10px] font-semibold text-on-error"
                              >
                                Hapus?
                              </button>
                              <button
                                onClick={() => setConfirmId(null)}
                                className="rounded bg-surface-container-high px-1.5 py-0.5 font-mono text-[10px] text-on-surface"
                              >
                                Batal
                              </button>
                            </span>
                          ) : (
                            <button
                              onClick={() => setConfirmId(tc.id)}
                              title="Hapus"
                              className="rounded p-1 text-on-surface-variant transition-colors hover:bg-error-container/20 hover:text-error"
                            >
                              <Icon name="delete" className="text-base" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* ===== Guided prompt (saran QA) ===== */}
      <section className="mt-4 flex flex-col items-start justify-between gap-3 rounded-xl bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low p-4 shadow-sm lg:flex-row lg:items-center">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon name="psychology_alt" className="text-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-primary">
                Saran QA
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-tertiary" />
              <span className="font-mono text-[10px] text-outline">Traceability</span>
            </div>
            <p className="mt-1 max-w-3xl text-sm leading-snug text-on-surface">
              Pastikan tiap test case menunjuk ke requirement PRD via kolom
              <strong className="text-on-surface"> Trace</strong> — ini menjaga
              matriks traceability tetap lengkap saat modul direview.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-end lg:self-center">
          <Link
            href={`/sessions/${sessionId}`}
            className="flex items-center gap-1.5 rounded-lg bg-surface-container-high px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-bright hover:text-on-surface"
          >
            <Icon name="article" className="text-base" />
            Lihat Markdown Sesi
          </Link>
        </div>
      </section>

      {/* ===== Modal form tambah/edit ===== */}
      {(creating || editing) && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="mt-8 w-full max-w-2xl rounded-xl border border-surface-container-high bg-surface-container p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon
                  name={creating ? 'add_task' : 'edit_note'}
                  className="text-xl text-primary"
                />
                <h2 className="font-display text-lg font-semibold">
                  {editing ? `Edit ${editing.id}` : 'Tambah Test Case'}
                </h2>
              </div>
              <button
                onClick={closeForm}
                className="rounded-md p-1 text-outline transition-colors hover:bg-surface-container-high hover:text-on-surface"
              >
                <Icon name="close" className="text-lg" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Judul Skenario *</Label>
                <Input
                  value={draft.title}
                  onChange={(v) => setDraft({ ...draft, title: v })}
                  placeholder="Mis. Memastikan pengguna dapat login dengan email valid"
                />
              </div>
              <div>
                <Label>Modul *</Label>
                <input
                  list="module-options"
                  value={draft.module}
                  onChange={(e) => setDraft({ ...draft, module: e.target.value })}
                  className="w-full rounded-lg border border-surface-container-high bg-surface-container-lowest px-3 py-2 text-sm outline-none ring-1 ring-transparent transition focus:border-primary focus:ring-primary"
                />
                <datalist id="module-options">
                  {modules.map((m) => (
                    <option key={m} value={m} />
                  ))}
                  <option value="Umum" />
                </datalist>
              </div>
              <div>
                <Label>Prioritas</Label>
                <select
                  value={draft.priority}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      priority: e.target.value as TestCase['priority'],
                    })
                  }
                  className="w-full rounded-lg border border-surface-container-high bg-surface-container-lowest px-3 py-2 text-sm outline-none ring-1 ring-transparent transition focus:border-primary focus:ring-primary"
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label>Pre-condition</Label>
                <TextArea
                  value={draft.preconditions}
                  onChange={(v) => setDraft({ ...draft, preconditions: v })}
                  rows={2}
                  placeholder="Kondisi awal sebelum menjalankan skenario…"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Langkah (satu per baris)</Label>
                <TextArea
                  value={draft.steps.join('\n')}
                  onChange={(v) => setDraft({ ...draft, steps: v.split('\n') })}
                  rows={5}
                  placeholder={'1. Buka aplikasi\n2. …'}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Data Test</Label>
                <TextArea
                  value={draft.testData}
                  onChange={(v) => setDraft({ ...draft, testData: v })}
                  rows={2}
                  placeholder="Data/input yang dipakai…"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Hasil yang Diharapkan</Label>
                <TextArea
                  value={draft.expected}
                  onChange={(v) => setDraft({ ...draft, expected: v })}
                  rows={2}
                  placeholder="Apa yang seharusnya terjadi…"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Traceability (sumber requirement)</Label>
                <Input
                  value={draft.traceability}
                  onChange={(v) => setDraft({ ...draft, traceability: v })}
                  placeholder="REQ-01 — …"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={closeForm}
                className="rounded-lg bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
              >
                Batal
              </button>
              <button
                onClick={saveForm}
                disabled={busy}
                className="flex items-center gap-1.5 rounded-lg bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container shadow-md transition-all hover:brightness-110 disabled:opacity-50"
              >
                <Icon name="save" className="text-base" />
                {busy ? 'Menyimpan…' : 'Simpan Test Case'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-outline">
      {children}
    </label>
  )
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-surface-container-high bg-surface-container-lowest px-3 py-2 text-sm outline-none ring-1 ring-transparent transition focus:border-primary focus:ring-primary"
    />
  )
}

function TextArea({
  value,
  onChange,
  rows,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  rows: number
  placeholder?: string
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full resize-y rounded-lg border border-surface-container-high bg-surface-container-lowest px-3 py-2 text-sm outline-none ring-1 ring-transparent transition focus:border-primary focus:ring-primary"
    />
  )
}
