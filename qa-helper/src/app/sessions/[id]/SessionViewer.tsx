'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Badge from '@/components/Badge'
import Icon from '@/components/Icon'

const SECTIONS: { key: string; label: string; icon: string }[] = [
  { key: 'strategy', label: 'Test Strategy', icon: 'psychology' },
  { key: 'plan', label: 'Test Plan', icon: 'checklist' },
  { key: 'testcase', label: 'Test Case', icon: 'data_object' },
]

export default function SessionViewer({
  sessionId,
  title: initialTitle,
  sourceType,
  prdText,
  summary,
  docTypes,
  docs,
  updatedAt,
}: {
  sessionId: string
  title: string
  sourceType: string
  prdText: string
  summary: string
  docTypes: string[]
  docs: Record<string, string>
  updatedAt: string
}) {
  const router = useRouter()
  const [title, setTitle] = useState(initialTitle)
  const [prdTextState, setPrdTextState] = useState(prdText)
  const [summaryState, setSummaryState] = useState(summary)
  const [docsState, setDocsState] = useState<Record<string, string>>(docs)
  const [activeTab, setActiveTab] = useState<string>(
    SECTIONS.find((s) => docTypes.includes(s.key))?.key ?? 'strategy'
  )
  const [showPrd, setShowPrd] = useState(false)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const fmt = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const activeSection = SECTIONS.find((s) => s.key === activeTab) ?? SECTIONS[0]
  const content = docsState[activeSection.key] || ''

  function setDoc(key: string, value: string) {
    setDocsState((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function handleUpdate() {
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          summary: summaryState,
          prdText: prdTextState,
          docsJson: docsState,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan perubahan.')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan perubahan.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal menghapus sesi.')
      }
      router.push('/')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus sesi.')
      setBusy(false)
    }
  }

  function download(label: string, textContent: string) {
    const blob = new Blob([textContent], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${label}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const hasMarkdown = Object.values(docsState).some((v) => (v || '').length > 0)

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-8 md:py-8">
      {/* ===== Toolbar sesi ===== */}
      <div className="flex flex-col gap-3 rounded-xl bg-surface-container-low p-4 shadow-sm">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-outline">
              <Link href="/" className="hover:text-on-surface">
                Dashboard
              </Link>
              <Icon name="chevron_right" className="text-xs" />
              <span className="flex items-center gap-1 font-semibold text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                Sesi Tersimpan
              </span>
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full max-w-xl rounded-lg bg-transparent font-display text-lg font-semibold tracking-tight text-on-surface outline-none ring-1 ring-transparent transition focus:ring-primary"
            />
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
              <Badge tone={sourceType === 'upload' ? 'tertiary' : 'outline'}>
                {sourceType === 'upload' ? 'Upload file' : 'Paste teks'}
              </Badge>
              {docTypes.map((t) => (
                <Badge key={t} tone="neutral">
                  {SECTIONS.find((s) => s.key === t)?.label ?? t}
                </Badge>
              ))}
              <span className="flex items-center gap-1 font-mono text-[11px] text-outline">
                <Icon name="schedule" className="text-xs" />
                {fmt.format(new Date(updatedAt))}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
            {(docTypes.includes('testcase') || docsState.testcase) && (
              <Link
                href={`/testcases/${sessionId}`}
                className="flex items-center gap-1.5 rounded-lg bg-secondary-container/20 px-3 py-2 text-sm font-semibold text-secondary transition-colors hover:bg-secondary-container/30"
              >
                <Icon name="fact_check" className="text-base" />
                Kelola Test Case
              </Link>
            )}
            <button
              onClick={() => setShowPrd((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg bg-surface-container-high px-3 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-bright"
            >
              <Icon name="description" className="text-base text-tertiary" />
              {showPrd ? 'Sembunyikan' : 'Lihat'} PRD
            </button>
            <button
              onClick={handleUpdate}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-lg bg-primary-container px-3.5 py-2 text-sm font-semibold text-on-primary-container shadow-md transition-all hover:brightness-110 disabled:opacity-50"
            >
              <Icon name="save" className="text-base" />
              {busy ? 'Menyimpan…' : saved ? 'Tersimpan ✓' : 'Simpan Perubahan'}
            </button>
          </div>
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
          Perubahan tersimpan.
        </div>
      )}

      {/* ===== PRD raw (toggle) ===== */}
      {showPrd && (
        <div className="mt-4 overflow-hidden rounded-xl bg-surface-container shadow-sm">
          <div className="flex items-center justify-between border-b border-surface-container-high px-4 py-2">
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <Icon name="description" className="text-base text-tertiary" />
              Teks PRD Sumber
            </span>
            <span className="font-mono text-[11px] text-outline">
              {prdTextState.length.toLocaleString('id-ID')} karakter
            </span>
          </div>
          <textarea
            value={prdTextState}
            onChange={(e) => {
              setPrdTextState(e.target.value)
              setSaved(false)
            }}
            rows={12}
            spellCheck={false}
            className="w-full resize-y bg-surface-container-lowest p-4 font-mono text-xs leading-relaxed text-on-surface outline-none"
          />
        </div>
      )}

      {/* ===== Review draf ===== */}
      <div className="mt-4 grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
        {/* Left: ringkasan */}
        <aside className="flex flex-col gap-3 rounded-xl bg-surface-container-low p-4 shadow-sm xl:col-span-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-outline">
            Ringkasan PRD
          </span>
          <textarea
            value={summaryState || ''}
            onChange={(e) => {
              setSummaryState(e.target.value)
              setSaved(false)
            }}
            rows={18}
            placeholder="_Tidak ada ringkasan._"
            className="w-full flex-1 resize-y rounded-lg bg-surface-container p-3 font-mono text-[11px] leading-relaxed text-on-surface-variant outline-none ring-1 ring-transparent transition focus:ring-primary"
          />
          <div className="flex items-start gap-2 rounded-lg bg-surface-container p-2.5">
            <Icon name="lock" className="mt-0.5 text-sm text-secondary" />
            <p className="text-[11px] leading-relaxed text-on-surface-variant">
              Ringkasan & draf disimpan lokal di SQLite — tidak dikirim ke pihak
              ketiga.
            </p>
          </div>
        </aside>

        {/* Right: segmented switcher + editor */}
        <section className="flex flex-col gap-3 rounded-xl bg-surface-container-low p-4 shadow-sm xl:col-span-9">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Segmented switcher */}
            <div className="flex items-center gap-1 rounded-xl bg-surface-container-lowest p-1">
              {SECTIONS.filter((s) => docTypes.includes(s.key) || docsState[s.key]).map(
                (s) => {
                  const active = activeTab === s.key
                  return (
                    <button
                      key={s.key}
                      onClick={() => setActiveTab(s.key)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-all ${
                        active
                          ? 'bg-primary-container font-semibold text-on-primary-container shadow-sm'
                          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                    >
                      <Icon name={s.icon} className="text-base" />
                      {s.label}
                    </button>
                  )
                }
              )}
            </div>

            <div className="flex items-center gap-2">
              {content && (
                <>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(content)
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-surface-container-high px-3 py-1.5 text-sm font-medium text-on-surface transition-colors hover:bg-surface-bright"
                  >
                    <Icon name="content_copy" className="text-base text-primary" />
                    Salin
                  </button>
                  <button
                    onClick={() => download(activeSection.label.toLowerCase().replace(/ /g, '-'), content)}
                    className="flex items-center gap-1.5 rounded-lg bg-surface-container-high px-3 py-1.5 text-sm font-medium text-on-surface transition-colors hover:bg-surface-bright"
                  >
                    <Icon name="download" className="text-base text-tertiary" />
                    .md
                  </button>
                </>
              )}
            </div>
          </div>

          {!hasMarkdown ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-outline-variant p-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high text-outline">
                <Icon name="article" className="text-xl" />
              </div>
              <p className="mt-3 text-sm text-on-surface-variant">
                Sesi ini belum punya draf dokumen. Gunakan Brainstorm QA Docs
                untuk menyusun dari PRD.
              </p>
              <Link
                href="/brainstorm"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container hover:brightness-110"
              >
                <Icon name="auto_awesome" className="text-base" />
                Buka Brainstorm
              </Link>
            </div>
          ) : content ? (
            <div className="overflow-hidden rounded-xl bg-surface-container-lowest">
              <div className="flex items-center justify-between border-b border-surface-container-high px-4 py-2">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <Icon name={activeSection.icon} className="text-base text-primary" />
                  {activeSection.label} — Markdown
                </span>
                <span className="font-mono text-[11px] text-outline">
                  {content.length.toLocaleString('id-ID')} karakter
                </span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setDoc(activeSection.key, e.target.value)}
                rows={24}
                spellCheck={false}
                className="w-full resize-y bg-surface-container-lowest p-4 font-mono text-xs leading-relaxed text-on-surface outline-none"
              />
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">
              Belum ada konten untuk {activeSection.label} di sesi ini.
            </p>
          )}
        </section>
      </div>

      {/* ===== Hapus sesi ===== */}
      <div className="mt-6 flex justify-end border-t border-surface-container-high pt-4">
        {confirmDelete ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-on-surface-variant">
              Hapus sesi ini permanen?
            </span>
            <button
              onClick={handleDelete}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-lg bg-error-container px-3 py-1.5 font-semibold text-on-error-container transition-colors hover:brightness-110 disabled:opacity-50"
            >
              <Icon name="delete" className="text-sm" />
              Ya, hapus
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="rounded-lg bg-surface-container-high px-3 py-1.5 text-on-surface-variant transition-colors hover:text-on-surface"
            >
              Batal
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1.5 text-sm text-error transition-colors hover:underline"
          >
            <Icon name="delete" className="text-sm" />
            Hapus sesi ini
          </button>
        )}
      </div>
    </div>
  )
}
