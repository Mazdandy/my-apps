import Link from 'next/link'
import { db } from '@/lib/db'
import Badge from '@/components/Badge'
import Icon from '@/components/Icon'

export const dynamic = 'force-dynamic'

export default async function TestCasesIndexPage() {
  const sessions = await db.session.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      docTypes: true,
      testCasesJson: true,
      updatedAt: true,
    },
  })

  const fmt = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' })

  const rows = sessions.map((s) => {
    let count = 0
    let high = 0
    try {
      const parsed = JSON.parse(s.testCasesJson || '[]')
      if (Array.isArray(parsed)) {
        count = parsed.length
        high = parsed.filter(
          (c: { priority?: string }) => c.priority === 'High'
        ).length
      }
    } catch {
      /* ignore */
    }
    let types: string[] = []
    try {
      types = JSON.parse(s.docTypes)
    } catch {
      /* ignore */
    }
    return { ...s, count, high, hasTestCase: types.includes('testcase') }
  })

  const totalCases = rows.reduce((acc, r) => acc + r.count, 0)

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-8 md:py-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] uppercase tracking-widest text-primary">
              Test Case Management
            </span>
            <span className="h-1 w-1 rounded-full bg-outline-variant" />
            <span className="font-mono text-[11px] text-outline">Per Sesi PRD</span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">
            Kelola Test Case
          </h1>
          <p className="text-sm text-on-surface-variant">
            Cari, filter, dan kelola test case terstruktur dari tiap sesi.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start rounded-lg bg-surface-container-low px-3 py-2 md:self-auto">
          <div className="text-right leading-tight">
            <span className="block font-display text-lg font-semibold leading-none">
              {totalCases}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-outline">
              Test Case
            </span>
          </div>
          <div className="h-8 w-px bg-surface-container-high" />
          <div className="text-right leading-tight">
            <span className="block font-display text-lg font-semibold leading-none">
              {rows.length}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-outline">
              Sesi
            </span>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-outline-variant bg-surface-container p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-high text-outline">
            <Icon name="fact_check" className="text-2xl" />
          </div>
          <p className="mt-4 max-w-sm text-sm text-on-surface-variant">
            Belum ada sesi. Buat lewat Brainstorm QA Docs dan simpan dengan
            memilih jenis <strong className="text-on-surface">Test Case</strong> —
            test case akan tersimpan terstruktur di sini.
          </p>
          <Link
            href="/brainstorm"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container transition-all hover:brightness-110"
          >
            <Icon name="auto_awesome" className="text-base" />
            Buka Brainstorm QA Docs
          </Link>
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-xl bg-surface-container shadow-sm">
          {/* Table header strip */}
          <div className="flex items-center justify-between border-b border-surface-container-high px-4 py-2.5">
            <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-outline">
              Riwayat Sesi & Coverage
            </span>
            <span className="font-mono text-[11px] text-outline">
              {rows.filter((r) => r.hasTestCase).length} sesi ber-TC
            </span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-[10px] uppercase tracking-wider text-outline">
                <th className="px-4 py-2.5 font-medium">Sesi</th>
                <th className="px-4 py-2.5 font-medium">Status TC</th>
                <th className="px-4 py-2.5 text-right font-medium">Total</th>
                <th className="hidden px-4 py-2.5 text-right font-medium sm:table-cell">
                  High
                </th>
                <th className="hidden px-4 py-2.5 font-medium md:table-cell">
                  Diperbarui
                </th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr
                  key={s.id}
                  className="border-t border-surface-container-high/60 transition-colors hover:bg-surface-container-low"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-on-surface">{s.title}</div>
                    <div className="mt-0.5 font-mono text-[10px] text-outline">
                      SES-{s.id.slice(-6).toUpperCase()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {s.hasTestCase ? (
                      <Badge tone="secondary">Terstruktur</Badge>
                    ) : (
                      <Badge tone="outline">Belum ada</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-display text-base font-semibold text-primary">
                      {s.count}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-right sm:table-cell">
                    {s.high > 0 ? (
                      <span className="flex items-center justify-end gap-1 font-mono text-[11px] text-error">
                        <span className="h-1.5 w-1.5 rounded-full bg-error" />
                        {s.high}
                      </span>
                    ) : (
                      <span className="text-outline">—</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-on-surface-variant md:table-cell">
                    {fmt.format(new Date(s.updatedAt))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/testcases/${s.id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary-container px-3 py-1.5 font-mono text-[11px] font-semibold text-on-primary-container transition-all hover:brightness-110"
                    >
                      Kelola
                      <Icon name="arrow_forward" className="text-xs" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows.length > 0 && (
        <p className="mt-3 text-xs text-outline">
          Test case muncul setelah sesi disimpan dari Brainstorm QA Docs dengan
          jenis Test Case dipilih.
        </p>
      )}
    </div>
  )
}
