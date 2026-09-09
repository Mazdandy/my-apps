'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'
import Badge from '@/components/Badge'
import {
  DOC_TYPES,
  emptyBrainstorm,
  type BrainstormOutput,
  type DocType,
  type PrdSummary,
  type TestCase,
} from '@/lib/types'

type Step = 'input' | 'config' | 'result'

export default function BrainstormPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('input')
  const [mode, setMode] = useState<'upload' | 'paste'>('upload')
  const [pasteText, setPasteText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sourceText, setSourceText] = useState('')
  const [sourceLabel, setSourceLabel] = useState('')
  const [summary, setSummary] = useState<PrdSummary | null>(null)
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [manualModule, setManualModule] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [docTypes, setDocTypes] = useState<DocType[]>(['strategy', 'plan', 'testcase'])
  const [markdown, setMarkdown] = useState<BrainstormOutput>(emptyBrainstorm())
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [title, setTitle] = useState('')
  const [activeResultTab, setActiveResultTab] = useState<DocType>('testcase')

  async function handleAnalyze() {
    setError('')
    setBusy(true)
    try {
      let text = ''
      let label = ''
      if (mode === 'upload') {
        if (!file) throw new Error('Pilih file terlebih dahulu.')
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/extract', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Gagal membaca file.')
        text = data.text
        label = data.fileName || file.name
      } else {
        text = pasteText.trim()
        label = `Paste teks (${text.length.toLocaleString('id-ID')} karakter)`
      }
      if (text.length < 40) {
        throw new Error(
          'Teks PRD terlalu pendek. Tempel minimal beberapa paragraf atau gunakan dokumen yang lebih lengkap.'
        )
      }
      const { analyzePrd } = await import('@/lib/prd-analysis')
      const s = analyzePrd(text)
      setSourceText(text)
      setSourceLabel(label)
      setSummary(s)
      setSelectedModules(s.modules)
      setTitle(s.title.replace(/\s+/g, ' ').slice(0, 80) || 'Sesi brainstorm QA')
      setStep('config')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan.')
    } finally {
      setBusy(false)
    }
  }

  function toggleModule(m: string) {
    setSelectedModules((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    )
  }

  function addManualModule() {
    const v = manualModule.trim()
    if (!v) return
    if (!selectedModules.includes(v)) setSelectedModules((p) => [...p, v])
    setManualModule('')
    setShowManual(false)
  }

  function toggleType(t: DocType) {
    setDocTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    )
  }

  async function handleGenerate() {
    if (!summary || docTypes.length === 0) return
    setError('')
    setBusy(true)
    try {
      const { buildDocsForTypes, renderDocsMarkdown } = await import(
        '@/lib/qadocs-generator'
      )
      const scoped: PrdSummary = {
        ...summary,
        modules:
          selectedModules.length > 0 ? selectedModules : summary.modules,
      }
      const docs = buildDocsForTypes(scoped, docTypes)
      const out = renderDocsMarkdown(docs)
      setMarkdown(out)
      if (docs.testcase) setTestCases(docs.testcase.cases)
      setActiveResultTab(docTypes.includes('testcase') ? 'testcase' : docTypes[0])
      setStep('result')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal membuat dokumen.')
    } finally {
      setBusy(false)
    }
  }

  async function handleSave() {
    if (!summary) return
    setBusy(true)
    setError('')
    try {
      const hasContent = Object.values(markdown).some((m) => m.trim().length > 0)
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Sesi brainstorm QA',
          sourceType: mode,
          prdText: sourceText || summary.raw,
          summary: '',
          docTypes,
          docsJson: hasContent ? markdown : null,
          testCases,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan sesi.')
      router.push(`/sessions/${data.session.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan sesi.')
      setBusy(false)
    }
  }

  function download(label: string, content: string) {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${label}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const resultMarkdown = markdown[activeResultTab] || ''

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-8 md:py-8">
      {/* ===== Stepper header ===== */}
      <header className="flex flex-col justify-between gap-3 rounded-xl bg-surface-container p-4 shadow-sm md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-secondary">
              Alur Brainstorming
            </span>
            <span className="text-outline">/</span>
            <span className="font-mono text-[11px] text-outline">v0.2 Rule-Engine</span>
          </div>
          <h2 className="mt-0.5 font-display text-lg font-semibold tracking-tight">
            {step === 'input' && 'Input Dokumen PRD'}
            {step === 'config' && 'Konfirmasi Modul & Pilih Output QA'}
            {step === 'result' && 'Review & Simpan Draf Dokumen QA'}
          </h2>
        </div>
        <nav
          aria-label="Progress Alur PRD"
          className="flex items-center gap-1.5 rounded-lg bg-surface-container-low p-1.5"
        >
          {(
            [
              ['input', 'Input PRD', 1],
              ['config', 'Konfirmasi Modul', 2],
              ['result', 'Pilih Output', 3],
            ] as [Step, string, number][]
          ).map(([s, label, n], i) => {
            const active = step === s
            const done =
              (step === 'config' && i === 0) || (step === 'result' && i < 2)
            return (
              <span key={s} className="flex items-center gap-1.5">
                {i > 0 && (
                  <Icon name="chevron_right" className="text-base text-outline" />
                )}
                <span
                  className={`flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors ${
                    active
                      ? 'bg-primary-container text-on-primary-container shadow-sm'
                      : done
                        ? 'text-secondary'
                        : 'text-outline'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] font-bold ${
                      active
                        ? 'bg-primary text-on-primary'
                        : done
                          ? 'bg-secondary-container/30 text-secondary'
                          : 'bg-surface-container-highest text-outline'
                    }`}
                  >
                    {done ? '✓' : n}
                  </span>
                  <span className="text-xs font-medium">{label}</span>
                </span>
              </span>
            )
          })}
        </nav>
      </header>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-error-container bg-error-container/15 px-3 py-2.5 text-sm text-on-error-container">
          <Icon name="error" className="mt-0.5 text-base" />
          {error}
        </div>
      )}

      {/* ===== STEP INPUT / CONFIG : dua kolom workbench ===== */}
      {(step === 'input' || step === 'config') && (
        <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
          {/* LEFT 7 — sumber + output */}
          <section className="flex flex-col gap-4 lg:col-span-7">
            {/* Sumber dokumen */}
            <div className="rounded-xl bg-surface-container p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="source" className="text-xl text-primary" />
                  <div>
                    <h3 className="font-display text-base font-semibold">
                      Sumber Dokumen PRD
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      Pilih metode penyediaan Product Requirement Document
                    </p>
                  </div>
                </div>
                <Badge tone="outline">Maks 10 MB</Badge>
              </div>

              {step === 'input' && (
                <>
                  {/* Mode tabs */}
                  <div className="mt-3 flex items-center gap-0.5 rounded-lg bg-surface-container-lowest p-1">
                    <button
                      onClick={() => setMode('upload')}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-sm transition-all ${
                        mode === 'upload'
                          ? 'bg-surface-container-high font-semibold text-on-surface'
                          : 'font-medium text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <Icon name="cloud_upload" className="text-base" />
                      Upload File Dokumen
                    </button>
                    <button
                      onClick={() => setMode('paste')}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-sm transition-all ${
                        mode === 'paste'
                          ? 'bg-surface-container-high font-semibold text-on-surface'
                          : 'font-medium text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <Icon name="description" className="text-base" />
                      Paste Teks PRD
                    </button>
                  </div>

                  {mode === 'upload' ? (
                    <label className="group relative mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-8 text-center transition-colors hover:border-primary/50 hover:bg-surface-container-high/40">
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt,.md"
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null
                          setFile(f)
                          setFileName(f ? f.name : '')
                        }}
                      />
                      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container/30 text-primary transition-transform group-hover:scale-105">
                        <Icon name="drive_folder_upload" className="text-2xl" />
                      </div>
                      <span className="text-[15px] font-medium text-on-surface">
                        Tarik file dokumen ke sini atau{' '}
                        <span className="font-semibold text-primary underline">
                          jelajahi berkas
                        </span>
                      </span>
                      <span className="mt-1 max-w-sm text-xs text-on-surface-variant">
                        Mendukung format resmi .pdf · .docx · .md · .txt
                      </span>
                      {fileName && (
                        <span className="mt-2 flex items-center gap-1 font-mono text-[11px] text-secondary">
                          <Icon name="check_circle" className="text-sm" />
                          {fileName} dipilih
                        </span>
                      )}
                    </label>
                  ) : (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-outline">
                        <span className="text-[11px] font-semibold uppercase tracking-widest">
                          Ketik atau salin dokumen spesifikasi
                        </span>
                        <span className="font-mono text-[11px]">
                          {pasteText.length.toLocaleString('id-ID')} karakter
                        </span>
                      </div>
                      <textarea
                        value={pasteText}
                        onChange={(e) => setPasteText(e.target.value)}
                        rows={12}
                        placeholder={'# PRD Aplikasi Contoh\n\n## Modul Autentikasi\nPengguna dapat login dengan email dan password...'}
                        className="mt-1.5 w-full resize-y rounded-xl bg-surface-container-lowest p-3 font-mono text-xs leading-relaxed text-on-surface outline-none ring-1 ring-transparent transition placeholder:text-outline focus:ring-primary"
                      />
                    </div>
                  )}
                </>
              )}

              {step === 'config' && (
                <div className="mt-3 flex items-center justify-between rounded-xl bg-surface-container-low p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest text-secondary">
                      <Icon
                        name={mode === 'upload' ? 'check_circle' : 'description'}
                        className="text-xl"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-mono text-xs font-medium text-on-surface">
                        {sourceLabel}
                      </div>
                      <span className="flex items-center gap-1 text-xs text-secondary">
                        <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                        Berhasil diekstrak ({summary?.modules.length ?? 0} modul
                        terdeteksi)
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep('input')}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-surface-container-high px-2.5 py-1.5 text-xs text-on-surface transition-colors hover:bg-surface-container-highest"
                  >
                    <Icon name="sync" className="text-sm" />
                    Ganti
                  </button>
                </div>
              )}
            </div>

            {/* Pilih output */}
            <div className="rounded-xl bg-surface-container p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="output" className="text-xl text-primary" />
                  <div>
                    <h3 className="font-display text-base font-semibold">
                      Pilih Dokumen QA yang Ingin Dihasilkan
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      Susun salah satu atau ketiga artefak QA sekaligus
                    </p>
                  </div>
                </div>
                <Badge tone="primary">{docTypes.length} Dipilih</Badge>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                {DOC_TYPES.map((t) => {
                  const checked = docTypes.includes(t.value)
                  const icon =
                    t.value === 'strategy'
                      ? 'psychology'
                      : t.value === 'plan'
                        ? 'checklist'
                        : 'data_object'
                  return (
                    <button
                      key={t.value}
                      onClick={() => toggleType(t.value)}
                      className={`group relative flex cursor-pointer flex-col justify-between rounded-xl p-3 text-left transition-colors ${
                        checked
                          ? 'bg-primary-container/15 ring-1 ring-primary/40'
                          : 'bg-surface-container-low hover:bg-surface-container-high'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span
                          className={`text-xl ${checked ? 'text-primary' : 'text-primary'}`}
                        >
                          <Icon name={icon} className="text-2xl" />
                        </span>
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                            checked
                              ? 'border-primary bg-primary text-on-primary'
                              : 'border-outline-variant bg-surface-container-highest'
                          }`}
                        >
                          {checked ? '✓' : ''}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="block text-sm font-semibold text-on-surface">
                          {t.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-on-surface-variant">
                          {t.desc}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          {/* RIGHT 5 — hasil analisis / konfirmasi */}
          <aside className="flex flex-col gap-4 lg:col-span-5">
            {step === 'input' ? (
              <>
                <div className="rounded-xl bg-surface-container p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Icon name="analytics" className="text-xl text-secondary" />
                    <h3 className="font-display text-base font-semibold">
                      Hasil Analisis & Ekstraksi PRD
                    </h3>
                  </div>
                  <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant p-10 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-high text-outline">
                      <Icon name="document_scanner" className="text-2xl" />
                    </div>
                    <p className="mt-3 max-w-xs text-sm text-on-surface-variant">
                      Tempel atau unggah dokumen PRD, lalu jalankan analisis untuk
                      mendeteksi modul & functional requirements.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-surface-container-lowest p-3 shadow-sm">
                  <div className="flex items-start gap-2">
                    <Icon name="verified_user" className="mt-0.5 text-lg text-secondary" />
                    <div>
                      <span className="text-sm font-medium text-on-surface">
                        Privasi & Kedaulatan Dokumen Dijamin
                      </span>
                      <p className="mt-0.5 text-xs leading-relaxed text-outline">
                        Dokumen diurai secara lokal. Tidak ada data rahasia yang
                        dikirim ke cloud pihak ketiga pada tahap MVP.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-xl bg-surface-container p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="analytics" className="text-xl text-secondary" />
                      <h3 className="font-display text-base font-semibold">
                        Hasil Analisis & Ekstraksi PRD
                      </h3>
                    </div>
                    <Badge tone="secondary">Terekstraksi Otomatis</Badge>
                  </div>

                  <div className="mt-3 rounded-xl bg-surface-container-low p-3">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-outline">
                      Judul Dokumen Teridentifikasi
                    </span>
                    <p className="text-[15px] font-semibold text-on-surface">
                      {summary?.title}
                    </p>
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-2 rounded-xl bg-surface-container-low p-3">
                    {[
                      { label: 'Modul', value: String(summary?.modules.length ?? 0), cls: 'text-on-surface' },
                      { label: 'Requirements', value: String(summary?.requirements.length ?? 0), cls: 'text-primary' },
                      {
                        label: 'Est. Test Cases',
                        value: `~${Math.min(summary?.requirements.length ?? 0, 40)}`,
                        cls: 'text-secondary',
                      },
                    ].map((m) => (
                      <div key={m.label} className="flex flex-col">
                        <span className="font-mono text-[10px] text-outline">
                          {m.label}
                        </span>
                        <span
                          className={`font-display text-lg font-semibold leading-tight ${m.cls}`}
                        >
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-on-surface">
                      Modul Terdeteksi ({selectedModules.length}/
                      {summary?.modules.length ?? 0} Aktif)
                    </span>
                    <button
                      onClick={() =>
                        setSelectedModules(summary?.modules ? [...summary.modules] : [])
                      }
                      className="font-mono text-[11px] text-primary hover:underline"
                    >
                      Pilih Semua
                    </button>
                  </div>

                  <div className="mt-2 flex flex-col gap-1.5">
                    {(summary?.modules ?? []).map((m) => {
                      const checked = selectedModules.includes(m)
                      return (
                        <label
                          key={m}
                          className="flex cursor-pointer items-start gap-2.5 rounded-lg bg-surface-container-low p-2.5 transition-colors hover:bg-surface-container-high"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleModule(m)}
                            className="mt-0.5 h-4 w-4 cursor-pointer accent-primary"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-on-surface">
                              {m}
                            </span>
                            <span className="block font-mono text-[10px] text-outline">
                              {summary?.requirements.filter((r) =>
                                r.toLowerCase().includes(m.split(' ').pop()?.toLowerCase() ?? '____')
                              ).length ?? 0}{' '}
                              req terkait
                            </span>
                          </span>
                          <Icon
                            name="drag_indicator"
                            className="self-center text-base text-outline-variant"
                          />
                        </label>
                      )
                    })}
                    {summary && summary.modules.length === 0 && (
                      <p className="text-xs text-on-surface-variant">
                        Tidak ada modul terdeteksi otomatis — tambahkan manual di
                        bawah.
                      </p>
                    )}
                  </div>

                  {/* Tambah modul manual */}
                  {showManual ? (
                    <div className="mt-2 flex gap-1.5 rounded-lg bg-surface-container-low p-2">
                      <input
                        value={manualModule}
                        onChange={(e) => setManualModule(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addManualModule()
                        }}
                        placeholder="Nama modul (contoh: Modul 5: Refund)"
                        className="w-full rounded-md bg-surface-container-lowest px-2 py-1 text-sm text-on-surface outline-none ring-1 ring-transparent focus:ring-primary"
                      />
                      <button
                        onClick={addManualModule}
                        className="shrink-0 rounded-md bg-primary-container px-2.5 py-1 text-xs font-semibold text-on-primary-container"
                      >
                        Tambah
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowManual(true)}
                      className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-surface-container-low py-2 text-xs font-semibold text-primary transition-colors hover:bg-surface-container-high"
                    >
                      <Icon name="add_circle" className="text-sm" />
                      Tambah Modul Manual
                    </button>
                  )}
                </div>

                <div className="flex items-start gap-2 rounded-lg bg-surface-container-lowest p-3 shadow-sm">
                  <Icon name="verified_user" className="mt-0.5 text-lg text-secondary" />
                  <div>
                    <span className="text-sm font-medium text-on-surface">
                      Privasi & Kedaulatan Dokumen Dijamin
                    </span>
                    <p className="mt-0.5 text-xs leading-relaxed text-outline">
                      Dokumen diurai secara lokal. Tidak ada data rahasia yang
                      dikirim ke cloud pihak ketiga pada tahap MVP.
                    </p>
                  </div>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {/* ===== STEP RESULT : review draf ===== */}
      {step === 'result' && (
        <div className="mt-4">
          {/* Toolbar sesi */}
          <div className="flex flex-col gap-3 rounded-xl bg-surface-container-low p-4 shadow-sm">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] text-outline">
                  <span className="hover:text-on-surface">Brainstorm QA Docs</span>
                  <Icon name="chevron_right" className="text-xs" />
                  <span className="flex items-center gap-1 font-semibold text-secondary">
                    <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                    Draf Siap Review
                  </span>
                </div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full max-w-xl rounded-lg bg-transparent font-display text-lg font-semibold tracking-tight text-on-surface outline-none ring-1 ring-transparent transition focus:ring-primary"
                />
              </div>
              {/* Segmented switcher */}
              <div className="flex items-center gap-1 self-start rounded-xl bg-surface-container-lowest p-1 lg:self-center">
                {DOC_TYPES.filter((t) => docTypes.includes(t.value)).map((t) => {
                  const active = activeResultTab === t.value
                  const icon =
                    t.value === 'strategy'
                      ? 'psychology'
                      : t.value === 'plan'
                        ? 'checklist'
                        : 'data_object'
                  return (
                    <button
                      key={t.value}
                      onClick={() => setActiveResultTab(t.value)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-all ${
                        active
                          ? 'bg-primary-container font-semibold text-on-primary-container shadow-sm'
                          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                    >
                      <Icon name={icon} className="text-base" />
                      {t.label}
                    </button>
                  )
                })}
              </div>
              {/* Aksi */}
              <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                <button
                  onClick={() => download(`qa-${activeResultTab}`, resultMarkdown)}
                  disabled={!resultMarkdown}
                  className="flex items-center gap-1.5 rounded-lg bg-surface-container-high px-3 py-1.5 text-sm font-medium text-on-surface transition-colors hover:bg-surface-bright disabled:opacity-50"
                >
                  <Icon name="download" className="text-base text-tertiary" />
                  Export .MD
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(resultMarkdown)
                  }}
                  disabled={!resultMarkdown}
                  className="flex items-center gap-1.5 rounded-lg bg-surface-container-high px-3 py-1.5 text-sm font-medium text-on-surface transition-colors hover:bg-surface-bright disabled:opacity-50"
                >
                  <Icon name="content_copy" className="text-base text-primary" />
                  Salin Markdown
                </button>
                <button
                  onClick={handleSave}
                  disabled={busy}
                  className="flex items-center gap-1.5 rounded-lg bg-primary-container px-3.5 py-1.5 text-sm font-semibold text-on-primary-container shadow-md transition-all hover:brightness-110 active:scale-95"
                >
                  <Icon name="save" className="text-base" />
                  {busy ? 'Menyimpan…' : 'Simpan Sesi'}
                </button>
              </div>
            </div>

            {/* Stats banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-container-lowest px-3 py-2 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="text-outline">Cakupan Modul:</span>
                  <span className="font-medium text-secondary">
                    {selectedModules.length} modul terpilih
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-outline">Dihasilkan:</span>
                  <span className="font-mono text-[11px] text-primary">
                    Rule-Engine v0.2
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono text-[11px] text-primary">
                <Icon name="auto_fix_high" className="text-sm" />
                {docTypes.join(' + ')}
              </div>
            </div>
          </div>

          {/* Konten draf */}
          <div className="mt-3 overflow-hidden rounded-xl bg-surface-container-low shadow-sm">
            <div className="flex items-center justify-between border-b border-surface-container-high px-4 py-2">
              <span className="flex items-center gap-1.5 text-sm font-medium text-on-surface">
                <Icon name="description" className="text-lg text-primary" />
                {DOC_TYPES.find((t) => t.value === activeResultTab)?.label} — Markdown
              </span>
              <span className="font-mono text-[11px] text-outline">
                {resultMarkdown.length.toLocaleString('id-ID')} karakter
              </span>
            </div>
            <textarea
              value={resultMarkdown}
              onChange={(e) => {
                setMarkdown((prev) => ({ ...prev, [activeResultTab]: e.target.value }))
              }}
              rows={26}
              spellCheck={false}
              className="w-full resize-y bg-surface-container-lowest p-4 font-mono text-xs leading-relaxed text-on-surface outline-none"
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => setStep('config')}
              className="flex items-center gap-1.5 rounded-lg bg-surface-container px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            >
              <Icon name="arrow_back" className="text-sm" />
              Kembali ke Konfirmasi
            </button>
            <button
              onClick={() => {
                setStep('input')
                setPasteText('')
                setFile(null)
                setFileName('')
                setSourceText('')
                setSourceLabel('')
                setSummary(null)
                setSelectedModules([])
                setMarkdown(emptyBrainstorm())
                setTestCases([])
              }}
              className="rounded-lg bg-surface-container px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            >
              Mulai Baru
            </button>
          </div>
        </div>
      )}

      {/* ===== Sticky action dock (input & config) ===== */}
      {(step === 'input' || step === 'config') && (
        <footer className="sticky bottom-3 z-30 mt-4 flex items-center justify-between gap-3 rounded-xl bg-surface-container-high/90 p-2.5 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg bg-surface-container px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
            >
              <Icon name="arrow_back" className="text-sm" />
              Dashboard
            </Link>
            {step === 'config' && (
              <span className="hidden items-center gap-1.5 font-mono text-[11px] text-secondary sm:flex">
                <Icon name="check" className="text-sm" />
                Konfigurasi Siap untuk Brainstorming
              </span>
            )}
          </div>
          {step === 'input' ? (
            <button
              onClick={handleAnalyze}
              disabled={busy || (mode === 'upload' ? !file : pasteText.trim().length < 40)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-transform hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              <Icon name="analytics" className="text-base" />
              {busy ? 'Menganalisis…' : 'Jalankan Analisis PRD'}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerate}
                disabled={busy || docTypes.length === 0 || selectedModules.length === 0}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-transform hover:brightness-110 active:scale-95 disabled:opacity-50"
              >
                <Icon name="auto_awesome" className="text-base" />
                {busy ? 'Menyusun draf…' : 'Mulai Brainstorming Terpandu'}
              </button>
            </div>
          )}
        </footer>
      )}
    </div>
  )
}
